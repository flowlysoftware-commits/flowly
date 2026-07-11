"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { LockKeyhole, Sparkles } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!email || !password) return alert("Introduce email y contraseña");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      return alert(error.message);
    }

    const userId = data.user?.id;
    if (!userId) {
      setLoading(false);
      return alert("No se pudo iniciar sesión");
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("account_type, role")
      .eq("user_id", userId)
      .maybeSingle();

    if (profile?.account_type === "admin") return router.push("/admin");
    if (profile?.account_type === "sales") return router.push("/comercial");

    const { data: salesUser } = await supabase
      .from("sales_users")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (salesUser) return router.push("/comercial");

    window.sessionStorage.setItem("flow_companion_welcome_pending", "1");
    router.push("/dashboard");
  };

  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden flowly-public px-6 text-white">
      <div className="fixed inset-0 " />
      <div className="relative w-full max-w-md rounded-[2rem] flowly-glass p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <Link href="/" className="text-sm text-white/55">← Volver a Flowly IA</Link>

        <div className="mt-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-fuchsia-400 text-slate-950">
          <LockKeyhole />
        </div>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full flowly-chip px-4 py-2 text-xs">
          <Sparkles size={14} /> Acceso seguro
        </div>

        <h1 className="mt-6 text-3xl font-semibold">Acceder a Flowly IA</h1>
        <p className="mt-2 text-white/55">Clientes, comerciales y administradores entran desde aquí. Flowly te redirige a tu área correcta.</p>

        <div className="mt-6 grid gap-4">
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" className="flowly-input-light rounded-2xl px-4 py-3" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Contraseña" className="flowly-input-light rounded-2xl px-4 py-3" />
        </div>

        <button onClick={login} disabled={loading} className="mt-6 w-full flowly-primary rounded-full px-6 py-4 font-semibold disabled:opacity-60">
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </div>
    </main>
  );
}
