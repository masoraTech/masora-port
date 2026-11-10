"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// Elements that fade/slide in when they scroll into view.
const REVEAL_SELECTOR = [
  "[data-reveal]",
  ".section-head > *",
  ".service-card",
  ".process-step",
  ".cta-band",
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

// Elements that tilt in 3D under the pointer (desktop only).
const TILT_SELECTOR = ".card, .service-card, .admin-stat";

export default function MotionLayer() {
  const pathname = usePathname();
  const progressRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const progress = progressRef.current;
    const spotlight = spotlightRef.current;

    // Scroll progress + cursor spotlight: written straight to their own element's
    // transform (compositor only), batched to one update per frame.
    let frame = 0;
    let pointerX = -1000;
    let pointerY = -1000;
    let tiltTarget: HTMLElement | null = null;
    let tiltEvent: PointerEvent | null = null;
    const paint = () => {
      frame = 0;
      if (progress) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
      }
      if (spotlight) spotlight.style.transform = `translate3d(${pointerX - 300}px, ${pointerY - 300}px, 0)`;
      if (tiltTarget && tiltEvent) {
        const box = tiltTarget.getBoundingClientRect();
        const x = (tiltEvent.clientX - box.left) / box.width - 0.5;
        const y = (tiltEvent.clientY - box.top) / box.height - 0.5;
        tiltTarget.style.transform = `perspective(1000px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg)`;
        tiltTarget.style.setProperty("--gx", `${((x + 0.5) * 100).toFixed(1)}%`);
        tiltTarget.style.setProperty("--gy", `${((y + 0.5) * 100).toFixed(1)}%`);
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const onPointer = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (!reduced.matches && finePointer.matches) {
        const target = event.target instanceof Element ? event.target.closest<HTMLElement>(TILT_SELECTOR) : null;
        if (tiltTarget && tiltTarget !== target) tiltTarget.style.transform = "";
        tiltTarget = target;
        tiltEvent = event;
      }
      schedule();
    };
    const onLeave = () => {
      if (tiltTarget) tiltTarget.style.transform = "";
      tiltTarget = null;
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    document.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    // Reveal on scroll. Web Animations API: nothing is written to server-rendered
    // markup (keeps React hydration happy), and only opacity/transform animate.
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
      { rootMargin: "0px 0px -6% 0px", threshold: 0.05 },
    );
    const scan = (initial = false) => {
      if (reduced.matches) return;
      const siblings = new Map<Element | null, number>();
      document.querySelectorAll(REVEAL_SELECTOR).forEach((element) => {
        if (seen.has(element)) return;
        seen.add(element);
        // Already on screen at load: show immediately, no hidden flash.
        const box = element.getBoundingClientRect();
        if (initial && box.top < window.innerHeight && box.bottom > 0) return;
        const index = siblings.get(element.parentElement) ?? 0;
        siblings.set(element.parentElement, index + 1);
        const animation = element.animate(
          [
            { opacity: 0, transform: "translateY(28px)" },
            { opacity: 1, transform: "none" },
          ],
          { duration: 700, delay: Math.min(index, 6) * 60, easing: "cubic-bezier(.2, .8, .2, 1)", fill: "both" },
        );
        animation.pause();
        pending.set(element, animation);
        observer.observe(element);
      });
    };
    scan(true);
    // Re-scan only when new elements are added, at most once per frame.
    let scanFrame = 0;
    const mutations = new MutationObserver((records) => {
      if (scanFrame) return;
      if (!records.some((record) => Array.from(record.addedNodes).some((node) => node.nodeType === 1))) return;
      scanFrame = requestAnimationFrame(() => {
        scanFrame = 0;
        scan();
      });
    });
    const root = document.querySelector("main")?.parentElement ?? document.body;
    mutations.observe(root, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(scanFrame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("pointermove", onPointer);
      document.removeEventListener("pointerleave", onLeave);
      onLeave();
      observer.disconnect();
      mutations.disconnect();
      pending.forEach((animation) => animation.cancel());
      pending.clear();
    };
  }, [pathname]);

  return (
    <>
      <div ref={progressRef} className="scroll-progress" aria-hidden="true" />
      <div className="ambient" aria-hidden="true">
        <span className="ambient-blob ambient-pink" />
        <span className="ambient-blob ambient-blue" />
        <span className="ambient-blob ambient-green" />
      </div>
      <div ref={spotlightRef} className="cursor-spotlight" aria-hidden="true" />
    </>
  );
}
