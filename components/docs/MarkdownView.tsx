import type { ReactNode } from "react";

function inlineFormat(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    const token = match[0];
    if (token.startsWith("**")) {
      parts.push(<strong key={`${match.index}-b`} className="font-semibold text-white">{token.slice(2, -2)}</strong>);
    } else {
      parts.push(<code key={`${match.index}-c`} className="rounded-md border border-white/10 bg-black/35 px-1.5 py-0.5 text-cyan-100">{token.slice(1, -1)}</code>);
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

export default function MarkdownView({ content }: { content: string }) {
  const lines = content.split("\n");
  const blocks: ReactNode[] = [];
  let list: string[] = [];
  let code: string[] = [];
  let inCode = false;

  const flushList = () => {
    if (!list.length) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="my-5 space-y-2 rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-white/68">
        {list.map((item, index) => <li key={`${item}-${index}`} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-200" /> <span>{inlineFormat(item)}</span></li>)}
      </ul>
    );
    list = [];
  };

  const flushCode = () => {
    if (!code.length) return;
    blocks.push(
      <pre key={`code-${blocks.length}`} className="my-5 overflow-x-auto rounded-2xl border border-white/10 bg-black/45 p-5 text-sm leading-6 text-cyan-50">
        <code>{code.join("\n")}</code>
      </pre>
    );
    code = [];
  };

  lines.forEach((line) => {
    if (line.trim().startsWith("```")) {
      if (inCode) {
        inCode = false;
        flushCode();
      } else {
        flushList();
        inCode = true;
      }
      return;
    }
    if (inCode) {
      code.push(line);
      return;
    }
    if (line.startsWith("# ")) {
      flushList();
      blocks.push(<h1 key={`h1-${blocks.length}`} className="mb-5 mt-2 text-4xl font-semibold tracking-tight md:text-5xl">{line.slice(2)}</h1>);
      return;
    }
    if (line.startsWith("## ")) {
      flushList();
      blocks.push(<h2 key={`h2-${blocks.length}`} className="mb-3 mt-8 text-2xl font-semibold text-white">{line.slice(3)}</h2>);
      return;
    }
    if (line.startsWith("### ")) {
      flushList();
      blocks.push(<h3 key={`h3-${blocks.length}`} className="mb-2 mt-6 text-xl font-semibold text-white/90">{line.slice(4)}</h3>);
      return;
    }
    if (line.trim().startsWith("- ")) {
      list.push(line.trim().slice(2));
      return;
    }
    if (!line.trim()) {
      flushList();
      return;
    }
    flushList();
    blocks.push(<p key={`p-${blocks.length}`} className="my-3 text-base leading-8 text-white/64">{inlineFormat(line)}</p>);
  });
  flushList();
  flushCode();
  return <article className="prose-invert max-w-none">{blocks}</article>;
}
