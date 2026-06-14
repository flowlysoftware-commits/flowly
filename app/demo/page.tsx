import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Grid3X3, Sparkles, Zap } from "lucide-react";
import { demoSectorGroups, demoSectorMap, demoSectors } from "@/lib/demoSectors";

export default function DemoSelectorPage() {
  const featured = demoSectors.slice(0, 6);

  return (
    <main className="flowly-public min-h-screen px-6 py-8">
      <span className="flowly-orb left-8 top-24 h-44 w-44 bg-cyan-400/30" />
      <span className="flowly-orb right-16 top-40 h-52 w-52 bg-fuchsia-500/25" />
      <span className="flowly-orb bottom-20 left-1/2 h-60 w-60 bg-violet-500/20" />
      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="flowly-nav mb-14 flex items-center justify-between rounded-full px-5 py-3">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="Flowly IA" width={145} height={42} className="h-auto w-32 object-contain" />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="flowly-secondary rounded-full px-4 py-2 text-sm font-semibold">Área cliente</Link>
            <Link href="/" className="flowly-chip rounded-full px-5 py-2 text-sm">Volver</Link>
          </div>
        </header>

        <section className="text-center">
          <div className="flowly-chip mx-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"><Zap size={16} /> Demos sectoriales realistas</div>
          <h1 className="mx-auto mt-5 max-w-5xl text-5xl font-semibold tracking-tight md:text-7xl">Un panel Flowly para <span className="flowly-gradient-text">cada tipo de negocio</span></h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-white/65">Todas las demos usan datos ficticios, módulos distintos y una experiencia inspirada en el panel real: CRM, agenda, WhatsApp, marketing, TPV, inventario, RRHH, documentos y automatizaciones según el sector.</p>
        </section>

        <section className="mt-12 grid gap-4 md:grid-cols-4">
          <div className="flowly-card rounded-[1.7rem] p-5">
            <p className="text-3xl font-semibold">{demoSectors.length}</p>
            <p className="mt-1 text-sm text-white/55">sectores listos</p>
          </div>
          <div className="flowly-card rounded-[1.7rem] p-5">
            <p className="text-3xl font-semibold">13</p>
            <p className="mt-1 text-sm text-white/55">módulos combinables</p>
          </div>
          <div className="flowly-card rounded-[1.7rem] p-5">
            <p className="text-3xl font-semibold">100%</p>
            <p className="mt-1 text-sm text-white/55">datos ficticios</p>
          </div>
          <div className="flowly-card rounded-[1.7rem] p-5">
            <p className="text-3xl font-semibold">Live</p>
            <p className="mt-1 text-sm text-white/55">estética SaaS pro</p>
          </div>
        </section>

        <section className="mt-14 grid gap-6 lg:grid-cols-3">
          {featured.map((demo) => {
            const Icon = demo.icon;
            return (
              <Link key={demo.key} href={demo.href} className="flowly-card group relative overflow-hidden rounded-[2rem] p-7 transition hover:-translate-y-1 hover:border-cyan-300/40">
                <div className="absolute -right-6 -top-6 text-7xl opacity-10 transition group-hover:scale-110 group-hover:opacity-20">{demo.decor[0]}</div>
                <div className="mb-8 flex items-start justify-between gap-4">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br ${demo.accent} text-slate-950 shadow-lg`}><Icon size={28} /></div>
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/60">{demo.badge}</span>
                </div>
                <h2 className="text-3xl font-semibold">{demo.title}</h2>
                <p className="mt-3 min-h-[72px] max-w-lg text-sm leading-6 text-white/58">{demo.subtitle}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {demo.modules.slice(0, 5).map((module) => <span key={module} className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs text-white/72">{module}</span>)}
                </div>
                <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950">Entrar en demo <ArrowRight size={16} /></div>
              </Link>
            );
          })}
        </section>

        <section className="mt-16 rounded-[2.5rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl md:p-8">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flowly-chip inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm"><Grid3X3 size={16} /> Catálogo completo</div>
              <h2 className="mt-4 text-3xl font-semibold md:text-4xl">Demos por sector y módulos recomendados</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-white/55">Cada sector abre un panel demo diferente, con datos operativos y módulos adaptados para que el cliente vea Flowly aplicado a su mundo.</p>
          </div>

          <div className="space-y-8">
            {demoSectorGroups.map((group) => (
              <div key={group.title}>
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold"><Sparkles size={18} className="text-cyan-300" /> {group.title}</h3>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {group.keys.map((key) => {
                    const demo = demoSectorMap[key];
                    const Icon = demo.icon;
                    return (
                      <Link key={demo.key} href={demo.href} className="group rounded-[1.6rem] border border-white/10 bg-white/[0.055] p-5 transition hover:border-cyan-300/40 hover:bg-white/[0.09]">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${demo.accent} text-slate-950`}><Icon size={20} /></span>
                            <div>
                              <p className="font-semibold">{demo.shortName}</p>
                              <p className="text-xs text-white/45">{demo.modules.length} módulos demo</p>
                            </div>
                          </div>
                          <span className="text-2xl opacity-50 transition group-hover:opacity-100">{demo.decor[0]}</span>
                        </div>
                        <p className="mt-4 line-clamp-2 text-sm leading-6 text-white/55">{demo.subtitle}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {demo.modules.slice(0, 4).map((module) => <span key={module} className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-white/62">{module}</span>)}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
