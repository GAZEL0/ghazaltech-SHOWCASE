import { FrontendSnippetPlaygroundClient } from "@/components/marketing/developers/FrontendSnippetPlaygroundClient";
import { Footer } from "@/components/marketing/Footer";
import { Navbar } from "@/components/marketing/Navbar";
import { NeonBackground } from "@/components/marketing/NeonBackground";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getTranslations } from "next-intl/server";
import { getServerSession } from "next-auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

type PlaygroundPageProps = {
  params: Promise<{ locale: string }>;
  searchParams?: { id?: string; slug?: string; preview?: string };
};

export default async function DevelopersFrontendPlaygroundPage({
  params,
  searchParams,
}: PlaygroundPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "developersFrontend" });

  const id = searchParams?.id?.trim() ?? "";
  const slug = searchParams?.slug?.trim() ?? "";
  const wantsPreview = searchParams?.preview === "1";

  const session = wantsPreview ? await getServerSession(authOptions) : null;
  const isStaff = session?.user.role === "ADMIN" || session?.user.role === "PARTNER";

  const snippet = id || slug
    ? await prisma.frontEndSnippet.findFirst({
        where: {
          ...(id ? { id } : {}),
          ...(slug ? { slug } : {}),
          ...(!wantsPreview || !isStaff ? { status: "PUBLISHED" } : {}),
        },
        include: { tags: { include: { tag: true } } },
      })
    : null;

  return (
    <NeonBackground>
      <Navbar locale={locale} />
      <main dir={locale === "ar" ? "rtl" : "ltr"} className={locale === "ar" ? "rtl rtl:text-right" : ""}>
        {snippet ? (
          <FrontendSnippetPlaygroundClient
            locale={locale}
            snippet={{
              id: snippet.id,
              title: snippet.title,
              description: snippet.description,
              slug: snippet.slug,
              html: snippet.html,
              css: snippet.css,
              js: snippet.js,
              tags: snippet.tags.map((rel) => ({
                name: rel.tag.name,
                category: rel.tag.category,
              })),
            }}
          />
        ) : (
          <section className="py-12 sm:py-16">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <div className="rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-6 text-center text-sm text-slate-300">
                <h1 className="text-2xl font-semibold text-slate-50">{t("playground.missing")}</h1>
                <p className="mt-2 text-sm text-slate-400">{t("playground.missingBody")}</p>
                <Link
                  href={`/${locale}/developers/frontend`}
                  className="mt-5 inline-flex items-center rounded-full border border-cyan-300/70 bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-[0_0_24px_rgba(56,189,248,0.35)]"
                >
                  {t("playground.back")}
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </NeonBackground>
  );
}
