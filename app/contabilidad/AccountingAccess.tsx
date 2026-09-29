"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { LockKeyhole } from "lucide-react";
import { accountingFetch } from "@/lib/accountingFetch";

type SessionUser = { id: null; name: string };
export default function AccountingAccess({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const revision = useRef(0);

  useEffect(() => {
    let active = true;
    let checkingNow = false;
    const expire = () => { revision.current++; setUser(null); setPassword(""); };
    const check = async () => {
      if (checkingNow || pending.current) return;
      checkingNow = true;
      const version = revision.current;
      try {
        const response = await fetch("/api/contabilidad/sesion", { cache: "no-store", credentials: "same-origin" });
        const data = await response.json();
        if (active && version === revision.current) {
          setUser(response.ok ? data.user : null);
          if (!response.ok && response.status !== 401) setError("No se pudo comprobar la sesión.");
        }
      } catch { if (active && version === revision.current) { setUser(null); setError("No se pudo comprobar la sesión. Revisa la conexión."); } }
      finally { checkingNow = false; if (active) setChecking(false); }
    };
    void check();
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") void check(); }, 30000);
    const onVisible = () => { if (document.visibilityState === "visible") void check(); };
    window.addEventListener("accounting-session-expired", expire);
    window.addEventListener("pageshow", onVisible);
    document.addEventListener("visibilitychange", onVisible);
    return () => { active = false; window.clearInterval(timer); window.removeEventListener("accounting-session-expired", expire); window.removeEventListener("pageshow", onVisible); document.removeEventListener("visibilitychange", onVisible); };
  }, []);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    pending.current = true; revision.current++; setBusy(true); setError("");
    try {
      const response = await accountingFetch("/api/contabilidad/sesion", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
      const data = await response.json();
      setPassword("");
      if (!response.ok) { setError(data.error || "Usuario o contraseña incorrectos."); return; }
      setUser(data.user);
    } catch { setPassword(""); setError("No se pudo conectar. Inténtalo de nuevo."); }
    finally { pending.current = false; setBusy(false); }
  }

  async function logout() {
    if (pending.current) return;
    pending.current = true; revision.current++; setBusy(true); setError("");
    try {
      const response = await accountingFetch("/api/contabilidad/sesion", { method: "DELETE" });
      if (!response.ok) throw new Error();
      setUser(null); setPassword("");
    } catch { setError("No se pudo cerrar la sesión. Vuelve a intentarlo."); }
    finally { pending.current = false; setBusy(false); }
  }

  if (checking) return <main className="flowly-app-shell grid min-h-screen place-items-center text-cyan-100"><p role="status">Comprobando sesión privada…</p></main>;
  if (user) return <>
    <div className="flex flex-wrap items-center justify-end gap-3 bg-slate-950 px-5 py-3 text-sm text-cyan-100">
      <span role="status" title="Nombre seleccionado al entrar con la contraseña común">Sesión: {user.name} · nombre seleccionado</span>
      <button type="button" disabled={busy} onClick={() => void logout()} className="min-h-11 rounded-xl border border-cyan-200/30 px-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 disabled:opacity-50">{busy ? "Cerrando…" : "Cerrar sesión"}</button>
      {error ? <p role="alert" className="w-full text-right text-rose-300">{error}</p> : null}
    </div>
    {children}
  </>;
  return <main className="flowly-app-shell min-h-screen px-4 py-10 text-white">
    <section className="mx-auto flex min-h-[78vh] max-w-xl items-center justify-center">
      <form onSubmit={login} aria-busy={busy} className="flowly-client-card w-full rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-purple-950/30 backdrop-blur sm:p-8">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-200"><LockKeyhole size={26} aria-hidden="true" /></div>
        <p className="text-xs font-black uppercase tracking-[0.32em] text-cyan-200/70">Área privada</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">Contabilidad mensual</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">Elige tu nombre e introduce la contraseña común de siempre.</p>
        <fieldset disabled={busy} className="mt-8 space-y-3 disabled:opacity-60">
          <label htmlFor="accounting-username" className="block text-xs font-bold uppercase tracking-[0.18em] text-slate-300">¿Quién entra?</label>
          <select id="accounting-username" name="username" required value={username} onChange={e => setUsername(e.target.value)} aria-describedby="accounting-name-help" className="w-full rounded-2xl border border-white/20 bg-slate-900 px-4 py-4 text-base outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/30">
            <option value="" disabled>Selecciona tu nombre</option>
            <option value="Alex">Alex</option>
            <option value="Ricky">Ricky</option>
          </select>
          <p id="accounting-name-help" className="text-xs leading-5 text-slate-400">El historial mostrará el nombre elegido. No es una cuenta personal verificada.</p>
          <label htmlFor="accounting-password" className="block pt-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Contraseña</label>
          <input id="accounting-password" name="password" type="password" required maxLength={1024} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••••" className="w-full rounded-2xl border border-white/20 bg-black/30 px-4 py-4 text-base outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/30" />
        </fieldset>
        {error ? <p role="alert" className="mt-4 text-sm font-semibold text-rose-300">{error}</p> : null}
        <button type="submit" disabled={busy} className="mt-6 min-h-14 w-full rounded-2xl bg-gradient-to-r from-cyan-300 via-violet-400 to-pink-400 px-5 py-4 font-black text-slate-950 transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300 disabled:opacity-60">{busy ? "Comprobando acceso…" : "Entrar"}</button>
      </form>
    </section>
  </main>;
}
