"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Category = { name: string; slug: string };
type IconName = "home" | "work" | "categories" | "contact";

function NavigationIcon({ name, className = "" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, React.ReactNode> = {
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1z" /><path d="M9 21v-7h6v7" /></>,
    work: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18m-11 0v2h4v-2" /></>,
    categories: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    contact: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
  };

  return (
    <svg className={`nav-icon nav-icon-${name} ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

export default function Navbar({ categories }: { categories: Category[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeHash, setActiveHash] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const closeMenu = (restoreFocus = false) => {
    setOpen(false);
    setCategoriesOpen(false);
    if (restoreFocus) requestAnimationFrame(() => burgerRef.current?.focus());
  };
  const openMenu = () => {
    setOpen(true);
  };

  useEffect(() => {
    const updateScroll = () => setScrolled(window.scrollY > 24);
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);

  useEffect(() => {
    const syncCategory = () => setSelectedCategory(new URLSearchParams(window.location.search).get("cat"));
    syncCategory();
    window.addEventListener("popstate", syncCategory);
    return () => window.removeEventListener("popstate", syncCategory);
  }, [pathname]);

  useEffect(() => {
    const syncHash = () => setActiveHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
        return;
      }

      if (event.key !== "Tab" || !drawerRef.current) return;
      const focusable = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.tabIndex >= 0 && element.getClientRects().length > 0);
      if (!focusable.length) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !drawerRef.current.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !drawerRef.current.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const homeActive = pathname === "/" && !selectedCategory && activeHash !== "#services";
  const projectsActive = (pathname === "/" && activeHash === "#services") || pathname === "/projects" || pathname.startsWith("/projects/");
  const contactActive = pathname === "/contact";
  const categoryActive = pathname === "/" && Boolean(selectedCategory);
  const selectCategory = (slug: string) => {
    setSelectedCategory(slug);
    setCategoriesOpen(false);
  };

  return (
    <>
      <header className={`top${scrolled ? " is-scrolled" : ""}`} id="top">
        <Link href="/" className="brand" aria-label="Masora Technologies, accueil">
          <span className="brand-icon"><img src="/masora_technologies_icon.png" alt="" /></span>
          <img src="/masora-logo-blanc.png" alt="Masora Technologies" className="brand-img" />
        </Link>

        <nav className="top-controls" aria-label="Navigation principale">
          <button
            ref={burgerRef}
            className={`burger${open ? " active" : ""}`}
            type="button"
            onClick={() => open ? closeMenu(true) : openMenu()}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            aria-controls="main-navigation"
          >
            <i /><i /><i />
          </button>
        </nav>
      </header>
      <div className="top-spacer" aria-hidden="true" />

      <button
        className={`scrim${open ? " on" : ""}`}
        type="button"
        onClick={() => closeMenu(true)}
        aria-label="Fermer le menu"
        aria-hidden={!open}
        tabIndex={-1}
      />

      <div
        ref={drawerRef}
        id="main-navigation"
        className={`drawer${open ? " on" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu principal"
        aria-hidden={!open}
        onTransitionEnd={(event) => {
          if (open && event.target === event.currentTarget && event.propertyName === "transform") {
            closeRef.current?.focus();
          }
        }}
      >
        <div className="drawer-heading">
          <img src="/masora_technologies_icon.png" alt="Masora Technologies" />
          <button ref={closeRef} className="x" type="button" onClick={() => closeMenu(true)} aria-label="Fermer le menu">×</button>
        </div>

        <nav className="drawer-links" aria-label="Navigation mobile">
          <Link
            href="/"
            onClick={() => {
              setSelectedCategory(null);
              setActiveHash("");
              closeMenu();
            }}
            className={homeActive ? "is-active" : undefined}
            aria-current={homeActive ? "page" : undefined}
          >
            <NavigationIcon name="home" />Accueil
          </Link>
          <Link
            href="/#services"
            onClick={() => {
              setSelectedCategory(null);
              setActiveHash("#services");
              closeMenu();
            }}
            className={projectsActive ? "is-active" : undefined}
            aria-current={projectsActive ? "page" : undefined}
          >
            <NavigationIcon name="work" />Réalisations
          </Link>

          <div className={`drawer-category${categoriesOpen ? " is-open" : ""}`}>
            <button
              className={`cat${categoryActive ? " is-active" : ""}`}
              type="button"
              aria-expanded={categoriesOpen}
              aria-controls="category-navigation"
              onClick={() => setCategoriesOpen((value) => !value)}
            >
              <span><NavigationIcon name="categories" />Catégories</span>
              <svg className="chevron" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
            </button>
            <div
              className={`sub${categoriesOpen ? " is-open" : ""}`}
              id="category-navigation"
              aria-hidden={!categoriesOpen}
            >
              <div className="sub-inner">
                {categories.map((category) => (
                  <Link
                    href={`/?cat=${category.slug}`}
                    key={category.slug}
                    onClick={() => {
                      selectCategory(category.slug);
                      closeMenu();
                    }}
                    aria-current={selectedCategory === category.slug ? "page" : undefined}
                    className={selectedCategory === category.slug ? "is-active" : undefined}
                    tabIndex={categoriesOpen ? 0 : -1}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Link
            href="/contact"
            onClick={() => {
              setSelectedCategory(null);
              closeMenu();
            }}
            className={contactActive ? "is-active" : undefined}
            aria-current={contactActive ? "page" : undefined}
          >
            <NavigationIcon name="contact" />Contact
          </Link>
        </nav>

        <div className="drawer-footer">
          <a className="drawer-email" href="mailto:masora.contact@gmail.com">masora.contact@gmail.com</a>
          <div className="drawer-socials" aria-label="Réseaux et contact">
            <a href="https://www.linkedin.com/in/masora-technologies/" target="_blank" rel="noreferrer" aria-label="Masora Technologies sur LinkedIn (nouvel onglet)">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2ZM8.34 18H5.67V9.4h2.67ZM7 8.22a1.55 1.55 0 1 1 0-3.1 1.55 1.55 0 0 1 0 3.1ZM18.34 18h-2.67v-4.18c0-1-.02-2.28-1.39-2.28s-1.6 1.08-1.6 2.2V18h-2.67V9.4h2.56v1.17h.04a2.81 2.81 0 0 1 2.53-1.39c2.7 0 3.2 1.78 3.2 4.1Z" /></svg>
            </a>
            <a href="mailto:masora.contact@gmail.com" aria-label="Envoyer un e-mail à masora.contact@gmail.com">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6.5 12 13l9-6.5M4.5 5h15A1.5 1.5 0 0 1 21 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-11A1.5 1.5 0 0 1 4.5 5Z" /></svg>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
