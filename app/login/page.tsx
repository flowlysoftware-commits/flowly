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

    router.push("/dashboard");
  };

  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-[#070711] px-6 text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,.55),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(236,72,153,.18),transparent_30%)]" />
      <div className="relative w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.07] p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <Link href="/" className="text-sm text-white/55">← Volver a Flowly IA</Link>

        <div className="mt-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-100">
          <LockKeyhole />
        </div>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-500/10 px-4 py-2 text-xs text-violet-100">
          <Sparkles size={14} /> Acceso seguro
        </div>

        <h1 className="mt-6 text-3xl font-semibold">Acceder a Flowly IA</h1>
        <p className="mt-2 text-white/55">Clientes, comerciales y administradores entran desde aquí. Flowly te redirige a tu área correcta.</p>

        <div className="mt-6 grid gap-4">
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" className="input-dark" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Contraseña" className="input-dark" />
        </div>

        <button onClick={login} disabled={loading} className="mt-6 w-full rounded-full bg-white px-6 py-4 font-semibold text-neutral-950 disabled:opacity-60">
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </div>
    </main>
  );
}
