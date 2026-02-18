import Link from "next/link";
import Image from "next/image";
import { Section } from "@/components/marketing/Section";

type ProjectCard = {
  slug: string;
  title: string;
  description?: string | null;
  projectType?: string | null;
  coverImage?: string | null;
  rating?: number | null;
};

type ProjectsClientProps = {
  locale: string;
  hero: {
    title: string;
    subtitle: string;
  };
  labels: {
    projectsTitle: string;
    typeLabel: string;
    ratingLabel: string;
    viewProject: string;
    emptyTitle: string;
    emptyBody: string;
  };
  projects: ProjectCard[];
};

export function ProjectsClient({ locale, hero, labels, projects }: ProjectsClientProps) {
  return (
    <>
      <Section>
        <div className="rounded-3xl border border-slate-800/70 bg-[#050b18]/80 p-6 shadow-[0_18px_45px_rgba(0,0,0,0.35)]">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{labels.projectsTitle}</p>
            <h1 className="text-3xl font-bold text-slate-50 sm:text-4xl">{hero.title}</h1>
            <p className="max-w-2xl text-sm text-slate-300 sm:text-base">{hero.subtitle}</p>
          </div>
        </div>
      </Section>

      <Section>
        {projects.length === 0 ? (
          <div className="rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-6 text-center">
            <h2 className="text-xl font-semibold text-slate-100">{labels.emptyTitle}</h2>
            <p className="mt-2 text-sm text-slate-400">{labels.emptyBody}</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.slug}
                className="group relative overflow-hidden rounded-3xl border border-slate-800/70 bg-[#0b1120]/80 p-5 shadow-[0_16px_45px_rgba(0,0,0,0.35)] transition hover:-translate-y-1 hover:border-sky-400/60"
              >
                {project.coverImage ? (
                  <div className="relative mb-4 h-40 w-full overflow-hidden rounded-2xl">
                    <Image
                      src={project.coverImage}
                      alt={project.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="mb-4 h-40 w-full rounded-2xl border border-slate-800/70 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.18),transparent_45%)]" />
                )}
                <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                  <span className="rounded-full border border-slate-700/60 bg-slate-950/60 px-3 py-1 text-[11px] font-semibold text-slate-200">
                    {project.projectType || labels.typeLabel}
                  </span>
                  {project.rating ? (
                    <span className="rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-[11px] text-amber-200">
                      {labels.ratingLabel} {project.rating}/5
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-3 text-lg font-semibold text-slate-50">{project.title}</h3>
                {project.description && (
                  <p className="mt-2 text-sm text-slate-300">{project.description}</p>
                )}
                <div className="mt-4">
                  <Link
                    href={`/${locale}/work/${project.slug}`}
                    className="text-xs font-semibold text-sky-300 underline underline-offset-2"
                  >
                    {labels.viewProject}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
