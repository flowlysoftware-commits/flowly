"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ClientPanelLoadingVideoProps = {
  panelReady: boolean;
  onComplete: () => void;
};

const VIDEO_SRC = "/carga panel (1).mp4";
const SAFETY_TIMEOUT_MS = 45_000;
const EXIT_ANIMATION_MS = 650;

export default function ClientPanelLoadingVideo({ panelReady, onComplete }: ClientPanelLoadingVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const completedRef = useRef(false);
  const [videoFinished, setVideoFinished] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const markVideoFinished = useCallback(() => {
    setVideoFinished(true);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(markVideoFinished, SAFETY_TIMEOUT_MS);
    return () => window.clearTimeout(timeout);
  }, [markVideoFinished]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const playVideo = async () => {
      try {
        video.currentTime = 0;
        await video.play();
      } catch {
        markVideoFinished();
      }
    };

    void playVideo();
  }, [markVideoFinished]);

  useEffect(() => {
    if (!panelReady || !videoFinished || completedRef.current) return;

    completedRef.current = true;
    setLeaving(true);

    const timeout = window.setTimeout(onComplete, EXIT_ANIMATION_MS);
    return () => window.clearTimeout(timeout);
  }, [onComplete, panelReady, videoFinished]);

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center overflow-hidden bg-black px-5 py-8 transition-all duration-700 sm:px-8 ${
        leaving ? "scale-[1.015] opacity-0" : "scale-100 opacity-100"
      }`}
      style={{ zIndex: 2147483647 }}
      role="status"
      aria-label="Preparando panel de Flowly"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, rgba(77, 82, 200, 0.18), transparent 42%), radial-gradient(circle at 35% 60%, rgba(0, 183, 255, 0.08), transparent 36%)",
        }}
      />

      <div className="relative w-full max-w-[980px]">
        <div
          className="relative overflow-hidden rounded-[24px] border border-white/15 bg-[#050509] shadow-2xl"
          style={{
            boxShadow:
              "0 34px 100px rgba(0,0,0,.78), 0 0 55px rgba(103,83,255,.16), inset 0 1px 0 rgba(255,255,255,.08)",
          }}
        >
          <div className="aspect-video w-full overflow-hidden bg-black">
            <video
              ref={videoRef}
              className="h-full w-full object-contain"
              src={VIDEO_SRC}
              autoPlay
              muted
              playsInline
              preload="auto"
              controls={false}
              disablePictureInPicture
              onEnded={markVideoFinished}
              onError={markVideoFinished}
              aria-hidden="true"
            />
          </div>

          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/75 to-transparent" />

          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-4 sm:bottom-5 sm:left-6 sm:right-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/55 sm:text-xs">
                Flowly OS
              </p>
              <p className="mt-1 text-sm font-medium text-white/90 sm:text-base">
                Preparando tu panel
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-white/55">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
              Sincronizando
            </div>
          </div>
        </div>

        <div className="mx-auto mt-5 h-1 w-44 overflow-hidden rounded-full bg-white/10 sm:w-56">
          <div className="h-full w-2/5 animate-pulse rounded-full bg-gradient-to-r from-cyan-300 via-violet-400 to-fuchsia-400" />
        </div>
      </div>

      <span className="sr-only">Flowly está preparando tu panel.</span>
    </div>
  );
}
