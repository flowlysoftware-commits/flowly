import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const ACCESS_PASSWORD = "Nosotrostarot1.";
const allowedCategories = new Set(["business", "money_origin", "money_destination", "payment_method", "movement_type"]);

function isAuthorized(request: NextRequest) {
  return request.headers.get("x-contabilidad-password") === ACCESS_PASSWORD;
}

function dbReady() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function jsonError(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

function cleanText(value: unknown, max = 80) {
  if (typeof value !== "string") return "";
  const clean = value.trim();
  return clean.length > 0 && clean.length <= max ? clean : "";
}

const selectFields = "id, category, value, active, created_at";

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) return jsonError("No autorizado", 401);
  if (!dbReady()) return jsonError("Supabase no está configurado", 503);

  const { data, error } = await supabaseAdmin
    .from("manual_accounting_options")
    .select(selectFields)
    .order("category", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ options: data || [] });
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) return jsonError("No autorizado", 401);
  if (!dbReady()) return jsonError("Supabase no está configurado", 503);

  const body = await request.json();
  const category = cleanText(body.category, 40);
  const value = cleanText(body.value);

  if (!allowedCategories.has(category)) return jsonError("Categoría no válida");
  if (!value) return jsonError("Escribe un nombre válido de hasta 80 caracteres");

  const { data, error } = await supabaseAdmin
    .from("manual_accounting_options")
    .insert({ category, value, active: true })
    .select(selectFields)
    .single();

  if (error?.code === "23505") return jsonError("Ya existe una opción con ese nombre en esta categoría", 409);
  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ option: data });
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
  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ option: data });
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

  if (error) return jsonError(error.message, 500);
  if (!data) return jsonError("La opción no existe o ya fue eliminada", 404);
  return NextResponse.json({ deletedId: data.id });
}
