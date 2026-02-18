import Link from "next/link";

type CTASectionProps = {
  title: string;
  text: string;
  cta: string;
  href: string;
};

export function CTASection({ title, text, cta, href }: CTASectionProps) {
  return (
    <div className="gt-card flex flex-col gap-3 rounded-3xl border border-cyan-400/60 bg-[radial-gradient(circle_at_0_0,#0f172a,#020617)] px-6 py-8 shadow-[0_0_25px_rgba(56,189,248,0.3)] sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="max-w-2xl">
        <h3 className="text-xl font-semibold text-slate-50">{title}</h3>
        <p className="mt-2 text-sm text-slate-400">{text}</p>
      </div>
      <Link
        href={href}
        className="relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 px-5 py-3 text-sm font-bold text-slate-900 shadow-[0_0_25px_rgba(14,165,233,0.65)] transition hover:scale-[1.01] hover:shadow-[0_0_35px_rgba(56,189,248,0.85)]"
      >
        <span className="absolute inset-[-40%] translate-x-[-40%] opacity-0 bg-[radial-gradient(circle_at_0_0,rgba(255,255,255,0.4),transparent_55%)] transition duration-200 hover:translate-x-[10%] hover:opacity-100" />
        <span className="relative">{cta}</span>
      </Link>
    </div>
  );
}
