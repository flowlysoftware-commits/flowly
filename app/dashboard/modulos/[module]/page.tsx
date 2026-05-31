"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Bot,
  CalendarDays,
  CreditCard,
  Megaphone,
  MessageCircle,
  PhoneCall,
  Receipt,
  SlidersHorizontal,
  Store,
  TrendingUp,
} from "lucide-react";

type Business = { id: string; name: string; plan: string };
type BusinessModule = { module_key: string; status: string };

const modules = {
  whatsapp: {
    key: "whatsapp",
    title: "WhatsApp automático",
    description: "Automatiza confirmaciones, recordatorios y avisos para tus clientes.",
    Icon: MessageCircle,
    highlights: ["Recordatorios de cita", "Confirmaciones automáticas", "Avisos de cambios", "Mensajes de recuperación"],
  },
  facturacion: {
    key: "billing",
    title: "Facturación",
    description: "Controla facturas, presupuestos, ingresos, gastos y documentación.",
    Icon: Receipt,
    highlights: ["Facturas PDF", "Presupuestos", "Gastos", "Resumen mensual"],
  },
  tpv: {
    key: "pos",
    title: "TPV",
    description: "Gestiona cobros, caja, tickets y ventas presenciales desde Flowly.",
    Icon: Store,
    highlights: ["Caja diaria", "Tickets", "Cobros", "Ventas por empleado"],
  },
  crm: {
    key: "crm",
    title: "CRM avanzado",
    description: "Segmenta clientes, detecta inactivos y mejora el seguimiento comercial.",
    Icon: CreditCard,
    highlights: ["Clientes inactivos", "Segmentación", "Historial avanzado", "Seguimientos"],
  },
  marketing: {
    key: "marketing",
    title: "Marketing",
    description: "Lanza campañas, promociones y acciones de recuperación de clientes.",
    Icon: Megaphone,
    highlights: ["Campañas", "Promociones", "Clientes recurrentes", "Reactivación"],
  },
  ia: {
    key: "ai",
    title: "IA Assistant",
    description: "Utiliza IA para obtener resúmenes, sugerencias y automatizaciones.",
    Icon: Bot,
    highlights: ["Resumen del día", "Sugerencias", "Automatizaciones", "Análisis inteligente"],
  },
  estadisticas: {
    key: "analytics",
    title: "Estadísticas avanzadas",
    description: "Visualiza KPIs, evolución, previsión y rendimiento del negocio.",
    Icon: TrendingUp,
    highlights: ["MRR", "Ocupación", "Ingresos", "Servicios top"],
  },
  "reservas-premium": {
    key: "booking_premium",
    title: "Reservas Premium",
    description: "Personaliza y mejora la experiencia de reserva online para tus clientes.",
    Icon: SlidersHorizontal,
    highlights: ["Diseño personalizado", "Reglas avanzadas", "Página premium", "Bloqueos especiales"],
  },
  voice: {
    key: "voice",
    title: "Flowly Voice",
    description: "Centralita inteligente para recibir llamadas y agendar por voz con IA.",
    Icon: PhoneCall,
    highlights: ["Recepción automática", "Agendado por voz", "Resumen de llamadas", "IA telefónica"],
  },
};

export default function ModulePage() {
  const router = useRouter();
  const params = useParams();
  const moduleSlug = params.module as keyof typeof modules;
  const config = modules[moduleSlug];

  const [business, setBusiness] = useState<Business | null>(null);
  const [activeModules, setActiveModules] = useState<BusinessModule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push("/login");
        return;
      }

      const { data: businessData } = await supabase
        .from("businesses")
        .select("id, name, plan")
        .eq("owner_id", userData.user.id)
        .single();

      if (!businessData) {
        setLoading(false);
        return;
      }

      setBusiness(businessData as Business);

      const { data: modulesData } = await supabase
        .from("business_modules")
        .select("module_key, status")
        .eq("business_id", businessData.id)
        .eq("status", "active");

      setActiveModules((modulesData || []) as BusinessModule[]);
      setLoading(false);
    };

    load();
  }, [router]);

  const hasAccess = useMemo(() => {
    if (!config || !business) return false;
    if (business.plan === "premium") return true;
    return activeModules.some((item) => item.module_key === config.key);
  }, [activeModules, business, config]);

  if (!config) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070711] px-6 text-center text-white">
        <div>
          <h1 className="text-3xl font-semibold">Módulo no encontrado</h1>
          <Link href="/dashboard" className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-neutral-950">Volver al panel</Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-[#070711] text-white">Cargando módulo...</main>;
  }

  const Icon = config.Icon;

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,#6d28d9_0%,#111827_34%,#020617_100%)] px-6 py-8 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="relative mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-violet-300">Flowly IA · Módulo</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">{config.title}</h1>
            <p className="mt-2 max-w-2xl text-white/60">{config.description}</p>
          </div>
          <Link href="/dashboard" className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm">Volver al panel</Link>
        </header>

        {!hasAccess ? (
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-400/20 text-violet-100"><Icon /></div>
            <h2 className="text-2xl font-semibold">Este módulo no está activo</h2>
            <p className="mt-3 text-white/60">Puedes contratarlo desde el portal de facturación o contactando con Flowly IA.</p>
            <button className="mt-6 rounded-full bg-white px-5 py-3 font-medium text-neutral-950" onClick={() => alert("Actívalo desde Facturación o contacta con Flowly IA.")}>Solicitar activación</button>
          </section>
        ) : (
          <section className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-400/20 text-violet-100"><Icon /></div>
              <h2 className="text-2xl font-semibold">Módulo activo</h2>
              <p className="mt-3 text-white/60">Este módulo está habilitado para {business?.name}. Aquí construiremos la funcionalidad completa.</p>
              <div className="mt-6 rounded-3xl bg-black/25 p-5">
                <p className="text-sm text-violet-200">Estado</p>
                <p className="mt-1 text-3xl font-semibold">Activo</p>
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <h2 className="text-2xl font-semibold">Incluye</h2>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {config.highlights.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                    <CalendarDays size={18} className="mb-3 text-violet-200" />
                    <p className="font-medium">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
