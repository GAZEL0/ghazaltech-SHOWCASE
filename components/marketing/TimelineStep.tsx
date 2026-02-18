type TimelineStepProps = {
  order: string;
  title: string;
  text: string;
};

export function TimelineStep({ order, title, text }: TimelineStepProps) {
  return (
    <div className="relative flex gap-4 border-b border-dashed border-blue-900/40 pb-5 pt-4 last:border-b-0 rtl:flex-row-reverse rtl:text-right">
      <div className="relative flex flex-col items-center rtl:order-2">
        <div className="h-5 w-5 rounded-full border-2 border-sky-400 bg-[#020617] shadow-[0_0_0_3px_rgba(15,23,42,1)]" />
        <div className="h-full w-[2px] bg-gradient-to-b from-sky-400 to-emerald-400 opacity-70" />
      </div>
      <div className="flex-1 rtl:order-1">
        <div className="text-[11px] text-sky-300">{order}</div>
        <div className="pb-1 text-sm font-semibold text-slate-50">{title}</div>
        <p className="text-xs leading-relaxed text-slate-400">{text}</p>
      </div>
    </div>
  );
}
