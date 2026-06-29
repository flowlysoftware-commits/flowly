export type VoiceEngineV2Phase = "idle" | "requesting-permission" | "ready" | "recording" | "transcribing" | "thinking" | "speaking" | "error";

export type VoiceEngineV2PermissionState = "unknown" | "prompt" | "granted" | "denied" | "error";

export type VoiceEngineV2Snapshot = {
  active: boolean;
  permissionState: VoiceEngineV2PermissionState;
  phase: VoiceEngineV2Phase;
  recording: boolean;
  lastAudioKb: number;
  lastTranscript: string;
  lastTranscriptionStatus: number | null;
  lastTranscriptionRawResponse: string;
  wakeDetected: boolean;
  intentionDetected: boolean;
  lastBrainRequest: string;
  lastBrainResponse: string;
  lastError: string;
};

type VoiceEngineV2Options = {
  activeConversationMode?: boolean;
  onStateChange?: (snapshot: VoiceEngineV2Snapshot) => void;
};

const RECORDING_DURATION_MS = 4200;
const RESTART_DELAY_MS = 900;

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes)) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function cleanText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,!?¿¡;:]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectWakeWord(value: string) {
  const normalized = cleanText(value).toLowerCase();
  return /\b(hola\s+flow|oye\s+flow|flowly|flow|flou|flo|flor)\b/i.test(normalized);
}

function detectIntention(value: string, activeConversationMode: boolean) {
  const normalized = cleanText(value).toLowerCase();
  if (!normalized) return false;
  if (activeConversationMode) return true;
  const words = normalized.split(/\s+/).filter(Boolean);
  const hasWakeWord = detectWakeWord(normalized);
  const hasKeyword = /\b(que|como|ayuda|abre|crea|muestra|dime|tengo|hacer|cliente|clientes|venta|ventas|factura|facturas|crm|whatsapp|objetivo|objetivos|tarea|tareas|agenda|resumen|analiza|plan)\b/i.test(normalized);
  return hasWakeWord || hasKeyword || words.length >= 3;
}

export class VoiceEngineV2 {
  private active = false;
  private activeConversationMode: boolean;
  private permissionState: VoiceEngineV2PermissionState = "unknown";
  private phase: VoiceEngineV2Phase = "idle";
  private recording = false;
  private lastAudioKb = 0;
  private lastTranscript = "";
  private lastTranscriptionStatus: number | null = null;
  private lastTranscriptionRawResponse = "";
  private wakeDetected = false;
  private intentionDetected = false;
  private lastBrainRequest = "";
  private lastBrainResponse = "";
  private lastError = "";
  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private recorderTimer: number | null = null;
  private restartTimer: number | null = null;
  private cycleBusy = false;
  private onStateChange?: (snapshot: VoiceEngineV2Snapshot) => void;

  constructor(options: VoiceEngineV2Options = {}) {
    this.activeConversationMode = options.activeConversationMode ?? true;
    this.onStateChange = options.onStateChange;
  }

  start() {
    if (typeof window === "undefined") {
      this.setError("La ventana no está disponible.");
      return false;
    }

    this.active = true;
    this.clearRestartTimer();
    this.clearRecorderTimer();
    this.permissionState = "prompt";
    this.phase = "requesting-permission";
    this.lastError = "";
    this.publish();
    void this.requestPermissionAndRun();
    return true;
  }

  stop() {
    this.active = false;
    this.cycleBusy = false;
    this.clearRestartTimer();
    this.clearRecorderTimer();
    this.stopRecorder();
    this.stopStream();
    this.recording = false;
    this.phase = "idle";
    this.publish();
  }

  getSnapshot(): VoiceEngineV2Snapshot {
    return {
      active: this.active,
      permissionState: this.permissionState,
      phase: this.phase,
      recording: this.recording,
      lastAudioKb: this.lastAudioKb,
      lastTranscript: this.lastTranscript,
      lastTranscriptionStatus: this.lastTranscriptionStatus,
      lastTranscriptionRawResponse: this.lastTranscriptionRawResponse,
      wakeDetected: this.wakeDetected,
      intentionDetected: this.intentionDetected,
      lastBrainRequest: this.lastBrainRequest,
      lastBrainResponse: this.lastBrainResponse,
      lastError: this.lastError,
    };
  }

  private publish() {
    this.onStateChange?.(this.getSnapshot());
  }

  private setError(message: string) {
    this.lastError = message;
    this.phase = "error";
    this.publish();
  }

  private async requestPermissionAndRun() {
    if (!this.active || typeof window === "undefined") return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      this.stream = stream;
      this.permissionState = "granted";
      this.phase = "ready";
      this.publish();
      await this.runCaptureCycle();
    } catch (error) {
      this.permissionState = "denied";
      const message = error instanceof Error ? error.message : "No se pudo obtener acceso al micrófono.";
      this.setError(message);
    }
  }

  private async runCaptureCycle() {
    if (!this.active || this.cycleBusy || !this.stream) return;

    this.cycleBusy = true;
    this.recording = true;
    this.phase = "recording";
    this.publish();

    const recorder = this.createRecorder();
    if (!recorder) {
      this.recording = false;
      this.cycleBusy = false;
      this.phase = "ready";
      this.publish();
      this.scheduleRestart();
      return;
    }

    const blob = await this.captureBlob(recorder);
    this.recording = false;
    this.recorder = null;

    if (!this.active) return;

    if (!blob || blob.size < 1024) {
      this.lastAudioKb = 0;
      this.phase = "ready";
      this.publish();
      this.cycleBusy = false;
      this.scheduleRestart();
      return;
    }

    this.lastAudioKb = Math.round(blob.size / 1024);
    this.phase = "transcribing";
    this.publish();

    try {
      const transcription = await this.transcribe(blob);
      this.lastTranscript = transcription.text;
      this.lastError = transcription.error || "";
      this.publish();

      this.wakeDetected = detectWakeWord(transcription.text);
      this.intentionDetected = detectIntention(transcription.text, this.activeConversationMode);
      this.phase = transcription.text ? "thinking" : "ready";
      this.publish();

      if (transcription.text && this.intentionDetected) {
        this.lastBrainRequest = transcription.text;
        this.phase = "thinking";
        this.publish();
        const brainReply = await this.runBrain(transcription.text);
        this.lastBrainResponse = brainReply;
        this.phase = "speaking";
        this.publish();
        this.speak(brainReply);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error inesperado en el ciclo de voz.";
      this.lastError = message;
      this.phase = "error";
      this.publish();
    } finally {
      this.cycleBusy = false;
      if (this.active) {
        this.phase = "ready";
        this.publish();
        this.scheduleRestart();
      }
    }
  }

  private createRecorder() {
    if (typeof MediaRecorder === "undefined" || !this.stream) return null;
    const mimeType = this.detectMimeType();
    const recorder = new MediaRecorder(this.stream, mimeType ? { mimeType } : undefined);
    this.recorder = recorder;
    return recorder;
  }

  private detectMimeType() {
    if (typeof MediaRecorder === "undefined") return "";
    const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/mpeg"];
    return candidates.find((mime) => MediaRecorder.isTypeSupported(mime)) || "";
  }

  private captureBlob(recorder: MediaRecorder): Promise<Blob | null> {
    return new Promise((resolve) => {
      const chunks: BlobPart[] = [];
      const finish = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        this.lastAudioKb = Math.max(this.lastAudioKb, Math.round(blob.size / 1024));
        resolve(blob);
      };

      recorder.ondataavailable = (event) => {
        if (event.data?.size) chunks.push(event.data);
      };
      recorder.onerror = () => resolve(null);
      recorder.onstop = () => finish();

      try {
        recorder.start(250);
        this.recorderTimer = window.setTimeout(() => {
          if (recorder.state !== "inactive") recorder.stop();
          else finish();
        }, RECORDING_DURATION_MS);
      } catch {
        resolve(null);
      }
    });
  }

  private async transcribe(blob: Blob) {
    const formData = new FormData();
    const extension = blob.type.includes("mp4") ? "mp4" : "webm";
    formData.append("audio", blob, `flowly-runtime-v2.${extension}`);

    try {
      const response = await fetch("/api/voice-test/transcribe", {
        method: "POST",
        body: formData,
      });
      const rawResponseText = await response.text();
      let data: Record<string, unknown> = {};
      try {
        data = rawResponseText ? (JSON.parse(rawResponseText) as Record<string, unknown>) : {};
      } catch {
        data = { raw: rawResponseText };
      }

      this.lastTranscriptionStatus = response.status;
      this.lastTranscriptionRawResponse = rawResponseText || JSON.stringify(data);

      if (!response.ok) {
        const message = typeof data?.error === "string" ? data.error : "No se pudo transcribir el audio.";
        return { text: "", error: message };
      }

      const transcriptionText: string =
        typeof data?.text === "string"
          ? data.text
          : typeof (data as Record<string, unknown>)?.transcript === "object" &&
              (data as Record<string, unknown>).transcript !== null &&
              typeof ((data as Record<string, unknown>).transcript as Record<string, unknown>).text === "string"
            ? String(((data as Record<string, unknown>).transcript as Record<string, unknown>).text)
            : typeof (data as Record<string, unknown>).raw === "string"
              ? (data as Record<string, unknown>).raw
              : "";

      const text = cleanText(transcriptionText);
      return { text, error: "" };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido al transcribir.";
      this.lastTranscriptionStatus = null;
      this.lastTranscriptionRawResponse = message;
      return { text: "", error: message };
    }
  }

  private async runBrain(text: string) {
    this.lastBrainRequest = text;
    try {
      const response = await fetch("/api/voice-test/brain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = typeof data?.error === "string" ? data.error : "Brain no respondió correctamente.";
        this.lastError = message;
        return message;
      }
      return String(data?.reply || "");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error inesperado al hablar con Brain.";
      this.lastError = message;
      return message;
    }
  }

  private speak(text: string) {
    if (typeof window === "undefined" || !text.trim()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES";
    utterance.rate = 1.02;
    utterance.pitch = 1.02;
    utterance.volume = 0.95;
    window.speechSynthesis.speak(utterance);
  }

  private scheduleRestart() {
    this.clearRestartTimer();
    if (!this.active) return;
    this.restartTimer = window.setTimeout(() => {
      void this.runCaptureCycle();
    }, RESTART_DELAY_MS);
  }

  private clearRestartTimer() {
    if (this.restartTimer) window.clearTimeout(this.restartTimer);
    this.restartTimer = null;
  }

  private clearRecorderTimer() {
    if (this.recorderTimer) window.clearTimeout(this.recorderTimer);
    this.recorderTimer = null;
  }

  private stopRecorder() {
    if (this.recorder && this.recorder.state !== "inactive") {
      try {
        this.recorder.stop();
      } catch {
        // ignore
      }
    }
    this.recorder = null;
  }

  private stopStream() {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
  }
}

export function createVoiceEngineV2(options: VoiceEngineV2Options = {}) {
  return new VoiceEngineV2(options);
}

export function getVoiceEngineV2DebugSummary(snapshot: VoiceEngineV2Snapshot) {
  return {
    summary: `${snapshot.phase} · ${snapshot.recording ? "recording" : "idle"} · audio ${snapshot.lastAudioKb} KB`,
    humanReadable: [
      `Permiso: ${snapshot.permissionState}`,
      `Estado: ${snapshot.phase}`,
      `Grabando: ${snapshot.recording ? "sí" : "no"}`,
      `Audio: ${snapshot.lastAudioKb} KB`,
      `Transcripción: ${snapshot.lastTranscript || "—"}`,
      `Estado de transcripción: ${snapshot.lastTranscriptionStatus ?? "—"}`,
      `Respuesta de transcripción: ${snapshot.lastTranscriptionRawResponse || "—"}`,
      `Intención: ${snapshot.intentionDetected ? "sí" : "no"}`,
      `Brain: ${snapshot.lastBrainResponse || "—"}`,
      `Error: ${snapshot.lastError || "—"}`,
    ],
  };
}
