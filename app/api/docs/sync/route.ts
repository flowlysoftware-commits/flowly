import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { flowlyDocBooks } from "@/lib/flowlyDocsContent";

function dbReady() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function POST() {
  if (!dbReady()) return NextResponse.json({ error: "Supabase no está configurado." }, { status: 503 });
  let booksCount = 0;
  let chaptersCount = 0;
  for (const [bookIndex, book] of flowlyDocBooks.entries()) {
    const { data: savedBook, error: bookError } = await supabaseAdmin
      .from("flowly_doc_books")
      .upsert({ slug: book.slug, title: book.title, badge: book.badge, description: book.description, status: "ready", sort_order: bookIndex + 1 }, { onConflict: "slug" })
      .select("id")
      .single();
    if (bookError || !savedBook) continue;
    booksCount += 1;
    const rows = book.chapters.map((chapter, chapterIndex) => ({
      book_id: savedBook.id,
      slug: chapter.slug,
      title: chapter.title,
      summary: chapter.summary,
      content: chapter.content,
      status: chapter.status,
      sort_order: chapterIndex + 1,
    }));
    const { data } = await supabaseAdmin.from("flowly_doc_chapters").upsert(rows, { onConflict: "book_id,slug" }).select("id");
    chaptersCount += data?.length || 0;
  }
  return NextResponse.json({ ok: true, books: booksCount, chapters: chaptersCount });
}
