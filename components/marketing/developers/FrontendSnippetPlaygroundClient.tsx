"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { SnippetCopyActions, SnippetCodeTabs, SnippetPreviewFrame } from "./SnippetUI";
import { SnippetTagCategory } from "@/lib/snippets";

type SnippetTag = {
  name: string;
  category: SnippetTagCategory;
};

type SnippetData = {
  id: string;
  title: string;
  description?: string | null;
  slug: string;
  html: string;
  css: string;
  js: string;
  tags: SnippetTag[];
};

type FrontendSnippetPlaygroundClientProps = {
  locale: string;
  snippet: SnippetData;
};

export function FrontendSnippetPlaygroundClient({ locale, snippet }: FrontendSnippetPlaygroundClientProps) {
  const t = useTranslations("developersFrontend");
  const codeLabels = {
    html: t("code.html"),
    css: t("code.css"),
    js: t("code.js"),
  };
  const actionLabels = {
    copy: t("actions.copy"),
    copyAs: t("actions.copyAs"),
    copyHtml: t("actions.copyHtml"),
    copyCss: t("actions.copyCss"),
    copyJs: t("actions.copyJs"),
    copyFull: t("actions.copyFull"),
  };

  return (
    <section className="py-10 sm:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Link
          href={`/${locale}/developers/frontend`}
          className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 hover:text-slate-200"
        >
          {t("playground.back")}
        </Link>

        <div className="mt-4 rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-cyan-200">
                {t("playground.title")}
              </div>
              <h1 className="mt-3 text-2xl font-semibold text-slate-50 sm:text-3xl">
                {snippet.title}
              </h1>
              {snippet.description && (
                <p className="mt-2 text-sm text-slate-300">{snippet.description}</p>
              )}
            </div>
            <SnippetCopyActions
              html={snippet.html}
              css={snippet.css}
              js={snippet.js}
              labels={actionLabels}
              align="right"
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
            <SnippetPreviewFrame
              title={snippet.title}
              html={snippet.html}
              css={snippet.css}
              js={snippet.js}
              className="h-[320px] sm:h-[420px]"
            />
            <div className="space-y-4">
              <SnippetCodeTabs
                html={snippet.html}
                css={snippet.css}
                js={snippet.js}
                labels={codeLabels}
              />
              <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
                {snippet.tags.map((tag) => (
                  <span
                    key={`${snippet.id}-${tag.name}`}
                    className="rounded-full border border-slate-800/70 bg-slate-900/60 px-2 py-1"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
