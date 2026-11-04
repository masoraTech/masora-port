"use client";
import { useEffect, useRef, useState } from "react";

export default function Carousel({ images, title, mini, presentation }: { images: string[]; title: string; mini?: boolean; presentation?: boolean }) {
  const [i, setI] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);
  const openButton = useRef<HTMLButtonElement>(null);
  const n = images.length;
  const go = (d: number) => setI((v) => (v + d + n) % n);

  useEffect(() => {
    if (!fullscreen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFullscreen(false);
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setI((v) => (v - 1 + n) % n);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setI((v) => (v + 1) % n);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    closeButton.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      openButton.current?.focus();
    };
  }, [fullscreen, n]);

  return (
    <>
      <div className={`car${mini ? " mini" : ""}${presentation ? " presentation" : ""}`}>
        {n ? <img src={images[i]} alt={`${title} – image ${i + 1}`} /> : <div className="ph">{title}</div>}
        {n > 1 && (
          <>
            <button type="button" className="arr l" onClick={() => go(-1)} aria-label="Image précédente">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 5-7 7 7 7" /></svg>
            </button>
            <button type="button" className="arr r" onClick={() => go(1)} aria-label="Image suivante">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9.5 5 7 7-7 7" /></svg>
            </button>
          </>
        )}
        {!mini && n > 1 && (
          <div className="dots">
            {images.map((_, k) => (
              <button type="button" key={k} className={k === i ? "on" : ""} onClick={() => setI(k)} aria-label={`Image ${k + 1}`} />
            ))}
          </div>
        )}
        {presentation && n > 0 && (
          <button ref={openButton} type="button" className="open-viewer" onClick={() => setFullscreen(true)}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3m13-5h3a2 2 0 0 1 2 2v3M3 16v3a2 2 0 0 0 2 2h3m8 0h3a2 2 0 0 0 2-2v-3" /></svg>
            Voir en plein écran
          </button>
        )}
      </div>
      {fullscreen && (
        <div className="image-viewer" role="dialog" aria-modal="true" aria-label={`Galerie du projet ${title}`}>
          <div className="viewer-topbar">
            <div className="viewer-heading">
              <span className="viewer-brand">MASORA TECHNOLOGIES</span>
              <span className="viewer-divider" />
              <span className="viewer-title">{title}</span>
            </div>
            <div className="viewer-controls">
              <span className="viewer-count">{String(i + 1).padStart(2, "0")} <i>/</i> {String(n).padStart(2, "0")}</span>
              <button ref={closeButton} type="button" className="viewer-close" onClick={() => setFullscreen(false)} aria-label="Fermer le plein écran">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
              </button>
            </div>
          </div>
          <div className="viewer-stage">
            {n > 1 && (
              <button type="button" className="viewer-arrow viewer-prev" onClick={() => go(-1)} aria-label="Image précédente">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 5-7 7 7 7" /></svg>
              </button>
            )}
            <img className="viewer-image" src={images[i]} alt={`${title} – image ${i + 1} sur ${n}`} />
            {n > 1 && (
              <button type="button" className="viewer-arrow viewer-next" onClick={() => go(1)} aria-label="Image suivante">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9.5 5 7 7-7 7" /></svg>
              </button>
            )}
          </div>
          {n > 1 && (
            <div className="viewer-thumbnails" aria-label="Choisir une image">
              {images.map((image, index) => (
                <button
                  type="button"
                  key={`${image}-${index}`}
                  className={`viewer-thumbnail${index === i ? " active" : ""}`}
                  onClick={() => setI(index)}
                  aria-label={`Afficher l’image ${index + 1}`}
                  aria-current={index === i ? "true" : undefined}
                >
                  <img src={image} alt="" />
                </button>
              ))}
            </div>
          )}
          <span className="viewer-key-hint">Utilisez ← → pour naviguer · Échap pour fermer</span>
        </div>
      )}
    </>
  );
}
