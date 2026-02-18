type InfiniteLogosProps = {
  label: string;
  logos: string[];
  isRTL?: boolean;
};

export function InfiniteLogos({ label, logos, isRTL = false }: InfiniteLogosProps) {
  const tripled = [...logos, ...logos, ...logos];
  return (
    <div className="rounded-full border border-slate-800 bg-[radial-gradient(circle_at_0_0,#0b1120,#020617)] px-4 py-3">
      <div className="flex items-center gap-3 overflow-hidden">
        <span className="whitespace-nowrap text-xs text-slate-200">{label}</span>
        <div className="relative w-full overflow-hidden">
          <div className={`flex ${isRTL ? "justify-end" : "justify-start"}`}>
            <div
              dir="ltr"
              className={`flex w-max gap-2 animate-[logosMove_18s_linear_infinite] ${isRTL ? "[animation-direction:reverse]" : ""}`}
            >
              {tripled.map((logo, idx) => (
                <span
                  key={`${logo}-${idx}`}
                  className="whitespace-nowrap rounded-full border border-slate-600/70 bg-[#020617e6] px-3 py-1 text-[11px] text-slate-100"
                >
                  {logo}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
