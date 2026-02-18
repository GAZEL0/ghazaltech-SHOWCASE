type Stat = {
  label: string;
  value: string | number;
  accent?: "cyan" | "emerald" | "amber" | "rose";
  sub?: string;
};

type OverviewStatsProps = {
  stats: Stat[];
};

const accentMap: Record<NonNullable<Stat["accent"]>, string> = {
  cyan: "from-cyan-400/50 to-sky-500/50",
  emerald: "from-emerald-400/60 to-cyan-500/50",
  amber: "from-amber-400/60 to-orange-400/50",
  rose: "from-rose-400/60 to-fuchsia-500/40",
};

export function OverviewStats({ stats }: OverviewStatsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="relative overflow-hidden rounded-xl border border-slate-800/70 bg-slate-950/60 p-4 shadow-[0_10px_35px_rgba(0,0,0,0.35)]"
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br ${
              stat.accent ? accentMap[stat.accent] : "from-slate-800/40 to-slate-900/30"
            } opacity-30`}
          />
          <div className="relative z-10 space-y-1">
            <div className="text-[11px] uppercase tracking-[0.08em] text-slate-400">
              {stat.label}
            </div>
            <div className="text-2xl font-bold text-slate-100">{stat.value}</div>
            {stat.sub && <div className="text-xs text-slate-400">{stat.sub}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
