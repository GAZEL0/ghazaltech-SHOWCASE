"use client";

type NeonButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "danger" | "success";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
};

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

const variantStyles: Record<NonNullable<NeonButtonProps["variant"]>, string> = {
  primary:
    "border-sky-300/70 bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-900 shadow-[0_0_25px_rgba(56,189,248,0.45)] hover:shadow-[0_0_35px_rgba(56,189,248,0.65)]",
  ghost:
    "border-slate-700/70 bg-slate-900/60 text-slate-100 hover:-translate-y-[1px] hover:border-sky-400/60",
  danger:
    "border-rose-400/60 bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-[0_0_25px_rgba(244,63,94,0.35)] hover:shadow-[0_0_35px_rgba(248,113,113,0.55)]",
  success:
    "border-emerald-400/70 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:shadow-[0_0_35px_rgba(16,185,129,0.55)]",
};

export function NeonButton({
  children,
  variant = "primary",
  className = "",
  type = "button",
  disabled,
  onClick,
}: NeonButtonProps) {
  const classes = [
    baseStyles,
    variantStyles[variant],
    disabled ? "opacity-60 cursor-not-allowed" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
