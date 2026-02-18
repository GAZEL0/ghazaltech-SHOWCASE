import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { publicSite } from "@/lib/public-site";

export function Footer() {
  const t = useTranslations();
  const locale = useLocale();

  const withLocale = (path: string) =>
    path === "/" ? `/${locale}` : `/${locale}${path}`;

  const quickLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/about", label: t("nav.about") },
    { href: "/faq", label: t("nav.faq") },
    { href: "/blog", label: t("nav.blog") },
    { href: "/case-studies", label: t("nav.caseStudies") },
    { href: "/services", label: t("nav.services") },
    { href: "/templates", label: t("nav.templates") },
    { href: "/work", label: t("nav.projects") },
    { href: "/workflow", label: t("nav.workflow") },
    { href: "/referrals", label: t("nav.referrals") },
    { href: "/contact", label: t("nav.contact") },
  ];

  const socials = [
    { href: publicSite.social.facebook, label: "Facebook", icon: FacebookIcon },
    { href: publicSite.social.instagram, label: "Instagram", icon: InstagramIcon },
    { href: publicSite.social.linkedin, label: "LinkedIn", icon: LinkedInIcon },
    { href: publicSite.social.github, label: "GitHub", icon: GitHubIcon },
    { href: publicSite.social.whatsapp, label: "WhatsApp", icon: WhatsAppIcon },
  ];

  return (
    <footer className="site-footer gt-surface mt-10 border-t border-slate-900/80 bg-[#020617dd] py-6 text-[11px] text-slate-500">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-300">
          {quickLinks.map((link, idx) => (
            <span key={link.href} className="flex items-center gap-3">
              <Link href={withLocale(link.href)} className="hover:text-slate-100 transition-colors">
                {link.label}
              </Link>
              {idx < quickLinks.length - 1 && <span className="text-slate-700">|</span>}
            </span>
          ))}
          <span className="text-slate-700">|</span>
          <Link href={withLocale("/privacy")} className="hover:text-slate-100 transition-colors">
            {t("footer.privacy")}
          </Link>
          <span className="text-slate-700">|</span>
          <Link href={withLocale("/terms")} className="hover:text-slate-100 transition-colors">
            {t("footer.terms")}
          </Link>
        </div>

        <div className="flex items-center gap-3 text-slate-300">
          {socials.map(({ href, label, icon: Icon }) => {
            const isExternal = href.startsWith("http");
            return (
            <Link
              key={label}
              href={href}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noreferrer" : undefined}
              aria-label={label}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-800/60 bg-slate-900/70 text-slate-200 transition hover:border-cyan-300/80 hover:text-cyan-100"
            >
              <Icon className="h-4 w-4" />
            </Link>
            );
          })}
        </div>

        <div className="flex flex-col gap-1 text-right text-slate-300">
          <div>{t("footer.built")}</div>
          <div className="font-semibold text-slate-100">{t("footer.copy")}</div>
        </div>
      </div>
    </footer>
  );
}

function LinkedInIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M6.94 8.75v8.77H3.88V8.75h3.06ZM5.4 4.5a1.78 1.78 0 1 1 0 3.56 1.78 1.78 0 0 1 0-3.56Zm5.46 4.25c1.62 0 2.63.86 3.06 1.68V8.75h3.05v8.77h-3.05v-4.55c0-1.15-.76-1.91-1.78-1.91-.99 0-1.7.67-1.7 1.91v4.55h-3.1V8.75h3.1Z" />
    </svg>
  );
}

function GitHubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.21.68-.47 0-.23-.01-.99-.01-1.8-2.5.46-3.14-.61-3.34-1.17a3 3 0 0 0-.84-1.17c-.28-.15-.68-.52-.01-.53a1.66 1.66 0 0 1 1.27.85 1.77 1.77 0 0 0 2.4.69 1.77 1.77 0 0 1 .53-1.11c-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.99 1.03-2.69a3.58 3.58 0 0 1 .1-2.65s.84-.27 2.75 1.02a9.45 9.45 0 0 1 5 0c1.9-1.3 2.74-1.02 2.74-1.02.55 1.4.2 2.44.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.68-4.57 4.93.36.32.68.94.68 1.9 0 1.38-.01 2.49-.01 2.83 0 .26.18.57.69.47A10 10 0 0 0 12 2Z" />
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
