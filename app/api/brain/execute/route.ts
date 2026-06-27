import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const approved = Boolean(body.approved);
  const action = String(body.action || "");

  if (!approved) {
    return NextResponse.json({ ok: false, error: "Flowly Brain no ejecuta acciones sin aprobación explícita." }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    status: "queued",
    action,
    message: "Acción aceptada por Flowly Brain. En esta primera versión queda preparada para Builder/Executor.",
    next: ["Registrar evento", "Enviar a Builder", "Verificar resultado", "Actualizar Docs"],
  });
}
