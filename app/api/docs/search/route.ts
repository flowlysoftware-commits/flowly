import { NextRequest, NextResponse } from "next/server";
import { searchDocs } from "@/lib/flowlyDocsDb";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") || "";
  const limit = Number(request.nextUrl.searchParams.get("limit") || 20);
  const results = await searchDocs(query, limit);
  return NextResponse.json({ query, results });
}
