"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ProjectSlide } from "@/lib/project-types";

const AUTOPLAY_DELAY = 4000;

export default function ProjectCarousel({ projects }: { projects: ProjectSlide[] }) {
  return <ProjectCarouselContent projects={projects} />;
}

function ProjectCarouselContent({ projects }: { projects: readonly ProjectSlide[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const paused = hovered || focused;
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
    return <div className="empty">Aucun projet pour le moment.</div>;
  }

  const showPrevious = () => setActiveIndex((index) => (index - 1 + total) % total);
  const showNext = () => setActiveIndex((index) => (index + 1) % total);

  return (
    <section
      className="project-carousel"
      aria-label="Projets récents"
      aria-roledescription="carrousel"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        const nextFocused = event.relatedTarget;
        if (!(nextFocused instanceof Node) || !event.currentTarget.contains(nextFocused)) setFocused(false);
      }}
    >
      <article className="featured-project" key={project.id} aria-live="polite">
        {project.imageUrl ? (
          <img className="featured-image" src={project.imageUrl} alt="" />
        ) : (
          <div className="featured-image featured-placeholder" aria-hidden="true" />
        )}
        <div className="featured-shade" />
        <div className="featured-content">
          <div className="featured-meta">
            <span className="featured-category">{project.category}</span>
            <span className="featured-count">{String(activeIndex + 1).padStart(2, "0")} <i>/</i> {String(total).padStart(2, "0")}</span>
          </div>
          <h2>{project.title}</h2>
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
  );
}