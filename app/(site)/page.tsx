import Link from "next/link";
import Carousel from "@/components/Carousel";
import HomeCircuitHero from "@/components/HomeCircuitHero";
import ProjectCarousel from "@/components/ProjectCarousel";
import { db } from "@/lib/db";
import { projectSlidesQuery, realtime } from "@/lib/realtime";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: { cat?: string } }) {
  const cat = searchParams.cat;
  const [projects, categories, technologyRecords, sealedQuery] = await Promise.all([
    db.project.findMany({
      where: { active: true, ...(cat ? { category: { slug: cat } } : {}) },
      include: {
        images: { orderBy: { position: "asc" }, ...(!cat ? { take: 1 } : {}) },
        category: true,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      ...(!cat ? { take: 5 } : {}),
    }),
    db.category.findMany({ orderBy: { id: "asc" } }),
    db.project.findMany({ where: { active: true }, select: { technologies: true } }),
    realtime ? realtime.seal({ query: projectSlidesQuery() }) : Promise.resolve(null),
  ]);
  const technologies = [...new Set(
    technologyRecords
      .flatMap((project) => project.technologies.split(","))
      .map((technology) => technology.trim())
      .filter(Boolean),
  )];
  const currentCategory = cat ? categories.find((category) => category.slug === cat) : null;
  const current = cat ? currentCategory?.name ?? cat : null;
  return (
    <main className={current ? "category-listing" : "home-page"}>
      {!current && (
        <>
          <HomeCircuitHero />

          <nav className="home-expertise" id="services" aria-label="Explorer nos expertises">
            <span className="expertise-label">Nos expertises</span>
            {categories.map((category) => (
              <Link key={category.slug} href={`/?cat=${category.slug}`} className="expertise-link">
                {category.name}
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg>
              </Link>
            ))}
          </nav>
          {technologies.length > 0 && (
            <section className="technology-marquee" aria-label="Technologies utilisées">
              <span className="technology-marquee-label">Technologies utilisées</span>
              <div className="technology-marquee-window">
                <div className="technology-marquee-track">
                  {[false, true].map((duplicate) => (
                    <div
                      key={String(duplicate)}
                      className="technology-marquee-group"
                      aria-hidden={duplicate}
                    >
                      {technologies.map((technology) => (
                        <span className="technology-marquee-item" key={technology}>{technology}</span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
          <section className="projects-intro" id="projects">
            <div>
              <span className="section-eyebrow">PORTFOLIO · MASORA TECHNOLOGIES</span>
              <h2>Des projets concrets. Des solutions durables.</h2>
            </div>
            <p>Une sélection de réalisations récentes, imaginées avec nos clients et développées pour répondre à leurs besoins.</p>
          </section>
        </>
      )}
      {current && (
        <section className="category-page" aria-labelledby="category-title">
          <div className="category-heading">
            <div className="category-copy">
              <div className="breadcrumbs"><Link href="/">Accueil</Link><span>/</span><span>Expertises</span><span>/</span><b>{current}</b></div>
              <span className="category-eyebrow">MASORA TECHNOLOGIES · NOS RÉALISATIONS</span>
              <h1 id="category-title">{current}</h1>
              <p>
                Découvrez les projets de cette expertise, conçus pour répondre aux besoins concrets des entreprises.
              </p>
            </div>
            <div className="category-count">
              <strong>{String(projects.length).padStart(2, "0")}</strong>
              <span>{projects.length === 1 ? "projet" : "projets"} réalisés</span>
            </div>
          </div>
          <nav className="category-tabs" aria-label="Explorer les catégories">
            <Link href="/" className="category-tab">Toutes les réalisations</Link>
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/?cat=${category.slug}`}
                className={`category-tab${category.slug === cat ? " active" : ""}`}
                aria-current={category.slug === cat ? "page" : undefined}
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </section>
      )}
      {current ? (
        <div className="grid category-results-grid" id="project-grid">
          {projects.length === 0 && <div className="empty">Aucun projet pour le moment.</div>}
          {projects.map((p) => (
            <article key={p.id} className="card">
              <Carousel images={p.images.map((x) => x.url)} title={p.title} />
              <div className="info">
                <div className="project-meta">
                  <span className="tag">{p.category.name}</span>
                  <span className="project-number">{p.createdAt.getFullYear()}</span>
                </div>
                <h3><Link href={`/projects/${p.id}`}>{p.title}</Link></h3>
                <Link className="project-link" href={`/projects/${p.id}`}>
                  Découvrir le projet
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <ProjectCarousel
          projects={projects.map((project) => ({
            id: project.id,
            title: project.title,
            category: project.category.name,
            imageUrl: project.images[0]?.url ?? null,
          }))}
          sealedQuery={sealedQuery}
        />
      )}
    </main>
  );
}
