"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  Bot,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  HeartPulse,
  Loader2,
  LockKeyhole,
  MessageCircle,
  Palette,
  PhoneCall,
  Plus,
  Receipt,
  Send,
  Shield,
  Sparkles,
  Store,
  Users,
} from "lucide-react";

type ModuleKey =
  | "agenda"
  | "crm"
  | "voice"
  | "whatsapp"
  | "billing"
  | "pos"
  | "marketing"
  | "ai"
  | "analytics"
  | "booking_premium"
  | "time_tracking";

type CreateResult = {
  success?: boolean;
  businessId?: string;
  userId?: string;
  email?: string;
  password?: string;
  checkoutUrl?: string | null;
  stripeCustomerId?: string | null;
  error?: string;
};

const moduleOptions: { key: ModuleKey; label: string; description: string; Icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { key: "agenda", label: "Agenda PRO", description: "Calendario visual, huecos libres y citas rápidas.", Icon: CalendarDays },
  { key: "crm", label: "CRM clínico avanzado", description: "Pacientes, notas, seguimientos, historial y oportunidades.", Icon: Users },
  { key: "voice", label: "Centralita / Voice", description: "Llamadas, recepción, registros y futura IA telefónica.", Icon: PhoneCall },
  { key: "whatsapp", label: "WhatsApp automático", description: "Recordatorios, confirmaciones y mensajes configurables.", Icon: MessageCircle },
  { key: "billing", label: "Facturación PRO", description: "Ingresos, gastos, proveedores, caja y control financiero.", Icon: Receipt },
  { key: "booking_premium", label: "Agenda Premium", description: "Agenda para pacientes, doctores, reglas y disponibilidad.", Icon: CalendarDays },
  { key: "analytics", label: "Estadísticas avanzadas", description: "KPIs, ocupación, evolución y rendimiento mensual.", Icon: Sparkles },
  { key: "ai", label: "IA Assistant", description: "Capa inteligente para análisis, resúmenes y automatizaciones.", Icon: Bot },
  { key: "marketing", label: "Marketing", description: "Campañas y preparación para Ads y captación.", Icon: Send },
  { key: "pos", label: "TPV", description: "Tickets, caja y ventas presenciales si el cliente lo necesita.", Icon: Store },
  { key: "time_tracking", label: "Módulo Fichaje", description: "Entradas, salidas, pausas y control horario del equipo.", Icon: Clock },
];

const defaultClinicModules: ModuleKey[] = ["agenda", "crm", "voice", "whatsapp", "billing", "booking_premium", "analytics", "ai"];

export default function EnterpriseFactoryPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CreateResult | null>(null);

  const [businessName, setBusinessName] = useState("Clínica Demo Enterprise");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState(() => `Flowly${Math.floor(100000 + Math.random() * 900000)}!`);
  const [businessType, setBusinessType] = useState("Clínica");
  const [monthlyAmount, setMonthlyAmount] = useState("250");
  const [setupAmount, setSetupAmount] = useState("0");
  const [currency, setCurrency] = useState("EUR");
  const [createCheckout, setCreateCheckout] = useState(true);
  const [modules, setModules] = useState<ModuleKey[]>(defaultClinicModules);
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#7C3AED");
  const [theme, setTheme] = useState("dark");
  const [goal, setGoal] = useState("Gestionar pacientes, agenda médica, llamadas y seguimiento comercial desde un único panel.");
  const [clinicServices, setClinicServices] = useState("Primera consulta\nConsulta de seguimiento\nFisioterapia\nRevisión médica\nTeleconsulta");
  const [doctors, setDoctors] = useState("Dr. Principal\nRecepción");
  const [voiceNumber, setVoiceNumber] = useState("");
  const [voiceProvider, setVoiceProvider] = useState("Pendiente de conectar");
  const [voiceNotes, setVoiceNotes] = useState("Recibir llamadas, registrar motivo, asociar al paciente, crear lead o cita y dejar nota en CRM.");
  const [internalNotes, setInternalNotes] = useState("");

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("account_type, role, email")
        .eq("user_id", data.user.id)
        .maybeSingle();

      const isAdmin =
        profile?.account_type === "admin" ||
        profile?.role === "super_admin" ||
        profile?.role === "admin" ||
        data.user.email?.includes("flowly") ||
        data.user.email?.includes("admin");

      setAllowed(Boolean(isAdmin));
      setChecking(false);
    };

    check();
  }, [router]);

  const selectedTotal = useMemo(() => Number(monthlyAmount || 0), [monthlyAmount]);

  const toggleModule = (key: ModuleKey) => {
    setModules((current) => (current.includes(key) ? current.filter((item) => item !== key) : [...current, key]));
  };

  const createPanel = async () => {
    if (!businessName || !email || !password || !monthlyAmount) {
      alert("Rellena nombre del negocio, email, contraseña e importe mensual.");
      return;
    }

    setSubmitting(true);
    setResult(null);

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    const res = await fetch("/api/enterprise/create-panel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        businessName,
        contactName,
        email,
        phone,
        password,
        businessType,
        monthlyAmount: Number(monthlyAmount),
        setupAmount: Number(setupAmount || 0),
        currency,
        createCheckout,
        modules,
        logoUrl,
        primaryColor,
        theme,
        goal,
        clinicServices: clinicServices.split("\n").map((item) => item.trim()).filter(Boolean),
        doctors: doctors.split("\n").map((item) => item.trim()).filter(Boolean),
        voice: { number: voiceNumber, provider: voiceProvider, notes: voiceNotes },
        internalNotes,
      }),
    });

    const json = (await res.json()) as CreateResult;
    setResult(json);
    setSubmitting(false);

    if (!res.ok) alert(json.error || "No se pudo crear el panel Enterprise");
  };

  if (checking) {
    return <Shell><div className="text-white/70">Comprobando permisos...</div></Shell>;
  }

  if (!allowed) {
    return (
      <Shell>
        <div className="mx-auto max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.07] p-8 text-center shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/20 text-red-100"><LockKeyhole /></div>
          <h1 className="text-3xl font-semibold">Acceso restringido</h1>
          <p className="mt-3 text-white/60">Este panel es solo para administración interna de Flowly IA.</p>
          <Link href="/dashboard" className="mt-6 inline-flex rounded-full bg-white px-5 py-3 font-medium text-neutral-950">Volver</Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white p-2">
              <Image src="/logo.png" alt="Flowly IA" width={120} height={80} className="max-h-10 w-auto object-contain" />
            </div>
            <div>
              <p className="text-sm font-medium text-violet-300">Flowly IA · Factory Enterprise</p>
              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Crear panel personalizado</h1>
              <p className="mt-2 max-w-2xl text-white/60">Crea usuario, negocio, suscripción personalizada, módulos, CRM clínico y centralita en un único proceso.</p>
            </div>
          </div>
          <Link href="/admin" className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm text-white/80">Volver a Admin</Link>
        </header>

        <section className="mb-6 grid gap-4 md:grid-cols-4">
          <Metric icon={<Building2 />} label="Tipo" value={businessType} />
          <Metric icon={<CreditCard />} label="Mensualidad" value={money(selectedTotal, currency)} />
          <Metric icon={<Sparkles />} label="Módulos" value={modules.length} />
          <Metric icon={<PhoneCall />} label="Centralita" value={modules.includes("voice") ? "Activa" : "No"} />
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_.92fr]">
          <div className="space-y-6">
            <GlassCard title="1. Cliente y acceso">
              <div className="grid gap-3 md:grid-cols-2">
                <input className="input-dark" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Nombre del negocio" />
                <select className="input-dark" value={businessType} onChange={(e) => setBusinessType(e.target.value)}>
                  <option>Clínica</option><option>Fisioterapia</option><option>Psicología</option><option>Nutrición</option><option>Peluquería</option><option>Estética</option><option>Restaurante</option><option>Otro</option><option>Enterprise</option>
                </select>
                <input className="input-dark" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Nombre contacto" />
                <input className="input-dark" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Teléfono" />
                <input className="input-dark" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email de acceso" type="email" />
                <input className="input-dark" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña provisional" />
              </div>
            </GlassCard>

            <GlassCard title="2. Suscripción personalizada">
              <div className="grid gap-3 md:grid-cols-3">
                <input className="input-dark" value={monthlyAmount} onChange={(e) => setMonthlyAmount(e.target.value)} type="number" placeholder="Mensualidad" />
                <input className="input-dark" value={setupAmount} onChange={(e) => setSetupAmount(e.target.value)} type="number" placeholder="Instalación" />
                <select className="input-dark" value={currency} onChange={(e) => setCurrency(e.target.value)}><option value="EUR">EUR</option><option value="USD">USD</option><option value="COP">COP</option></select>
              </div>
              <label className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm text-white/70">
                <input type="checkbox" checked={createCheckout} onChange={(e) => setCreateCheckout(e.target.checked)} className="h-5 w-5" />
                Crear enlace de pago Stripe para la suscripción mensual personalizada.
              </label>
            </GlassCard>

            <GlassCard title="3. Módulos activos">
              <div className="grid gap-3 md:grid-cols-2">
                {moduleOptions.map((item) => {
                  const active = modules.includes(item.key);
                  const Icon = item.Icon;
                  return (
                    <button key={item.key} type="button" onClick={() => toggleModule(item.key)} className={active ? "rounded-2xl border border-violet-300/40 bg-violet-500/20 p-4 text-left" : "rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-left hover:bg-white/[0.08]"}>
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-white/10 p-2 text-violet-100"><Icon size={20} /></div>
                        <div>
                          <p className="font-semibold">{item.label}</p>
                          <p className="mt-1 text-sm text-white/50">{item.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </GlassCard>

            <GlassCard title="4. Clínica, agenda y centralita">
              <div className="grid gap-3 md:grid-cols-2">
                <textarea className="input-dark min-h-32" value={clinicServices} onChange={(e) => setClinicServices(e.target.value)} placeholder="Servicios iniciales, uno por línea" />
                <textarea className="input-dark min-h-32" value={doctors} onChange={(e) => setDoctors(e.target.value)} placeholder="Doctores / empleados, uno por línea" />
                <input className="input-dark" value={voiceNumber} onChange={(e) => setVoiceNumber(e.target.value)} placeholder="Número centralita / teléfono" />
                <input className="input-dark" value={voiceProvider} onChange={(e) => setVoiceProvider(e.target.value)} placeholder="Proveedor: Twilio, Aircall, 3CX..." />
              </div>
              <textarea className="input-dark mt-3 min-h-28" value={voiceNotes} onChange={(e) => setVoiceNotes(e.target.value)} placeholder="Configuración y objetivos de la centralita" />
            </GlassCard>
          </div>

          <div className="space-y-6">
            <GlassCard title="5. Marca y experiencia del panel">
              <div className="grid gap-3">
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4"><Palette className="text-violet-200" /><div><p className="font-semibold">Panel con marca del cliente</p><p className="text-sm text-white/50">Logo, color principal, tema y objetivo inicial.</p></div></div>
                <input className="input-dark" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="URL del logo del cliente opcional" />
                <div className="grid grid-cols-[1fr_auto] gap-3"><input className="input-dark" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} placeholder="#7C3AED" /><input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-full w-16 rounded-2xl border border-white/10 bg-transparent" /></div>
                <select className="input-dark" value={theme} onChange={(e) => setTheme(e.target.value)}><option value="dark">Oscuro premium</option><option value="light">Claro</option><option value="clinic">Clínica profesional</option></select>
                <textarea className="input-dark min-h-24" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Objetivo inicial del panel" />
                <textarea className="input-dark min-h-24" value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} placeholder="Notas internas para Flowly" />
              </div>
            </GlassCard>

            <GlassCard title="Resumen de creación">
              <div className="space-y-3 text-sm text-white/65">
                <Summary label="Cliente" value={businessName || "Sin nombre"} />
                <Summary label="Email" value={email || "Sin email"} />
                <Summary label="Plan" value="Enterprise personalizado" />
                <Summary label="Mensualidad" value={money(selectedTotal, currency)} />
                <Summary label="Instalación" value={money(Number(setupAmount || 0), currency)} />
                <Summary label="Módulos" value={modules.join(", ")} />
              </div>
              <button onClick={createPanel} disabled={submitting} className="btn-primary mt-6 w-full disabled:opacity-60">
                {submitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                {submitting ? "Creando panel..." : "Crear panel Enterprise"}
              </button>
            </GlassCard>

            {result && (
              <GlassCard title={result.success ? "Panel creado" : "Error"}>
                {result.success ? (
                  <div className="space-y-3 text-sm text-white/70">
                    <p className="flex items-center gap-2 text-green-200"><CheckCircle2 size={18} /> Usuario, negocio y módulos creados correctamente.</p>
                    <Summary label="Email" value={result.email || email} />
                    <Summary label="Contraseña" value={result.password || password} />
                    <Summary label="Business ID" value={result.businessId || "-"} />
                    {result.checkoutUrl && <a href={result.checkoutUrl} target="_blank" className="btn-primary mt-4 w-full" rel="noreferrer"><CreditCard size={18} /> Abrir enlace de pago</a>}
                  </div>
                ) : (
                  <p className="text-red-200">{result.error}</p>
                )}
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen overflow-hidden bg-[#070711] px-6 py-8 text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,.55),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(236,72,153,.18),transparent_30%)]" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:64px_64px]" />
      <div className="relative">{children}</div>
    </main>
  );
}

function GlassCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return <div className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">{title && <h2 className="mb-5 text-xl font-semibold">{title}</h2>}{children}</div>;
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl"><div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-100">{icon}</div><p className="text-sm text-white/50">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>;
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-4 rounded-2xl bg-black/20 p-3"><span className="text-white/45">{label}</span><span className="text-right font-medium text-white">{value}</span></div>;
}

function money(value: number, currency: string) {
  if (currency === "COP") return `$${Math.round(value).toLocaleString("es-CO")} COP`;
  if (currency === "USD") return `$${Number(value || 0).toLocaleString("es-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`;
  return `${Number(value || 0).toFixed(2)}€`;
}
