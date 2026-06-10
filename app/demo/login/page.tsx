"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, Sparkles } from "lucide-react";
import Link from "next/link";

export default function DemoLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@flowlyia.com");
  const [password, setPassword] = useState("flowlydemo");

  const login = () => {
    if (email === "demo@flowlyia.com" && password === "flowlydemo") {
      localStorage.setItem("flowly_demo_access", "true");
      router.push("/demo");
    } else {
      alert("Credenciales incorrectas");
    }
  };

  return (
    <main className="flowly-public flex min-h-screen items-center justify-center px-6 py-10">
      <div className="relative z-10 grid w-full max-w-5xl gap-6 md:grid-cols-[.9fr_1.1fr] md:items-center">
        <section className="hidden md:block">
          <div className="flowly-chip mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"><Sparkles size={16} /> Acceso demo</div>
          <h1 className="text-6xl font-semibold tracking-tight">Prueba Flowly como si ya fuera tu panel.</h1>
          <p className="mt-5 text-lg leading-8 text-white/62">Entra al selector y explora demos tecnológicas para clínicas, peluquerías y restaurantes.</p>
        </section>
        <section className="flowly-glass rounded-[2rem] p-8">
          <Link href="/" className="text-sm text-white/60 hover:text-white">← Volver a Flowly IA</Link>
          <div className="mt-8 flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-300 to-fuchsia-400 text-slate-950"><LockKeyhole /></div>
          <h2 className="mt-6 text-3xl font-semibold">Entrar a demos</h2>
          <p className="mt-2 text-white/60">Usa las credenciales ya cargadas para acceder.</p>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.07] p-4 text-sm text-white/70"><p><strong>Usuario:</strong> demo@flowlyia.com</p><p><strong>Contraseña:</strong> flowlydemo</p></div>
          <div className="mt-6 grid gap-4">
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" className="flowly-input-light rounded-2xl px-4 py-3" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" type="password" className="flowly-input-light rounded-2xl px-4 py-3" />
          </div>
          <button onClick={login} className="flowly-primary mt-6 w-full rounded-full px-6 py-4 font-semibold">Entrar a las demos</button>
        </section>
      </div>
    </main>
  );
}
