"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "@/public/logo.png";
import logoLight from "@/public/logo_light.png";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "../theme/ThemeToggle";
import { useTheme } from "../theme/ThemeProvider";

export function Navbar({ locale }: { locale: string }) {
  const t = useTranslations();
  const locales = ["ar", "tr", "en"];
  const { theme } = useTheme();
  const isLight = theme === "light";
  const isRtl = locale === "ar";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileSections, setMobileSections] = useState({
    services: false,
    projects: false,
    knowledge: false,
    about: false,
    developers: false,
  });

  const withLocale = (path: string) => (path === "/" ? `/${locale}` : `/${locale}${path}`);
  const dropdownAlign = isRtl ? "right-0" : "left-0";
  const dropdownOrigin = isRtl ? "origin-top-right" : "origin-top-left";

  const servicesItems = [
    { href: "/services", label: t("nav.servicesPage") },
    { href: "/services/business-management-systems", label: t("nav.serviceBms") },
    { href: "/services/custom-web-solutions", label: t("nav.serviceCustomWeb") },
    { href: "/services/business-websites", label: t("nav.serviceBusinessWebsites") },
    { href: "/services/ecommerce-websites", label: t("nav.serviceEcommerce") },
    { href: "/services/personal-websites", label: t("nav.servicePersonal") },
    { href: "/services/web-automation", label: t("nav.serviceAutomation") },
    { href: "/services/technical-audit", label: t("nav.serviceAudit") },
    { href: "/support", label: t("nav.serviceSupport") },
    { href: "/custom-project", label: t("nav.customProject") },
    { href: "/templates", label: t("nav.templates") },
  ];

  const projectsItems = [
    { href: "/work", label: t("nav.projects") },
    { href: "/case-studies", label: t("nav.caseStudies") },
    { href: "/referrals", label: t("nav.referrals") },
  ];

  const knowledgeItems = [
    { href: "/blog", label: t("nav.blog") },
    { href: "/faq", label: t("nav.faq") },
    { href: "/workflow", label: t("nav.workflow") },
  ];

  const aboutItems = [
    { href: "/about", label: t("nav.about") },
    { href: "/contact", label: t("nav.contact") },
  ];

  const developersItems = [
    { href: "/developers/frontend", label: t("nav.frontend") },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  return (
    <>
      <div className="hidden lg:block lg:h-[92px]" aria-hidden="true" />
      <header
        className={`relative w-full ${mobileOpen ? "z-[90]" : "z-40"} lg:fixed lg:left-0 lg:top-0 lg:z-[80] lg:w-full`}
      >
        <div
          className={[
            "lg:border-b lg:border-slate-800/60 lg:backdrop-blur-xl lg:transition-shadow lg:transition-colors",
            "lg:bg-[#050b18]/50 lg:shadow-[0_6px_20px_rgba(0,0,0,0.18)]",
            scrolled ? "lg:bg-[#050b18]/70 lg:shadow-[0_12px_30px_rgba(0,0,0,0.35)]" : "",
          ].join(" ")}
        >
          <div className="gt-navbar gt-card gt-surface relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 pb-2 pt-5 sm:px-6 lg:max-w-7xl lg:px-4 2xl:max-w-[1400px]">
            <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-600/60 bg-[radial-gradient(circle_at_30%_0,#1f2937,#020617)] text-xl font-extrabold text-cyan-300 shadow-[0_0_0_1px_rgba(15,23,42,0.7),0_0_24px_rgba(74,224,255,0.35)]">
          <Image
            src={isLight ? logoLight : logo}
            alt={t("brand.logoAlt")}
            width={32}
            height={32}
            className="h-8 w-8 object-contain"
            priority
          />
        </div>
        <div>
          <div className="brand-mark text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-300">
            Ghazal Tech
          </div>
          <div className="text-sm font-semibold text-slate-50">
            {t("brand.tagline")}
          </div>
        </div>
      </div>

      <button
        type="button"
        className="inline-flex items-center justify-center rounded-full border border-slate-700/70 bg-[#050b18]/80 p-2 text-slate-200 transition hover:border-slate-500/80 sm:hidden"
        aria-label="Open menu"
        onClick={() => setMobileOpen(true)}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      <nav className="hidden items-center gap-4 text-[13px] text-slate-400 sm:flex xl:gap-5 xl:text-sm">
        <Link
          href={withLocale("/")}
          className="relative px-1 transition-colors hover:text-slate-100"
        >
          <span>{t("nav.home")}</span>
          <span className="absolute inset-x-0 -bottom-1 h-[2px] scale-x-0 rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-transform duration-150 ease-out hover:scale-x-100" />
        </Link>

        <div className="group relative after:absolute after:left-0 after:right-0 after:top-full after:h-4 after:content-['']">
          <button type="button" className="flex items-center gap-2 px-1 text-sm transition-colors hover:text-slate-100">
            <span>{t("nav.servicesMenu")}</span>
            <ChevronIcon />
          </button>
          <div
            className={`invisible absolute ${dropdownAlign} ${dropdownOrigin} z-50 mt-2 w-64 translate-y-2 rounded-2xl border border-slate-800/70 bg-[#050b18]/95 p-2 opacity-0 shadow-[0_18px_40px_rgba(0,0,0,0.45)] backdrop-blur transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100`}
          >
            {servicesItems.map((item) => (
              <Link
                key={item.href}
                href={withLocale(item.href)}
                className="block rounded-xl px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-900/60 hover:text-slate-50"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="group relative after:absolute after:left-0 after:right-0 after:top-full after:h-4 after:content-['']">
          <button type="button" className="flex items-center gap-2 px-1 text-sm transition-colors hover:text-slate-100">
            <span>{t("nav.projectsMenu")}</span>
            <ChevronIcon />
          </button>
          <div
            className={`invisible absolute ${dropdownAlign} ${dropdownOrigin} z-50 mt-2 w-56 translate-y-2 rounded-2xl border border-slate-800/70 bg-[#050b18]/95 p-2 opacity-0 shadow-[0_18px_40px_rgba(0,0,0,0.45)] backdrop-blur transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100`}
          >
            {projectsItems.map((item) => (
              <Link
                key={item.href}
                href={withLocale(item.href)}
                className="block rounded-xl px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-900/60 hover:text-slate-50"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="group relative after:absolute after:left-0 after:right-0 after:top-full after:h-4 after:content-['']">
          <button type="button" className="flex items-center gap-2 px-1 text-sm transition-colors hover:text-slate-100">
            <span>{t("nav.knowledgeMenu")}</span>
            <ChevronIcon />
          </button>
          <div
            className={`invisible absolute ${dropdownAlign} ${dropdownOrigin} z-50 mt-2 w-56 translate-y-2 rounded-2xl border border-slate-800/70 bg-[#050b18]/95 p-2 opacity-0 shadow-[0_18px_40px_rgba(0,0,0,0.45)] backdrop-blur transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100`}
          >
            {knowledgeItems.map((item) => (
              <Link
                key={item.href}
                href={withLocale(item.href)}
                className="block rounded-xl px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-900/60 hover:text-slate-50"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="group relative after:absolute after:left-0 after:right-0 after:top-full after:h-4 after:content-['']">
          <button type="button" className="flex items-center gap-2 px-1 text-sm transition-colors hover:text-slate-100">
            <span>{t("nav.aboutMenu")}</span>
            <ChevronIcon />
          </button>
          <div
            className={`invisible absolute ${dropdownAlign} ${dropdownOrigin} z-50 mt-2 w-48 translate-y-2 rounded-2xl border border-slate-800/70 bg-[#050b18]/95 p-2 opacity-0 shadow-[0_18px_40px_rgba(0,0,0,0.45)] backdrop-blur transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100`}
          >
            {aboutItems.map((item) => (
              <Link
                key={item.href}
                href={withLocale(item.href)}
                className="block rounded-xl px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-900/60 hover:text-slate-50"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="group relative after:absolute after:left-0 after:right-0 after:top-full after:h-4 after:content-['']">
          <button type="button" className="flex items-center gap-2 px-1 text-sm transition-colors hover:text-slate-100">
            <span>{t("nav.developersMenu")}</span>
            <ChevronIcon />
          </button>
          <div
            className={`invisible absolute ${dropdownAlign} ${dropdownOrigin} z-50 mt-2 w-48 translate-y-2 rounded-2xl border border-slate-800/70 bg-[#050b18]/95 p-2 opacity-0 shadow-[0_18px_40px_rgba(0,0,0,0.45)] backdrop-blur transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100`}
          >
            {developersItems.map((item) => (
              <Link
                key={item.href}
                href={withLocale(item.href)}
                className="block rounded-xl px-3 py-2 text-sm text-slate-200 transition hover:bg-slate-900/60 hover:text-slate-50"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <span className="text-slate-700">|</span>

        <Link
          href={withLocale("/login")}
          className="whitespace-nowrap rounded-full border border-slate-600/60 bg-[#020617aa] px-3 py-1.5 text-xs font-semibold text-slate-100 transition hover:border-sky-300/80 hover:text-sky-200"
        >
          {t("nav.login")}
        </Link>
        <Link
          href={withLocale("/register")}
          className="whitespace-nowrap rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-[0_0_18px_rgba(56,189,248,0.45)] transition hover:shadow-[0_0_24px_rgba(34,197,94,0.55)]"
        >
          {t("nav.register")}
        </Link>
        <ThemeToggle />
        <LanguageSwitcher current={locale} locales={locales} />
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className={`absolute top-4 ${
              isRtl ? "left-4" : "right-4"
            } flex max-h-[92vh] w-[calc(100%-2rem)] max-w-sm flex-col rounded-2xl border border-slate-800/70 bg-[#050b18]/95 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.6)]`}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-200">{t("nav.menuTitle")}</div>
              <button
                type="button"
                className="rounded-full border border-slate-700/70 bg-[#0b1120]/80 p-1 text-slate-300"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                  <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-200">
              <Link
                href={withLocale("/")}
                onClick={() => setMobileOpen(false)}
                className="block rounded-lg border border-slate-800/70 bg-[#0b1120]/80 px-3 py-2 font-semibold text-slate-100"
              >
                {t("nav.home")}
              </Link>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={withLocale("/login")}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full border border-slate-600/60 bg-[#020617aa] px-3 py-1.5 text-xs font-semibold text-slate-100"
                >
                  {t("nav.login")}
                </Link>
                <Link
                  href={withLocale("/register")}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 px-3 py-1.5 text-xs font-semibold text-slate-900"
                >
                  {t("nav.register")}
                </Link>
                <ThemeToggle />
                <LanguageSwitcher current={locale} locales={locales} />
              </div>
            </div>

            <div className="mt-4 flex-1 space-y-5 overflow-y-auto pr-1 text-sm text-slate-200">
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() =>
                    setMobileSections((prev) => ({ ...prev, services: !prev.services }))
                  }
                  aria-expanded={mobileSections.services}
                  className="flex w-full items-center justify-between rounded-lg px-1 py-2 text-xs uppercase tracking-[0.18em] text-slate-500"
                >
                  <span>{t("nav.servicesMenu")}</span>
                  <ChevronIcon
                    className={`h-4 w-4 transition ${mobileSections.services ? "rotate-180 text-slate-200" : ""}`}
                  />
                </button>
                {mobileSections.services && (
                  <div className="space-y-1">
                    {servicesItems.map((item) => (
                      <Link
                        key={item.href}
                        href={withLocale(item.href)}
                        onClick={() => setMobileOpen(false)}
                        className="block rounded-lg px-3 py-2 text-slate-200 hover:bg-slate-900/60"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() =>
                    setMobileSections((prev) => ({ ...prev, projects: !prev.projects }))
                  }
                  aria-expanded={mobileSections.projects}
                  className="flex w-full items-center justify-between rounded-lg px-1 py-2 text-xs uppercase tracking-[0.18em] text-slate-500"
                >
                  <span>{t("nav.projectsMenu")}</span>
                  <ChevronIcon
                    className={`h-4 w-4 transition ${mobileSections.projects ? "rotate-180 text-slate-200" : ""}`}
                  />
                </button>
                {mobileSections.projects && (
                  <div className="space-y-1">
                    {projectsItems.map((item) => (
                      <Link
                        key={item.href}
                        href={withLocale(item.href)}
                        onClick={() => setMobileOpen(false)}
                        className="block rounded-lg px-3 py-2 text-slate-200 hover:bg-slate-900/60"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() =>
                    setMobileSections((prev) => ({ ...prev, knowledge: !prev.knowledge }))
                  }
                  aria-expanded={mobileSections.knowledge}
                  className="flex w-full items-center justify-between rounded-lg px-1 py-2 text-xs uppercase tracking-[0.18em] text-slate-500"
                >
                  <span>{t("nav.knowledgeMenu")}</span>
                  <ChevronIcon
                    className={`h-4 w-4 transition ${mobileSections.knowledge ? "rotate-180 text-slate-200" : ""}`}
                  />
                </button>
                {mobileSections.knowledge && (
                  <div className="space-y-1">
                    {knowledgeItems.map((item) => (
                      <Link
                        key={item.href}
                        href={withLocale(item.href)}
                        onClick={() => setMobileOpen(false)}
                        className="block rounded-lg px-3 py-2 text-slate-200 hover:bg-slate-900/60"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() =>
                    setMobileSections((prev) => ({ ...prev, about: !prev.about }))
                  }
                  aria-expanded={mobileSections.about}
                  className="flex w-full items-center justify-between rounded-lg px-1 py-2 text-xs uppercase tracking-[0.18em] text-slate-500"
                >
                  <span>{t("nav.aboutMenu")}</span>
                  <ChevronIcon
                    className={`h-4 w-4 transition ${mobileSections.about ? "rotate-180 text-slate-200" : ""}`}
                  />
                </button>
                {mobileSections.about && (
                  <div className="space-y-1">
                    {aboutItems.map((item) => (
                      <Link
                        key={item.href}
                        href={withLocale(item.href)}
                        onClick={() => setMobileOpen(false)}
                        className="block rounded-lg px-3 py-2 text-slate-200 hover:bg-slate-900/60"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() =>
                    setMobileSections((prev) => ({ ...prev, developers: !prev.developers }))
                  }
                  aria-expanded={mobileSections.developers}
                  className="flex w-full items-center justify-between rounded-lg px-1 py-2 text-xs uppercase tracking-[0.18em] text-slate-500"
                >
                  <span>{t("nav.developersMenu")}</span>
                  <ChevronIcon
                    className={`h-4 w-4 transition ${mobileSections.developers ? "rotate-180 text-slate-200" : ""}`}
                  />
                </button>
                {mobileSections.developers && (
                  <div className="space-y-1">
                    {developersItems.map((item) => (
                      <Link
                        key={item.href}
                        href={withLocale(item.href)}
                        onClick={() => setMobileOpen(false)}
                        className="block rounded-lg px-3 py-2 text-slate-200 hover:bg-slate-900/60"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
          </div>
        </div>
      </header>
    </>
  );
}

function ChevronIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={`h-4 w-4 text-slate-500 transition ${className}`}
    >
      <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
