"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Section } from "@/components/marketing/Section";
import { ResponsivePreview } from "@/components/marketing/ResponsivePreview";

type ProjectDetail = {
  title: string;
  description?: string | null;
  fullDescription?: string | null;
  projectType?: string | null;
  category?: string | null;
  concept?: string | null;
  clientGoal?: string | null;
  problem?: string | null;
  solution?: string | null;
  keyFeatures?: string[] | null;
  coverImage?: string | null;
  gallery?: string[] | null;
  videoUrl?: string | null;
  liveUrl?: string | null;
  laptopPreviewImage?: string | null;
  tabletPreviewImage?: string | null;
  mobilePreviewImage?: string | null;
  review?: { rating: number; comment?: string | null } | null;
};

type ProjectDetailClientProps = {
  locale: string;
  labels: {
    back: string;
    type: string;
    category: string;
    concept: string;
    clientGoal: string;
    overview: string;
    problem: string;
    solution: string;
    features: string;
    gallery: string;
    video: string;
    preview: string;
    livePreview: string;
    reviewTitle: string;
  };
  project: ProjectDetail;
};

export function ProjectDetailClient({ locale, labels, project }: ProjectDetailClientProps) {
  const overview = project.fullDescription ?? project.description;
  const gallery = useMemo(() => (project.gallery ?? []).filter(Boolean), [project.gallery]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  useEffect(() => {
    if (gallery.length <= 1 || isPaused || lightboxSrc) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % gallery.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [gallery.length, isPaused, lightboxSrc]);

  useEffect(() => {
    if (activeSlide >= gallery.length && gallery.length > 0) {
      setActiveSlide(0);
    }
  }, [activeSlide, gallery.length]);

  function goPrev() {
    if (gallery.length <= 1) return;
    setActiveSlide((prev) => (prev - 1 + gallery.length) % gallery.length);
  }

  function goNext() {
    if (gallery.length <= 1) return;
    setActiveSlide((prev) => (prev + 1) % gallery.length);
  }

  return (
    <>
      <Section>
        <div className="space-y-4 rounded-3xl border border-slate-800/70 bg-[#050b18]/80 p-6 shadow-[0_18px_45px_rgba(0,0,0,0.35)]">
          <Link href={`/${locale}/work`} className="text-xs font-semibold text-slate-400">
            {labels.back}
          </Link>
          <div className="grid gap-6 md:grid-cols-[1.2fr,0.8fr]">
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-slate-50">{project.title}</h1>
              <p className="text-sm text-slate-300">{project.description ?? project.fullDescription}</p>
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-full border border-emerald-400/60 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-200"
                >
                  {labels.livePreview}
                </a>
              )}
            </div>
            <div className="grid gap-3 text-sm text-slate-300">
              {project.projectType && (
                <div className="rounded-2xl border border-slate-800/70 bg-[#0b1120]/80 p-3">
                  <div className="text-xs uppercase tracking-[0.14em] text-slate-500">{labels.type}</div>
                  <div className="mt-1 text-slate-100">{project.projectType}</div>
                </div>
              )}
              {project.category && (
                <div className="rounded-2xl border border-slate-800/70 bg-[#0b1120]/80 p-3">
                  <div className="text-xs uppercase tracking-[0.14em] text-slate-500">{labels.category}</div>
                  <div className="mt-1 text-slate-100">{project.category}</div>
                </div>
              )}
              {project.concept && (
                <div className="rounded-2xl border border-slate-800/70 bg-[#0b1120]/80 p-3">
                  <div className="text-xs uppercase tracking-[0.14em] text-slate-500">{labels.concept}</div>
                  <div className="mt-1 text-slate-100">{project.concept}</div>
                </div>
              )}
              {project.clientGoal && (
                <div className="rounded-2xl border border-slate-800/70 bg-[#0b1120]/80 p-3">
                  <div className="text-xs uppercase tracking-[0.14em] text-slate-500">{labels.clientGoal}</div>
                  <div className="mt-1 text-slate-100">{project.clientGoal}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Section>

      <ResponsivePreview
        title={labels.preview}
        laptopSrc={project.laptopPreviewImage}
        tabletSrc={project.tabletPreviewImage}
        mobileSrc={project.mobilePreviewImage}
      />

      {project.coverImage && (
        <Section>
          <div className="relative h-[320px] w-full overflow-hidden rounded-3xl border border-slate-800/70">
            <Image
              src={project.coverImage}
              alt={project.title}
              fill
              sizes="100vw"
              className="object-cover"
              unoptimized
            />
          </div>
        </Section>
      )}

      <Section>
        <div className="grid gap-4 md:grid-cols-2">
          {overview && (
            <div className="rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-5">
              <div className="text-xs uppercase tracking-[0.14em] text-slate-500">{labels.overview}</div>
              <p className="mt-2 text-sm text-slate-300 break-words">{overview}</p>
            </div>
          )}
          {project.problem && (
            <div className="rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-5">
              <div className="text-xs uppercase tracking-[0.14em] text-slate-500">{labels.problem}</div>
              <p className="mt-2 text-sm text-slate-300 break-words">{project.problem}</p>
            </div>
          )}
          {project.solution && (
            <div className="rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-5">
              <div className="text-xs uppercase tracking-[0.14em] text-slate-500">{labels.solution}</div>
              <p className="mt-2 text-sm text-slate-300 break-words">{project.solution}</p>
            </div>
          )}
          {project.keyFeatures && project.keyFeatures.length > 0 && (
            <div className="rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-5">
              <div className="text-xs uppercase tracking-[0.14em] text-slate-500">{labels.features}</div>
              <ul className="mt-2 space-y-2 text-sm text-slate-200">
                {project.keyFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Section>

      {gallery.length > 0 && (
        <Section>
          <div className="rounded-3xl border border-slate-800/70 bg-[#050b18]/80 p-5">
            <div className="text-xs uppercase tracking-[0.14em] text-slate-500">{labels.gallery}</div>
            <div
              className="relative mt-4 overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/60"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <div
                className="flex transition-transform duration-700 ease-out"
                style={{ transform: `translateX(-${activeSlide * 100}%)` }}
              >
                {gallery.map((src, index) => (
                  <button
                    key={`${src}-${index}`}
                    type="button"
                    className="relative h-[340px] w-full shrink-0"
                    onClick={() => setLightboxSrc(src)}
                    aria-label={project.title}
                  >
                    <Image
                      src={src}
                      alt={project.title}
                      fill
                      sizes="100vw"
                      className="object-cover"
                      unoptimized
                    />
                    <span className="absolute bottom-4 right-4 rounded-full border border-white/10 bg-black/50 px-3 py-1 text-[11px] font-semibold text-white/80">
                      {index + 1}/{gallery.length}
                    </span>
                  </button>
                ))}
              </div>
              {gallery.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/50 p-2 text-xs text-white/90"
                    aria-label="Previous"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/50 p-2 text-xs text-white/90"
                    aria-label="Next"
                  >
                    →
                  </button>
                </>
              )}
            </div>
          </div>
        </Section>
      )}

      {project.videoUrl && (
        <Section>
          <div className="rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-5">
            <div className="text-xs uppercase tracking-[0.14em] text-slate-500">{labels.video}</div>
            <div className="mt-3 overflow-hidden rounded-2xl border border-slate-800/70 bg-black/30">
              <video
                src={project.videoUrl}
                controls
                className="h-[360px] w-full bg-black"
                poster={project.coverImage ?? undefined}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </Section>
      )}

      {project.review && (
        <Section>
          <div className="rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-5">
            <div className="text-xs uppercase tracking-[0.14em] text-slate-500">{labels.reviewTitle}</div>
            <div className="mt-3 flex items-center gap-2 text-sm text-amber-200">
              <span className="font-semibold">{project.review.rating}/5</span>
              <span>
                {"*".repeat(project.review.rating)}
                {"-".repeat(Math.max(0, 5 - project.review.rating))}
              </span>
            </div>
            {project.review.comment && (
              <p className="mt-2 text-sm text-slate-300">
                &quot;{project.review.comment}&quot;
              </p>
            )}
          </div>
        </Section>
      )}

      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-8"
          onClick={() => setLightboxSrc(null)}
        >
          <div
            className="relative h-[80vh] w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightboxSrc}
              alt={project.title}
              fill
              sizes="100vw"
              className="rounded-3xl border border-slate-800/70 object-contain"
              unoptimized
            />
            <button
              type="button"
              onClick={() => setLightboxSrc(null)}
              className="absolute right-4 top-4 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-xs font-semibold text-white/80"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
