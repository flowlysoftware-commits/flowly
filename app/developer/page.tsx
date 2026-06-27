import Link from "next/link";
import { ReactNode } from "react";
import { Activity, Archive, Bot, Boxes, BrainCircuit, Code2, Cpu, Database, FileCode2, GitPullRequest, Github, HeartPulse, Layers3, MemoryStick, Network, Rocket, ShieldCheck, Sparkles, TerminalSquare, Wand2 } from "lucide-react";

const coreModules = [
  { title: "Cerebro", subtitle: "Brain", href: "/os/brain", icon: BrainCircuit, color: "from-violet-500/30 to-cyan-400/10", description: "Razonamiento, contexto, planes y decisiones antes de ejecutar cambios." },
  { title: "Corazón", subtitle: "Kernel", href: "/kernel", icon: HeartPulse, color: "from-rose-500/30 to-orange-400/10", description: "Runtime central, registros, eventos, capacidades y gobierno interno." },
  { title: "Memoria", subtitle: "Knowledge", href: "/docs", icon: MemoryStick, color: "from-blue-500/30 to-cyan-400/10", description: "Documentación viva, arquitectura, decisiones, módulos y conocimiento técnico." },
  { title: "Companion", subtitle: "IA", href: "/companion", icon: Bot, color: "from-cyan-500/30 to-emerald-400/10", description: "Avatar global, contexto de negocio y conversación con el usuario." },
  { title: "Studio", subtitle: "Módulos", href: "/studio/v2", icon: Boxes, color: "from-purple-500/30 to-fuchsia-400/10", description: "Editor visual de blueprints, piezas, relaciones y arquitectura de módulos." },
];

const quickAccess = [
  { title: "Project Graph", href: "/os/project-graph", icon: Network, tag: "Nuevo" },
  { title: "Executor V3", href: "/os/executor-v3", icon: Rocket, tag: "Nuevo" },
  { title: "GitHub Executor", href: "/os/github", icon: Github, tag: "Conectado" },
  { title: "Asistente Arquitecto", href: "/asistente", icon: Bot, tag: "Chat" },
  { title: "Crear módulo", href: "/crear", icon: Wand2, tag: "Simple" },
  { title: "Migración OS", href: "/os/migration", icon: Network, tag: "Mapa" },
  { title: "Studio Core", href: "/studio/core", icon: Layers3, tag: "Avanzado" },
  { title: "Generator", href: "/studio/generator", icon: FileCode2, tag: "Builder" },
  { title: "Docs Studio", href: "/docs/studio", icon: Archive, tag: "Docs" },
];

const systemHealth = [
  ["Brain", "Activo", "100%"],
  ["Kernel", "Estable", "100%"],
  ["Knowledge", "Sincronizada", "98%"],
  ["GitHub App", "Conectada", "100%"],
];

const activity = [
  "Executor V3 preparado para análisis profundo",
  "GitHub App conectada al repositorio flowly",
  "Brain operativo en modo arquitecto",
  "Kernel y migración OS registrados",
  "Companion separado entre cliente y desarrollo",
];

export default function DeveloperControlCenterPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#02040b] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(124,58,237,.24),transparent_28%),radial-gradient(circle_at_82%_16%,rgba(34,211,238,.2),transparent_26%),radial-gradient(circle_at_50%_90%,rgba(236,72,153,.12),transparent_28%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.18] [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:44px_44px]" />

      <section className="relative mx-auto flex min-h-screen max-w-[1600px] gap-5 px-5 py-5">
        <aside className="hidden w-72 shrink-0 rounded-[2rem] border border-white/10 bg-white/[0.045] p-4 shadow-2xl shadow-black/40 backdrop-blur-xl xl:block">
          <div className="flex items-center gap-3 px-2 py-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-300 text-xl font-black shadow-lg shadow-violet-500/25">F</div>
            <div>
              <p className="text-xl font-black">Flowly IA</p>
              <p className="text-xs text-cyan-100/50">Developer OS</p>
            </div>
          </div>

          <nav className="mt-6 space-y-6 text-sm">
            <MenuGroup title="Centro">
              <MenuItem href="/developer" icon={<Activity size={17} />} label="Centro de Control" active />
              <MenuItem href="/os/brain" icon={<BrainCircuit size={17} />} label="Cerebro" />
              <MenuItem href="/kernel" icon={<HeartPulse size={17} />} label="Corazón" />
              <MenuItem href="/docs" icon={<MemoryStick size={17} />} label="Memoria" />
            </MenuGroup>
            <MenuGroup title="Creación">
              <MenuItem href="/studio/v2" icon={<Boxes size={17} />} label="Studio" />
              <MenuItem href="/crear" icon={<Wand2 size={17} />} label="Crear simple" />
              <MenuItem href="/studio/generator" icon={<FileCode2 size={17} />} label="Generador" />
            </MenuGroup>
            <MenuGroup title="Ejecución">
              <MenuItem href="/os/project-graph" icon={<Network size={17} />} label="Project Graph" highlight />
              <MenuItem href="/os/executor-v3" icon={<Rocket size={17} />} label="Executor V3" />
              <MenuItem href="/os/github" icon={<Github size={17} />} label="GitHub" />
              <MenuItem href="/os/migration" icon={<Network size={17} />} label="Migración OS" />
            </MenuGroup>
            <MenuGroup title="Datos">
              <MenuItem href="/os" icon={<Cpu size={17} />} label="Flowly OS" />
              <MenuItem href="/docs/studio" icon={<Database size={17} />} label="Knowledge Studio" />
            </MenuGroup>
          </nav>

          <div className="mt-8 rounded-3xl border border-white/10 bg-black/30 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">Usuario</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500 font-black">R</div>
              <div>
                <p className="font-black">Ricky</p>
                <p className="text-xs text-emerald-300">Online</p>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-5">
          <header className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-100/55">Flowly IA Developer Control Center</p>
              <h1 className="mt-2 text-4xl font-black tracking-tight md:text-6xl">Centro operativo de desarrollo</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">Un único panel para controlar el Cerebro, Corazón, Memoria, Studio, Executor, GitHub y todos los motores internos de Flowly OS.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
              <Badge label="Entorno" value="Producción" />
              <Badge label="Versión" value="v3-dev" />
              <Badge label="Modo" value="Arquitecto" />
              <Badge label="Repo" value="flowly" />
            </div>
          </header>

          <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
            <div className="space-y-5">
              <div className="rounded-[2rem] border border-cyan-300/15 bg-white/[0.045] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-100/55">Salud del sistema</p>
                    <h2 className="mt-2 text-2xl font-black">Flowly OS operativo</h2>
                  </div>
                  <Link href="/os/executor-v3" className="rounded-2xl bg-cyan-200 px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/20">Abrir Executor V3</Link>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-4">
                  {systemHealth.map(([name, status, pct]) => <SystemCard key={name} name={name} status={status} pct={pct} />)}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-5">
                {coreModules.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href} className={`group rounded-[1.7rem] border border-white/10 bg-gradient-to-br ${item.color} p-4 transition hover:-translate-y-1 hover:border-cyan-200/40 hover:shadow-2xl hover:shadow-cyan-950/25`}>
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-cyan-100"><Icon size={21} /></div>
                      <h3 className="mt-4 text-lg font-black">{item.title}</h3>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/35">{item.subtitle}</p>
                      <p className="mt-3 min-h-[64px] text-xs leading-5 text-white/58">{item.description}</p>
                      <div className="mt-4 rounded-xl bg-white/10 px-3 py-2 text-center text-xs font-black text-white/80 group-hover:bg-cyan-200 group-hover:text-slate-950">Abrir</div>
                    </Link>
                  );
                })}
              </div>

              <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
                <div className="rounded-[2rem] border border-purple-300/15 bg-white/[0.045] p-5 backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-100/55">Executor V3</p>
                      <h2 className="mt-2 text-2xl font-black">Agente de desarrollo</h2>
                    </div>
                    <div className="rounded-full border border-purple-300/25 bg-purple-300/15 px-3 py-1 text-xs font-black text-purple-100">v3.0</div>
                  </div>
                  <div className="mt-5 grid gap-2 text-sm text-white/70">
                    <Check text="Mapa profundo del proyecto" />
                    <Check text="Edición preferente de archivos existentes" />
                    <Check text="Pull Requests seguros" />
                    <Check text="Razonamiento antes de ejecutar" />
                  </div>
                  <Link href="/os/executor-v3" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-purple-400/90 px-5 py-3 text-sm font-black text-white"><Rocket size={16} /> Abrir Executor V3</Link>
                </div>

                <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-100/55">Accesos rápidos</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {quickAccess.map((item) => {
                      const Icon = item.icon;
                      return <Link key={item.href} href={item.href} className="rounded-2xl border border-white/10 bg-black/25 p-4 transition hover:border-cyan-200/40 hover:bg-cyan-200/10"><div className="flex items-center justify-between gap-2"><Icon size={18} className="text-cyan-100" /><span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-black text-white/50">{item.tag}</span></div><p className="mt-3 text-sm font-black">{item.title}</p></Link>;
                    })}
                  </div>
                </div>
              </div>
            </div>

            <aside className="space-y-5">
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white/35">Actividad reciente</p>
                <div className="mt-4 space-y-3">
                  {activity.map((item, index) => <div key={item} className="rounded-2xl border border-white/10 bg-black/25 p-3"><p className="text-sm font-bold text-white/80">{item}</p><p className="mt-1 text-xs text-white/35">Hace {index + 2} min</p></div>)}
                </div>
              </div>
              <div className="rounded-[2rem] border border-emerald-300/20 bg-emerald-300/10 p-5 backdrop-blur-xl">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-100/65">Estado</p>
                <h3 className="mt-2 text-2xl font-black">Todo conectado</h3>
                <p className="mt-2 text-sm leading-6 text-white/65">Brain, GitHub App, Kernel y Studio están preparados para trabajar mediante Pull Requests seguros.</p>
              </div>
            </aside>
          </section>
        </div>
      </section>
    </main>
  );
}

function MenuGroup({ title, children }: { title: string; children: ReactNode }) {
  return <div><p className="mb-2 px-2 text-[11px] font-black uppercase tracking-[0.2em] text-white/30">{title}</p><div className="space-y-1">{children}</div></div>;
}

function MenuItem({ href, icon, label, active, highlight }: { href: string; icon: ReactNode; label: string; active?: boolean; highlight?: boolean }) {
  return <Link href={href} className={`flex items-center gap-3 rounded-2xl px-3 py-2 font-bold transition ${active ? "bg-cyan-300/15 text-cyan-50" : highlight ? "bg-purple-400/15 text-purple-50" : "text-white/62 hover:bg-white/10 hover:text-white"}`}>{icon}<span>{label}</span></Link>;
}

function Badge({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/35">{label}</p><p className="mt-1 font-black text-white">{value}</p></div>;
}

function SystemCard({ name, status, pct }: { name: string; status: string; pct: string }) {
  return <div className="rounded-2xl border border-white/10 bg-black/25 p-4"><p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">{name}</p><p className="mt-2 text-lg font-black">{status}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300" style={{ width: pct }} /></div><p className="mt-2 text-right text-xs font-black text-emerald-300">{pct}</p></div>;
}

function Check({ text }: { text: string }) {
  return <div className="flex items-center gap-2"><Sparkles size={14} className="text-emerald-300" /><span>{text}</span></div>;
}
