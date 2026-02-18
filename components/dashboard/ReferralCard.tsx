import { DashboardCard } from "./DashboardCard";
import { NeonButton } from "./NeonButton";

type ReferralCardProps = {
  link: string;
  referrals: number;
  earned: number;
  available: number;
  pending: number;
  labels: {
    title: string;
    requestPayout: string;
    referrals: string;
    earned: string;
    available: string;
    pending: string;
  };
  onRequestPayout?: () => Promise<void>;
};

export function ReferralCard({
  link,
  referrals,
  earned,
  available,
  pending,
  labels,
  onRequestPayout,
}: ReferralCardProps) {
  return (
    <DashboardCard
      title={labels.title}
      action={
        <NeonButton variant="success" onClick={() => void onRequestPayout?.()}>
          {labels.requestPayout}
        </NeonButton>
      }
    >
      <div className="space-y-3">
        <div className="rounded-lg border border-slate-800/80 bg-slate-900/60 px-3 py-2 text-xs text-slate-200">
          {link}
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm text-slate-100 lg:grid-cols-4">
          <div className="rounded-lg border border-slate-800/70 bg-slate-950/50 px-3 py-2">
            <div className="text-[11px] uppercase tracking-wide text-slate-400">
              {labels.referrals}
            </div>
            <div className="text-lg font-semibold text-slate-100">{referrals}</div>
          </div>
          <div className="rounded-lg border border-slate-800/70 bg-slate-950/50 px-3 py-2">
            <div className="text-[11px] uppercase tracking-wide text-slate-400">
              {labels.earned}
            </div>
            <div className="text-lg font-semibold text-emerald-300">
              USD {earned.toFixed(2)}
            </div>
          </div>
          <div className="rounded-lg border border-slate-800/70 bg-slate-950/50 px-3 py-2">
            <div className="text-[11px] uppercase tracking-wide text-slate-400">
              {labels.available}
            </div>
            <div className="text-lg font-semibold text-sky-300">
              USD {available.toFixed(2)}
            </div>
          </div>
          <div className="rounded-lg border border-slate-800/70 bg-slate-950/50 px-3 py-2">
            <div className="text-[11px] uppercase tracking-wide text-slate-400">
              {labels.pending}
            </div>
            <div className="text-lg font-semibold text-amber-200">
              USD {pending.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}
