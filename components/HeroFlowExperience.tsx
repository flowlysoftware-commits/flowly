"use client";

import { useEffect, useState } from "react";
import { CalendarDays, FileText, MessageCircle, Sparkles, Users } from "lucide-react";
import FlowCharacter from "@/components/flow-engine/FlowCharacter";
import type { FlowEmotion, FlowMode } from "@/components/flow-engine/types";

const emotion: FlowEmotion = {
  mood: "joyful",
  calm: 0.78,
  joy: 0.72,
  curiosity: 0.58,
  empathy: 0.7,
  stress: 0.04,
  confidence: 0.9,
  attention: 0.82,
  energy: 0.7,
};

export default function HeroFlowExperience() {
  const [mode, setMode] = useState<FlowMode>("waving");

  useEffect(() => {
    const first = window.setTimeout(() => setMode("idle"), 3100);
    const loop = window.setInterval(() => {
      setMode("waving");
      window.setTimeout(() => setMode("idle"), 2900);
    }, 11000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(loop);
    };
  }, []);

  return (
    <div className="flowly-hero-experience" aria-label="Flow controlando el sistema de tu negocio">
      <div className="flowly-ai-halo" />
      <div className="flowly-ai-ring flowly-ai-ring-one" />
      <div className="flowly-ai-ring flowly-ai-ring-two" />
      <div className="flowly-ai-floor" />

      <div className="flowly-hero-character">
        <FlowCharacter mode={mode} facing="front" emotion={emotion} speechLevel={0} />
      </div>

      <div className="flowly-orbit-card flowly-orbit-card-clients">
        <Users size={18} />
        <div><span>CRM</span><strong>Cliente nuevo</strong></div>
      </div>
      <div className="flowly-orbit-card flowly-orbit-card-whatsapp">
        <MessageCircle size={18} />
        <div><span>WhatsApp</span><strong>Respuesta lista</strong></div>
      </div>
      <div className="flowly-orbit-card flowly-orbit-card-agenda">
        <CalendarDays size={18} />
        <div><span>Agenda</span><strong>Cita confirmada</strong></div>
      </div>
      <div className="flowly-orbit-card flowly-orbit-card-invoice">
        <FileText size={18} />
        <div><span>Ventas</span><strong>Factura cobrada</strong></div>
      </div>

      <div className="flowly-ai-status">
        <Sparkles size={15} />
        <span>Flow está coordinando tu negocio</span>
      </div>
    </div>
  );
}
