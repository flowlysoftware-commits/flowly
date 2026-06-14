import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "../_utils/auth";

const BUCKET = "sales-documents";
const allowedFolders = new Set(["contratos", "formaciones"]);
const MAX_FILE_SIZE = 250 * 1024 * 1024;

function safeFileName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase() || "archivo";
}

async function ensureBucket() {
  const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
  if (listError) return listError;
  if (buckets?.some((bucket) => bucket.name === BUCKET)) return null;

  const { error: bucketError } = await supabaseAdmin.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_FILE_SIZE,
  });
  return bucketError || null;
}

function buildStoragePath(folder: string, fileName: string) {
  return `${folder}/${Date.now()}-${crypto.randomUUID()}-${safeFileName(fileName || "archivo")}`;
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const bucketError = await ensureBucket();
  if (bucketError) return NextResponse.json({ error: bucketError.message }, { status: 500 });

  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => null);
    const folder = String(body?.folder || "formaciones");
    const fileName = String(body?.fileName || "archivo");
    const fileSize = Number(body?.size || 0);

    if (!allowedFolders.has(folder)) return NextResponse.json({ error: "Carpeta no permitida" }, { status: 400 });
    if (!fileName.trim()) return NextResponse.json({ error: "Nombre de archivo no válido" }, { status: 400 });
    if (fileSize > MAX_FILE_SIZE) return NextResponse.json({ error: "El archivo supera 250MB" }, { status: 400 });

    const path = buildStoragePath(folder, fileName);
    const { data, error } = await supabaseAdmin.storage.from(BUCKET).createSignedUploadUrl(path);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { data: publicData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({
      bucket: BUCKET,
      path,
      token: data.token,
      signedUrl: data.signedUrl,
      publicUrl: publicData.publicUrl,
    });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const folder = String(formData.get("folder") || "formaciones");

  if (!(file instanceof File)) return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
  if (!allowedFolders.has(folder)) return NextResponse.json({ error: "Carpeta no permitida" }, { status: 400 });
  if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: "El archivo supera 250MB" }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const path = buildStoragePath(folder, file.name || "archivo");
  const { error } = await supabaseAdmin.storage.from(BUCKET).upload(path, bytes, {
    contentType: file.type || "application/octet-stream",
    cacheControl: "3600",
    upsert: false,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ bucket: BUCKET, path, publicUrl: data.publicUrl });
}
