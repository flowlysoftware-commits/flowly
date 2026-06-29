"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { ArrowLeft, BookOpen, Bot, Code2, Database, Download, FileInput, PenLine, Search, Sparkles } from "lucide-react";

type SearchResult = {
  bookSlug: string;
  bookTitle: string;
  chapterSlug: string;
  chapterTitle: string;
  summary: string;
  excerpt: string;
  score: number;
};

type CodeLink = { path: string; score: number };

async function postJson<T>(url: string, body?: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Error inesperado");
  return data as T;
}

function Panel({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[1.7rem] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-2xl">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-black/25 text-cyan-100">{icon}</span>
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function FlowlyDocsStudioPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [bookTitle, setBookTitle] = useState("Nuevo libro Flowly");
  const [bookSlug, setBookSlug] = useState("nuevo-libro-flowly");
  const [chapterTitle, setChapterTitle] = useState("Nuevo capítulo");
  const [chapterContent, setChapterContent] = useState("# Nuevo capítulo\n\nContenido inicial.");
  const [markdownImport, setMarkdownImport] = useState("# Libro importado\n\n## Introducción\n\nPega aquí tu Markdown.");
  const [target, setTarget] = useState("customer");
  const [links, setLinks] = useState<CodeLink[]>([]);
  const [message, setMessage] = useState("");
  const exportUrl = useMemo(() => `/api/docs/export?book=${encodeURIComponent(bookSlug || "constitution")}&format=markdown`, [bookSlug]);

  async function runSearch(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    const response = await fetch(`/api/docs/search?q=${encodeURIComponent(query)}&limit=12`);
    const data = await response.json();
    setResults(data.results || []);
  }

  async function runAsk(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    const data = await postJson<{ answer: string }>("/api/docs/ask", { question });
    setAnswer(data.answer);
  }

  async function createBook(event: FormEvent) {
    event.preventDefault();
    const data = await postJson<{ book: { slug: string } }>("/api/docs/books", { title: bookTitle, slug: bookSlug, badge: "Studio", description: "Libro creado desde Flowly Docs Studio." });
    setBookSlug(data.book.slug);
    setMessage("Libro guardado en Supabase.");
  }

  async function createChapter(event: FormEvent) {
    event.preventDefault();
    await postJson("/api/docs/chapters", { bookSlug, title: chapterTitle, content: chapterContent, summary: "Capítulo creado desde Flowly Docs Studio.", status: "draft" });
    setMessage("Capítulo guardado en Supabase.");
  }

  async function importMarkdown(event: FormEvent) {
    event.preventDefault();
    await postJson("/api/docs/import", { bookSlug, title: bookTitle, markdown: markdownImport });
    setMessage("Markdown importado y dividido en capítulos.");
  }

  async function syncStaticDocs() {
    await postJson("/api/docs/sync");
    setMessage("Documentación estática sincronizada con Supabase.");
  }

  async function findLinks(event: FormEvent) {
    event.preventDefault();
    const response = await fetch(`/api/docs/code-links?target=${encodeURIComponent(target)}`);
    const data = await response.json();
    setLinks(data.links || []);
  }

  return (
    <main className="min-h-screen bg-[#080611] px-5 py-8 text-white lg:px-8">
      <section className="mx-auto max-w-7xl">
        <Link href="/docs" className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white"><ArrowLeft size={16} /> Volver a Flowly Docs</Link>
        <header className="mt-6 rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 backdrop-blur-2xl">
          <span className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">Flowly Docs Studio</span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-6xl">Sistema vivo de documentación</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-white/60">Editor, importador Markdown, búsqueda, asistente, exportación, sincronización con Supabase y enlaces al código desde una única pantalla.</p>
          {message ? <div className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">{message}</div> : null}
        </header>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <Panel icon={<Search size={18} />} title="1. Buscador real">
            <form onSubmit={runSearch} className="flex gap-2">
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar Business Objects, Companion, AI Runtime..." className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none placeholder:text-white/35" />
              <button className="rounded-2xl bg-cyan-100 px-4 py-3 text-sm font-semibold text-slate-950">Buscar</button>
            </form>
            <div className="mt-4 space-y-3">
              {results.map((result) => (
                <Link key={`${result.bookSlug}-${result.chapterSlug}`} href={`/docs/${result.bookSlug}/${result.chapterSlug}`} className="block rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:bg-white/[0.06]">
                  <div className="text-sm font-semibold text-white">{result.chapterTitle}</div>
                  <div className="text-xs text-cyan-100/70">{result.bookTitle}</div>
                  <p className="mt-2 text-sm leading-6 text-white/55">{result.excerpt}</p>
                </Link>
              ))}
            </div>
          </Panel>

          <Panel icon={<Bot size={18} />} title="2. Preguntar a Flowly Docs">
            <form onSubmit={runAsk} className="space-y-3">
              <textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="¿Qué es el Decision Engine?" className="min-h-28 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none placeholder:text-white/35" />
              <button className="inline-flex items-center gap-2 rounded-2xl bg-cyan-100 px-4 py-3 text-sm font-semibold text-slate-950"><Sparkles size={16} /> Preguntar</button>
            </form>
            {answer ? <p className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/65">{answer}</p> : null}
          </Panel>

          <Panel icon={<Database size={18} />} title="3. Base de datos + sincronización">
            <form onSubmit={createBook} className="space-y-3">
              <input value={bookTitle} onChange={(event) => setBookTitle(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none" />
              <input value={bookSlug} onChange={(event) => setBookSlug(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none" />
              <div className="flex flex-wrap gap-2">
                <button className="rounded-2xl bg-cyan-100 px-4 py-3 text-sm font-semibold text-slate-950">Crear/actualizar libro</button>
                <button type="button" onClick={syncStaticDocs} className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white">Sincronizar Docs actuales</button>
              </div>
            </form>
          </Panel>

          <Panel icon={<PenLine size={18} />} title="4. Editor interno">
            <form onSubmit={createChapter} className="space-y-3">
              <input value={chapterTitle} onChange={(event) => setChapterTitle(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none" />
              <textarea value={chapterContent} onChange={(event) => setChapterContent(event.target.value)} className="min-h-52 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 font-mono text-sm outline-none" />
              <button className="rounded-2xl bg-cyan-100 px-4 py-3 text-sm font-semibold text-slate-950">Guardar capítulo</button>
            </form>
          </Panel>

          <Panel icon={<FileInput size={18} />} title="5. Importador Markdown">
            <form onSubmit={importMarkdown} className="space-y-3">
              <textarea value={markdownImport} onChange={(event) => setMarkdownImport(event.target.value)} className="min-h-60 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 font-mono text-sm outline-none" />
              <button className="rounded-2xl bg-cyan-100 px-4 py-3 text-sm font-semibold text-slate-950">Importar Markdown</button>
            </form>
          </Panel>

          <Panel icon={<Download size={18} />} title="6. Exportar + conectar con código">
            <div className="flex flex-wrap gap-2">
              <a href={exportUrl} className="rounded-2xl bg-cyan-100 px-4 py-3 text-sm font-semibold text-slate-950">Exportar Markdown</a>
              <a href={`/api/docs/export?book=${encodeURIComponent(bookSlug || "constitution")}&format=html`} className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white">Exportar HTML</a>
            </div>
          </Panel>

          <Panel icon={<Code2 size={18} />} title="7. Enlaces de código">
            <form onSubmit={findLinks} className="space-y-3">
              <input value={target} onChange={(event) => setTarget(event.target.value)} placeholder="Buscar enlaces de código" className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm outline-none" />
              <button className="rounded-2xl bg-cyan-100 px-4 py-3 text-sm font-semibold text-slate-950">Buscar enlaces</button>
            </form>
            <div className="mt-4 space-y-3">
              {links.map((link) => (
                <a key={link.path} href={link.path} className="block rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:bg-white/[0.06]">
                  <div className="text-sm font-semibold text-white">{link.path}</div>
                </a>
              ))}
            </div>
          </Panel>
        </div>
      </section>
    </main>
  );
}