"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { createRealtimeClient, type SealedLiveQuery } from "@neon/realtime/client";
import { RealtimeProvider, useLiveQuery } from "@neon/realtime-react";
import type { ProjectSlide } from "@/lib/project-types";

const AUTOPLAY_DELAY = 4000;

export default function ProjectCarousel({
  projects,
  sealedQuery,
}: {
  projects: ProjectSlide[];
  sealedQuery: SealedLiveQuery<ProjectSlide> | null;
}) {
  if (!sealedQuery) return <ProjectCarouselContent projects={projects} />;
  return <LiveProjectCarousel projects={projects} sealedQuery={sealedQuery} />;
}

function LiveProjectCarousel({
  projects,
  sealedQuery,
}: {
  projects: ProjectSlide[];
  sealedQuery: SealedLiveQuery<ProjectSlide>;
}) {
  const [client] = useState(() => {
    const url = process.env.NEXT_PUBLIC_NEON_REALTIME_URL;
    if (!url) throw new Error("NEXT_PUBLIC_NEON_REALTIME_URL is required for live project updates");
    return createRealtimeClient({ url });
  });

  return (
    <RealtimeProvider client={client}>
      <LiveProjectCarouselContent projects={projects} sealedQuery={sealedQuery} />
    </RealtimeProvider>
  );
}

function LiveProjectCarouselContent({
  projects,
  sealedQuery,
}: {
  projects: readonly ProjectSlide[];
  sealedQuery: SealedLiveQuery<ProjectSlide>;
}) {
  const refreshQuery = useCallback(async () => {
    const response = await fetch("/api/projects/live", { method: "POST" });
    if (!response.ok) throw new Error(`Could not refresh the live project query (${response.status})`);
    return (await response.json()) as SealedLiveQuery<ProjectSlide>;
  }, []);
  const { data, status, error } = useLiveQuery(sealedQuery, { initialData: projects, refreshQuery });
  return (
    <ProjectCarouselContent
      projects={data ?? projects}
      liveUpdateError={status === "error" ? error.message : undefined}
    />
  );
}

function ProjectCarouselContent({
  projects,
  liveUpdateError,
}: {
  projects: readonly ProjectSlide[];
  liveUpdateError?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  // Once a visitor touches or clicks the carousel, stop autoplay so slides never
  // change under their finger.
  const [interacted, setInteracted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const paused = hovered || focused || interacted;
  const total = projects.length;
  const project = projects[activeIndex];

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(preference.matches);
    updatePreference();
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    setActiveIndex((index) => Math.min(index, Math.max(total - 1, 0)));
  }, [total]);

  useEffect(() => {
    if (paused || reducedMotion || total < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % total);
    }, AUTOPLAY_DELAY);
    return () => window.clearInterval(timer);
  }, [activeIndex, paused, reducedMotion, total]);

  if (!project) {
    return (
      <>
        {liveUpdateError && <p className="empty" role="alert">Live updates stopped: {liveUpdateError}</p>}
        <div className="empty">Aucun projet pour le moment.</div>
      </>
    );
  }

  const showPrevious = () => setActiveIndex((index) => (index - 1 + total) % total);
  const showNext = () => setActiveIndex((index) => (index + 1) % total);

  return (
    <>
      {liveUpdateError && <p className="empty" role="alert">Live updates stopped: {liveUpdateError}</p>}
      <section
        className={`project-carousel${paused || reducedMotion ? " is-paused" : ""}`}
        style={{ "--autoplay": `${AUTOPLAY_DELAY}ms` } as React.CSSProperties}
        aria-label="Projets récents"
        aria-roledescription="carrousel"
        onPointerDown={() => setInteracted(true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={(event) => {
          const nextFocused = event.relatedTarget;
          if (!(nextFocused instanceof Node) || !event.currentTarget.contains(nextFocused)) setFocused(false);
        }}
      >
        {/* The article and its link stay mounted between slides so a click is never
            lost mid-change; only the image and text are re-keyed to replay their animation. */}
        <article className="featured-project" aria-live="polite">
          {project.imageUrl ? (
            <img key={project.id} className="featured-image" src={project.imageUrl} alt="" loading="lazy" decoding="async" />
          ) : (
            <div key={project.id} className="featured-image featured-placeholder" aria-hidden="true" />
          )}
          <div className="featured-shade" />
          <div className="featured-chrome" aria-hidden="true">
            <span className="win-dots"><i /><i /><i /></span>
            <span className="browser-url">masora / projets / {project.id}</span>
            <span className="featured-live"><i />Live</span>
          </div>
          <div className="featured-content">
            <div className="featured-text" key={project.id}>
              <div className="featured-meta">
                <span className="featured-category">{project.category}</span>
                <span className="featured-count">{String(activeIndex + 1).padStart(2, "0")} <i>/</i> {String(total).padStart(2, "0")}</span>
              </div>
              <h2>{project.title}</h2>
            </div>
            <Link className="featured-link" href={`/projects/${project.id}`}>
              Découvrir le projet
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
            </Link>
          </div>
        </article>
        {total > 1 && (
          <div className="project-carousel-controls">
            <button type="button" className="featured-arrow" onClick={showPrevious} aria-label="Projet précédent">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 5-7 7 7 7" /></svg>
            </button>
            <div className="featured-pagination" aria-label="Choisir un projet">
              {projects.map((item, index) => (
                <button
                  type="button"
                  key={item.id}
                  className={`featured-dot${index === activeIndex ? " active" : ""}`}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Afficher le projet ${index + 1} : ${item.title}`}
                  aria-current={index === activeIndex ? "true" : undefined}
                />
              ))}
            </div>
            <button type="button" className="featured-arrow" onClick={showNext} aria-label="Projet suivant">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9.5 5 7 7-7 7" /></svg>
            </button>
          </div>
        )}
      </section>
    </>
  );
}