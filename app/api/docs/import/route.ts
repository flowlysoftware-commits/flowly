import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { slugifyDoc, splitMarkdownIntoChapters } from "@/lib/flowlyDocsDb";

function dbReady() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function POST(request: NextRequest) {
  if (!dbReady()) return NextResponse.json({ error: "Supabase no está configurado." }, { status: 503 });
  const body = await request.json();
  const markdown = String(body.markdown || "").trim();
  const title = String(body.title || "Imported Book").trim();
  const bookSlug = slugifyDoc(body.bookSlug || title);
  if (!markdown) return NextResponse.json({ error: "markdown es obligatorio." }, { status: 400 });

  const { data: book, error: bookError } = await supabaseAdmin
    .from("flowly_doc_books")
    .upsert({ slug: bookSlug, title, badge: body.badge || "Import", description: body.description || "Libro importado desde Markdown.", status: "draft", sort_order: Number(body.sort_order || 1000) }, { onConflict: "slug" })
    .select("id, slug, title")
    .single();
  if (bookError || !book) return NextResponse.json({ error: bookError?.message || "No se pudo crear el libro." }, { status: 500 });

  const chapters = splitMarkdownIntoChapters(markdown);
  const rows = chapters.map((chapter, index) => ({
    book_id: book.id,
    slug: slugifyDoc(chapter.title),
    title: chapter.title,
    summary: chapter.content.replace(/[#*_>`-]/g, " ").replace(/\s+/g, " ").slice(0, 180),
    content: chapter.content,
    status: "draft",
    sort_order: index + 1,
  }));
  const { data, error } = await supabaseAdmin.from("flowly_doc_chapters").upsert(rows, { onConflict: "book_id,slug" }).select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ book, chapters: data });
}
