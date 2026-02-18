"use client";

import dynamic from "next/dynamic";
import { Section } from "@/components/marketing/Section";
import { Safe3DBoundary } from "./Safe3DBoundary";

const TechCore3D = dynamic(() => import("../three/TechCore3D").then((m) => m.TechCore3D), {
  ssr: false,
  loading: () => <div className="h-full w-full rounded-2xl border border-slate-800/60 bg-slate-950/50" />,
});

type TechCoreProps = {
  title: string;
  subtitle: string;
  points: string[];
};

export function TechCore({ title, subtitle, points }: TechCoreProps) {
  return (
    <Section id="tech-core">
      <div className="grid gap-6 rounded-[24px] border border-slate-800/60 bg-[#020617] p-6 md:grid-cols-[1.1fr,1fr] md:p-8">
        <div className="space-y-4 relative z-10">
          <div className="text-lg font-semibold text-slate-50">{title}</div>
          <p className="text-sm text-slate-400">{subtitle}</p>
          <ul className="space-y-2 text-sm text-slate-200">
            {points.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-cyan-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative min-h-[420px] w-full overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-950/40">
          <Safe3DBoundary>
            <TechCore3D />
          </Safe3DBoundary>
          <div className="absolute inset-0 z-[-1]" />
        </div>
      </div>
    </Section>
  );
}
