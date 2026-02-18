import { defaultLocale, isLocale, locales, rtlLocales, type Locale } from "@/i18n";
import { SessionWrapper } from "@/components/SessionWrapper";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getSiteUrl } from "@/lib/site-url";

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export const dynamic = "force-dynamic";

const localeMetadata: Record<Locale, { title: string; description: string; image: string }> = {
  en: {
    title: "Ghazal Tech",
    description: "Web, BMS, and dashboard solutions built as full-stack digital products.",
    image: "/og-en.jpg",
  },
  ar: {
    title: "غزال تك",
    description: "نبني مواقع وأنظمة إدارة أعمال (BMS) ولوحات تحكم رقمية باحتراف.",
    image: "/og-ar.jpg",
  },
  tr: {
    title: "Ghazal Tech",
    description: "Web, BMS ve yönetim panelleri geliştiren yazılım çözümleri.",
    image: "/og-tr.jpg",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const meta = localeMetadata[locale];
  const localePath = `/${locale}`;
  const absoluteUrl = `${getSiteUrl()}${localePath}`;

  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: absoluteUrl,
      siteName: "Ghazal Tech",
      type: "website",
      images: [
        {
          url: meta.image,
          width: 1200,
          height: 630,
          alt: meta.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [meta.image],
    },
    alternates: {
      canonical: localePath,
    },
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const messages = (await import(`@/messages/${locale}.json`)).default;
  const direction = rtlLocales.has(locale) ? "rtl" : "ltr";

  const rtlClass = direction === "rtl" ? "rtl rtl:text-right font-arabic" : "";

  return (
    <NextIntlClientProvider locale={locale ?? defaultLocale} messages={messages}>
      <SessionWrapper>
        <div dir={direction} className={`overflow-x-hidden ${rtlClass}`}>
          {children}
        </div>
      </SessionWrapper>
    </NextIntlClientProvider>
  );
}
