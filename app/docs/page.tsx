"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  Clock3,
  FileText,
  GitBranch,
  Search,
  Sparkles,
} from "lucide-react";
import { flowlyDocSections, flowlyDocsRoadmap, flowlyDocsStats } from "@/lib/flowlyDocs";

const statusStyles = {
  ready: "border-emerald-300/25 bg-emerald-400/10 text-emerald-100",
  draft: "border-white/10 bg-white/[0.06] text-white/70",
  next: "border-cyan-300/25 bg-cyan-400/10 text-cyan-100",
};

const statusLabel = {
  ready: "Listo",
  draft: "Borrador",
  next: "Siguiente",
};

export default function FlowlyDocsPage() {
  const [query, setQuery] = useState("");
  const [activeSlug, setActiveSlug] = useState(flowlyDocSections[0]?.slug || "");

  const filteredSections = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return flowlyDocSections;
    return flowlyDocSections.filter((section) => {
      const haystack = [
        section.title,
        section.badge,
        section.description,
        ...section.chapters.flatMap((chapter) => [chapter.title, chapter.summary]),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [query]);

  const activeSection = flowlyDocSections.find((section) => section.slug === activeSlug) || flowlyDocSections[0];

  return (
    <main className="min-h-screen overflow-hidden bg-[#080611] text-white">
      <div className="pointer-events-none fixed inset-0 opacity-70">
        <div className="absolute left-[-10%] top-[-10%] h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute right-[-8%] top-[18%] h-[28rem] w-[28rem] rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="absolute bottom-[-15%] left-[30%] h-[26rem] w-[26rem] rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>

      <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-8 lg:px-8">
        <header className="flex flex-col gap-5 rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
              <Image src="/logo.png" alt="Flowly IA" width={132} height={40} className="h-auto w-28" priority />
            </div>
            <div>
              <Link href="/dashboard" className="mb-3 inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white">
                <ArrowLeft size={16} /> Volver al panel
              </Link>
              <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">Flowly Docs</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/60 md:text-base">
                Centro de conocimiento vivo para la arquitectura, ingeniería, dominio, APIs, SDK y evolución de Flowly OS.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:w-[30rem]">
            {flowlyDocsStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-2xl font-semibold">{stat.value}</p>
                <p className="mt-1 text-xs text-white/45">{stat.label}</p>
              </div>
            ))}
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[22rem,1fr]">
          <aside className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-4 backdrop-blur-2xl lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:overflow-y-auto">
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/35" size={18} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar en Flowly Docs..."
                className="w-full rounded-2xl border border-white/10 bg-black/30 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-300/40"
              />
            </div>
            <div className="grid gap-2">
              {filteredSections.map((section) => {
                const Icon = section.icon;
                const isActive = section.slug === activeSection.slug;
                return (
                  <button
                    key={section.slug}
                    onClick={() => setActiveSlug(section.slug)}
                    className={`group flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                      isActive ? "border-cyan-300/35 bg-cyan-300/10" : "border-white/10 bg-white/[0.035] hover:bg-white/[0.07]"
                    }`}
                  >
                    <span className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${section.color}`}>
                      <Icon size={19} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{section.title}</span>
                      <span className="mt-0.5 block truncate text-xs text-white/45">{section.badge}</span>
                    </span>
                    <ArrowRight size={15} className="text-white/25 transition group-hover:translate-x-0.5 group-hover:text-white/60" />
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="grid gap-6">
            <div className={`rounded-[2rem] border border-white/10 bg-gradient-to-br ${activeSection.color} p-6 shadow-2xl shadow-black/20`}>
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <span className="inline-flex rounded-full border border-white/15 bg-black/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
                    {activeSection.badge}
                  </span>
                  <h2 className="mt-4 text-3xl font-semibold md:text-4xl">{activeSection.title}</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-white/68 md:text-base">{activeSection.description}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/60 md:w-72">
                  <p className="flex items-center gap-2 font-semibold text-white"><Sparkles size={17} /> Objetivo</p>
                  <p className="mt-2 leading-6">Convertir documentación estática en conocimiento navegable, consultable y conectado con el código.</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {activeSection.chapters.map((chapter) => (
                <article key={chapter.title} className="rounded-[1.6rem] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/[0.075]">
                  <div className="flex items-start justify-between gap-3">
                    <FileText className="mt-1 text-cyan-100" size={20} />
                    <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${statusStyles[chapter.status]}`}>
                      {statusLabel[chapter.status]}
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold">{chapter.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/55">{chapter.summary}</p>
                </article>
              ))}
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 backdrop-blur-2xl">
              <div className="flex items-center gap-3">
                <GitBranch className="text-cyan-100" />
                <div>
                  <h2 className="text-2xl font-semibold">Roadmap de Flowly Docs</h2>
                  <p className="mt-1 text-sm text-white/50">La ruta para convertir esta documentación en un producto real dentro de Flowly.</p>
                </div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {flowlyDocsRoadmap.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.06]">
                          <Icon size={18} />
                        </span>
                        <span className="text-xs text-white/40">Fase {index + 1}</span>
                      </div>
                      <h3 className="mt-4 font-semibold">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-white/55">{item.text}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <InfoCard icon={<CheckCircle2 />} title="Listo para Git" text="La documentación vive dentro del repositorio y se versiona junto al código." />
              <InfoCard icon={<Clock3 />} title="Preparado para IA" text="La estructura ya permite indexar secciones para búsquedas semánticas futuras." />
              <InfoCard icon={<CircleDashed />} title="Siguiente paso" text="Crear el Implementation Blueprint y convertirlo en tareas reales de desarrollo." />
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function InfoCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-5 backdrop-blur-xl">
      <div className="mb-4 inline-flex rounded-xl border border-white/10 bg-white/[0.06] p-3 text-cyan-100">{icon}</div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/52">{text}</p>
    </div>
  );
}
