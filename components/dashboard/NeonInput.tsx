"use client";

type NeonInputProps = {
  label?: string;
  placeholder?: string;
  type?: string;
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
};

export function NeonInput({
  label,
  placeholder,
  type = "text",
  name,
  value,
  onChange,
}: NeonInputProps) {
  return (
    <label className="flex flex-col gap-1 text-sm text-slate-200">
      {label && <span className="text-xs uppercase tracking-[0.08em] text-slate-400">{label}</span>}
      <input
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        className="rounded-lg border border-slate-700/70 bg-slate-950/60 px-3 py-2 text-slate-100 shadow-inner shadow-slate-900/50 outline-none ring-0 transition placeholder:text-slate-500 focus:border-cyan-400/70 focus:shadow-[0_0_18px_rgba(56,189,248,0.35)]"
      />
    </label>
  );
}
