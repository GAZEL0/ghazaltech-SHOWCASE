type ServiceCardProps = {
  title: string;
  tag: string;
  description: string;
  href?: string;
  ctaLabel?: string;
};

export function ServiceCard({ title, tag, description, href, ctaLabel }: ServiceCardProps) {
  const Wrapper = href ? "a" : "div";

  return (
    <Wrapper
      href={href}
      className="gt-card group relative flex h-full flex-col gap-3 rounded-2xl border border-slate-500/50 bg-[#020617f0] p-5 text-slate-200 shadow-[0_16px_40px_rgba(15,23,42,1)] transition-all duration-200 hover:-translate-y-1.5 hover:border-cyan-300/90 hover:shadow-[0_20px_50px_rgba(56,189,248,0.25)]"
    >
      <div className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100 [background:radial-gradient(circle_at_0_0,rgba(56,189,248,0.3),transparent_55%)]" />
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-50">{title}</h3>
        <span className="card-pill rounded-full border border-cyan-300/80 px-3 py-1 text-[11px] text-cyan-100">
          {tag}
        </span>
      </div>
      <p className="gt-text-muted text-sm leading-relaxed text-slate-400">{description}</p>
      {href && ctaLabel ? (
        <span className="card-cta mt-auto text-xs font-semibold text-cyan-300 group-hover:text-cyan-200">
          {ctaLabel}
        </span>
      ) : null}
    </Wrapper>
  );
}
