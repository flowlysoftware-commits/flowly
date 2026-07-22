import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const ACCESS_PASSWORD = "Nosotrostarot1.";
const movementTypes = new Set(["ingreso", "gasto"]);
const businesses = new Set(["Flowly", "Celestial", "Leonaris"]);

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

function validOption(value: unknown, max = 80) {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= max;
}

type BalanceMap = Record<string, number>;

type PriorEntry = {
  movement_type: "ingreso" | "gasto";
  business: string;
  amount: number | string;
  origin_account: string | null;
  destination_account: string | null;
};

function calculateOpeningBalances(entries: PriorEntry[]) {
  const business: BalanceMap = { Flowly: 0, Celestial: 0, Leonaris: 0 };
  const cash: BalanceMap = { Flowly: 0, Celestial: 0, Leonaris: 0 };

  for (const entry of entries) {
    const amount = Number(entry.amount) || 0;
    const sign = entry.movement_type === "ingreso" ? 1 : -1;
    business[entry.business] = (business[entry.business] || 0) + sign * amount;

    if (entry.destination_account === "Caja extra") cash[entry.business] = (cash[entry.business] || 0) + amount;
    if (entry.origin_account === "Caja extra") cash[entry.business] = (cash[entry.business] || 0) - amount;
  }

  return { business, cash };
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) return jsonError("No autorizado", 401);
  if (!dbReady()) {
    return NextResponse.json({
      entries: [],
      openingBalances: { Flowly: 0, Celestial: 0, Leonaris: 0 },
      openingCashBalances: { Flowly: 0, Celestial: 0, Leonaris: 0 },
      dbReady: false,
    });
  }

  const { searchParams } = new URL(request.url);
  const { month, start, next } = parseMonth(searchParams.get("month"));

  const [monthResult, priorResult] = await Promise.all([
    supabaseAdmin
      .from("manual_accounting_movements")
      .select("id, movement_type, movement_date, business, channel, category, amount, note, origin_account, destination_account, created_at")
      .gte("movement_date", start)
      .lt("movement_date", next)
      .order("movement_date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("manual_accounting_movements")
      .select("movement_type, business, amount, origin_account, destination_account")
      .lt("movement_date", start),
  ]);

  if (monthResult.error) return jsonError(monthResult.error.message, 500);
  if (priorResult.error) return jsonError(priorResult.error.message, 500);

  const opening = calculateOpeningBalances((priorResult.data || []) as PriorEntry[]);

  return NextResponse.json({
    entries: monthResult.data || [],
    month,
    openingBalances: opening.business,
    openingCashBalances: opening.cash,
    dbReady: true,
  });
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) return jsonError("No autorizado", 401);
  if (!dbReady()) return jsonError("Supabase no está configurado", 503);

  const body = await request.json();
  const type = String(body.type || "");
  const date = String(body.date || "");
  const business = String(body.business || "");
  const originAccount = String(body.originAccount || body.origin_account || "Banco").trim();
  const destinationAccount = String(body.destinationAccount || body.destination_account || "Banco").trim();
  const channel = String(body.channel || "").trim();
  const category = String(body.category || "").trim();
  const amount = Number(String(body.amount ?? "").replace(",", "."));
  const note = typeof body.note === "string" ? body.note.trim() : "";

  if (!movementTypes.has(type)) return jsonError("Tipo de movimiento no válido");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return jsonError("Fecha no válida");
  if (!businesses.has(business)) return jsonError("Negocio no válido");
  if (!validOption(originAccount)) return jsonError("Origen de dinero no válido");
  if (!validOption(destinationAccount)) return jsonError("Destino de dinero no válido");
  if (!validOption(channel)) return jsonError("Medio no válido");
  if (!validOption(category)) return jsonError("Tipo no válido");
  if (!Number.isFinite(amount) || amount <= 0) return jsonError("Importe no válido");
  if (note.length > 500) return jsonError("La observación es demasiado larga");

  const { data, error } = await supabaseAdmin
    .from("manual_accounting_movements")
    .insert({
      movement_type: type,
      movement_date: date,
      business,
      origin_account: originAccount,
      destination_account: destinationAccount,
      channel,
      category,
      amount,
      note: note || null,
    })
    .select("id, movement_type, movement_date, business, channel, category, amount, note, origin_account, destination_account, created_at")
    .single();

  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ entry: data });
}

export async function DELETE(request: NextRequest) {
  if (!isAuthorized(request)) return jsonError("No autorizado", 401);
  if (!dbReady()) return jsonError("Supabase no está configurado", 503);

  const { searchParams } = new URL(request.url);
  const id = String(searchParams.get("id") || "").trim();

  if (!id) return jsonError("Falta el identificador del movimiento");

  const { data, error } = await supabaseAdmin
    .from("manual_accounting_movements")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) return jsonError(error.message, 500);
  if (!data) return jsonError("El movimiento no existe o ya fue eliminado", 404);

  return NextResponse.json({ deletedId: data.id });
}
