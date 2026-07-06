"use client";

import Image from "next/image";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";


const SESSION_KEY = "flowly_analytics_session_id";
const VISITOR_KEY = "flowly_analytics_visitor_id";
const SESSION_STARTED_KEY = "flowly_analytics_session_started_at";

function createAnalyticsId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function trackRegistroVisit() {
  try {
    const params = new URLSearchParams(window.location.search || "");
    let visitorId = window.localStorage.getItem(VISITOR_KEY);
    if (!visitorId) {
      visitorId = createAnalyticsId("visitor");
      window.localStorage.setItem(VISITOR_KEY, visitorId);
    }

    const startedAt = Number(window.sessionStorage.getItem(SESSION_STARTED_KEY) || 0);
    let sessionId = window.sessionStorage.getItem(SESSION_KEY);
    if (!sessionId || !startedAt || Date.now() - startedAt > 30 * 60 * 1000) {
      sessionId = createAnalyticsId("session");
      window.sessionStorage.setItem(SESSION_KEY, sessionId);
    }
    window.sessionStorage.setItem(SESSION_STARTED_KEY, String(Date.now()));

    const fullPath = `${window.location.pathname}${window.location.search || ""}${window.location.hash || ""}`;
    const payload = {
      eventName: "page_view",
      visitorId,
      sessionId,
      path: window.location.pathname || "/registro",
      fullPath,
      funnelStep: "signup",
      title: document.title || "Registro Flowly IA",
      referrer: document.referrer || null,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      attribution: {
        gclid: params.get("gclid"),
        fbclid: params.get("fbclid"),
        utm_source: params.get("utm_source"),
        utm_medium: params.get("utm_medium"),
        utm_campaign: params.get("utm_campaign"),
        utm_content: params.get("utm_content"),
        utm_term: params.get("utm_term"),
      },
      source: "registro_direct_tracker",
    };

    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      const queued = navigator.sendBeacon(
        "/api/analytics/track",
        new Blob([body], { type: "application/json" }),
      );
      if (queued) return;
    }

    fetch("/api/analytics/track", {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body,
    }).catch(() => undefined);
  } catch {
    // El tracking nunca debe bloquear el registro.
  }
}

export default function RegistroPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center flowly-public text-white">Cargando...</main>}>
      <RegistroContent />
    </Suspense>
  );
}

function RegistroContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    trackRegistroVisit();
  }, []);

  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("Peluquería");
  const [password, setPassword] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [primaryGoal, setPrimaryGoal] = useState("reservas");
  const [loading, setLoading] = useState(false);

  const createAccount = async () => {
    if (!sessionId || !businessName || !password) {
      alert("Faltan datos");
      return;
    }
    if (!termsAccepted) {
      alert("Debes aceptar las condiciones de contratación y privacidad de Flowly IA para crear el panel.");
      return;
    }

    setLoading(true);

    let logoBase64: string | null = null;
    if (logoFile) {
      setLogoUploading(true);
      logoBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("No se pudo leer el logo"));
        reader.readAsDataURL(logoFile);
      }).catch((error) => {
        alert(error.message);
        return null;
      });
      setLogoUploading(false);
      if (!logoBase64) {
        setLoading(false);
        return;
      }
    }

    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, businessName, businessType, password, logoUrl, logoBase64, logoFileName: logoFile?.name || null, logoMimeType: logoFile?.type || null, termsAccepted, termsVersion: "flowly-ia-v1", theme, primaryGoal }),
    });

    const data = await res.json();

    if (data.error) alert(data.error);
    else {
      const emailParam = data.email ? `?email=${encodeURIComponent(data.email)}` : "";
      router.push(`/bienvenido${emailParam}`);
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen flowly-public px-6 py-10 text-white">
      <div className="fixed inset-0 " />
      <div className="relative mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <section>
          <Image src="/logo.png" alt="Flowly IA" width={170} height={48} className="h-auto w-40 object-contain" priority />
          <h1 className="mt-10 text-5xl font-semibold tracking-tight md:text-6xl">Personaliza tu panel desde el primer día.</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-white/60">
            Tu suscripción ya está activa. Configura el nombre, sector, tema visual y logo para que el panel parezca realmente tuyo.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <MiniStat title="Paso 1" text="Identidad" />
            <MiniStat title="Paso 2" text="Tema" />
            <MiniStat title="Paso 3" text="Logo y tema" />
          </div>
        </section>

        <section className="rounded-[2rem] flowly-glass p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <h2 className="text-3xl font-semibold">Configura tu cuenta</h2>
          <p className="mt-2 text-white/55">Estos datos se usarán para crear tu espacio de trabajo Flowly.</p>

          <div className="mt-6 grid gap-4">
            <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Nombre del negocio" className="flowly-input-light rounded-2xl px-4 py-3" />
            <select value={businessType} onChange={(e) => setBusinessType(e.target.value)} className="flowly-input-light rounded-2xl px-4 py-3">
              <option>Clínica / Centro médico</option><option>Clínica dental</option><option>Fisioterapia</option><option>Veterinaria</option><option>Medicina estética</option><option>Peluquería</option><option>Barbería</option><option>Centro de estética</option><option>Spa</option><option>Gimnasio</option><option>Restaurante</option><option>Cafetería</option><option>Hotel</option><option>Taller mecánico</option><option>Inmobiliaria</option><option>Despacho legal</option><option>Asesoría</option><option>Academia</option><option>Autoescuela</option><option>Empresa de limpieza</option><option>Reformas</option><option>Instaladores</option><option>Agencia de marketing</option><option>Comercio minorista</option><option>Tienda de ropa</option><option>Tienda tecnológica</option><option>Ecommerce</option><option>Logística</option><option>Transporte</option><option>Otro</option>
            </select>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm font-semibold text-white">Logo del negocio</p>
              <p className="mt-1 text-xs text-white/50">Sube el archivo del logo. Ya no usamos enlaces externos para la marca del cliente.</p>
              <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} className="mt-3 block w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-950" />
              {(logoFile || logoUrl) && <p className="mt-2 text-xs text-cyan-200">{logoFile ? `Archivo seleccionado: ${logoFile.name}` : "Logo cargado correctamente"}</p>}
            </div>
            <select value={theme} onChange={(e) => setTheme(e.target.value)} className="flowly-input-light rounded-2xl px-4 py-3">
              <option value="dark">Tema oscuro premium</option>
              <option value="light">Tema claro elegante</option>
              <option value="violet">Tema morado Flowly</option>
            </select>
            <select value={primaryGoal} onChange={(e) => setPrimaryGoal(e.target.value)} className="flowly-input-light rounded-2xl px-4 py-3">
              <option value="reservas">Quiero gestionar reservas</option>
              <option value="clientes">Quiero organizar clientes</option>
              <option value="ventas">Quiero controlar ventas y caja</option>
              <option value="automatizar">Quiero automatizar tareas</option>
            </select>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Crear contraseña" className="flowly-input-light rounded-2xl px-4 py-3" />
            <label className="flex items-start gap-3 rounded-2xl border border-violet-300/20 bg-violet-400/10 p-4 text-sm text-white/75">
              <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="mt-1 h-5 w-5 shrink-0" />
              <span>
                Acepto las <a href="/legal/condiciones" target="_blank" className="font-semibold text-cyan-200 underline decoration-cyan-200/40">condiciones de contratación, confidencialidad y privacidad de Flowly IA</a>. Entiendo que los datos del negocio y sus clientes son confidenciales y serán tratados según las políticas de Flowly IA.
              </span>
            </label>
          </div>

          <button onClick={createAccount} disabled={loading} className="mt-6 w-full flowly-primary rounded-full px-6 py-4 font-semibold disabled:opacity-60">
            {loading || logoUploading ? "Creando panel..." : "Crear mi panel personalizado"}
          </button>
        </section>
      </div>
    </main>
  );
}

function MiniStat({ title, text }: { title: string; text: string }) {
  return <div className="rounded-2xl flowly-glass p-4"><p className="text-sm text-violet-200">{title}</p><p className="mt-1 font-semibold">{text}</p></div>;
}
