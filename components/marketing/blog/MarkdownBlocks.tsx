import React from "react";

export type MarkdownBlock =
  | { type: "heading"; level: number; text: string; id: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "blockquote"; text: string }
  | { type: "code"; language: string; code: string }
  | { type: "hr" };

function makeId(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseMarkdown(content: string) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i += 1;
      continue;
    }

    if (line.trim().startsWith("```")) {
      const language = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i += 1;
      }
      i += 1;
      blocks.push({ type: "code", language, code: codeLines.join("\n") });
      continue;
    }

    if (/^#{1,4}\s+/.test(line)) {
      const level = line.match(/^#{1,4}/)?.[0].length ?? 2;
      const text = line.replace(/^#{1,4}\s+/, "").trim();
      blocks.push({ type: "heading", level, text, id: makeId(text) || `heading-${i}` });
      i += 1;
      continue;
    }

    if (line.trim() === "---") {
      blocks.push({ type: "hr" });
      i += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quoteLines: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^>\s?/, "").trim());
        i += 1;
      }
      blocks.push({ type: "blockquote", text: quoteLines.join(" ") });
      continue;
    }

    if (/^(\*|-)\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^(\*|-)\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^(\*|-)\s+/, "").trim());
        i += 1;
      }
      blocks.push({ type: "list", ordered: false, items });
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, "").trim());
        i += 1;
      }
      blocks.push({ type: "list", ordered: true, items });
      continue;
    }

    const paragraphLines: string[] = [line.trim()];
    i += 1;
    while (i < lines.length && lines[i].trim()) {
      paragraphLines.push(lines[i].trim());
      i += 1;
    }
    blocks.push({ type: "paragraph", text: paragraphLines.join(" ") });
  }

  return blocks;
}

export function extractHeadings(blocks: MarkdownBlock[]) {
  return blocks
    .filter((block) => block.type === "heading")
    .map((block) => {
      const heading = block as Extract<MarkdownBlock, { type: "heading" }>;
      return { id: heading.id, text: heading.text, level: heading.level };
    });
}

function renderInline(text: string) {
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**")) {
      parts.push(<strong key={`${match.index}-b`}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("*")) {
      parts.push(<em key={`${match.index}-i`}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith("`")) {
      parts.push(
        <code key={`${match.index}-c`} className="rounded-md bg-slate-800/60 px-1 py-0.5 text-xs text-slate-100">
          {token.slice(1, -1)}
        </code>,
      );
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

export function MarkdownBlocks({
  blocks,
  insertAfter,
  cta,
}: {
  blocks: MarkdownBlock[];
  insertAfter?: number;
  cta?: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      {blocks.map((block, idx) => {
        const elements: React.ReactNode[] = [];

        if (block.type === "heading") {
          const HeadingTag = block.level === 1 ? "h2" : block.level === 2 ? "h3" : "h4";
          elements.push(
            <HeadingTag key={`heading-${block.id}`} id={block.id} className="mt-6 text-xl font-semibold text-slate-50">
              {block.text}
            </HeadingTag>,
          );
        }

        if (block.type === "paragraph") {
          elements.push(
            <p key={`paragraph-${idx}`} className="text-sm leading-7 text-slate-300">
              {renderInline(block.text)}
            </p>,
          );
        }

        if (block.type === "list") {
          const ListTag = block.ordered ? "ol" : "ul";
          elements.push(
            <ListTag
              key={`list-${idx}`}
              className={`ml-4 space-y-2 text-sm text-slate-300 ${block.ordered ? "list-decimal" : "list-disc"} rtl:ml-0 rtl:mr-4`}
            >
              {block.items.map((item, itemIdx) => (
                <li key={`item-${idx}-${itemIdx}`}>{renderInline(item)}</li>
              ))}
            </ListTag>,
          );
        }

        if (block.type === "blockquote") {
          elements.push(
            <blockquote
              key={`quote-${idx}`}
              className="rounded-2xl border border-slate-800/70 bg-slate-950/60 px-4 py-3 text-sm text-slate-300 rtl:border-r-2 rtl:border-l-0"
            >
              {renderInline(block.text)}
            </blockquote>,
          );
        }

        if (block.type === "code") {
          elements.push(
            <pre
              key={`code-${idx}`}
              className="overflow-x-auto rounded-2xl border border-slate-800/70 bg-[#050b18]/80 p-4 text-xs text-slate-200"
            >
              <code>{block.code}</code>
            </pre>,
          );
        }

        if (block.type === "hr") {
          elements.push(<hr key={`hr-${idx}`} className="border-slate-800/70" />);
        }

        if (cta && insertAfter !== undefined && idx === insertAfter) {
          elements.push(<div key={`cta-${idx}`} className="my-6">{cta}</div>);
        }

        return elements;
      })}
    </div>
  );
}
