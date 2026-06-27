import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Code2, PenLine } from "lucide-react";
import { getAllDocBooks } from "@/lib/flowlyDocsDb";
import MarkdownView from "@/components/docs/MarkdownView";

export default async function FlowlyDocChapterPage({ params }: { params: Promise<{ book: string; chapter: string }> }) {
  const { book: bookSlug, chapter: chapterSlug } = await params;
  const books = await getAllDocBooks();
  const book = books.find((item) => item.slug === bookSlug);
  const chapter = book?.chapters.find((item) => item.slug === chapterSlug);
  if (!book || !chapter) {
    return (
      <main className="min-h-screen bg-[#080611] px-5 py-8 text-white">
        <section className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/[0.06] p-8">
          <Link href="/docs" className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white"><ArrowLeft size={16} /> Volver a Flowly Docs</Link>
          <h1 className="mt-6 text-3xl font-semibold">Capítulo no encontrado</h1>
        </section>
      </main>
    );
  }
  const currentIndex = book.chapters.findIndex((item) => item.slug === chapter.slug);
  const previous = currentIndex > 0 ? book.chapters[currentIndex - 1] : null;
  const next = currentIndex < book.chapters.length - 1 ? book.chapters[currentIndex + 1] : null;
  const codeTarget = chapter.slug.split("-").slice(1).join("-") || chapter.slug;

  return (
    <main className="min-h-screen bg-[#080611] px-5 py-8 text-white lg:px-8">
      <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[18rem,1fr]">
        <aside className="rounded-[1.6rem] border border-white/10 bg-white/[0.055] p-4 backdrop-blur-2xl lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:overflow-y-auto">
          <Link href={`/docs/${book.slug}`} className="mb-4 inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white"><ArrowLeft size={16} /> {book.title}</Link>
          <div className="space-y-2">
            {book.chapters.map((item, index) => (
              <Link key={item.slug} href={`/docs/${book.slug}/${item.slug}`} className={`block rounded-xl border p-3 text-sm transition ${item.slug === chapter.slug ? "border-cyan-300/35 bg-cyan-300/10 text-white" : "border-white/10 bg-white/[0.035] text-white/55 hover:bg-white/[0.07] hover:text-white"}`}>
                <span className="mr-2 text-xs text-white/35">{String(index + 1).padStart(2, "0")}</span>{item.title}
              </Link>
            ))}
          </div>
        </aside>

        <article className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 backdrop-blur-2xl md:p-9">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm text-white/45">
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/docs" className="hover:text-white">Flowly Docs</Link><span>/</span><Link href={`/docs/${book.slug}`} className="hover:text-white">{book.title}</Link>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/docs/studio" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs text-white/65 hover:text-white"><PenLine size={14} /> Editar/importar</Link>
              <Link href={`/docs/studio?target=${codeTarget}`} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs text-white/65 hover:text-white"><Code2 size={14} /> Ver código relacionado</Link>
            </div>
          </div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100"><BookOpen size={14} /> {book.badge}</div>
          <MarkdownView content={chapter.content} />
          <div className="mt-10 grid gap-4 border-t border-white/10 pt-6 md:grid-cols-2">
            {previous ? <Link href={`/docs/${book.slug}/${previous.slug}`} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/60 transition hover:bg-white/[0.06]"><ArrowLeft size={16} className="mb-2" /> Anterior<br /><span className="font-semibold text-white">{previous.title}</span></Link> : <div />}
            {next ? <Link href={`/docs/${book.slug}/${next.slug}`} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-right text-sm text-white/60 transition hover:bg-white/[0.06]"><ArrowRight size={16} className="mb-2 ml-auto" /> Siguiente<br /><span className="font-semibold text-white">{next.title}</span></Link> : <div />}
          </div>
        </article>
      </section>
    </main>
  );
}
