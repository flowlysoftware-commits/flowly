import { NextRequest, NextResponse } from "next/server";
import { getAllDocBooks } from "@/lib/flowlyDocsDb";
import { exportBookAsHtml, exportBookAsMarkdown } from "@/lib/flowlyDocsExport";

export async function GET(request: NextRequest) {
  const bookSlug = request.nextUrl.searchParams.get("book") || "constitution";
  const format = request.nextUrl.searchParams.get("format") || "markdown";
  const books = await getAllDocBooks();
  const book = books.find((item) => item.slug === bookSlug);
  if (!book) return NextResponse.json({ error: "Libro no encontrado." }, { status: 404 });

  if (format === "json") return NextResponse.json(book);
  if (format === "html" || format === "word") {
    const html = exportBookAsHtml(book);
    return new NextResponse(html, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "content-disposition": `attachment; filename="${book.slug}.${format === "word" ? "doc" : "html"}"`,
      },
    });
  }

  const markdown = exportBookAsMarkdown(book);
  return new NextResponse(markdown, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition": `attachment; filename="${book.slug}.md"`,
    },
  });
}
