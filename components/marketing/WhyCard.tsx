type WhyCardProps = {
  tag: string;
  label: string;
  title: string;
  text: string;
};

export function WhyCard({ tag, label, title, text }: WhyCardProps) {
  return (
    <div className="gt-card why-card why-card-dark relative overflow-hidden rounded-2xl border border-blue-900/70 bg-[radial-gradient(circle_at_0_0,#020617,#020617)] p-4 text-slate-200">
      <div className="mb-3 flex flex-col gap-1">
        <span className="card-pill w-fit rounded-full border border-cyan-300/80 bg-slate-900/70 px-3 py-1 text-[11px] text-cyan-100">
          {tag}
        </span>
        <span className="why-card-label card-pill text-[11px] text-sky-300">{label}</span>
      </div>
      <div className="why-card-title text-sm font-semibold text-slate-50">{title}</div>
      <p className="why-card-body gt-text-muted mt-2 text-sm leading-relaxed text-slate-400">
        {text}
      </p>
    </div>
  );
}
