import { NextRequest, NextResponse } from "next/server";
import { searchDocs } from "@/lib/flowlyDocsDb";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const question = String(body.question || "").trim();
  if (!question) return NextResponse.json({ error: "La pregunta es obligatoria." }, { status: 400 });
  const results = await searchDocs(question, 6);
  const answer = results.length
    ? `He encontrado ${results.length} referencia(s) relevantes. La más importante es “${results[0].chapterTitle}” dentro de “${results[0].bookTitle}”. ${results[0].excerpt}`
    : "No he encontrado una referencia clara todavía. Prueba con términos como Business Object, Capability, Companion, AI Runtime o Governance.";
  return NextResponse.json({ question, answer, sources: results });
}
