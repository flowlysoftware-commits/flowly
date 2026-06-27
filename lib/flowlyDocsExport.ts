import type { FlowlyDocBook } from "@/lib/flowlyDocsContent";

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function markdownToBasicHtml(markdown: string) {
  return escapeHtml(markdown)
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^/, "<p>")
    .replace(/$/, "</p>");
}

export function exportBookAsMarkdown(book: FlowlyDocBook) {
  return [`# ${book.title}`, "", book.description, "", ...book.chapters.flatMap((chapter, index) => [
    `---`,
    "",
    `# ${index + 1}. ${chapter.title}`,
    "",
    chapter.summary,
    "",
    chapter.content,
    "",
  ])].join("\n");
}

export function exportBookAsHtml(book: FlowlyDocBook) {
  const chapters = book.chapters.map((chapter) => `<section><h1>${escapeHtml(chapter.title)}</h1><p>${escapeHtml(chapter.summary)}</p>${markdownToBasicHtml(chapter.content)}</section>`).join("\n");
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(book.title)}</title><style>body{font-family:Arial,sans-serif;max-width:900px;margin:40px auto;line-height:1.6;color:#111}section{page-break-before:always}pre{background:#f4f4f4;padding:16px;overflow:auto}</style></head><body><h1>${escapeHtml(book.title)}</h1><p>${escapeHtml(book.description)}</p>${chapters}</body></html>`;
}
