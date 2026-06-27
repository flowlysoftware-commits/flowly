import Link from "next/link";
import { ArrowRight, BookOpen, Database, PenLine, Search, Sparkles } from "lucide-react";
import { getAllDocBooks } from "@/lib/flowlyDocsDb";

const highlights = [
  { icon: Search, title: "Búsqueda", text: "Busca en todos los libros y capítulos de Flowly Docs." },
  { icon: PenLine, title: "Editor", text: "Crea, importa y edita documentación viva desde el panel." },
  { icon: Database, title: "Supabase", text: "Sincroniza la documentación estática con la base de datos." },
];

export default async function FlowlyDocsPage() {
  const books = await getAllDocBooks();
  const totalChapters = books.reduce((total, book) => total + book.chapters.length, 0);

  return (
    <main className="min-h-screen bg-[#080611] px-5 py-8 text-white lg:px-8">
      <section className="mx-auto max-w-7xl">
        <header className="overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/[0.06] p-8 backdrop-blur-2xl md:p-10">
          <span className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">Flowly Docs</span>
          <div className="mt-6 grid gap-8 lg:grid-cols-[1.25fr,0.75fr] lg:items-end">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">Sistema vivo de conocimiento de Flowly</h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-white/62">Architecture Bible, Reference Architecture, Engineering Handbook, catálogos, API, SDK, Companion y documentación operativa en un único módulo nativo.</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-5">
              <div className="text-sm text-white/45">Estado actual</div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4"><div className="text-3xl font-semibold">{books.length}</div><div className="text-xs text-white/45">Libros</div></div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4"><div className="text-3xl font-semibold">{totalChapters}</div><div className="text-xs text-white/45">Capítulos</div></div>
              </div>
              <Link href="/docs/studio" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-100 px-4 py-3 text-sm font-semibold text-slate-950">
                <Sparkles size={16} /> Abrir Docs Studio
              </Link>
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-[1.4rem] border border-white/10 bg-white/[0.045] p-5">
                <Icon className="text-cyan-100" size={20} />
                <h2 className="mt-4 font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-white/55">{item.text}</p>
              </div>
            );
          })}
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {books.map((book) => (
            <Link key={book.slug} href={`/docs/${book.slug}`} className="group rounded-[1.6rem] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/[0.085]">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-100">{book.badge}</span>
                <BookOpen size={18} className="text-white/45" />
              </div>
              <h2 className="mt-4 text-xl font-semibold">{book.title}</h2>
              <p className="mt-2 min-h-16 text-sm leading-6 text-white/55">{book.description}</p>
              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-sm text-white/45">
                <span>{book.chapters.length} capítulos</span>
                <span className="inline-flex items-center gap-1 text-cyan-100/80">Abrir <ArrowRight size={15} className="transition group-hover:translate-x-1" /></span>
              </div>
            </Link>
          ))}
        </section>
      </section>
    </main>
  );
}
