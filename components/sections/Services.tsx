"use client";

import { Section } from "@/components/marketing/Section";
import { ServiceCard } from "@/components/marketing/ServiceCard";
import { InfiniteLogos } from "@/components/marketing/InfiniteLogos";
import { serviceSlugs } from "@/lib/services-catalog";

type ServicesProps = {
  title: string;
  subtitle: string;
  cta: string;
  stripLabel: string;
  cardCta?: string;
  services: { title: string; tag: string; body: string }[];
  locale: string;
  logos: string[];
  isRTL: boolean;
};

export function Services({ title, subtitle, cta, stripLabel, cardCta, services, locale, logos, isRTL }: ServicesProps) {
  const serviceLinkSlugs = serviceSlugs.slice(0, services.length);

  return (
    <Section id="services">
      <div
        className={`flex items-start gap-4 pb-4 ${isRTL ? "flex-row-reverse justify-end text-right" : "justify-between"}`}
      >
        <div className={isRTL ? "text-right" : ""}>
          <div className="text-lg font-semibold text-slate-50">
            {title}
          </div>
          <div className="text-sm text-slate-400">{subtitle}</div>
        </div>
        <div className="text-xs font-semibold text-sky-300 self-start">
          {cta}
        </div>
      </div>
      <div className="gt-card flex flex-col gap-3 rounded-[22px] border border-slate-500/40 bg-[radial-gradient(circle_at_0_0,#0b1120,#020617)] p-4 md:flex-row">
        <div className="flex-1 grid gap-3 md:grid-cols-3">
          {services.map((service, idx) => {
            const slug = serviceLinkSlugs[idx];
            const href = slug ? `/${locale}/services/${slug}` : `/${locale}/services`;
            return (
              <div key={service.title} className="flex-1">
                <ServiceCard
                  title={service.title}
                  tag={service.tag}
                  description={service.body}
                  href={href}
                  ctaLabel={cardCta}
                />
              </div>
            );
          })}
        </div>
      </div>
      <div className="mt-4">
        <InfiniteLogos label={stripLabel} logos={logos} isRTL={isRTL} />
      </div>
    </Section>
  );
}
