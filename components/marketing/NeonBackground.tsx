type NeonBackgroundProps = {
  children: React.ReactNode;
};

export function NeonBackground({ children }: NeonBackgroundProps) {
  return (
    <div className="neon-shell gt-hero-bg relative flex min-h-screen flex-col overflow-x-hidden bg-[#020617] text-slate-100">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="neon-bg absolute inset-0 bg-[radial-gradient(circle_at_top,#1e293b_0%,#020617_55%)]" />
        <div className="neon-glow absolute inset-0 opacity-60 [background:linear-gradient(120deg,transparent_0_30%,rgba(56,189,248,0.2)_40%,transparent_55%),linear-gradient(-120deg,transparent_0_35%,rgba(56,189,248,0.18)_45%,transparent_60%)] [background-size:260%_260%] [animation:neonLines_18s_ease-in-out_infinite_alternate]" />
        <div className="neon-grid absolute inset-0 opacity-50 [background-image:linear-gradient(#0f172a33_1px,transparent_1px),linear-gradient(90deg,#0f172a33_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(circle_at_20%_0,rgba(0,0,0,0.9),transparent_70%)]" />
      </div>
      <div className="neon-content relative z-10 flex flex-1 flex-col">{children}</div>
    </div>
  );
}

// Tailwind safelist for keyframe
// animate using [animation:neonLines_18s_ease-in-out_infinite_alternate]
