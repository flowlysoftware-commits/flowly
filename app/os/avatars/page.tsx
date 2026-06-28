"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Database, Loader2, RefreshCw, Save, Sparkles, UploadCloud, Wand2 } from "lucide-react";
import EvolutionaryCompanionAvatar from "@/components/EvolutionaryCompanionAvatar";
import { defaultFlowlyAvatarProfile, flowlyAvatarAnimations, type FlowlyAvatarProfile } from "@/lib/flowlyAvatarRuntime";

type ApiResponse = {
  ok: boolean;
  source?: string;
  warning?: string | null;
  error?: string;
  avatar?: FlowlyAvatarProfile;
};

export default function FlowlyAvatarRuntimePage() {
  const [avatar, setAvatar] = useState<FlowlyAvatarProfile>(defaultFlowlyAvatarProfile);
  const [modelUrl, setModelUrl] = useState(defaultFlowlyAvatarProfile.modelUrl);
  const [name, setName] = useState(defaultFlowlyAvatarProfile.name);
  const [description, setDescription] = useState(defaultFlowlyAvatarProfile.description);
  const [source, setSource] = useState("fallback");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [mood, setMood] = useState("idle");

  const previewAvatar = useMemo(() => ({ ...avatar, name, description, modelUrl }), [avatar, name, description, modelUrl]);

  async function load() {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/avatar/config", { cache: "no-store" });
      const data = (await response.json()) as ApiResponse;
      if (data.avatar) {
        setAvatar(data.avatar);
        setName(data.avatar.name);
        setDescription(data.avatar.description);
        setModelUrl(data.avatar.modelUrl);
        setSource(data.source || "desconocido");
      }
      if (data.warning) setMessage(`Aviso: ${data.warning}`);
    } catch (error) {
      setMessage("No he podido leer la configuración. Usaré el avatar local por defecto.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/avatar/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          modelUrl,
          provider: modelUrl.startsWith("http") ? "external" : "local",
          version: "1.0.0",
          fileSizeMb: modelUrl.includes("flowly.glb") ? 5 : undefined,
          supportsProceduralAnimations: true,
          supportsNativeAnimations: false,
          notes: ["Configurado desde /os/avatars", "El Companion global cargará esta URL como avatar principal."],
        }),
      });
      const data = (await response.json()) as ApiResponse;
      if (!response.ok || !data.ok) throw new Error(data.error || "No se ha podido guardar.");
      setMessage("Avatar guardado correctamente. Recarga el panel para verlo en el Companion global.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se ha podido guardar el avatar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#030711] px-6 py-8 text-white">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/developer" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-white/75 hover:bg-white/[0.1]"><ArrowLeft size={16} /> Volver a Developer</Link>
          <button onClick={load} className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-black text-cyan-100"><RefreshCw size={16} /> Recargar configuración</button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[2rem] border border-cyan-300/15 bg-white/[0.055] p-7 shadow-2xl shadow-cyan-950/20">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-300/20 bg-purple-300/10 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-purple-100"><Sparkles size={15} /> Avatar Runtime</div>
            <h1 className="mt-5 text-4xl font-black tracking-tight md:text-6xl">Sistema de avatares de Flowly</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/60">Gestiona el avatar 3D del Companion sin meter modelos pesados en los ZIP. El runtime puede cargar un GLB local, una URL externa o más adelante Supabase Storage.</p>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><span className="text-xs uppercase tracking-[0.18em] text-white/35">Fuente</span><strong className="mt-1 block text-lg">{source}</strong></div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><span className="text-xs uppercase tracking-[0.18em] text-white/35">Modelo</span><strong className="mt-1 block truncate text-lg">{modelUrl}</strong></div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><span className="text-xs uppercase tracking-[0.18em] text-white/35">Estado</span><strong className="mt-1 block text-lg">{loading ? "Cargando" : "Listo"}</strong></div>
            </div>

            <form onSubmit={save} className="mt-7 space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-white/70">Nombre del avatar</span>
                <input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-cyan-300/45" />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-white/70">Descripción</span>
                <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-cyan-300/45" />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-white/70">Ruta del modelo GLB</span>
                <input value={modelUrl} onChange={(event) => setModelUrl(event.target.value)} placeholder="/avatars/flowly.glb" className="mt-2 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none focus:border-cyan-300/45" />
                <small className="mt-2 block text-white/45">Para el avatar optimizado usa: <code>/avatars/flowly.glb</code>. Coloca el archivo en <code>public/avatars/flowly.glb</code>.</small>
              </label>

              <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/10 p-4 text-sm leading-6 text-cyan-50/80">
                <div className="flex items-center gap-2 font-black text-cyan-100"><UploadCloud size={16} /> Cómo usar tu GLB optimizado</div>
                <p className="mt-2">Sube manualmente <strong>flowly.glb</strong> a <strong>public/avatars/flowly.glb</strong>. No lo metas en ZIP si pesa mucho. El Companion lo cargará desde esa ruta.</p>
              </div>

              {message && <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-50/85">{message}</div>}

              <button disabled={saving} className="inline-flex items-center gap-2 rounded-2xl bg-cyan-300 px-5 py-3 font-black text-slate-950 shadow-lg shadow-cyan-950/30 disabled:opacity-60">
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Guardar avatar activo
              </button>
            </form>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-[#07101d] p-7 shadow-2xl shadow-black/30">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black">Vista previa viva</h2>
                <p className="mt-1 text-sm text-white/45">Prueba estados antes de dejarlo activo.</p>
              </div>
              <CheckCircle2 className="text-emerald-300" />
            </div>

            <div className="mt-6 flex min-h-[420px] items-center justify-center rounded-[1.8rem] border border-cyan-300/10 bg-gradient-to-b from-cyan-300/10 via-purple-300/5 to-black/30 p-6">
              <EvolutionaryCompanionAvatar name={previewAvatar.name} level={7} xpPercent={68} mood={mood} modelUrl={previewAvatar.modelUrl} memory="Avatar Runtime activo" />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
              {["idle", "talking", "thinking", "walking", "happy", "celebrating", "working", "sleeping"].map((item) => (
                <button key={item} onClick={() => setMood(item)} className={`rounded-2xl border px-3 py-2 text-sm font-bold transition ${mood === item ? "border-cyan-300/60 bg-cyan-300/20 text-cyan-50" : "border-white/10 bg-white/[0.04] text-white/55 hover:bg-white/[0.08]"}`}>{item}</button>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-sm font-black text-white/80"><Database size={16} /> Animaciones registradas</div>
              <div className="mt-3 grid gap-2">
                {flowlyAvatarAnimations.map((animation) => (
                  <div key={animation.id} className="rounded-xl bg-white/[0.04] px-3 py-2 text-sm text-white/62"><strong className="text-white/85">{animation.label}</strong> · {animation.description}</div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
