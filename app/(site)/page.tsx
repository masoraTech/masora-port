import Link from "next/link";
import Carousel from "@/components/Carousel";
import HomeCircuitHero from "@/components/HomeCircuitHero";
import { getCategories, getProjects, getTechnologies } from "@/lib/queries";
import { SERVICE_ICON_PATHS, serviceInfo } from "@/lib/services";

export const dynamic = "force-dynamic";

const PROCESS = [
  { title: "Analyse", text: "Nous étudions vos besoins, vos utilisateurs et vos objectifs métier." },
  { title: "Conception", text: "Architecture, maquettes et choix techniques validés avec vous." },
  { title: "Développement", text: "Sprints courts, démonstrations régulières et code testé." },
  { title: "Lancement & suivi", text: "Mise en production, formation et maintenance évolutive." },
];

export default async function Home({ searchParams }: { searchParams: { cat?: string } }) {
  const cat = searchParams.cat;
  const [projects, categories, technologies] = await Promise.all([
    cat ? getProjects(cat) : Promise.resolve([]),
    getCategories(),
    getTechnologies(),
  ]);
  const currentCategory = cat ? categories.find((category) => category.slug === cat) : null;
  const current = cat ? currentCategory?.name ?? cat : null;

  if (current) {
    return (
      <main className="category-listing">
        <section className="category-page" aria-labelledby="category-title">
          <div className="category-heading">
            <div className="category-copy">
              <div className="breadcrumbs"><Link href="/">Accueil</Link><span>/</span><span>Expertises</span><span>/</span><b>{current}</b></div>
              <span className="category-eyebrow">MASORA TECHNOLOGIES · NOS RÉALISATIONS</span>
              <h1 id="category-title">{current}</h1>
              <p>{cat ? serviceInfo(cat).description : null} Découvrez les projets que nous avons réalisés dans cette expertise.</p>
            </div>
            <div className="category-count">
              <strong>{String(projects.length).padStart(2, "0")}</strong>
              <span>{projects.length === 1 ? "projet" : "projets"} réalisés</span>
            </div>
          </div>
          <nav className="category-tabs" aria-label="Explorer les catégories">
            <Link href="/#services" className="category-tab">Toutes les expertises</Link>
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
        <div className="grid category-results-grid" id="project-grid">
          {projects.length === 0 && <div className="empty">Aucun projet pour le moment.</div>}
          {projects.map((p) => (
            <article key={p.id} className="card">
              <div className="browser-frame">
                <div className="browser-bar" aria-hidden="true">
                  <span className="win-dots"><i /><i /><i /></span>
                  <span className="browser-url">masora / projets / {p.id}</span>
                </div>
                <Carousel images={p.images} title={p.title} />
              </div>
              <div className="info">
                <div className="project-meta">
                  <span className="tag">{p.category}</span>
                  <span className="project-number">{p.year}</span>
                </div>
                <h3><Link href={`/projects/${p.id}`}>{p.title}</Link></h3>
                {p.technologies && (
                  <ul className="card-stack" aria-label="Technologies">
                    {p.technologies.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 4).map((t) => <li key={t}>{t}</li>)}
                  </ul>
                )}
                <Link className="project-link" href={`/projects/${p.id}`}>
                  Voir l’étude de cas
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </main>
    );
  }

  const totalProjects = categories.reduce((sum, category) => sum + category.projectCount, 0);

  return (
    <main className="home-page">
      <HomeCircuitHero
        stats={{ projects: totalProjects, expertises: categories.length, technologies: technologies.length }}
        technologies={technologies}
      />

      <section className="services" id="services" aria-labelledby="services-title">
        <div className="section-head">
          <span className="section-eyebrow">01 · NOS SERVICES</span>
          <h2 id="services-title">Des expertises techniques au service de votre activité.</h2>
          <p>De la première maquette à la mise en production, nous couvrons tout le cycle de vie de vos projets numériques.</p>
        </div>
        <div className="services-grid">
          {categories.map((category, index) => {
            const info = serviceInfo(category.slug);
            return (
              <Link key={category.slug} href={`/?cat=${category.slug}`} className="service-card">
                <span className="service-index">{String(index + 1).padStart(2, "0")}</span>
                <span className="service-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><path d={SERVICE_ICON_PATHS[info.icon]} /></svg>
                </span>
                <h3>{category.name}</h3>
                <p>{info.description}</p>
                <span className="service-footer">
                  <span>
                    {category.projectCount > 0
                      ? `${category.projectCount} ${category.projectCount === 1 ? "projet" : "projets"}`
                      : "Découvrir"}
                  </span>
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {technologies.length > 0 && (
        <section className="technology-marquee" aria-label="Technologies utilisées">
          <span className="technology-marquee-label">&lt;stack&gt; Technologies que nous maîtrisons &lt;/stack&gt;</span>
          <div className="technology-marquee-window">
            <div className="technology-marquee-track">
              {[false, true].map((duplicate) => (
                <div key={String(duplicate)} className="technology-marquee-group" aria-hidden={duplicate}>
                  {technologies.map((technology) => (
                    <span className="technology-marquee-item" key={technology}>{technology}</span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="process" aria-labelledby="process-title">
        <div className="section-head">
          <span className="section-eyebrow">02 · NOTRE MÉTHODE</span>
          <h2 id="process-title">Un processus clair, de l’idée au lancement.</h2>
        </div>
        <ol className="process-steps">
          {PROCESS.map((step, index) => (
            <li key={step.title} className="process-step">
              <span className="process-number">{String(index + 1).padStart(2, "0")}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="cta-band" aria-labelledby="cta-title">
        <code className="cta-code" aria-hidden="true">{"<projet statut=\"à démarrer\" />"}</code>
        <h2 id="cta-title">Un projet en tête ? <span className="gradient-text">Construisons-le ensemble.</span></h2>
        <p>Parlez-nous de vos objectifs : nous revenons vers vous sous 48 h avec une première proposition.</p>
        <Link href="/contact" className="circuit-button circuit-button-primary">
          <span>Démarrer un projet</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
        </Link>
      </section>
    </main>
  );
}
