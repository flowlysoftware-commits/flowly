import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const ACCESS_PASSWORD = "Nosotrostarot1.";
const allowedCategories = new Set(["business", "money_origin", "money_destination", "payment_method", "movement_type"]);
const selectFields = "id, category, value, active, created_at";

function isAuthorized(request: NextRequest) {
  return request.headers.get("x-contabilidad-password") === ACCESS_PASSWORD;
}

function dbReady() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function json(data: object, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

function jsonError(error: string, status = 400) {
  return json({ error }, status);
}

function isMissingOptionsTable(error: { code?: string; message?: string } | null | undefined) {
  const message = String(error?.message || "").toLowerCase();
  return (
    error?.code === "42P01" ||
    error?.code === "PGRST205" ||
    (message.includes("manual_accounting_options") &&
      (message.includes("does not exist") || message.includes("schema cache") || message.includes("could not find")))
  );
}

function cleanText(value: unknown, max = 80) {
  if (typeof value !== "string") return "";
  const clean = value.trim().replace(/\s+/g, " ");
  return clean.length > 0 && clean.length <= max ? clean : "";
}

function sameOptionValue(left: string, right: string) {
  return left.localeCompare(right, "es", { sensitivity: "base" }) === 0;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) return jsonError("No autorizado", 401);
  if (!dbReady()) return jsonError("Supabase no está configurado", 503);

  const { data, error } = await supabaseAdmin
    .from("manual_accounting_options")
    .select(selectFields)
    .order("category", { ascending: true })
    .order("created_at", { ascending: true });

  // El formulario conserva siempre sus opciones predeterminadas aunque la migración aún no se haya ejecutado.
  if (isMissingOptionsTable(error)) return json({ options: [], available: false });
  if (error) return jsonError("No se pudieron cargar las opciones configurables", 503);
  return json({ options: data || [], available: true });
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) return jsonError("No autorizado", 401);
  if (!dbReady()) return jsonError("Supabase no está configurado", 503);

  const body = await request.json();
  const category = cleanText(body.category, 40);
  const value = cleanText(body.value);

  if (!allowedCategories.has(category)) return jsonError("Categoría no válida");
  if (!value) return jsonError("Escribe un nombre válido de hasta 80 caracteres");

  // Si la opción ya existía pero fue desactivada, se recupera en lugar de crear un duplicado.
  const existingResult = await supabaseAdmin
    .from("manual_accounting_options")
    .select(selectFields)
    .eq("category", category);

  if (isMissingOptionsTable(existingResult.error)) {
    return jsonError("La tabla de opciones configurables todavía no está disponible. Ejecuta el SQL incluido.", 503);
  }
  if (existingResult.error) return jsonError("No se pudo comprobar la opción", 500);

  const existing = (existingResult.data || []).find((item) => sameOptionValue(String(item.value || ""), value));
  if (existing?.active) return jsonError("Ya existe una opción con ese nombre en esta categoría", 409);

  if (existing) {
    const { data, error } = await supabaseAdmin
      .from("manual_accounting_options")
      .update({ value, active: true })
      .eq("id", existing.id)
      .select(selectFields)
      .single();

    if (error) return jsonError("No se pudo reactivar la opción", 500);
    return json({ option: data });
  }

  const { data, error } = await supabaseAdmin
    .from("manual_accounting_options")
    .insert({ category, value, active: true })
    .select(selectFields)
    .single();

  if (error?.code === "23505") return jsonError("Ya existe una opción con ese nombre en esta categoría", 409);
  if (isMissingOptionsTable(error)) return jsonError("La tabla de opciones configurables todavía no está disponible. Ejecuta el SQL incluido.", 503);
  if (error) return jsonError("No se pudo guardar la opción", 500);
  return json({ option: data });
}

export async function PATCH(request: NextRequest) {
  if (!isAuthorized(request)) return jsonError("No autorizado", 401);
  if (!dbReady()) return jsonError("Supabase no está configurado", 503);

  const body = await request.json();
  const id = cleanText(body.id, 100);
  const value = cleanText(body.value);
  if (!id) return jsonError("Falta el identificador de la opción");
  if (!value) return jsonError("Escribe un nombre válido de hasta 80 caracteres");

  const { data, error } = await supabaseAdmin
    .from("manual_accounting_options")
    .update({ value })
    .eq("id", id)
    .select(selectFields)
    .single();

  if (error?.code === "23505") return jsonError("Ya existe una opción con ese nombre en esta categoría", 409);
  if (isMissingOptionsTable(error)) return jsonError("La tabla de opciones configurables todavía no está disponible. Ejecuta el SQL incluido.", 503);
  if (error) return jsonError("No se pudo actualizar la opción", 500);
  return json({ option: data });
}

export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) return jsonError("No autorizado", 401);
  if (!dbReady()) return jsonError("Supabase no está configurado", 503);

  const id = cleanText(new URL(request.url).searchParams.get("id"), 100);
  if (!id) return jsonError("Falta el identificador de la opción");

  const { data, error } = await supabaseAdmin
    .from("manual_accounting_options")
    .update({ active: false })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (isMissingOptionsTable(error)) return jsonError("La tabla de opciones configurables todavía no está disponible. Ejecuta el SQL incluido.", 503);
  if (error) return jsonError("No se pudo desactivar la opción", 500);
  if (!data) return jsonError("La opción no existe o ya fue eliminada", 404);
  return json({ deletedId: data.id });
}
