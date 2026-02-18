import { Footer } from "@/components/marketing/Footer";
import { Navbar } from "@/components/marketing/Navbar";
import { NeonBackground } from "@/components/marketing/NeonBackground";
import { FaqClient } from "@/components/marketing/faq/FaqClient";
import { getTranslations } from "next-intl/server";

type FaqPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function FaqPage({ params }: FaqPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  const hero = {
    title: t("faqPage.hero.title"),
    subtitle: t("faqPage.hero.subtitle"),
    searchLabel: t("faqPage.hero.searchLabel"),
    searchPlaceholder: t("faqPage.hero.searchPlaceholder"),
    placeholders: (t.raw("faqPage.hero.placeholders") as string[]) ?? [],
  };

  const categories = (t.raw("faqPage.categories") as { id: string; label: string }[]) ?? [];
  const rawQuestions = (t.raw("faqPage.questions") as Record<
    string,
    { q: string; a: string; highlights?: string[] }[]
  >) ?? {};

  const questionsByCategory = Object.fromEntries(
    Object.entries(rawQuestions).map(([key, items]) => [
      key,
      items.map((item, idx) => ({
        id: `${key}-${idx}`,
        question: item.q,
        answer: item.a,
        highlights: item.highlights ?? [],
      })),
    ]),
  );

  const ctaCard = {
    title: t("faqPage.cta.title"),
    body: t("faqPage.cta.body"),
    button: t("faqPage.cta.button"),
  };

  const finalCta = {
    title: t("faqPage.finalCta.title"),
    body: t("faqPage.finalCta.body"),
    primary: t("faqPage.finalCta.primary"),
    secondary: t("faqPage.finalCta.secondary"),
  };

  const emptyState = {
    title: t("faqPage.empty.title"),
    body: t("faqPage.empty.body"),
    reset: t("faqPage.empty.reset"),
  };

  return (
    <NeonBackground>
      <Navbar locale={locale} />
      <main dir={locale === "ar" ? "rtl" : "ltr"} className={locale === "ar" ? "rtl rtl:text-right" : ""}>
        <FaqClient
          locale={locale}
          hero={hero}
          categories={categories}
          questionsByCategory={questionsByCategory}
          ctaCard={ctaCard}
          finalCta={finalCta}
          emptyState={emptyState}
          typingLabel={t("faqPage.typing")}
        />
      </main>
      <Footer />
    </NeonBackground>
  );
}
