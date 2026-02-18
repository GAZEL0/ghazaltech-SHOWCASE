import { Navbar } from "@/components/marketing/Navbar";
import { NeonBackground } from "@/components/marketing/NeonBackground";
import { Section } from "@/components/marketing/Section";
import { Footer } from "@/components/marketing/Footer";
import { CustomProjectForm } from "./CustomProjectForm";
import { getTranslations } from "next-intl/server";

export default async function CustomProjectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const isRTL = locale === "ar";

  return (
    <NeonBackground>
      <Navbar locale={locale} />
      <main dir={isRTL ? "rtl" : "ltr"} className={isRTL ? "rtl rtl:text-right" : ""}>
        <Section>
          <div className="rounded-3xl border border-slate-800/70 bg-[#050b18]/80 p-6 shadow-[0_14px_40px_rgba(0,0,0,0.45)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.18em] text-sky-300">
                  {t("customProject.title")}
                </p>
                <h1 className="text-3xl font-extrabold text-slate-50 sm:text-4xl">
                  {t("customProject.hero")}
                </h1>
                <p className="max-w-3xl text-base text-slate-300 sm:text-lg">
                  {t("customProject.subtitle")}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800/70 bg-[#0b1120]/80 px-4 py-3 text-sm text-slate-200">
                <div className="font-semibold text-emerald-200">
                  {t("customProject.guarantee")}
                </div>
                <div className="text-slate-400">{t("customProject.guaranteeCopy")}</div>
              </div>
            </div>
          </div>
        </Section>

        <Section>
          <CustomProjectForm />
        </Section>
      </main>
      <Footer />
    </NeonBackground>
  );
}
