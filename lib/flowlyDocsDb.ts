import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { flowlyDocBooks, type FlowlyDocBook, type FlowlyDocChapterContent } from "@/lib/flowlyDocsContent";

export type DocsBookRecord = {
  id?: string;
  slug: string;
  title: string;
  badge?: string | null;
  description?: string | null;
  status?: string | null;
  sort_order?: number | null;
};

export type DocsChapterRecord = {
  id?: string;
  book_id?: string | null;
  book_slug?: string | null;
  slug: string;
  title: string;
  summary?: string | null;
  content: string;
  status?: "ready" | "draft" | "next" | string | null;
  sort_order?: number | null;
};

export type DocsSearchResult = {
  bookSlug: string;
  bookTitle: string;
  chapterSlug: string;
  chapterTitle: string;
  summary: string;
  excerpt: string;
  score: number;
  source: "static" | "database";
};

function canUseSupabase() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function excerptFor(content: string, query: string) {
  const clean = content.replace(/[#*_>`-]/g, " ").replace(/\s+/g, " ").trim();
  const normalized = normalize(clean);
  const term = normalize(query).split(/\s+/).find(Boolean) || "";
  const index = term ? normalized.indexOf(term) : -1;
  const start = Math.max(0, index - 110);
  const slice = clean.slice(start, start + 280);
  return `${start > 0 ? "..." : ""}${slice}${start + 280 < clean.length ? "..." : ""}`;
}

export async function getDatabaseDocBooks(): Promise<FlowlyDocBook[]> {
  if (!canUseSupabase()) return [];
  try {
    const { data: books, error: booksError } = await supabaseAdmin
      .from("flowly_doc_books")
      .select("id, slug, title, badge, description, status, sort_order")
      .order("sort_order", { ascending: true })
      .order("title", { ascending: true });

    if (booksError || !books?.length) return [];

    const { data: chapters, error: chaptersError } = await supabaseAdmin
      .from("flowly_doc_chapters")
      .select("id, book_id, slug, title, summary, content, status, sort_order")
      .order("sort_order", { ascending: true })
      .order("title", { ascending: true });

    if (chaptersError) return [];

    return books.map((book) => ({
      slug: book.slug,
      title: book.title,
      badge: book.badge || "Docs",
      description: book.description || "Documento vivo de Flowly.",
      chapters: (chapters || [])
        .filter((chapter) => chapter.book_id === book.id)
        .map((chapter) => ({
          slug: chapter.slug,
          title: chapter.title,
          summary: chapter.summary || "Capítulo de Flowly Docs.",
          status: (chapter.status || "draft") as FlowlyDocChapterContent["status"],
          content: chapter.content || "",
        })),
    }));
  } catch {
    return [];
  }
}

export async function getAllDocBooks(): Promise<FlowlyDocBook[]> {
  const dbBooks = await getDatabaseDocBooks();
  const staticSlugs = new Set(flowlyDocBooks.map((book) => book.slug));
  const additionalDbBooks = dbBooks.filter((book) => !staticSlugs.has(book.slug));
  const mergedStaticBooks = flowlyDocBooks.map((book) => {
    const dbBook = dbBooks.find((item) => item.slug === book.slug);
    if (!dbBook) return book;
    const chapterSlugs = new Set(book.chapters.map((chapter) => chapter.slug));
    return {
      ...book,
      title: dbBook.title || book.title,
      badge: dbBook.badge || book.badge,
      description: dbBook.description || book.description,
      chapters: [...book.chapters, ...dbBook.chapters.filter((chapter) => !chapterSlugs.has(chapter.slug))],
    };
  });
  return [...mergedStaticBooks, ...additionalDbBooks];
}

export async function searchDocs(query: string, limit = 20): Promise<DocsSearchResult[]> {
  const q = normalize(query);
  if (!q) return [];
  const words = q.split(/\s+/).filter(Boolean);
  const books = await getAllDocBooks();
  return books
    .flatMap((book) =>
      book.chapters.map((chapter) => {
        const haystack = normalize(`${book.title} ${chapter.title} ${chapter.summary} ${chapter.content}`);
        const score = words.reduce((total, word) => total + (haystack.includes(word) ? 1 : 0), 0);
        return {
          bookSlug: book.slug,
          bookTitle: book.title,
          chapterSlug: chapter.slug,
          chapterTitle: chapter.title,
          summary: chapter.summary,
          excerpt: excerptFor(chapter.content, query),
          score,
          source: flowlyDocBooks.some((staticBook) => staticBook.slug === book.slug && staticBook.chapters.some((staticChapter) => staticChapter.slug === chapter.slug)) ? "static" as const : "database" as const,
        };
      }),
    )
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.bookTitle.localeCompare(b.bookTitle))
    .slice(0, limit);
}

export function slugifyDoc(value: string) {
  return normalize(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "untitled";
}

export function splitMarkdownIntoChapters(markdown: string) {
  const sections: Array<{ title: string; content: string }> = [];
  const lines = markdown.split(/\r?\n/);
  let currentTitle = "Imported Chapter";
  let buffer: string[] = [];

  for (const line of lines) {
    const match = line.match(/^#\s+(.+)/);
    if (match && buffer.length) {
      sections.push({ title: currentTitle, content: buffer.join("\n").trim() });
      currentTitle = match[1].trim();
      buffer = [line];
    } else {
      if (match) currentTitle = match[1].trim();
      buffer.push(line);
    }
  }

  if (buffer.join("\n").trim()) sections.push({ title: currentTitle, content: buffer.join("\n").trim() });
  return sections.length ? sections : [{ title: currentTitle, content: markdown }];
}
