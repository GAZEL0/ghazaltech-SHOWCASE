import { Section } from "@/components/marketing/Section";
import Image from "next/image";

type ResponsivePreviewProps = {
  title?: string;
  laptopSrc?: string | null;
  tabletSrc?: string | null;
  mobileSrc?: string | null;
  className?: string;
};

export function ResponsivePreview({
  title,
  laptopSrc,
  tabletSrc,
  mobileSrc,
  className = "",
}: ResponsivePreviewProps) {
  const hasPreview = Boolean(laptopSrc || tabletSrc || mobileSrc);
  if (!hasPreview) return null;

  const hasLaptop = Boolean(laptopSrc);
  const useOverlayLayout = hasLaptop && (Boolean(tabletSrc) || Boolean(mobileSrc));

  return (
    <Section className={className}>
      <div className="mx-auto w-full max-w-[860px] rounded-3xl border border-slate-800/70 bg-[#050b18]/80 p-2 sm:p-3 shadow-[0_14px_32px_rgba(0,0,0,0.28)]">
        {title && (
          <div className="text-xs uppercase tracking-[0.18em] text-slate-500">
            {title}
          </div>
        )}

        <div className={`relative mt-3 ${useOverlayLayout ? "min-h-[220px] sm:min-h-[260px]" : ""}`}>
          <div className="relative mx-auto w-full max-w-[640px] scale-[0.7] origin-top sm:scale-100">
            {laptopSrc && (
              <div className="relative z-10 mx-auto w-full overflow-hidden rounded-2xl border border-slate-700/70 bg-[#0b1120]/80 shadow-[0_10px_26px_rgba(0,0,0,0.38)]">
                <div className="flex items-center gap-1 border-b border-slate-800/70 bg-[#0a1324] px-3 py-2">
                  <span className="h-2 w-2 rounded-full bg-rose-400/70" />
                  <span className="h-2 w-2 rounded-full bg-amber-300/70" />
                  <span className="h-2 w-2 rounded-full bg-emerald-300/70" />
                </div>
                <div className="bg-black/40 p-2">
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl">
                    <Image
                      src={laptopSrc}
                      alt="Laptop preview"
                      fill
                      sizes="(max-width: 768px) 100vw, 640px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </div>
              </div>
            )}

            {useOverlayLayout && tabletSrc && (
              <div
                className={[
                  "absolute z-30",
                  "left-0 bottom-[4px] sm:left-[-8%]",
                  "translate-y-[8px]",
                  "w-[150px] sm:w-[185px]",
                  "overflow-hidden rounded-2xl border border-slate-700/70 bg-[#0b1120]/90",
                  "shadow-[0_10px_26px_rgba(0,0,0,0.32)]",
                ].join(" ")}
              >
                <div className="flex items-center justify-center border-b border-slate-800/70 bg-[#0a1324] px-3 py-2">
                  <span className="h-1.5 w-1.5 rounded-full border border-slate-500/80" />
                </div>
                <div className="bg-black/40 p-2">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
                    <Image
                      src={tabletSrc}
                      alt="Tablet preview"
                      fill
                      sizes="185px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </div>
                <div className="flex items-center justify-center border-t border-slate-800/70 bg-[#0a1324] px-3 py-2">
                  <span className="h-2.5 w-2.5 rounded-full border border-slate-500/80" />
                </div>
              </div>
            )}

            {useOverlayLayout && mobileSrc && (
              <div
                className={[
                  "absolute z-40",
                  "right-0 bottom-[4px] sm:right-[-8%]",
                  "translate-y-[8px]",
                  "w-[95px] sm:w-[112px]",
                  "overflow-hidden rounded-2xl border border-slate-700/70 bg-[#0b1120]/90",
                  "shadow-[0_10px_26px_rgba(0,0,0,0.32)]",
                ].join(" ")}
              >
                <div className="flex items-center justify-center border-b border-slate-800/70 bg-[#0a1324] px-3 py-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500/70" />
                </div>
                <div className="bg-black/40 p-2">
                  <div className="relative aspect-[9/16] w-full overflow-hidden rounded-xl">
                    <Image
                      src={mobileSrc}
                      alt="Mobile preview"
                      fill
                      sizes="112px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </div>
                <div className="flex items-center justify-center border-t border-slate-800/70 bg-[#0a1324] px-3 py-2">
                  <span className="h-1.5 w-10 rounded-full bg-slate-500/70" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}
