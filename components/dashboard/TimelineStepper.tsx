type TimelineStep = {
  label: string;
  displayLabel?: string;
  description?: string;
};

type TimelineStepperProps = {
  steps: TimelineStep[];
  current: string;
};

export function TimelineStepper({ steps, current }: TimelineStepperProps) {
  return (
    <div className="grid gap-3 md:grid-cols-5">
      {steps.map((step) => {
        const isActive = step.label === current;
        const isDone = steps.findIndex((s) => s.label === step.label) <
          steps.findIndex((s) => s.label === current);

        return (
          <div
            key={step.label}
            className={`relative rounded-xl border px-3 py-4 transition ${
              isActive
                ? "border-sky-400/70 bg-sky-500/10 shadow-[0_0_20px_rgba(56,189,248,0.3)]"
                : isDone
                  ? "border-emerald-400/60 bg-emerald-500/10"
                  : "border-slate-800/80 bg-slate-950/40"
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isActive
                    ? "bg-sky-400 shadow-[0_0_14px_rgba(56,189,248,0.8)]"
                    : isDone
                      ? "bg-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.8)]"
                      : "bg-slate-500"
                }`}
              />
              {step.displayLabel ?? step.label}
            </div>
            {step.description && (
              <p className="mt-2 text-xs text-slate-400">{step.description}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
