"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildSnippetHtml } from "@/lib/snippets";

export type SnippetCodeLabels = {
  html: string;
  css: string;
  js: string;
};

export type SnippetActionLabels = {
  copy: string;
  copyAs: string;
  copyHtml: string;
  copyCss: string;
  copyJs: string;
  copyFull: string;
};

type SnippetPreviewFrameProps = {
  title: string;
  html: string;
  css: string;
  js: string;
  lazy?: boolean;
  className?: string;
};

export function SnippetPreviewFrame({
  title,
  html,
  css,
  js,
  lazy = false,
  className = "",
}: SnippetPreviewFrameProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(!lazy);
  const srcDoc = useMemo(() => buildSnippetHtml({ html, css, js }), [html, css, js]);

  useEffect(() => {
    if (!lazy) return undefined;
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "160px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [lazy]);

  return (
    <div
      ref={ref}
      className={`relative w-full overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/70 ${className}`}
    >
      {visible ? (
        <iframe
          title={title}
          srcDoc={srcDoc}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin"
          className="h-full w-full bg-white"
        />
      ) : (
        <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.18),transparent_55%)]" />
      )}
    </div>
  );
}

type SnippetCodeTabsProps = {
  html: string;
  css: string;
  js: string;
  labels: SnippetCodeLabels;
};

export function SnippetCodeTabs({ html, css, js, labels }: SnippetCodeTabsProps) {
  const [active, setActive] = useState<"html" | "css" | "js">("html");

  const code = active === "html" ? html : active === "css" ? css : js;

  return (
    <div className="min-w-0 rounded-2xl border border-slate-800/70 bg-slate-950/60">
      <div className="flex flex-wrap gap-2 border-b border-slate-800/70 px-3 py-2 text-xs">
        {([
          { key: "html", label: labels.html },
          { key: "css", label: labels.css },
          { key: "js", label: labels.js },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              active === tab.key
                ? "border-cyan-400/70 bg-cyan-500/15 text-cyan-100"
                : "border-slate-800/70 bg-slate-900/60 text-slate-300 hover:border-slate-600/70"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <pre className="max-h-56 max-w-full overflow-auto px-4 py-3 text-xs text-slate-200 whitespace-pre-wrap break-words sm:whitespace-pre sm:break-normal">
        <code>{code || ""}</code>
      </pre>
    </div>
  );
}

type SnippetCopyActionsProps = {
  html: string;
  css: string;
  js: string;
  labels: SnippetActionLabels;
  align?: "left" | "right";
};

export function SnippetCopyActions({ html, css, js, labels, align = "left" }: SnippetCopyActionsProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState<null | "all" | "html" | "css" | "js" | "full">(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const fullHtml = useMemo(() => buildSnippetHtml({ html, css, js }), [html, css, js]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  useEffect(() => {
    if (!copied) return undefined;
    const timeout = setTimeout(() => setCopied(null), 1400);
    return () => clearTimeout(timeout);
  }, [copied]);

  async function copyText(value: string, type: typeof copied) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(type);
      setMenuOpen(false);
    } catch {
      setMenuOpen(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2" ref={menuRef}>
      <button
        type="button"
        onClick={() => void copyText(fullHtml, "all")}
        className="rounded-full border border-cyan-400/70 bg-cyan-500/15 px-4 py-2 text-xs font-semibold text-cyan-100 transition hover:border-cyan-300"
      >
        {labels.copy}{copied === "all" ? " ?" : ""}
      </button>
      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="rounded-full border border-slate-700/70 bg-slate-900/60 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-slate-500/70"
        >
          {labels.copyAs}
        </button>
        {menuOpen && (
          <div
            className={`absolute z-20 mt-2 w-48 overflow-hidden rounded-xl border border-slate-800/70 bg-[#050b18] py-1 text-xs text-slate-200 shadow-[0_16px_40px_rgba(0,0,0,0.45)] ${
              align === "right" ? "right-0" : "left-0"
            }`}
          >
            <button
              type="button"
              onClick={() => void copyText(html, "html")}
              className="block w-full px-4 py-2 text-left hover:bg-slate-900/70"
            >
              {labels.copyHtml}{copied === "html" ? " ?" : ""}
            </button>
            <button
              type="button"
              onClick={() => void copyText(css, "css")}
              className="block w-full px-4 py-2 text-left hover:bg-slate-900/70"
            >
              {labels.copyCss}{copied === "css" ? " ?" : ""}
            </button>
            <button
              type="button"
              onClick={() => void copyText(js, "js")}
              className="block w-full px-4 py-2 text-left hover:bg-slate-900/70"
            >
              {labels.copyJs}{copied === "js" ? " ?" : ""}
            </button>
            <button
              type="button"
              onClick={() => void copyText(fullHtml, "full")}
              className="block w-full px-4 py-2 text-left hover:bg-slate-900/70"
            >
              {labels.copyFull}{copied === "full" ? " ?" : ""}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
