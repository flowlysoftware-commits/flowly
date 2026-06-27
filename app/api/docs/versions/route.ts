import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function dbReady() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function GET(request: NextRequest) {
  if (!dbReady()) return NextResponse.json({ versions: [] });
  const chapterId = request.nextUrl.searchParams.get("chapterId");
  let query = supabaseAdmin.from("flowly_doc_versions").select("*").order("created_at", { ascending: false }).limit(50);
  if (chapterId) query = query.eq("chapter_id", chapterId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ versions: data || [] });
}

export async function POST(request: NextRequest) {
  if (!dbReady()) return NextResponse.json({ error: "Supabase no está configurado." }, { status: 503 });
  const body = await request.json();
  const { data, error } = await supabaseAdmin.from("flowly_doc_versions").insert({
    chapter_id: body.chapterId || null,
    title: body.title || "Snapshot",
    content: body.content || "",
    change_note: body.changeNote || "Manual snapshot",
    created_by: body.createdBy || null,
  }).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ version: data });
}
