"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { accountingFetch } from "@/lib/accountingFetch";
import { supabase } from "@/lib/supabaseClient";

type SessionUser = { id: string; name: string };
export default function AccountingAccess({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const revision = useRef(0);

  useEffect(() => {
    let active = true;
    let checkingNow = false;
    const expire = () => { revision.current++; setUser(null); };
    const check = async () => {
      if (checkingNow || pending.current) return;
      checkingNow = true;
      const version = revision.current;
      try {
        const response = await accountingFetch("/api/contabilidad/sesion");
        const data = await response.json();
        if (active && version === revision.current) {
          setUser(response.ok ? data.user : null);
          setError(response.ok || response.status === 401 ? "" : (data.error || "No se pudo comprobar la sesión."));
        }
      } catch {
        if (active && version === revision.current) { setUser(null); setError("No se pudo comprobar la sesión. Revisa la conexión."); }
      } finally { checkingNow = false; if (active) setChecking(false); }
    };
    void check();
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") void check(); }, 30000);
    const onVisible = () => { if (document.visibilityState === "visible") void check(); };
    window.addEventListener("accounting-session-expired", expire);
    window.addEventListener("pageshow", onVisible);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active = false; window.clearInterval(timer);
      window.removeEventListener("accounting-session-expired", expire);
      window.removeEventListener("pageshow", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  async function logout() {
    if (pending.current) return;
    pending.current = true; revision.current++; setBusy(true); setError("");
    try {
      const response = await accountingFetch("/api/contabilidad/sesion", { method: "DELETE" });
      if (!response.ok) throw new Error();
      setUser(null);
      const { error: signOutError } = await supabase.auth.signOut({ scope: "local" });
      if (signOutError) setError("Contabilidad se ha cerrado. Cierra también tu sesión de Flowly antes de compartir este dispositivo.");
    } catch { setUser(null); setError("No se pudo completar el cierre de sesión. Vuelve a intentarlo."); }
    finally { pending.current = false; setBusy(false); }
  }

  if (checking) return <main className="flowly-app-shell grid min-h-screen place-items-center text-cyan-100"><p role="status">Comprobando tu acceso de administrador…</p></main>;
  if (user) return <>
    <div className="flex flex-wrap items-center justify-end gap-3 bg-slate-950 px-5 py-3 text-sm text-cyan-100">
      <span role="status">Administración: {user.name}</span>
      <button type="button" disabled={busy} onClick={() => void logout()} className="min-h-11 rounded-xl border border-cyan-200/30 px-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 disabled:opacity-50">{busy ? "Cerrando…" : "Cerrar sesión"}</button>
      {error ? <p role="alert" className="w-full text-right text-rose-300">{error}</p> : null}
    </div>
    {children}
  </>;
  return <main className="flowly-app-shell min-h-screen px-4 py-10 text-white">
    <section className="mx-auto flex min-h-[78vh] max-w-xl items-center justify-center">
      <div className="flowly-client-card w-full rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-purple-950/30 backdrop-blur sm:p-8">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-200"><LockKeyhole size={26} aria-hidden="true" /></div>
        <p className="text-xs font-black uppercase tracking-[0.32em] text-cyan-200/70">Área privada</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">Contabilidad mensual</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">Ya no necesitas la contraseña compartida de Contabilidad. Entra con tu cuenta de administrador de Flowly.</p>
        <p className="mt-3 text-sm leading-6 text-slate-400">El acceso sigue siendo privado. Los movimientos, la caja y el diseño contable se conservan.</p>
        {error ? <p role="alert" className="mt-4 text-sm font-semibold text-rose-300">{error}</p> : null}
        <Link href="/login?next=/contabilidad" className="mt-6 flex min-h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-300 via-violet-400 to-pink-400 px-5 py-4 text-center font-black text-slate-950 transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300">Entrar con mi cuenta de Flowly</Link>
      </div>
    </section>
  </main>;
}
