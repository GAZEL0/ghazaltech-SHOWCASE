import { Footer } from "@/components/marketing/Footer";
import { Navbar } from "@/components/marketing/Navbar";
import { NeonBackground } from "@/components/marketing/NeonBackground";
import { Section } from "@/components/marketing/Section";
import { getTranslations } from "next-intl/server";
import { publicSite } from "@/lib/public-site";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const sections = t.raw("legal.privacy.sections") as { title: string; body: string }[];
  const emailLabel = locale === "tr" ? "E-posta" : locale === "ar" ? "البريد الإلكتروني" : "Email";
  const locationLabel = locale === "tr" ? "Konum" : locale === "ar" ? "الموقع" : "Location";

  return (
    <NeonBackground>
      <Navbar locale={locale} />
      <main dir={locale === "ar" ? "rtl" : "ltr"} className={locale === "ar" ? "rtl rtl:text-right" : ""}>
        <Section>
          <article className="mx-auto max-w-3xl rounded-3xl border border-slate-700/60 bg-[#0b1120]/90 p-8 text-slate-200 shadow-[0_18px_40px_rgba(15,23,42,0.6)]">
            <header className="space-y-3 border-b border-slate-800/70 pb-6">
              <h1 className="text-3xl font-bold text-slate-50">{t("legal.privacy.title")}</h1>
              <p className="text-sm text-slate-300">{t("legal.privacy.subtitle")}</p>
            </header>

            <ol className="mt-6 space-y-6">
              {sections.map((item, index) => (
                <li key={`${item.title}-${index}`}>
                  <h2 className="text-lg font-semibold text-slate-100">
                    {index + 1}. {item.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300 whitespace-pre-line">
                    {item.body}
                  </p>
                </li>
              ))}
            </ol>

            <div className="mt-6 border-t border-slate-800/70 pt-4 text-sm text-slate-300">
              <div className="font-semibold text-slate-100">{t("legal.privacy.contactTitle")}</div>
              <div className="mt-2 space-y-1">
                <div>{`${emailLabel}: ${publicSite.contactEmail}`}</div>
                <div>{`${locationLabel}: ${publicSite.contactLocationLabel}`}</div>
              </div>
            </div>

            <div className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-500">
              {t("legal.privacy.lastUpdated")}
            </div>
          </article>
        </Section>
      </main>
      <Footer />
    </NeonBackground>
  );
}
