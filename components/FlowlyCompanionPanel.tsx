"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Bot,
  Brain,
  CheckCircle2,
  Database,
  HeartPulse,
  MessageCircle,
  Radio,
  RefreshCw,
  Server,
  Sparkles,
  TerminalSquare,
  Workflow,
  Zap,
} from "lucide-react";

type FlowlyCompanionPanelProps = {
  business?: {
    id?: string;
    name?: string | null;
    business_type?: string | null;
    plan?: string | null;
    subscription_status?: string | null;
  } | null;
  businessAvatar?: {
    avatar_name?: string | null;
    avatar_personality?: string | null;
    avatar_style?: string | null;
  } | null;
  customersCount?: number;
  appointmentsCount?: number;
  activeModulesCount?: number;
  integrationsCount?: number;
  voiceCallsCount?: number;
  onNavigate?: (tab: string) => void;
};

type CompanionProfile = {
  id?: string;
  name?: string;
  language?: string;
  voice?: string;
  personality?: string;
  model?: string;
  memoryEnabled?: boolean;
  emotionEnabled?: boolean;
};

type ToolsStatus = {
  ok?: boolean;
  generatedAt?: string;
  counters?: Record<string, number>;
  checks?: Record<string, { ok?: boolean; count?: number; error?: string }>;
};

type ToolsList = {
  ok?: boolean;
  tools?: { name: string; description?: string; endpoint?: string; method?: string }[];
};

const GATEWAY_URL = process.env.NEXT_PUBLIC_FLOW_COMPANION_GATEWAY_URL || "https://flowly-companion-gateway.onrender.com";

function StatusPill({ ok, label }: { ok?: boolean; label: string }) {
  return (
    <span className={ok ? "inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs font-black text-emerald-100" : "inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-xs font-black text-amber-100"}>
      <span className={ok ? "h-2 w-2 rounded-full bg-emerald-300" : "h-2 w-2 rounded-full bg-amber-300"} />
      {label}
    </span>
  );
}

function CounterCard({ label, value, icon }: { label: string; value: number | string; icon: React.ReactNode }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.2em] text-white/35">{label}</p>
        <span className="text-cyan-100/80">{icon}</span>
      </div>
      <strong className="mt-2 block text-2xl text-white">{value}</strong>
    </article>
  );
}

async function readJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export default function FlowlyCompanionPanel({
  business,
  businessAvatar,
  customersCount = 0,
  appointmentsCount = 0,
  activeModulesCount = 0,
  integrationsCount = 0,
  voiceCallsCount = 0,
  onNavigate,
}: FlowlyCompanionPanelProps) {
  const [profile, setProfile] = useState<CompanionProfile | null>(null);
  const [toolStatus, setToolStatus] = useState<ToolsStatus | null>(null);
  const [toolsList, setToolsList] = useState<ToolsList | null>(null);
  const [gatewayHealth, setGatewayHealth] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  const companionName = profile?.name || businessAvatar?.avatar_name || "Flow";
  const personality = profile?.personality || businessAvatar?.avatar_personality || "Empático, natural, atento y cercano.";
  const counters = toolStatus?.counters || {};

  const modules = useMemo(() => [
    { label: "Gateway", ok: Boolean(gatewayHealth?.ok), icon: <Server size={18} />, text: "Render WebSocket + Runtime + OpenAI." },
    { label: "OpenAI", ok: Boolean(gatewayHealth), icon: <Brain size={18} />, text: "Conversation Engine conectado." },
    { label: "Memoria", ok: Boolean(profile?.memoryEnabled), icon: <Database size={18} />, text: "Memoria básica operativa." },
    { label: "Emoción", ok: Boolean(profile?.emotionEnabled), icon: <HeartPulse size={18} />, text: "Emotion Engine sincronizado con Unity." },
    { label: "Herramientas", ok: Boolean(toolsList?.tools?.length), icon: <Workflow size={18} />, text: "Tool Engine preparado para Flowly." },
    { label: "Panel", ok: true, icon: <Bot size={18} />, text: "Este es el nuevo Flow dentro de Flowly." },
  ], [gatewayHealth, profile, toolsList]);

  const loadStatus = async () => {
    setLoading(true);
    const [profileData, toolsData, statusData, gatewayData] = await Promise.all([
      readJson<{ ok?: boolean; companion?: CompanionProfile }>("/api/companion/profile"),
      readJson<ToolsList>("/api/companion/tools"),
      readJson<ToolsStatus>("/api/companion/tools/status"),
      readJson<Record<string, unknown>>(`${GATEWAY_URL}/health`),
    ]);

    setProfile(profileData?.companion || null);
    setToolsList(toolsData);
    setToolStatus(statusData);
    setGatewayHealth(gatewayData);
    setLoading(false);
  };

  useEffect(() => {
    void loadStatus();
  }, []);

  return (
    <section className="grid gap-6">
      <div className="overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-[radial-gradient(circle_at_10%_0%,rgba(34,211,238,.28),transparent_30%),radial-gradient(circle_at_90%_10%,rgba(167,139,250,.24),transparent_34%),linear-gradient(135deg,rgba(2,6,23,.98),rgba(15,23,42,.94))] p-6 shadow-2xl shadow-cyan-950/30">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-200">Nuevo Flow Companion Engine</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white">{companionName} ya está visible en Flowly</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/65">
              Este es el nuevo Flow: Gateway propio, Conversation Engine, memoria, emoción, personalidad base, Tool Engine y conexión con OpenAI. El Flow flotante antiguo queda apartado para no confundirse con este runtime nuevo.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <StatusPill ok={Boolean(gatewayHealth?.ok)} label={gatewayHealth?.ok ? "Gateway online" : "Gateway pendiente"} />
              <StatusPill ok={Boolean(profile)} label={profile ? "Perfil cargado" : "Perfil pendiente"} />
              <StatusPill ok={Boolean(toolStatus?.ok)} label={toolStatus?.ok ? "Tools API online" : "Tools API pendiente"} />
            </div>
          </div>
          <button type="button" onClick={loadStatus} className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100 hover:bg-cyan-300/15">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Actualizar estado
          </button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-4">
          <CounterCard label="Clientes" value={counters.customers ?? customersCount} icon={<MessageCircle size={17} />} />
          <CounterCard label="Citas" value={counters.appointments ?? appointmentsCount} icon={<Activity size={17} />} />
          <CounterCard label="Módulos" value={counters.modules ?? activeModulesCount} icon={<Workflow size={17} />} />
          <CounterCard label="Voice Calls" value={counters.voiceCalls ?? voiceCallsCount} icon={<Radio size={17} />} />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
        <article className="rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-lg font-black text-white"><Sparkles size={18} /> Núcleo del Companion</h2>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white/70">Engine v3</span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {modules.map((module) => (
              <div key={module.label} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 font-black text-white">{module.icon}{module.label}</div>
                  {module.ok ? <CheckCircle2 size={17} className="text-emerald-300" /> : <span className="h-2 w-2 rounded-full bg-amber-300" />}
                </div>
                <p className="mt-2 text-sm leading-6 text-white/55">{module.text}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-5">
          <h2 className="flex items-center gap-2 text-lg font-black text-white"><Brain size={18} /> Perfil activo</h2>
          <div className="mt-4 space-y-3 text-sm text-white/65">
            <p><strong className="text-white">ID:</strong> {profile?.id || "flow-companion-dev"}</p>
            <p><strong className="text-white">Nombre:</strong> {companionName}</p>
            <p><strong className="text-white">Idioma:</strong> {profile?.language || "es"}</p>
            <p><strong className="text-white">Voz:</strong> {profile?.voice || "nova"}</p>
            <p><strong className="text-white">Modelo:</strong> {profile?.model || "gpt-4.1-mini / realtime-ready"}</p>
            <p className="leading-6"><strong className="text-white">Personalidad:</strong> {personality}</p>
          </div>
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-[1.7rem] border border-cyan-300/20 bg-cyan-300/10 p-5">
          <h2 className="flex items-center gap-2 text-lg font-black text-cyan-50"><TerminalSquare size={18} /> Tool Engine</h2>
          <p className="mt-2 text-sm leading-6 text-white/70">
            Primera herramienta real activa: <strong>flowly.status</strong>. El siguiente paso será añadir CRM, agenda, facturación y WhatsApp.
          </p>
          <div className="mt-4 space-y-2">
            {(toolsList?.tools || []).map((tool) => (
              <div key={tool.name} className="rounded-2xl border border-white/10 bg-black/25 p-3 text-sm text-white/65">
                <strong className="text-white">{tool.name}</strong>
                <p className="mt-1">{tool.description}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[1.7rem] border border-white/10 bg-black/25 p-5">
          <h2 className="flex items-center gap-2 text-lg font-black text-white"><Zap size={18} /> Acciones rápidas</h2>
          <div className="mt-4 grid gap-2">
            <button type="button" onClick={() => onNavigate?.("clientes")} className="rounded-full bg-white px-4 py-2 text-sm font-bold text-neutral-950">Abrir clientes</button>
            <button type="button" onClick={() => onNavigate?.("agenda")} className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white">Abrir agenda</button>
            <Link href="/companion" className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-center text-sm font-bold text-cyan-100">Ver runtime completo</Link>
          </div>
        </article>

        <article className="rounded-[1.7rem] border border-white/10 bg-black/25 p-5">
          <h2 className="flex items-center gap-2 text-lg font-black text-white"><Bot size={18} /> Estado visual</h2>
          <p className="mt-2 text-sm leading-6 text-white/65">
            El nuevo Flow está aquí en el panel. El Companion antiguo flotante se ha desactivado desde <code className="rounded bg-white/10 px-1 py-0.5">FlowlyCompanionGate</code> para que solo veas esta versión nueva.
          </p>
        </article>
      </div>
    </section>
  );
}
