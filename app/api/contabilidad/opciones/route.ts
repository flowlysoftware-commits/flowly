import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const ACCESS_PASSWORD = "Nosotrostarot1.";
const allowedCategories = new Set([
  "movement",
  "business",
  "origin",
  "destination",
  "channel",
  "category",
  "functionality",
]);

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

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) return jsonError("No autorizado", 401);
  if (!dbReady()) return jsonError("Supabase no está configurado", 503);

  const { data, error } = await supabaseAdmin
    .from("accounting_select_options")
    .select("id, category, label, accounting_effect, active, sort_order, created_at, updated_at")
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ options: data || [] });
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) return jsonError("No autorizado", 401);
  if (!dbReady()) return jsonError("Supabase no está configurado", 503);

  const body = await request.json();
  const category = cleanText(body.category, 40);
  const label = cleanText(body.label);
  const accountingEffect = body.accountingEffect === "gasto" ? "gasto" : body.accountingEffect === "ingreso" ? "ingreso" : null;

  if (!allowedCategories.has(category)) return jsonError("Categoría no válida");
  if (!label) return jsonError("Escribe un nombre válido de hasta 80 caracteres");
  if (category === "movement" && !accountingEffect) return jsonError("Indica si el movimiento cuenta como ingreso o gasto");

  const { data: maxRow } = await supabaseAdmin
    .from("accounting_select_options")
    .select("sort_order")
    .eq("category", category)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabaseAdmin
    .from("accounting_select_options")
    .insert({
      category,
      label,
      accounting_effect: category === "movement" ? accountingEffect : null,
      active: true,
      sort_order: Number(maxRow?.sort_order || 0) + 10,
    })
    .select("id, category, label, accounting_effect, active, sort_order, created_at, updated_at")
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
  const label = cleanText(body.label);
  const accountingEffect = body.accountingEffect === "gasto" ? "gasto" : body.accountingEffect === "ingreso" ? "ingreso" : null;
  if (!id) return jsonError("Falta el identificador de la opción");
  if (!label) return jsonError("Escribe un nombre válido de hasta 80 caracteres");

  const { data: existing, error: existingError } = await supabaseAdmin
    .from("accounting_select_options")
    .select("category")
    .eq("id", id)
    .maybeSingle();
  if (existingError) return jsonError(existingError.message, 500);
  if (!existing) return jsonError("La opción no existe", 404);
  if (existing.category === "movement" && !accountingEffect) return jsonError("Indica si el movimiento cuenta como ingreso o gasto");

  const { data, error } = await supabaseAdmin
    .from("accounting_select_options")
    .update({
      label,
      accounting_effect: existing.category === "movement" ? accountingEffect : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id, category, label, accounting_effect, active, sort_order, created_at, updated_at")
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

  // Eliminación lógica: los movimientos históricos conservan el texto guardado.
  const { data, error } = await supabaseAdmin
    .from("accounting_select_options")
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) return jsonError(error.message, 500);
  if (!data) return jsonError("La opción no existe o ya fue eliminada", 404);
  return NextResponse.json({ deletedId: data.id });
}
