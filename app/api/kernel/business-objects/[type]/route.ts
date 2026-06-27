import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function dbReady() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function GET(_request: NextRequest, context: { params: Promise<{ type: string }> }) {
  const params = await context.params;
  if (!dbReady()) return NextResponse.json({ records: [], type: params.type, dbReady: false });
  const { data, error } = await supabaseAdmin.from("flowly_business_object_records").select("*").eq("object_type", params.type).order("updated_at", { ascending: false }).limit(200);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ records: data || [], type: params.type, dbReady: true });
}
