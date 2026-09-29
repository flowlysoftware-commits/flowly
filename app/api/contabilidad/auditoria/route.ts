import { NextRequest } from "next/server";
import { requireAccounting, accountingDatabase, privateJson } from "@/lib/accountingAuth";

export const dynamic = "force-dynamic";


export async function GET(request: NextRequest) {
  const actor = await requireAccounting(request);
  if (!actor) return privateJson({ error: "No autorizado" }, 401);
  const db = accountingDatabase(actor);
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return privateJson({ events: [], dbReady: false });
  const limit = Math.min(Math.max(Number(new URL(request.url).searchParams.get("limit")) || 200, 1), 500);
  const { data, error } = await db.from("manual_accounting_audit").select("id, movement_id, action, occurred_at, actor_user_id, database_role, source, old_data, new_data").order("occurred_at", { ascending: false }).limit(limit);
  if (error) {
    if (error.code === "42P01") return privateJson({ events: [], auditReady: false, error: "Ejecuta el SQL de auditoría incluido." });
    return privateJson({ error: "No se pudo cargar el historial de comparación." }, 500);
  }
  return privateJson({ events: data || [], auditReady: true });
}
