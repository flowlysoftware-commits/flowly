export type VoiceEngineV2State =
  | "idle"
  | "permission"
  | "listening"
  | "speech_detected"
  | "recording"
  | "silence_wait"
  | "uploading"
  | "transcribing"
  | "thinking"
  | "speaking"
  | "error";

export type VoiceEngineV2PermissionState = "unknown" | "prompt" | "granted" | "denied" | "error";

type VoiceEngineV2Config = {
  minRecordingMs: number;
  maxRecordingMs: number;
  silenceTimeoutMs: number;
  minAudioKb: number;
  debounceMs: number;
  speakingCooldownMs: number;
  speechThreshold: number;
  analyserPollMs: number;
  debugEventLimit: number;
};

export type VoiceEngineV2Snapshot = {
  active: boolean;
  permissionState: VoiceEngineV2PermissionState;
  phase: VoiceEngineV2State;
  currentState: VoiceEngineV2State;
  previousState: VoiceEngineV2State | null;
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
  lastTransitionAt: number | null;
  lastSilenceAt: number | null;
  lastSpeechDetectedAt: number | null;
  lastRecordingDurationMs: number;
  lastReason: string;
  lastDebugEvents: string[];
  config: VoiceEngineV2Config;
};

type VoiceEngineV2Options = {
  activeConversationMode?: boolean;
  onStateChange?: (snapshot: VoiceEngineV2Snapshot) => void;
};

const DEFAULT_CONFIG: VoiceEngineV2Config = {
  minRecordingMs: 900,
  maxRecordingMs: 9000,
  silenceTimeoutMs: 1150,
  minAudioKb: 2,
  debounceMs: 800,
  speakingCooldownMs: 500,
  speechThreshold: 0.045,
  analyserPollMs: 90,
  debugEventLimit: 18,
};

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

function now() {
  return Date.now();
}

export class VoiceEngineV2 {
  private active = false;
  private activeConversationMode: boolean;
  private permissionState: VoiceEngineV2PermissionState = "unknown";
  private currentState: VoiceEngineV2State = "idle";
  private previousState: VoiceEngineV2State | null = null;
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
  private lastTransitionAt: number | null = null;
  private lastSilenceAt: number | null = null;
  private lastSpeechDetectedAt: number | null = null;
  private lastRecordingDurationMs = 0;
  private lastReason = "";
  private lastDebugEvents: string[] = [];
  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private recorderChunks: BlobPart[] = [];
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private analyserSource: MediaStreamAudioSourceNode | null = null;
  private analyserBuffer: Uint8Array<ArrayBuffer> | null = null;
  private analyserTimer: number | null = null;
  private restartTimer: number | null = null;
  private cycleBusy = false;
  private uploadInFlight = false;
  private recordingStartedAt: number | null = null;
  private lastSubmissionAt = 0;
  private speakingFinishedAt = 0;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private onStateChange?: (snapshot: VoiceEngineV2Snapshot) => void;
  private config: VoiceEngineV2Config;

  constructor(options: VoiceEngineV2Options = {}) {
    this.activeConversationMode = options.activeConversationMode ?? true;
    this.onStateChange = options.onStateChange;
    this.config = { ...DEFAULT_CONFIG };
  }

  start() {
    if (typeof window === "undefined") {
      this.setError("La ventana no está disponible.", "window-unavailable");
      return false;
    }

    this.active = true;
    this.lastError = "";
    this.clearRestartTimer();
    this.stopSpeaking();
    this.permissionState = "prompt";
    this.transitionTo("permission", "start-requested");
    void this.requestPermissionAndRun();
    return true;
  }

  stop() {
    this.active = false;
    this.cycleBusy = false;
    this.uploadInFlight = false;
    this.clearRestartTimer();
    this.stopAnalyser();
    this.stopRecorder("stop-requested");
    this.stopSpeaking();
    this.stopStream();
    this.recording = false;
    this.recordingStartedAt = null;
    this.transitionTo("idle", "stop-requested");
  }

  getSnapshot(): VoiceEngineV2Snapshot {
    return {
      active: this.active,
      permissionState: this.permissionState,
      phase: this.currentState,
      currentState: this.currentState,
      previousState: this.previousState,
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
      lastTransitionAt: this.lastTransitionAt,
      lastSilenceAt: this.lastSilenceAt,
      lastSpeechDetectedAt: this.lastSpeechDetectedAt,
      lastRecordingDurationMs: this.lastRecordingDurationMs,
      lastReason: this.lastReason,
      lastDebugEvents: [...this.lastDebugEvents],
      config: { ...this.config },
    };
  }

  private publish() {
    this.onStateChange?.(this.getSnapshot());
  }

  private debug(message: string) {
    const stamped = `${new Date().toLocaleTimeString("es-ES", { hour12: false })} · ${message}`;
    this.lastDebugEvents = [...this.lastDebugEvents.slice(-(this.config.debugEventLimit - 1)), stamped];
  }

  private transitionTo(state: VoiceEngineV2State, reason: string) {
    if (this.currentState !== state) {
      this.previousState = this.currentState;
      this.currentState = state;
      this.lastTransitionAt = now();
    }
    this.lastReason = reason;
    this.debug(`${this.previousState || "none"} -> ${state} (${reason})`);
    this.publish();
  }

  private setError(message: string, reason: string) {
    this.lastError = message;
    this.transitionTo("error", reason);
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
      this.debug("Permiso de micrófono concedido");
      await this.enterListening("permission-granted");
    } catch (error) {
      this.permissionState = "denied";
      const message = error instanceof Error ? error.message : "No se pudo obtener acceso al micrófono.";
      this.setError(message, "permission-denied");
    }
  }

  private async ensureAnalyser() {
    if (!this.stream || typeof window === "undefined") return false;
    if (!this.audioContext) {
      const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextCtor) return false;
      this.audioContext = new AudioContextCtor();
    }
    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume().catch(() => undefined);
    }
    if (!this.analyser) {
      this.analyserSource = this.audioContext.createMediaStreamSource(this.stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 1024;
      this.analyser.smoothingTimeConstant = 0.2;
      this.analyserSource.connect(this.analyser);
      this.analyserBuffer = new Uint8Array(new ArrayBuffer(this.analyser.fftSize));
    }
    return true;
  }

  private async enterListening(reason: string) {
    if (!this.active || !this.stream) return;
    if (this.uploadInFlight) return;
    if (now() - this.speakingFinishedAt < this.config.speakingCooldownMs) {
      this.scheduleRestart(this.config.speakingCooldownMs, "speaking-cooldown");
      return;
    }

    const ready = await this.ensureAnalyser();
    if (!ready) {
      this.setError("No se pudo inicializar el analizador de audio.", "analyser-init-failed");
      return;
    }

    this.stopAnalyser();
    this.transitionTo("listening", reason);
    this.analyserTimer = window.setInterval(() => {
      void this.sampleAudioLevel();
    }, this.config.analyserPollMs);
  }

  private async sampleAudioLevel() {
    if (!this.active || !this.analyser || !this.analyserBuffer || !this.stream) return;
    if (this.currentState === "speaking" || this.uploadInFlight) return;

    this.analyser.getByteTimeDomainData(this.analyserBuffer);
    let energy = 0;
    for (const value of this.analyserBuffer) {
      const normalized = (value - 128) / 128;
      energy += normalized * normalized;
    }
    const rms = Math.sqrt(energy / this.analyserBuffer.length);
    const speechDetected = rms >= this.config.speechThreshold;

    if (!this.recording && speechDetected) {
      this.lastSpeechDetectedAt = now();
      this.transitionTo("speech_detected", "speech-threshold-reached");
      this.startRecording();
      return;
    }

    if (!this.recording || !this.recordingStartedAt) return;

    const duration = now() - this.recordingStartedAt;
    this.lastRecordingDurationMs = duration;

    if (speechDetected) {
      this.lastSpeechDetectedAt = now();
      if (this.currentState !== "recording") this.transitionTo("recording", "speech-continued");
      return;
    }

    this.lastSilenceAt = now();
    if (duration < this.config.minRecordingMs) {
      if (this.currentState !== "recording") this.transitionTo("recording", "waiting-min-duration");
      return;
    }

    if (this.currentState !== "silence_wait") {
      this.transitionTo("silence_wait", "silence-detected");
      return;
    }

    if (this.lastSpeechDetectedAt && now() - this.lastSpeechDetectedAt >= this.config.silenceTimeoutMs) {
      this.stopRecorder("silence-timeout");
      return;
    }

    if (duration >= this.config.maxRecordingMs) {
      this.stopRecorder("max-recording-reached");
    }
  }

  private startRecording() {
    if (!this.stream || this.recorder || this.uploadInFlight || !this.active) return;
    if (now() - this.lastSubmissionAt < this.config.debounceMs) return;

    const recorder = this.createRecorder();
    if (!recorder) {
      this.setError("No se pudo crear MediaRecorder.", "recorder-create-failed");
      return;
    }

    this.recorderChunks = [];
    this.recording = true;
    this.recordingStartedAt = now();
    this.lastRecordingDurationMs = 0;
    this.transitionTo("recording", "recording-started");

    recorder.ondataavailable = (event) => {
      if (event.data?.size) this.recorderChunks.push(event.data);
    };
    recorder.onerror = () => {
      this.recording = false;
      this.setError("MediaRecorder falló durante la captura.", "recorder-error");
    };
    recorder.onstop = () => {
      void this.finishRecording();
    };

    try {
      recorder.start(200);
    } catch {
      this.recording = false;
      this.setError("No se pudo iniciar la grabación.", "recorder-start-failed");
    }
  }

  private stopRecorder(reason: string) {
    if (!this.recorder) return;
    this.transitionTo("silence_wait", reason);
    try {
      if (this.recorder.state !== "inactive") this.recorder.stop();
    } catch {
      this.setError("No se pudo detener la grabación.", "recorder-stop-failed");
    }
  }

  private async finishRecording() {
    const recorder = this.recorder;
    this.recorder = null;
    this.recording = false;
    this.lastRecordingDurationMs = this.recordingStartedAt ? now() - this.recordingStartedAt : 0;
    this.recordingStartedAt = null;

    if (!recorder || !this.active) return;

    const blob = new Blob(this.recorderChunks, { type: recorder.mimeType || "audio/webm" });
    this.recorderChunks = [];
    this.lastAudioKb = Math.round(blob.size / 1024);

    if (this.lastRecordingDurationMs < this.config.minRecordingMs) {
      this.debug(`Audio descartado por duración corta: ${this.lastRecordingDurationMs} ms`);
      await this.enterListening("short-recording-discarded");
      return;
    }

    if (this.lastAudioKb < this.config.minAudioKb) {
      this.debug(`Audio descartado por tamaño pequeño: ${this.lastAudioKb} KB`);
      await this.enterListening("small-audio-discarded");
      return;
    }

    if (now() - this.lastSubmissionAt < this.config.debounceMs) {
      this.debug("Audio descartado por debounce");
      await this.enterListening("debounce-discarded");
      return;
    }

    this.lastSubmissionAt = now();
    this.uploadInFlight = true;
    this.transitionTo("uploading", "audio-ready-for-upload");

    try {
      await this.handleTranscription(blob);
    } finally {
      this.uploadInFlight = false;
      if (this.active && this.currentState !== "speaking") {
        await this.enterListening("upload-finished");
      }
    }
  }

  private async handleTranscription(blob: Blob) {
    this.transitionTo("transcribing", "transcription-started");
    const transcription = await this.transcribe(blob);
    this.lastTranscript = transcription.text;
    this.lastError = transcription.error || "";
    this.wakeDetected = detectWakeWord(transcription.text);
    this.intentionDetected = detectIntention(transcription.text, this.activeConversationMode);
    this.publish();

    if (!transcription.text) {
      this.debug("Transcripción vacía");
      return;
    }

    if (!this.intentionDetected) {
      this.debug("Texto transcrito sin intención suficiente");
      return;
    }

    this.lastBrainRequest = transcription.text;
    this.transitionTo("thinking", "brain-request-started");
    const brainReply = await this.runBrain(transcription.text);
    this.lastBrainResponse = brainReply;
    this.publish();

    if (brainReply.trim()) {
      this.transitionTo("speaking", "brain-response-speaking");
      this.speak(brainReply);
    }
  }

  private createRecorder() {
    if (typeof MediaRecorder === "undefined" || !this.stream) return null;
    const mimeType = this.detectMimeType();
    return new MediaRecorder(this.stream, mimeType ? { mimeType } : undefined);
  }

  private detectMimeType() {
    if (typeof MediaRecorder === "undefined") return "";
    const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/mpeg"];
    return candidates.find((mime) => MediaRecorder.isTypeSupported(mime)) || "";
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
        const message = typeof data.error === "string" ? data.error : "No se pudo transcribir el audio.";
        return { text: "", error: message };
      }

      const transcriptionText: string = (() => {
        if (typeof data.text === "string") return data.text;

        const transcript = data.transcript;
        if (typeof transcript === "object" && transcript !== null) {
          const transcriptText = (transcript as Record<string, unknown>).text;
          if (typeof transcriptText === "string") return transcriptText;
        }

        const raw = data.raw;
        if (typeof raw === "object" && raw !== null && typeof (raw as Record<string, unknown>).text === "string") {
          return String((raw as Record<string, unknown>).text);
        }

        return typeof raw === "string" ? raw : "";
      })();

      return { text: cleanText(transcriptionText), error: "" };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido al transcribir.";
      this.lastTranscriptionStatus = null;
      this.lastTranscriptionRawResponse = message;
      return { text: "", error: message };
    }
  }

  private async runBrain(text: string) {
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
    if (typeof window === "undefined" || !text.trim()) {
      void this.enterListening("empty-speech");
      return;
    }

    this.stopAnalyser();
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance = utterance;
    utterance.lang = "es-ES";
    utterance.rate = 1.01;
    utterance.pitch = 1.01;
    utterance.volume = 0.95;

    const finish = () => {
      if (this.currentUtterance !== utterance) return;
      this.currentUtterance = null;
      this.speakingFinishedAt = now();
      if (!this.active) return;
      void this.enterListening("speaking-finished");
    };

    utterance.onend = finish;
    utterance.onerror = finish;
    window.speechSynthesis.speak(utterance);
  }

  private stopSpeaking() {
    if (typeof window !== "undefined") {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
    this.speakingFinishedAt = now();
  }

  private scheduleRestart(delayMs: number, reason: string) {
    this.clearRestartTimer();
    if (!this.active) return;
    this.restartTimer = window.setTimeout(() => {
      void this.enterListening(reason);
    }, delayMs);
  }

  private clearRestartTimer() {
    if (this.restartTimer) window.clearTimeout(this.restartTimer);
    this.restartTimer = null;
  }

  private stopAnalyser() {
    if (this.analyserTimer) window.clearInterval(this.analyserTimer);
    this.analyserTimer = null;
  }

  private stopStream() {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    this.analyserSource?.disconnect();
    this.analyser = null;
    this.analyserSource = null;
    this.analyserBuffer = null;
    if (this.audioContext) {
      void this.audioContext.close().catch(() => undefined);
      this.audioContext = null;
    }
  }
}

export function createVoiceEngineV2(options: VoiceEngineV2Options = {}) {
  return new VoiceEngineV2(options);
}

export function getVoiceEngineV2DebugSummary(snapshot: VoiceEngineV2Snapshot) {
  return {
    summary: `${snapshot.currentState} · ${snapshot.recording ? "recording" : "idle"} · audio ${snapshot.lastAudioKb} KB`,
    humanReadable: [
      `Permiso: ${snapshot.permissionState}`,
      `Estado actual: ${snapshot.currentState}`,
      `Estado anterior: ${snapshot.previousState || "—"}`,
      `Grabando: ${snapshot.recording ? "sí" : "no"}`,
      `Duración grabación: ${snapshot.lastRecordingDurationMs} ms`,
      `Audio: ${snapshot.lastAudioKb} KB`,
      `Transcripción limpia: ${snapshot.lastTranscript || "—"}`,
      `Estado de transcripción: ${snapshot.lastTranscriptionStatus ?? "—"}`,
      `RAW OpenAI: ${snapshot.lastTranscriptionRawResponse || "—"}`,
      `Wake: ${snapshot.wakeDetected ? "sí" : "no"}`,
      `Intención: ${snapshot.intentionDetected ? "sí" : "no"}`,
      `Brain request: ${snapshot.lastBrainRequest || "—"}`,
      `Brain response: ${snapshot.lastBrainResponse || "—"}`,
      `Última razón: ${snapshot.lastReason || "—"}`,
      `Último error: ${snapshot.lastError || "—"}`,
    ],
  };
}