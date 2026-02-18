type DashboardCardProps = {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function DashboardCard({ title, action, children, className = "" }: DashboardCardProps) {
  return (
    <div
      className={`gt-card relative overflow-hidden rounded-2xl border border-slate-800/70 bg-[#0b1120]/90 p-5 shadow-[0_10px_50px_rgba(0,0,0,0.35)] ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.12),transparent_35%),radial-gradient(circle_at_80%_0,rgba(34,197,94,0.12),transparent_30%)]" />
      <div className="relative z-10 space-y-3">
        {(title || action) && (
          <div className="flex items-center justify-between gap-3">
            {title && <h3 className="text-sm font-semibold text-slate-100">{title}</h3>}
            {action}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
