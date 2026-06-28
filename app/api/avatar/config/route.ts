import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { buildAvatarProfile, defaultFlowlyAvatarProfile } from "@/lib/flowlyAvatarRuntime";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET() {
  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json({ ok: true, avatar: defaultFlowlyAvatarProfile, source: "fallback" });
  }

  const { data, error } = await supabase
    .from("flowly_avatar_profiles")
    .select("*")
    .eq("active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ ok: true, avatar: defaultFlowlyAvatarProfile, source: "fallback", warning: error?.message || null });
  }

  return NextResponse.json({
    ok: true,
    source: "supabase",
    avatar: buildAvatarProfile({
      id: data.id,
      name: data.name,
      description: data.description,
      provider: data.provider,
      modelUrl: data.model_url,
      thumbnailUrl: data.thumbnail_url,
      active: data.active,
      version: data.version,
      fileSizeMb: data.file_size_mb,
      supportsNativeAnimations: data.supports_native_animations,
      supportsProceduralAnimations: data.supports_procedural_animations,
      notes: Array.isArray(data.notes) ? data.notes : defaultFlowlyAvatarProfile.notes,
    }),
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const avatar = buildAvatarProfile({
    name: body.name,
    description: body.description,
    provider: body.provider,
    modelUrl: body.modelUrl || body.model_url,
    thumbnailUrl: body.thumbnailUrl || body.thumbnail_url,
    version: body.version,
    fileSizeMb: Number(body.fileSizeMb || body.file_size_mb || 0) || undefined,
    supportsNativeAnimations: Boolean(body.supportsNativeAnimations || body.supports_native_animations),
    supportsProceduralAnimations: body.supportsProceduralAnimations === false ? false : true,
    notes: Array.isArray(body.notes) ? body.notes : undefined,
  });

  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "Faltan variables de Supabase para guardar el avatar. Se puede usar el fallback local.", avatar }, { status: 400 });
  }

  await supabase.from("flowly_avatar_profiles").update({ active: false }).eq("active", true);

  const { data, error } = await supabase
    .from("flowly_avatar_profiles")
    .insert({
      name: avatar.name,
      description: avatar.description,
      provider: avatar.provider,
      model_url: avatar.modelUrl,
      thumbnail_url: avatar.thumbnailUrl || null,
      active: true,
      version: avatar.version,
      file_size_mb: avatar.fileSizeMb || null,
      supports_native_animations: avatar.supportsNativeAnimations,
      supports_procedural_animations: avatar.supportsProceduralAnimations,
      notes: avatar.notes,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, avatar: data });
}
