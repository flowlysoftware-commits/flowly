import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "../_utils/auth";

const BUCKET = "sales-documents";
const allowedFolders = new Set(["contratos", "formaciones"]);

function safeFileName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const formData = await request.formData();
  const file = formData.get("file");
  const folder = String(formData.get("folder") || "formaciones");

  if (!(file instanceof File)) return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
  if (!allowedFolders.has(folder)) return NextResponse.json({ error: "Carpeta no permitida" }, { status: 400 });
  if (file.size > 250 * 1024 * 1024) return NextResponse.json({ error: "El archivo supera 250MB" }, { status: 400 });

  const { data: buckets } = await supabaseAdmin.storage.listBuckets();
  if (!buckets?.some((bucket) => bucket.name === BUCKET)) {
    const { error: bucketError } = await supabaseAdmin.storage.createBucket(BUCKET, { public: true });
    if (bucketError) return NextResponse.json({ error: bucketError.message }, { status: 500 });
  }

  const bytes = await file.arrayBuffer();
  const path = `${folder}/${Date.now()}-${crypto.randomUUID()}-${safeFileName(file.name || "archivo")}`;
  const { error } = await supabaseAdmin.storage.from(BUCKET).upload(path, bytes, {
    contentType: file.type || "application/octet-stream",
    cacheControl: "3600",
    upsert: false,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ path, publicUrl: data.publicUrl });
}
