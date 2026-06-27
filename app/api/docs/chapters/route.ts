import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { slugifyDoc } from "@/lib/flowlyDocsDb";

function dbReady() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

async function getBookId(bookSlug: string) {
  const { data } = await supabaseAdmin.from("flowly_doc_books").select("id").eq("slug", bookSlug).maybeSingle();
  return data?.id as string | undefined;
}

export async function POST(request: NextRequest) {
  if (!dbReady()) return NextResponse.json({ error: "Supabase no está configurado." }, { status: 503 });
  const body = await request.json();
  const bookSlug = String(body.bookSlug || body.book_slug || "").trim();
  const title = String(body.title || "").trim();
  if (!bookSlug || !title) return NextResponse.json({ error: "bookSlug y title son obligatorios." }, { status: 400 });
  const bookId = await getBookId(bookSlug);
  if (!bookId) return NextResponse.json({ error: "Libro no encontrado en Supabase. Crea primero el libro desde Docs Studio." }, { status: 404 });
  const slug = slugifyDoc(body.slug || title);
  const payload = {
    book_id: bookId,
    slug,
    title,
    summary: body.summary || "Capítulo de Flowly Docs.",
    content: body.content || `# ${title}\n\nContenido pendiente.`,
    status: body.status || "draft",
    sort_order: Number(body.sort_order || 1000),
  };
  const { data, error } = await supabaseAdmin
    .from("flowly_doc_chapters")
    .upsert(payload, { onConflict: "book_id,slug" })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ chapter: data });
}

export async function PUT(request: NextRequest) {
  if (!dbReady()) return NextResponse.json({ error: "Supabase no está configurado." }, { status: 503 });
  const body = await request.json();
  const id = String(body.id || "").trim();
  if (!id) return NextResponse.json({ error: "id es obligatorio." }, { status: 400 });
  const { data, error } = await supabaseAdmin
    .from("flowly_doc_chapters")
    .update({
      title: body.title,
      summary: body.summary,
      content: body.content,
      status: body.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ chapter: data });
}
