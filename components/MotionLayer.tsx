"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Elements that fade/slide in when they scroll into view.
const REVEAL_SELECTOR = [
  "[data-reveal]",
  ".home-expertise",
  ".expertise-link",
  ".technology-marquee",
  ".projects-intro > *",
  ".project-carousel",
  ".category-heading > *",
  ".category-tabs",
  ".card",
  ".project-heading",
  ".project-showcase",
  ".project-description",
  ".project-facts",
  ".contact-card",
  ".contact-intro > *",
  ".footer-content > *",
].join(",");

// Elements that tilt in 3D under the pointer.
const TILT_SELECTOR = ".card, .featured-project, .admin-stat";
// Elements pulled slightly towards the pointer.
const MAGNET_SELECTOR = ".circuit-button, .featured-link, .featured-arrow, .back-top, .btn";

export default function MotionLayer() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

    // Scroll progress bar + cursor spotlight
    const onScroll = () => {
      const max = root.scrollHeight - window.innerHeight;
      root.style.setProperty("--scroll", String(max > 0 ? window.scrollY / max : 0));
    };
    const onPointer = (event: PointerEvent) => {
      root.style.setProperty("--mx", `${event.clientX}px`);
      root.style.setProperty("--my", `${event.clientY}px`);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });

    // Reveal on scroll. Uses the Web Animations API so no class or style attribute is
    // written to server-rendered elements (that would break React hydration).
    const seen = new WeakSet<Element>();
    const pending = new Map<Element, Animation>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const animation = pending.get(entry.target);
          pending.delete(entry.target);
          observer.unobserve(entry.target);
          if (!animation) continue;
          animation.onfinish = () => animation.cancel();
          animation.play();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    const scan = () => {
      if (reduced.matches) return;
      const siblings = new Map<Element | null, number>();
      document.querySelectorAll(REVEAL_SELECTOR).forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        const index = siblings.get(element.parentElement) ?? 0;
        siblings.set(element.parentElement, index + 1);
        const animation = element.animate(
          [
            { opacity: 0, translate: "0 34px", filter: "blur(8px)" },
            { opacity: 1, translate: "0 0", filter: "blur(0)" },
          ],
          { duration: 900, delay: Math.min(index, 8) * 70, easing: "cubic-bezier(.2, .8, .2, 1)", fill: "both" },
        );
        animation.pause();
        pending.set(element, animation);
        observer.observe(element);
      });
    };
    scan();
    const mutations = new MutationObserver(scan);
    mutations.observe(document.body, { childList: true, subtree: true });

    // Tilt + magnetic hover
    const onMove = (event: PointerEvent) => {
      if (reduced.matches || !finePointer.matches) return;
      const target = event.target instanceof Element ? event.target : null;
      const tilt = target?.closest<HTMLElement>(TILT_SELECTOR);
      if (tilt) {
        const box = tilt.getBoundingClientRect();
        const x = (event.clientX - box.left) / box.width - 0.5;
        const y = (event.clientY - box.top) / box.height - 0.5;
        tilt.style.setProperty("--rx", `${(-y * 6).toFixed(2)}deg`);
        tilt.style.setProperty("--ry", `${(x * 8).toFixed(2)}deg`);
        tilt.style.setProperty("--gx", `${((x + 0.5) * 100).toFixed(1)}%`);
        tilt.style.setProperty("--gy", `${((y + 0.5) * 100).toFixed(1)}%`);
        tilt.classList.add("is-tilting");
      }
      const magnet = target?.closest<HTMLElement>(MAGNET_SELECTOR);
      if (magnet) {
        const box = magnet.getBoundingClientRect();
        const dx = event.clientX - (box.left + box.width / 2);
        const dy = event.clientY - (box.top + box.height / 2);
        magnet.style.setProperty("--tx", `${(dx * 0.18).toFixed(1)}px`);
        magnet.style.setProperty("--ty", `${(dy * 0.28).toFixed(1)}px`);
      }
    };
    const onOut = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const related = event.relatedTarget instanceof Element ? event.relatedTarget : null;
      const tilt = target?.closest<HTMLElement>(TILT_SELECTOR);
      if (tilt && !tilt.contains(related)) {
        tilt.classList.remove("is-tilting");
        tilt.style.removeProperty("--rx");
        tilt.style.removeProperty("--ry");
      }
      const magnet = target?.closest<HTMLElement>(MAGNET_SELECTOR);
      if (magnet && !magnet.contains(related)) {
        magnet.style.removeProperty("--tx");
        magnet.style.removeProperty("--ty");
      }
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", onOut, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onOut);
      observer.disconnect();
      mutations.disconnect();
      pending.forEach((animation) => animation.cancel());
      pending.clear();
    };
  }, [pathname]);

  return (
    <>
      <div className="scroll-progress" aria-hidden="true" />
      <div className="ambient" aria-hidden="true">
        <span className="ambient-blob ambient-pink" />
        <span className="ambient-blob ambient-blue" />
        <span className="ambient-blob ambient-green" />
        <span className="ambient-grain" />
      </div>
      <div className="cursor-spotlight" aria-hidden="true" />
    </>
  );
}
