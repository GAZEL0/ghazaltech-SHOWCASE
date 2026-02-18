import { Footer } from "@/components/marketing/Footer";
import { Navbar } from "@/components/marketing/Navbar";
import { NeonBackground } from "@/components/marketing/NeonBackground";
import { Section } from "@/components/marketing/Section";
import { ContactForm } from "@/components/marketing/ContactForm";
import { ContactInfoActions } from "@/components/marketing/ContactInfoActions";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { publicSite } from "@/lib/public-site";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });
  const socials = [
    { href: publicSite.social.facebook, label: "Facebook", icon: FacebookIcon },
    { href: publicSite.social.instagram, label: "Instagram", icon: InstagramIcon },
    { href: publicSite.social.linkedin, label: "LinkedIn", icon: LinkedInIcon },
    { href: publicSite.social.whatsapp, label: "WhatsApp", icon: WhatsAppIcon },
  ];

  return (
    <NeonBackground>
      <Navbar locale={locale} />
      <main
        dir={locale === "ar" ? "rtl" : "ltr"}
        className={locale === "ar" ? "rtl rtl:text-right" : ""}
      >
        <Section>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-cyan-400/50 bg-[radial-gradient(circle_at_0_0,#0b1120,#020617)] p-6 shadow-[0_0_25px_rgba(56,189,248,0.3)]">
              <h1 className="text-2xl font-bold text-slate-50">{t("nav.contact")}</h1>
              <p className="mt-2 text-sm text-slate-400">
                {t("hero.desc")}
              </p>
              <ContactForm
                locale={locale}
                labels={{
                  name: t("contactPage.form.name"),
                  email: t("contactPage.form.email"),
                  subject: t("contactPage.form.subject"),
                  message: t("contactPage.form.message"),
                  submit: t("contactPage.form.submit"),
                  sending: t("contactPage.form.sending"),
                  error: t("contactPage.form.error"),
                }}
                placeholders={{
                  name: t("contactPage.placeholders.name"),
                  email: t("contactPage.placeholders.email"),
                  subject: t("contactPage.placeholders.subject"),
                }}
              />
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-700 bg-[#020617e6] p-5 shadow-[0_16px_40px_rgba(15,23,42,1)]">
                <h3 className="text-lg font-semibold text-slate-50">{t("contactPage.infoTitle")}</h3>
                <ContactInfoActions
                  email={publicSite.contactEmail}
                  phone={publicSite.contactPhone}
                  locationLabel={publicSite.contactLocationLabel}
                  locationHref={publicSite.contactLocationHref}
                />
                <div className="mt-4 flex items-center gap-3">
                  {socials.map(({ href, label, icon: Icon }) => {
                    const isExternal = href.startsWith("http");
                    return (
                      <a
                        key={label}
                        href={href}
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noreferrer" : undefined}
                        aria-label={label}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-800/60 bg-slate-900/70 text-slate-200 transition hover:border-cyan-300/80 hover:text-cyan-100"
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    );
                  })}
                </div>
              </div>
              <div className="rounded-2xl border border-cyan-400/50 bg-[radial-gradient(circle_at_0_0,#0b1120,#020617)] p-5 shadow-[0_0_25px_rgba(56,189,248,0.3)]">
                <h3 className="text-lg font-semibold text-slate-50">{t("contactPage.locationTitle")}</h3>
                <div className="mt-3 h-48 overflow-hidden rounded-xl border border-slate-600/70 bg-slate-900">
                  <a
                    href={publicSite.contactLocationHref}
                    target="_blank"
                    rel="noreferrer"
                    className="relative block h-full w-full"
                  >
                    <Image
                      src="/map-preview.svg"
                      alt="Map preview"
                      fill
                      sizes="100vw"
                      className="map-preview map-preview-dark object-cover"
                    />
                    <Image
                      src="/map-preview-light.svg"
                      alt="Map preview"
                      fill
                      sizes="100vw"
                      className="map-preview map-preview-light object-cover opacity-0"
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs text-slate-200 transition-colors hover:text-cyan-100">
                      {t("contactPage.mapPlaceholder")}
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </NeonBackground>
  );
}

function LinkedInIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M6.94 8.75v8.77H3.88V8.75h3.06ZM5.4 4.5a1.78 1.78 0 1 1 0 3.56 1.78 1.78 0 0 1 0-3.56Zm5.46 4.25c1.62 0 2.63.86 3.06 1.68V8.75h3.05v8.77h-3.05v-4.55c0-1.15-.76-1.91-1.78-1.91-.99 0-1.7.67-1.7 1.91v4.55h-3.1V8.75h3.1Z" />
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm0 2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7Zm5 3.5A3.5 3.5 0 1 1 8.5 12 3.5 3.5 0 0 1 12 8.5Zm0 2A1.5 1.5 0 1 0 13.5 12 1.5 1.5 0 0 0 12 10.5Zm4.75-3.25a1 1 0 1 1-1-1 1 1 0 0 1 1 1Z" />
    </svg>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M13 10h2.5l.5-3H13V5.5A1.5 1.5 0 0 1 14.5 4H16V1h-2.5A4.5 4.5 0 0 0 9 5.5V7H6.5v3H9v9h4v-9Z" />
    </svg>
  );
}

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12.04 2a9.9 9.9 0 0 0-8.41 15.12L2 22l5.05-1.6A9.99 9.99 0 1 0 12.04 2Zm0 1.97a8 8 0 0 1 6.7 12.36l-.3.46.77 2.81-2.88-.75-.44.27a7.99 7.99 0 1 1-3.85-15.15Zm-4.1 4.78c.23-.52.5-.54.72-.54h.62c.2 0 .46.07.7.56.24.5.83 1.69.9 1.82.08.14.12.3.02.48-.1.19-.15.3-.3.46-.14.16-.3.35-.42.47-.14.13-.29.28-.12.56.16.27.75 1.23 1.6 1.99 1.1.98 2.03 1.29 2.3 1.42.28.14.44.12.6-.07.16-.19.7-.82.88-1.1.19-.27.37-.23.62-.14.25.1 1.58.75 1.85.89.27.13.44.2.5.31.06.1.06.6-.14 1.17-.2.58-1.17 1.13-1.65 1.2-.47.08-1.06.12-1.72-.1-.4-.13-.91-.3-1.57-.58-2.75-1.15-4.55-4.02-4.69-4.21-.14-.2-1.12-1.49-1.12-2.85 0-1.35.7-2 1-2.3Z" />
    </svg>
  );
}
