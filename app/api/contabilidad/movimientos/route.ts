import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const ACCESS_PASSWORD = "Nosotrostarot1.";
const movementTypes = new Set(["ingreso", "gasto"]);
const businesses = new Set(["Flowly", "Celestial", "Leonaris"]);
const channels = new Set(["Square", "Transferencia", "Bizum", "Tarjeta", "Stripe", "PayPal", "Otro"]);
const categories = new Set(["recarga", "facebook", "pago tarotista", "Deuda", "Pago Centrales", "Pago premium numbers", "pago hubspot", "otros", "call400", "Flowly"]);

function isAuthorized(request: NextRequest) {
  return request.headers.get("x-contabilidad-password") === ACCESS_PASSWORD;
}

function jsonError(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

function dbReady() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function parseMonth(month: string | null) {
  const safeMonth = /^\d{4}-\d{2}$/.test(month || "") ? String(month) : new Date().toISOString().slice(0, 7);
  const start = `${safeMonth}-01`;
  const [year, monthNumber] = safeMonth.split("-").map(Number);
  const next = new Date(Date.UTC(year, monthNumber, 1)).toISOString().slice(0, 10);
  return { month: safeMonth, start, next };
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) return jsonError("No autorizado", 401);
  if (!dbReady()) return NextResponse.json({ entries: [], dbReady: false });

  const { searchParams } = new URL(request.url);
  const { month, start, next } = parseMonth(searchParams.get("month"));

  const { data, error } = await supabaseAdmin
    .from("manual_accounting_movements")
    .select("id, movement_type, movement_date, business, channel, category, amount, note, created_at")
    .gte("movement_date", start)
    .lt("movement_date", next)
    .order("movement_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ entries: data || [], month, dbReady: true });
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) return jsonError("No autorizado", 401);
  if (!dbReady()) return jsonError("Supabase no está configurado", 503);

  const body = await request.json();
  const type = String(body.type || "");
  const date = String(body.date || "");
  const business = String(body.business || "");
  const channel = String(body.channel || "");
  const category = String(body.category || "");
  const amount = Number(String(body.amount ?? "").replace(",", "."));
  const note = typeof body.note === "string" ? body.note.trim() : "";

  if (!movementTypes.has(type)) return jsonError("Tipo de movimiento no válido");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return jsonError("Fecha no válida");
  if (!businesses.has(business)) return jsonError("Negocio no válido");
  if (!channels.has(channel)) return jsonError("Medio no válido");
  if (!categories.has(category)) return jsonError("Tipo no válido");
  if (!Number.isFinite(amount) || amount <= 0) return jsonError("Importe no válido");

  const { data, error } = await supabaseAdmin
    .from("manual_accounting_movements")
    .insert({
      movement_type: type,
      movement_date: date,
      business,
      channel,
      category,
      amount,
      note: note || null,
    })
    .select("id, movement_type, movement_date, business, channel, category, amount, note, created_at")
    .single();

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ entry: data });
}
