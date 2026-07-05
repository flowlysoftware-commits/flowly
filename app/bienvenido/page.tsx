"use client";

import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, LayoutDashboard, LogIn, Sparkles, TrendingUp } from "lucide-react";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function BienvenidoPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  useEffect(() => {
    const payload = {
      value: 1,
      currency: "EUR",
      content_name: "Flowly IA subscription",
    };

    window.fbq?.("track", "Purchase", payload);
    window.gtag?.("event", "purchase", {
      transaction_id: `flowly_${Date.now()}`,
      value: 1,
      currency: "EUR",
      items: [{ item_name: "Flowly IA subscription" }],
    });

    fetch("/api/analytics/track", {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName: "checkout_completed",
        path: "/bienvenido",
        fullPath: window.location.pathname + window.location.search,
        funnelStep: "purchase",
        title: document.title,
        metadata: { source: "bienvenido_page" },
      }),
    }).catch(() => null);
  }, []);

  return (
    <main className="min-h-screen flowly-public px-6 py-10 text-white">
      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col">
        <header className="flex items-center justify-between gap-4">
          <Image src="/logo.png" alt="Flowly IA" width={170} height={48} className="h-auto w-40 object-contain" priority />
          <Link href="/login" className="rounded-full border border-white/15 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/[0.1] hover:text-white">
            Entrar al panel
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-8 py-12 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-100">
              <CheckCircle2 size={17} /> Compra completada
            </div>
            <h1 className="mt-8 max-w-3xl text-5xl font-black tracking-tight md:text-7xl">
              Bienvenido a Flowly IA.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/68">
              Tu suscripción está activa y tu espacio de trabajo ya ha sido preparado. Ahora puedes entrar al panel para empezar a organizar clientes, agenda, ventas, tareas y automatizaciones desde un solo lugar.
            </p>
            {email && <p className="mt-4 text-sm text-cyan-100/80">Cuenta creada para: <span className="font-semibold text-cyan-100">{email}</span></p>}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/login" className="flowly-primary inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 text-base font-black text-slate-950 shadow-2xl shadow-cyan-500/20">
                <LogIn size={19} /> Iniciar sesión
              </Link>
              <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-7 py-4 text-base font-bold text-white transition hover:bg-white/[0.1]">
                <LayoutDashboard size={19} /> Ir al dashboard
              </Link>
            </div>
          </div>

          <div className="flowly-glass rounded-[2.5rem] p-7 shadow-2xl shadow-black/35">
            <div className="rounded-[2rem] border border-cyan-300/15 bg-cyan-300/[0.06] p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300/15 text-cyan-100">
                <Sparkles size={26} />
              </div>
              <h2 className="mt-6 text-2xl font-black">Primeros pasos recomendados</h2>
              <div className="mt-6 grid gap-3">
                <Step number="1" title="Entra al panel" text="Accede con el email de compra y la contraseña que acabas de crear." />
                <Step number="2" title="Revisa tu dashboard" text="Comprueba módulos, clientes, agenda, facturación y configuración inicial." />
                <Step number="3" title="Activa Flow" text="Usa el Companion para pedir ayuda dentro del panel y acelerar la configuración." />
              </div>
            </div>

            <div className="mt-5 rounded-[2rem] border border-violet-300/15 bg-violet-400/[0.08] p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-300/15 text-violet-100">
                  <TrendingUp size={22} />
                </div>
                <div>
                  <h3 className="font-black text-white">Consejo</h3>
                  <p className="mt-2 text-sm leading-6 text-white/65">
                    Empieza creando tus clientes o servicios principales. Flowly funciona mejor cuando el panel ya tiene la información básica de tu negocio.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Step({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-black text-slate-950">{number}</div>
      <div>
        <p className="font-bold text-white">{title}</p>
        <p className="mt-1 text-sm leading-6 text-white/58">{text}</p>
      </div>
    </div>
  );
}
