"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ClientPanelLoadingVideoProps = {
  panelReady: boolean;
  onComplete: () => void;
};

const VIDEO_SRC = "/carga panel (1).mp4";
const SAFETY_TIMEOUT_MS = 45_000;
const EXIT_ANIMATION_MS = 550;

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
        // El vídeo está silenciado y normalmente puede reproducirse automáticamente.
        // Si el navegador aun así lo bloquea, no dejamos al usuario atrapado.
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
      className={`fixed inset-0 flex items-center justify-center bg-black transition-opacity duration-500 ${leaving ? "opacity-0" : "opacity-100"}`}
      style={{ zIndex: 2147483647 }}
      role="status"
      aria-label="Preparando panel de Flowly"
    >
      <video
        ref={videoRef}
        className="h-full w-full bg-black object-cover"
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

      <span className="sr-only">Flowly está preparando tu panel.</span>
    </div>
  );
}
