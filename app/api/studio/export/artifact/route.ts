import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function dbReady() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function GET(request: NextRequest) {
  if (!dbReady()) return NextResponse.json({ error: "Supabase no está configurado." }, { status: 503 });
  const kind = request.nextUrl.searchParams.get("kind");
  const slug = request.nextUrl.searchParams.get("slug");
  if (!kind || !slug) return NextResponse.json({ error: "kind y slug son obligatorios." }, { status: 400 });
  const { data, error } = await supabaseAdmin.from("flowly_studio_artifacts").select("*").eq("kind", kind).eq("slug", slug).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Artefacto no encontrado." }, { status: 404 });
  return new NextResponse(JSON.stringify(data.definition, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="${slug}.${kind}.json"`,
    },
  });
}
