"use client";

import Image from "next/image";
import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function RegistroPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-[#070711] text-white">Cargando...</main>}>
      <RegistroContent />
    </Suspense>
  );
}

function RegistroContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");

  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("Peluquería");
  const [password, setPassword] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [theme, setTheme] = useState("dark");
  const [primaryGoal, setPrimaryGoal] = useState("reservas");
  const [loading, setLoading] = useState(false);

  const createAccount = async () => {
    if (!sessionId || !businessName || !password) {
      alert("Faltan datos");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, businessName, businessType, password, logoUrl, theme, primaryGoal }),
    });

    const data = await res.json();

    if (data.error) alert(data.error);
    else {
      alert("Cuenta creada correctamente. Ahora inicia sesión.");
      router.push("/login");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#070711] px-6 py-10 text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,.55),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(236,72,153,.18),transparent_30%)]" />
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
            <MiniStat title="Paso 3" text="Acceso" />
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.08] p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <h2 className="text-3xl font-semibold">Configura tu cuenta</h2>
          <p className="mt-2 text-white/55">Estos datos se usarán para crear tu espacio de trabajo Flowly.</p>

          <div className="mt-6 grid gap-4">
            <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Nombre del negocio" className="input-dark" />
            <select value={businessType} onChange={(e) => setBusinessType(e.target.value)} className="input-dark">
              <option>Peluquería</option><option>Barbería</option><option>Estética</option><option>Restaurante</option><option>Clínica</option><option>Fisioterapia</option><option>Academia</option><option>Otro</option>
            </select>
            <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="URL del logo opcional" className="input-dark" />
            <select value={theme} onChange={(e) => setTheme(e.target.value)} className="input-dark">
              <option value="dark">Tema oscuro premium</option>
              <option value="light">Tema claro elegante</option>
              <option value="violet">Tema morado Flowly</option>
            </select>
            <select value={primaryGoal} onChange={(e) => setPrimaryGoal(e.target.value)} className="input-dark">
              <option value="reservas">Quiero gestionar reservas</option>
              <option value="clientes">Quiero organizar clientes</option>
              <option value="ventas">Quiero controlar ventas y caja</option>
              <option value="automatizar">Quiero automatizar tareas</option>
            </select>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Crear contraseña" className="input-dark" />
          </div>

          <button onClick={createAccount} disabled={loading} className="mt-6 w-full rounded-full bg-white px-6 py-4 font-semibold text-neutral-950 disabled:opacity-60">
            {loading ? "Creando panel..." : "Crear mi panel personalizado"}
          </button>
        </section>
      </div>
    </main>
  );
}

function MiniStat({ title, text }: { title: string; text: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4"><p className="text-sm text-violet-200">{title}</p><p className="mt-1 font-semibold">{text}</p></div>;
}
