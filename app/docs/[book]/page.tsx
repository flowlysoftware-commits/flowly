import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, FileText, PenLine } from "lucide-react";
import { getAllDocBooks } from "@/lib/flowlyDocsDb";

const statusLabel = { ready: "Listo", draft: "Borrador", next: "Siguiente" } as const;
const statusStyles = {
  ready: "border-emerald-300/25 bg-emerald-400/10 text-emerald-100",
  draft: "border-white/10 bg-white/[0.06] text-white/70",
  next: "border-cyan-300/25 bg-cyan-400/10 text-cyan-100",
} as const;

export default async function FlowlyDocBookPage({ params }: { params: Promise<{ book: string }> }) {
  const { book: bookSlug } = await params;
  const books = await getAllDocBooks();
  const book = books.find((item) => item.slug === bookSlug);
  if (!book) {
    return (
      <main className="min-h-screen bg-[#080611] px-5 py-8 text-white">
        <section className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/[0.06] p-8">
          <Link href="/docs" className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white"><ArrowLeft size={16} /> Volver a Flowly Docs</Link>
          <h1 className="mt-6 text-3xl font-semibold">Libro no encontrado</h1>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080611] px-5 py-8 text-white lg:px-8">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/docs" className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white"><ArrowLeft size={16} /> Volver a Flowly Docs</Link>
          <Link href="/docs/studio" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white/70 transition hover:bg-white/[0.1] hover:text-white"><PenLine size={15} /> Docs Studio</Link>
        </div>
        <header className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 backdrop-blur-2xl">
          <span className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">{book.badge}</span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-6xl">{book.title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-white/60">{book.description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white/60"><BookOpen size={17} /> {book.chapters.length} capítulos disponibles</div>
            <a href={`/api/docs/export?book=${book.slug}&format=markdown`} className="inline-flex items-center gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-100">Exportar Markdown</a>
          </div>
        </header>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {book.chapters.map((chapter, index) => (
            <Link key={chapter.slug} href={`/docs/${book.slug}/${chapter.slug}`} className="group rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white/[0.085]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.06] text-sm text-cyan-100">{String(index + 1).padStart(2, "0")}</span><FileText className="text-cyan-100" size={19} /></div>
                <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${statusStyles[chapter.status] || statusStyles.draft}`}>{statusLabel[chapter.status] || chapter.status}</span>
              </div>
              <h2 className="mt-4 text-xl font-semibold">{chapter.title}</h2>
              <p className="mt-2 text-sm leading-6 text-white/55">{chapter.summary}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm text-cyan-100/80">Abrir capítulo <ArrowRight size={15} className="transition group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
