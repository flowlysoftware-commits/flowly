import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAllDocBooks, slugifyDoc } from "@/lib/flowlyDocsDb";

function dbReady() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function GET() {
  const books = await getAllDocBooks();
  return NextResponse.json({ books });
}

export async function POST(request: NextRequest) {
  if (!dbReady()) return NextResponse.json({ error: "Supabase no está configurado." }, { status: 503 });
  const body = await request.json();
  const title = String(body.title || "").trim();
  if (!title) return NextResponse.json({ error: "El título es obligatorio." }, { status: 400 });
  const slug = slugifyDoc(body.slug || title);
  const { data, error } = await supabaseAdmin
    .from("flowly_doc_books")
    .upsert({
      slug,
      title,
      badge: body.badge || "Docs",
      description: body.description || "Documento vivo de Flowly.",
      status: body.status || "draft",
      sort_order: Number(body.sort_order || 1000),
    }, { onConflict: "slug" })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ book: data });
}
