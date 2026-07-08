"use client";

import { useEffect, useState } from "react";
import { Maximize2, RotateCw, Sparkles } from "lucide-react";

type FlowUnityWebGLProps = {
  compact?: boolean;
  className?: string;
};

const UNITY_URL = "/flow-companion-webgl/index.html";

export default function FlowUnityWebGL({ compact = false, className = "" }: FlowUnityWebGLProps) {
  const [frameKey, setFrameKey] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== "object") return;
      if (event.data.type === "flow-unity-ready") {
        setReady(true);
        setError(null);
      }
      if (event.data.type === "flow-unity-error") {
        setError(typeof event.data.message === "string" ? event.data.message : "No se pudo cargar Unity WebGL.");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const reload = () => {
    setReady(false);
    setError(null);
    setFrameKey((value) => value + 1);
  };

  return (
    <section className={`overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-[#07111f] shadow-2xl shadow-cyan-950/30 ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.045] px-4 py-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.24em] text-cyan-200">
            <Sparkles size={14} /> Unity WebGL Avatar
          </p>
          <p className="mt-1 truncate text-sm text-white/55">
            {ready ? "Flow Companion cargado" : error ? "Error al cargar el Companion" : "Cargando avatar real de Unity..."}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={reload} className="rounded-full border border-white/10 bg-white/5 p-2 text-white/70 hover:bg-white/10" aria-label="Recargar Flow Companion">
            <RotateCw size={16} />
          </button>
          <a href={UNITY_URL} target="_blank" rel="noreferrer" className="rounded-full border border-cyan-300/25 bg-cyan-300/10 p-2 text-cyan-100 hover:bg-cyan-300/15" aria-label="Abrir Flow Companion en pantalla completa">
            <Maximize2 size={16} />
          </a>
        </div>
      </div>

      <div className={compact ? "relative h-[34rem] min-h-[520px]" : "relative h-[min(76vh,780px)] min-h-[620px]"}>
        {!ready && !error && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-[#07111f] text-center text-white/70">
            <div>
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-cyan-200/20 border-t-cyan-200" />
              <p className="text-sm font-bold">Preparando el nuevo Flow...</p>
              <p className="mt-2 text-xs text-white/40">La primera carga puede tardar unos segundos.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-[#07111f] p-6 text-center text-white">
            <div className="max-w-md rounded-3xl border border-red-300/20 bg-red-500/10 p-6">
              <p className="font-black text-red-100">No se pudo cargar Flow Companion</p>
              <p className="mt-2 text-sm text-white/60">{error}</p>
              <button type="button" onClick={reload} className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-bold text-neutral-950">Reintentar</button>
            </div>
          </div>
        )}

        <iframe
          key={frameKey}
          title="Flow Companion Unity WebGL"
          src={UNITY_URL}
          className="h-full w-full border-0"
          allow="autoplay; microphone; fullscreen; clipboard-read; clipboard-write"
        />
      </div>
    </section>
  );
}
