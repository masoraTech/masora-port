import Link from "next/link";
import Navbar from "@/components/Navbar";
import TimedSplash from "@/components/TimedSplash";
import MotionLayer from "@/components/MotionLayer";
import { getCategories } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories();
  return (
    <>
      <TimedSplash />
      <MotionLayer />
      <Navbar categories={categories.map((c) => ({ name: c.name, slug: c.slug }))} />
      {children}
      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-company">
            <Link href="/" className="footer-brand" aria-label="Masora Technologies, accueil">
              <img className="footer-wordmark" src="/masora-logo-blanc.png" alt="Masora Technologies" />
            </Link>
            <p>Nous concevons des solutions numériques utiles, fiables et adaptées aux ambitions de votre entreprise.</p>
            <span className="footer-location"><i /> À vos côtés, de l’idée au lancement.</span>
          </div>
          <nav className="footer-column" aria-label="Navigation de pied de page">
            <h2>Navigation</h2>
            <Link href="/">Accueil</Link>
            <Link href="/#projects">Réalisations</Link>
            <Link href="/contact">Contact</Link>
          </nav>
          <nav className="footer-column footer-expertise" aria-label="Nos expertises">
            <h2>Expertises</h2>
            {categories.map((category) => (
              <Link key={category.slug} href={`/?cat=${category.slug}`}>{category.name}</Link>
            ))}
          </nav>
          <div className="footer-column footer-contact-info">
            <h2>Travaillons ensemble</h2>
            <p>Parlons de vos objectifs et imaginons la solution adaptée à votre activité.</p>
            <div className="footer-social-links">
              <a
                className="footer-social-link"
                href="https://www.linkedin.com/in/masora-technologies/"
                target="_blank"
                rel="noreferrer"
                aria-label="Masora Technologies sur LinkedIn (nouvel onglet)"
              >
                <span className="footer-social-icon"><svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2ZM8.34 18H5.67V9.4h2.67ZM7 8.22a1.55 1.55 0 1 1 0-3.1 1.55 1.55 0 0 1 0 3.1ZM18.34 18h-2.67v-4.18c0-1-.02-2.28-1.39-2.28s-1.6 1.08-1.6 2.2V18h-2.67V9.4h2.56v1.17h.04a2.81 2.81 0 0 1 2.53-1.39c2.7 0 3.2 1.78 3.2 4.1Z" />
                </svg></span>
                LinkedIn
              </a>
              <a
                className="footer-social-link"
                href="mailto:masora.contact@gmail.com"
                aria-label="Envoyer un e-mail à masora.contact@gmail.com"
              >
                <span className="footer-social-icon"><svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M3 6.5 12 13l9-6.5M4.5 5h15A1.5 1.5 0 0 1 21 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-11A1.5 1.5 0 0 1 4.5 5Z" />
                </svg></span>
                masora.contact@gmail.com
              </a>
            </div>
            <Link href="/contact" className="footer-inline-link">Contacter Masora Technologies <span aria-hidden="true">→</span></Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Masora Technologies. Tous droits réservés.</span>
          <span className="footer-credit">Solutions numériques pour les entreprises</span>
          <div className="footer-bottom-actions">
            <Link href="#top" className="back-top" aria-label="Retour en haut de page">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5m-7 7 7-7 7 7" /></svg>
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
