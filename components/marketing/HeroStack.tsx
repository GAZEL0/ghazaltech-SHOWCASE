import React from "react";

type HeroStackProps = {
  texts?: Record<string, string>;
  t?: (key: string) => string;
  pillLabel?: string;
  pillValue?: string;
};

export function HeroStack({ texts, t, pillLabel, pillValue }: HeroStackProps) {
  const get = (key: string) => (t ? t(key) : texts?.[key] ?? "");
  const resolvedPillLabel = pillLabel ?? get("stack.pillLabel");
  const resolvedPillValue = pillValue ?? get("stack.pillValue");
  return (
    <div className="relative w-full">
      <div className="absolute inset-[-32px] -z-10 bg-[radial-gradient(circle_at_10%_0,rgba(56,189,248,0.28),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.24),transparent_55%)] opacity-70 blur-sm" />
      <div className="absolute left-[6%] top-4 flex items-center gap-2 rounded-full border border-sky-400/60 bg-[#020617dd] px-3 py-2 text-xs text-slate-100 shadow-[0_0_18px_rgba(56,189,248,0.5)] animate-[pulseGlow_6s_ease-in-out_infinite]">
        <span className="text-slate-300">{resolvedPillLabel}</span>
        <span className="font-semibold text-cyan-300">{resolvedPillValue}</span>
      </div>
      <div className="pointer-events-auto relative mt-12 flex flex-col items-stretch gap-3 sm:-space-x-16 sm:flex-row sm:items-end sm:justify-end">
        <article
          tabIndex={0}
          className="gt-card hero-floating-card group relative z-50 mt-0 h-full min-h-[220px] rounded-2xl border border-slate-500/60 bg-[radial-gradient(circle_at_0_0,#020617,#020617)] px-4 py-4 text-[11px] text-slate-200 shadow-[0_20px_60px_rgba(15,23,42,0.95)] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus:z-[70] focus:-translate-y-4 focus:shadow-[0_28px_70px_rgba(15,23,42,1),0_0_30px_rgba(56,189,248,0.85)] active:z-[70] active:-translate-y-3 active:shadow-[0_24px_60px_rgba(15,23,42,1),0_0_24px_rgba(56,189,248,0.7)] sm:w-[240px] sm:hover:z-[60] sm:hover:-translate-y-4 sm:hover:shadow-[0_28px_70px_rgba(15,23,42,1),0_0_30px_rgba(56,189,248,0.85)]"
        >
          <StackCardHeader title={get("stack.card1Title")} badge={get("stats.liveBadge")} />
          <ProgressBar value={72} />
          <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-slate-200">
            <Stat label={get("stats.progress")} value="72%" />
            <Stat label={get("stats.milestones")} value="2 / 3" />
            <Stat label={get("stats.lastUpdate")} value="14:22" />
            <Stat label={get("stats.revisions")} value="3" />
          </div>
        </article>

        <article
          tabIndex={0}
          className="gt-card hero-floating-card group relative z-45 -mt-6 h-full min-h-[220px] rounded-2xl border border-slate-500/60 bg-[radial-gradient(circle_at_0_0,#020617,#020617)] px-4 py-4 text-[11px] text-slate-200 shadow-[0_20px_60px_rgba(15,23,42,0.95)] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus:z-[70] focus:-translate-y-4 focus:shadow-[0_28px_70px_rgba(15,23,42,1),0_0_30px_rgba(56,189,248,0.85)] active:z-[70] active:-translate-y-3 active:shadow-[0_24px_60px_rgba(15,23,42,1),0_0_24px_rgba(56,189,248,0.7)] sm:mt-0 sm:w-[240px] sm:translate-y-1 sm:hover:z-[60] sm:hover:-translate-y-4 sm:hover:shadow-[0_28px_70px_rgba(15,23,42,1),0_0_30px_rgba(56,189,248,0.85)]"
        >
          <StackCardHeader title={get("stack.card2Title")} badge="ghazal-tech/app" />
          <code className="gt-surface mt-1 block rounded-xl border border-slate-800 bg-[#020617] px-3 py-2 text-[11px] text-slate-200 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.9)]">
            <span className="text-sky-300">const</span> project ={" "}
            <span className="text-emerald-400">createDashboard</span>
            ({"{"} client: &quot;Anadolu&quot;, locale: [&quot;ar&quot;, &quot;tr&quot;, &quot;en&quot;], billing:
            &quot;manualProof&quot; {"}"});
            <br />
            <span className="text-sky-300">await</span>{" "}
            project.trackMilestones();
          </code>
          <div className="gt-surface mt-2 flex items-center gap-2 rounded-full border border-slate-600/60 bg-[#020617] px-3 py-2 text-[11px] text-slate-200">
            <div className="h-4 w-4 rounded-md bg-[radial-gradient(circle_at_0_0,#4ae0ff,#0ea5e9)] shadow-[0_0_16px_rgba(74,224,255,0.8)]" />
            <span>{get("stack.device")}</span>
          </div>
        </article>

        <article
          tabIndex={0}
          className="gt-card hero-floating-card group relative z-40 -mt-6 h-full min-h-[220px] rounded-2xl border border-slate-500/60 bg-[radial-gradient(circle_at_0_0,#020617,#020617)] px-4 py-4 text-[11px] text-slate-200 shadow-[0_20px_60px_rgba(15,23,42,0.95)] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus:z-[70] focus:-translate-y-4 focus:shadow-[0_28px_70px_rgba(15,23,42,1),0_0_30px_rgba(56,189,248,0.85)] active:z-[70] active:-translate-y-3 active:shadow-[0_24px_60px_rgba(15,23,42,1),0_0_24px_rgba(56,189,248,0.7)] sm:mt-0 sm:w-[240px] sm:translate-y-2 sm:hover:z-[60] sm:hover:-translate-y-4 sm:hover:shadow-[0_28px_70px_rgba(15,23,42,1),0_0_30px_rgba(56,189,248,0.85)]"
        >
          <StackCardHeader title={get("stack.card4Title")} badge={get("stack.referralBadge")} />
          <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-slate-200">
            <Stat label={get("stack.referralsNew")} value="12" />
            <Stat label={get("stack.referralsEarned")} value="$1,240" />
            <Stat label={get("stack.referralsPending")} value="$320" />
            <Stat label={get("stack.referralsPaid")} value="$920" />
          </div>
        </article>

        <article
          tabIndex={0}
          className="gt-card hero-floating-card group relative z-35 -mt-6 h-full min-h-[220px] rounded-2xl border border-slate-500/60 bg-[radial-gradient(circle_at_0_0,#020617,#020617)] px-4 py-4 text-[11px] text-slate-200 shadow-[0_20px_60px_rgba(15,23,42,0.95)] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus:z-[70] focus:-translate-y-4 focus:shadow-[0_28px_70px_rgba(15,23,42,1),0_0_30px_rgba(56,189,248,0.85)] active:z-[70] active:-translate-y-3 active:shadow-[0_24px_60px_rgba(15,23,42,1),0_0_24px_rgba(56,189,248,0.7)] sm:mt-0 sm:w-[240px] sm:translate-y-3 sm:hover:z-[60] sm:hover:-translate-y-4 sm:hover:shadow-[0_28px_70px_rgba(15,23,42,1),0_0_30px_rgba(56,189,248,0.85)]"
        >
          <StackCardHeader title={get("stack.card5Title")} badge={get("stack.revisionsBadge")} />
          <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-slate-200">
            <Stat label={get("stack.revisionsOpen")} value="4" />
            <Stat label={get("stack.revisionsInProgress")} value="2" />
            <Stat label={get("stack.revisionsBudget")} value="$580" />
            <Stat label={get("stack.revisionsDeadline")} value="ETA 2d" />
          </div>
        </article>

        <article
          tabIndex={0}
          className="gt-card hero-floating-card group relative z-30 -mt-6 h-full min-h-[220px] rounded-2xl border border-slate-500/60 bg-[radial-gradient(circle_at_0_0,#020617,#020617)] px-4 py-4 text-[11px] text-slate-200 shadow-[0_20px_60px_rgba(15,23,42,0.95)] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus:z-[70] focus:-translate-y-4 focus:shadow-[0_28px_70px_rgba(15,23,42,1),0_0_30px_rgba(56,189,248,0.85)] active:z-[70] active:-translate-y-3 active:shadow-[0_24px_60px_rgba(15,23,42,1),0_0_24px_rgba(56,189,248,0.7)] sm:mt-0 sm:w-[240px] sm:translate-y-4 sm:hover:z-[60] sm:hover:-translate-y-4 sm:hover:shadow-[0_28px_70px_rgba(15,23,42,1),0_0_30px_rgba(56,189,248,0.85)]"
        >
          <StackCardHeader title={get("stack.card3Title")} badge={get("hero.ctaPrimary")} />
          <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-slate-200">
            <Stat label={get("stats.progress")} value="9" />
            <Stat label={get("stats.milestones")} value={get("stack.milestonesValue")} />
            <Stat label={get("stats.files")} value="5" />
            <Stat label={get("stack.fees")} value="$742" />
          </div>
        </article>
      </div>
    </div>
  );
}

function StackCardHeader({ title, badge }: { title: string; badge: string }) {
  return (
    <div className="flex items-center justify-between text-[11px] text-slate-300 gt-text-muted">
      <span>{title}</span>
      <span className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-300">
        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(34,197,94,0.9)]" />
        {badge}
      </span>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#020617] shadow-[inset_0_0_0_1px_rgba(30,64,175,0.8)]">
      <span
        className="block h-full w-full bg-[linear-gradient(90deg,#22c55e,#4ade80,#22c55e)] [background-size:200%_100%] [animation:progressFlow_11s_linear_infinite]"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="gt-surface rounded-lg border border-blue-900/70 bg-[radial-gradient(circle_at_0_0,#0f172a,#020617)] px-2 py-1.5">
      <div className="gt-text-muted text-[10px] text-slate-400">{label}</div>
      <div className="text-sm font-semibold text-slate-50">{value}</div>
    </div>
  );
}
