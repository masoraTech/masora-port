import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import Carousel from "@/components/Carousel";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const p = await db.project.findUnique({
    where: { id: Number(params.id) || 0 },
    include: { images: { orderBy: { position: "asc" } }, category: true },
  });
  if (!p || (!p.active && !isAdmin())) notFound();
  return (
    <main className="project-page">
      <header className="project-heading">
        <Link href="/" className="project-back">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 5-7 7 7 7" /></svg>
          Tous les projets
        </Link>
        <div className="project-heading-main">
          <div className="project-heading-copy">
            <span className="tag">{p.category.name}</span>
            <h1>{p.title}</h1>
          </div>
          <span className="project-visual-label">Étude de cas <i /> Masora Technologies</span>
        </div>
      </header>
      <section className="project-showcase" aria-label={`Galerie du projet ${p.title}`}>
        <div className="browser-frame browser-frame-lg">
          <div className="browser-bar" aria-hidden="true">
            <span className="win-dots"><i /><i /><i /></span>
            <span className="browser-url">masora / projets / {p.id}</span>
          </div>
          <Carousel presentation images={p.images.map((image) => image.url)} title={p.title} />
        </div>
        {p.images.length > 1 && <span className="showcase-caption">{String(p.images.length).padStart(2, "0")} VISUELS · {p.category.name.toUpperCase()}</span>}
      </section>
      <section className="project-details">
        <div className="project-description">
          <span className="section-eyebrow">LE PROJET</span>
          <h2>Une solution conçue pour répondre à vos enjeux.</h2>
          <p>{p.description}</p>
        </div>
        <aside className="project-facts">
          <div>
            <span className="project-fact-label">Expertise</span>
            <span className="project-fact-value">{p.category.name}</span>
          </div>
          {p.technologies && (
            <div>
              <span className="project-fact-label">Technologies</span>
              <ul className="technology-list" aria-label="Technologies utilisées">
                {p.technologies.split(",").map((technology) => technology.trim()).filter(Boolean).map((technology) => (
                  <li key={technology}>{technology}</li>
                ))}
              </ul>
            </div>
          )}
          {!p.active && <span className="mute">Projet inactif, visible uniquement par vous.</span>}
        </aside>
      </section>
    </main>
  );
}
