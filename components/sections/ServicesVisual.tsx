"use client";

import dynamic from "next/dynamic";
import { Section } from "@/components/marketing/Section";
import { Safe3DBoundary } from "./Safe3DBoundary";

const ServicesVisual3D = dynamic(() => import("../three/ServicesVisual3D").then((m) => m.ServicesVisual3D), {
  ssr: false,
  loading: () => <div className="h-full w-full rounded-2xl border border-slate-800/60 bg-slate-950/50" />,
});

type ServicesVisualProps = {
  title: string;
  subtitle: string;
};

export function ServicesVisual({ title, subtitle }: ServicesVisualProps) {
  return (
    <Section id="services-visual">
      <div className="grid gap-6 rounded-[24px] border border-slate-800/60 bg-[#020617] p-6 md:grid-cols-[1fr,1.2fr] md:p-8">
        <div className="space-y-3 relative z-10">
          <div className="text-lg font-semibold text-slate-50">{title}</div>
          <p className="text-sm text-slate-400">{subtitle}</p>
        </div>
        <div className="relative h-[420px] w-full overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-950/40">
          <Safe3DBoundary>
            <ServicesVisual3D />
          </Safe3DBoundary>
          <div className="absolute inset-0 z-[-1]" />
        </div>
      </div>
    </Section>
  );
}
