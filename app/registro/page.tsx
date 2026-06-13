"use client";

import Image from "next/image";
import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

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

  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("Peluquería");
  const [password, setPassword] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [primaryGoal, setPrimaryGoal] = useState("reservas");
  const [createAvatar, setCreateAvatar] = useState(true);
  const [avatarName, setAvatarName] = useState("Nia");
  const [avatarStyle, setAvatarStyle] = useState("robot-premium");
  const [avatarPersonality, setAvatarPersonality] = useState("cercana, estratégica y orientada a ventas");
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
      body: JSON.stringify({ sessionId, businessName, businessType, password, logoUrl, logoBase64, logoFileName: logoFile?.name || null, logoMimeType: logoFile?.type || null, termsAccepted, termsVersion: "flowly-ia-v1", theme, primaryGoal, createAvatar, avatarName, avatarStyle, avatarPersonality }),
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
    <main className="min-h-screen flowly-public px-6 py-10 text-white">
      <div className="fixed inset-0 " />
      <div className="relative mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <section>
          <Image src="/logo.png" alt="Flowly IA" width={170} height={48} className="h-auto w-40 object-contain" priority />
          <h1 className="mt-10 text-5xl font-semibold tracking-tight md:text-6xl">Personaliza tu panel desde el primer día.</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-white/60">
            Tu suscripción ya está activa. Configura el nombre, sector, tema visual, logo y mascota IA para que el panel parezca realmente tuyo.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <MiniStat title="Paso 1" text="Identidad" />
            <MiniStat title="Paso 2" text="Tema" />
            <MiniStat title="Paso 3" text="Mascota IA" />
          </div>
        </section>

        <section className="rounded-[2rem] flowly-glass p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <h2 className="text-3xl font-semibold">Configura tu cuenta</h2>
          <p className="mt-2 text-white/55">Estos datos se usarán para crear tu espacio de trabajo Flowly.</p>

          <div className="mt-6 grid gap-4">
            <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Nombre del negocio" className="flowly-input-light rounded-2xl px-4 py-3" />
            <select value={businessType} onChange={(e) => setBusinessType(e.target.value)} className="flowly-input-light rounded-2xl px-4 py-3">
              <option>Peluquería</option><option>Barbería</option><option>Estética</option><option>Restaurante</option><option>Clínica</option><option>Fisioterapia</option><option>Academia</option><option>Otro</option>
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
            <div className="rounded-3xl border border-cyan-300/20 bg-cyan-400/10 p-4">
              <label className="flex items-center justify-between gap-4 text-sm font-semibold text-cyan-50">
                Crear tu mascota IA
                <input type="checkbox" checked={createAvatar} onChange={(e) => setCreateAvatar(e.target.checked)} className="h-5 w-5" />
              </label>
              <p className="mt-2 text-xs leading-5 text-white/55">Flowly generará un avatar de marca para el header, el dashboard y el módulo IA. Usará el logo y el estilo del negocio como inspiración.</p>
              {createAvatar && (
                <div className="mt-4 grid gap-3">
                  <input value={avatarName} onChange={(e) => setAvatarName(e.target.value)} placeholder="Nombre de la mascota. Ej: Nia" className="flowly-input-light rounded-2xl px-4 py-3" />
                  <select value={avatarStyle} onChange={(e) => setAvatarStyle(e.target.value)} className="flowly-input-light rounded-2xl px-4 py-3">
                    <option value="robot-premium">Robot premium SaaS</option>
                    <option value="humanoide-corporativo">Asistente humanoide corporativo</option>
                    <option value="animal-futurista">Mascota animal futurista</option>
                    <option value="minimalista-branding">Minimalista de marca</option>
                    <option value="cyberpunk-elegante">Cyberpunk elegante</option>
                  </select>
                  <textarea value={avatarPersonality} onChange={(e) => setAvatarPersonality(e.target.value)} placeholder="Personalidad de la mascota" className="flowly-input-light min-h-24 rounded-2xl px-4 py-3" />
                </div>
              )}
            </div>
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
