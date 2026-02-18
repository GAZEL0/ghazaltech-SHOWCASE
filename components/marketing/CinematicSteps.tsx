"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type CinematicStep = {
  title: string;
  desc: string;
};

type CinematicPreview = {
  headerLabel: string;
  headerValue: string;
  stats: { label: string; value: string }[];
  rows: { label: string; value: string }[];
  footer: { label: string; value: string };
};

type CinematicStepsProps = {
  steps: CinematicStep[];
  previews?: CinematicPreview[];
  variant?: "workflow" | "referrals";
};

const visualBackdrops = [
  "radial-gradient(circle_at_12%_10%,rgba(56,189,248,0.35),transparent_55%),radial-gradient(circle_at_82%_20%,rgba(16,185,129,0.25),transparent_55%)",
  "radial-gradient(circle_at_15%_15%,rgba(14,165,233,0.32),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.25),transparent_55%)",
  "radial-gradient(circle_at_10%_20%,rgba(34,197,94,0.35),transparent_55%),radial-gradient(circle_at_75%_10%,rgba(56,189,248,0.22),transparent_55%)",
  "radial-gradient(circle_at_20%_15%,rgba(168,85,247,0.25),transparent_55%),radial-gradient(circle_at_70%_80%,rgba(14,165,233,0.24),transparent_55%)",
];

export function CinematicSteps({ steps, previews, variant = "workflow" }: CinematicStepsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const defaultPreviews = useMemo(() => {
    const referrals = [
      {
        headerLabel: "Link",
        headerValue: "ghazal.tech/r/ghazal-01",
        stats: [
          { label: "Clicks", value: "84" },
          { label: "Signups", value: "12" },
          { label: "Rate", value: "14%" },
        ],
        rows: [
          { label: "Top channel", value: "WhatsApp" },
          { label: "Last click", value: "2h ago" },
          { label: "Next follow-up", value: "Tomorrow" },
        ],
        footer: { label: "Status", value: "Active" },
      },
      {
        headerLabel: "New user",
        headerValue: "Maya K.",
        stats: [
          { label: "Country", value: "TR" },
          { label: "Joined", value: "Today" },
          { label: "Source", value: "Referral" },
        ],
        rows: [
          { label: "Email verified", value: "Yes" },
          { label: "Account status", value: "Active" },
          { label: "Request type", value: "Template site" },
        ],
        footer: { label: "Referral", value: "Successful" },
      },
      {
        headerLabel: "Quote",
        headerValue: "$2,000",
        stats: [
          { label: "Commission", value: "$200" },
          { label: "Phases", value: "4" },
          { label: "Deposit", value: "$500" },
        ],
        rows: [
          { label: "Approved", value: "Yes" },
          { label: "Project", value: "Brand site" },
          { label: "Start", value: "Mon" },
        ],
        footer: { label: "Commission", value: "$200" },
      },
      {
        headerLabel: "Payments",
        headerValue: "1/4 paid",
        stats: [
          { label: "Paid", value: "$500" },
          { label: "Available", value: "$50" },
          { label: "Pending", value: "$150" },
        ],
        rows: [
          { label: "Payment 1", value: "Received" },
          { label: "Payment 2", value: "Due Jan 12" },
          { label: "Payment 3", value: "Pending" },
        ],
        footer: { label: "Next payout", value: "$50 available" },
      },
    ];

    const workflow = [
      {
        headerLabel: "Request",
        headerValue: "Web platform",
        stats: [
          { label: "Budget", value: "$3,000" },
          { label: "Timeline", value: "6 weeks" },
          { label: "Priority", value: "Normal" },
        ],
        rows: [
          { label: "Scope", value: "Dashboard + booking" },
          { label: "Reviewed", value: "In progress" },
          { label: "Owner", value: "Ghazal" },
        ],
        footer: { label: "Next", value: "Quote draft" },
      },
      {
        headerLabel: "Quote",
        headerValue: "$2,800",
        stats: [
          { label: "Phases", value: "4" },
          { label: "Milestones", value: "3" },
          { label: "ETA", value: "6 weeks" },
        ],
        rows: [
          { label: "Design", value: "$900" },
          { label: "Build", value: "$1,400" },
          { label: "QA", value: "$500" },
        ],
        footer: { label: "Status", value: "Sent" },
      },
      {
        headerLabel: "Project",
        headerValue: "Workspace ready",
        stats: [
          { label: "Kickoff", value: "Tue" },
          { label: "Team", value: "3" },
          { label: "Docs", value: "Shared" },
        ],
        rows: [
          { label: "Access", value: "Granted" },
          { label: "Timeline", value: "Created" },
          { label: "Repo", value: "Initialized" },
        ],
        footer: { label: "Status", value: "Active" },
      },
      {
        headerLabel: "Phase 2",
        headerValue: "In progress",
        stats: [
          { label: "Complete", value: "45%" },
          { label: "Next payment", value: "$500" },
          { label: "Due", value: "Dec 20" },
        ],
        rows: [
          { label: "Phase 1", value: "Done" },
          { label: "Phase 2", value: "Active" },
          { label: "Phase 3", value: "Planned" },
        ],
        footer: { label: "Milestone", value: "Awaiting proof" },
      },
      {
        headerLabel: "Delivery",
        headerValue: "3 files",
        stats: [
          { label: "Feedback", value: "2 notes" },
          { label: "Revisions", value: "1 paid" },
          { label: "Handoff", value: "Ready" },
        ],
        rows: [
          { label: "Preview", value: "Shared" },
          { label: "Review", value: "Client" },
          { label: "Release", value: "Pending" },
        ],
        footer: { label: "Next", value: "Revision slot" },
      },
    ];

    return { referrals, workflow };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]) {
          const idx = Number(visible[0].target.getAttribute("data-index") ?? 0);
          setActiveIndex(idx);
        }
      },
      {
        rootMargin: "-25% 0px -45% 0px",
        threshold: [0.2, 0.4, 0.6, 0.85],
      },
    );

    itemsRef.current.forEach((item) => item && observer.observe(item));
    return () => observer.disconnect();
  }, [steps.length]);

  const cards = useMemo(() => steps, [steps]);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute -inset-x-10 -top-20 h-64 bg-[radial-gradient(circle,rgba(56,189,248,0.08),transparent_70%)] blur-3xl" />
      <div className="space-y-12 md:space-y-16">
        {cards.map((step, idx) => {
          const delta = idx - activeIndex;
          const isActive = delta === 0;
          const isNext = delta === 1;
          const isPrev = delta === -1;
          const stepNumber = String(idx + 1).padStart(2, "0");
          const previewSet = (previews ?? defaultPreviews[variant === "referrals" ? "referrals" : "workflow"]);
          const preview = previewSet[idx] ?? previewSet[previewSet.length - 1];
          const classes = [
            "relative overflow-hidden rounded-[28px] border border-slate-700/60 bg-[#0b1120]/90 p-6 text-slate-100 shadow-[0_22px_60px_rgba(2,6,23,0.6)] transition-all duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] motion-reduce:transform-none motion-reduce:transition-none",
            isActive && "translate-y-0 scale-100 opacity-100 ring-1 ring-sky-400/30",
            isNext && "translate-y-8 scale-[0.98] opacity-60",
            isPrev && "-translate-y-6 scale-[0.98] opacity-55",
            !isActive && !isNext && !isPrev && "translate-y-12 scale-[0.96] opacity-0",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <div key={`${step.title}-${idx}`} className="min-h-[70vh] md:min-h-[80vh]">
              <div
                ref={(el) => {
                  itemsRef.current[idx] = el;
                }}
                data-index={idx}
                className="sticky top-24 md:top-28"
                style={{ zIndex: 40 - idx }}
              >
                <div className={classes}>
                  <div className="absolute inset-0 opacity-70" style={{ background: visualBackdrops[idx % visualBackdrops.length] }} />
                  <div className="relative z-10 grid gap-6 md:grid-cols-[1.1fr,0.9fr] md:items-center">
                    <div className="space-y-3">
                      <div className="inline-flex items-center gap-2 rounded-full border border-slate-600/60 bg-slate-950/70 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                        {stepNumber}
                      </div>
                      <h3 className="text-2xl font-semibold text-slate-50">{step.title}</h3>
                      <p className="text-sm text-slate-200/90">{step.desc}</p>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-cyan-400/80" />
                        <span className="h-1 w-16 rounded-full bg-slate-800/80" />
                        <span className="h-1 w-10 rounded-full bg-slate-800/70" />
                        <span className="h-1 w-20 rounded-full bg-slate-800/60" />
                      </div>
                    </div>
                    <div className="relative overflow-hidden rounded-2xl border border-slate-700/60 bg-[#020617]/80 p-4">
                      <div className="absolute -left-16 -top-12 h-40 w-40 rounded-full bg-cyan-500/20 blur-3xl" />
                      <div className="absolute -bottom-16 -right-12 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />
                      <div className="relative z-10 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-rose-400/70" />
                            <span className="h-2 w-2 rounded-full bg-amber-300/70" />
                            <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
                          </div>
                          <span className="rounded-full border border-slate-600/60 px-2 py-0.5 text-[10px] text-slate-200">
                            {stepNumber}
                          </span>
                        </div>
                        <div className="rounded-xl border border-slate-700/60 bg-slate-950/60 p-3 text-[11px] text-slate-200">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400">{preview.headerLabel}</span>
                            <span className="font-semibold text-slate-100">{preview.headerValue}</span>
                          </div>
                          <div className="mt-3 grid grid-cols-3 gap-2">
                            {preview.stats.map((item) => (
                              <div
                                key={`${item.label}-${idx}`}
                                className="rounded-lg border border-slate-700/60 bg-[#0b1120]/80 px-2 py-2 text-center"
                              >
                                <div className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                                  {item.label}
                                </div>
                                <div className="mt-1 text-sm font-semibold text-slate-100">
                                  {item.value}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="grid gap-2 text-[11px] text-slate-300">
                          {preview.rows.map((row) => (
                            <div
                              key={`${row.label}-${idx}`}
                              className="flex items-center justify-between rounded-lg border border-slate-700/60 bg-slate-950/50 px-3 py-2"
                            >
                              <span className="text-slate-400">{row.label}</span>
                              <span className="font-semibold text-slate-100">{row.value}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-slate-700/60 bg-slate-950/60 px-3 py-2 text-[11px] text-slate-300">
                          <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            <span>{preview.footer.label}</span>
                          </div>
                          <span className="text-slate-100">{preview.footer.value}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
