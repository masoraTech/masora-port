"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const COLORS = ["233, 30, 122", "47, 140, 255", "46, 224, 122"];
const ROTATING_WORDS = ["plus loin.", "plus vite.", "plus haut.", "ensemble."];
const HEADLINE = ["Le", "numérique,", "pensé", "pour", "aller"];

type Particle = { x: number; y: number; vx: number; vy: number; r: number; c: string };

export default function HomeCircuitHero() {
  const heroRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setWordIndex((i) => (i + 1) % ROTATING_WORDS.length), 2600);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!hero || !canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let frame = 0;
    let particles: Particle[] = [];
    const pointer = { x: -9999, y: -9999 };

    const resize = () => {
      const box = hero.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = box.width;
      height = box.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.max(28, Math.min(90, Math.round((width * height) / 16000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: 1 + Math.random() * 1.8,
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
      }));
      draw(false);
    };

    const draw = (move: boolean) => {
      ctx.clearRect(0, 0, width, height);
      const linkDistance = 130;
      for (const p of particles) {
        if (move) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const d = Math.hypot(dx, dy);
          if (d < 160 && d > 0) {
            p.vx += (dx / d) * 0.06;
            p.vy += (dy / d) * 0.06;
          }
          p.vx *= 0.985;
          p.vy *= 0.985;
          p.vx += (Math.random() - 0.5) * 0.02;
          p.vy += (Math.random() - 0.5) * 0.02;
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > width) p.vx *= -1;
          if (p.y < 0 || p.y > height) p.vy *= -1;
          p.x = Math.max(0, Math.min(width, p.x));
          p.y = Math.max(0, Math.min(height, p.y));
        }
      }
      for (let i = 0; i < particles.length; i += 1) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j += 1) {
          const b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d > linkDistance) continue;
          ctx.strokeStyle = `rgba(${a.c}, ${(1 - d / linkDistance) * 0.28})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
        const pd = Math.hypot(a.x - pointer.x, a.y - pointer.y);
        if (pd < 190) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - pd / 190) * 0.35})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();
        }
      }
      for (const p of particles) {
        ctx.fillStyle = `rgba(${p.c}, 0.9)`;
        ctx.shadowColor = `rgba(${p.c}, 1)`;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    };

    const loop = () => {
      draw(true);
      frame = window.requestAnimationFrame(loop);
    };
    const start = () => {
      if (!reduced.matches && !frame) frame = window.requestAnimationFrame(loop);
    };
    const stop = () => {
      window.cancelAnimationFrame(frame);
      frame = 0;
    };
    const onMotion = () => (reduced.matches ? (stop(), draw(false)) : start());
    const onPointer = (event: PointerEvent) => {
      const box = hero.getBoundingClientRect();
      pointer.x = event.clientX - box.left;
      pointer.y = event.clientY - box.top;
      hero.style.setProperty("--hx", `${(pointer.x / box.width - 0.5).toFixed(3)}`);
      hero.style.setProperty("--hy", `${(pointer.y / box.height - 0.5).toFixed(3)}`);
    };
    const onLeave = () => {
      pointer.x = -9999;
      pointer.y = -9999;
    };
    const visibility = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()));

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(hero);
    visibility.observe(hero);
    hero.addEventListener("pointermove", onPointer, { passive: true });
    hero.addEventListener("pointerleave", onLeave);
    reduced.addEventListener("change", onMotion);
    resize();
    start();

    return () => {
      stop();
      resizeObserver.disconnect();
      visibility.disconnect();
      hero.removeEventListener("pointermove", onPointer);
      hero.removeEventListener("pointerleave", onLeave);
      reduced.removeEventListener("change", onMotion);
    };
  }, []);

  return (
    <section ref={heroRef} className="circuit-hero" aria-labelledby="circuit-title">
      <canvas ref={canvasRef} className="circuit-canvas" aria-hidden="true" />
      <div className="hero-rings" aria-hidden="true">
        <span /><span /><span />
      </div>

      <div className="circuit-content">
        <span className="hero-badge">
          <i aria-hidden="true" />
          Masora Technologies · Studio numérique
        </span>

        <h1 id="circuit-title">
          <span className="sr-only">Le numérique, pensé pour aller plus loin.</span>
          <span className="hero-words" aria-hidden="true">
            {HEADLINE.map((word, index) => (
              <span className="hero-word" key={word} style={{ "--i": index } as React.CSSProperties}>
                {word}
              </span>
            ))}
            <span className="hero-rotator" style={{ "--i": HEADLINE.length } as React.CSSProperties}>
              <span className="hero-rotator-word" key={wordIndex}>{ROTATING_WORDS[wordIndex]}</span>
            </span>
          </span>
        </h1>

        <p>Des solutions digitales conçues pour faire avancer vos idées — du web au mobile, jusqu’à l’ERP.</p>

        <div className="circuit-actions">
          <Link href="#services" className="circuit-button circuit-button-primary">
            <span>Découvrir nos services</span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
          </Link>
          <Link href="/contact" className="circuit-button circuit-button-secondary">
            <span>Nous contacter</span>
          </Link>
        </div>
      </div>

      <a className="hero-scroll" href="#services" aria-label="Défiler vers nos expertises">
        <span />
      </a>
    </section>
  );
}
