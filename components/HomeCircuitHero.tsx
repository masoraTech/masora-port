"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

const GRID_SIZE = 56;
const TRACE_COLORS = [
  { color: "#E91E7A", rgb: "233, 30, 122" },
  { color: "#1E88E5", rgb: "30, 136, 229" },
  { color: "#2EC050", rgb: "46, 192, 80" },
];

type Point = { x: number; y: number; distance: number };
type Trace = {
  points: Point[];
  direction: { x: number; y: number };
  segmentProgress: number;
  distance: number;
  speed: number;
  age: number;
  lifetime: number;
  color: (typeof TRACE_COLORS)[number];
};

function randomDirection() {
  const directions = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
  return directions[Math.floor(Math.random() * directions.length)];
}

function createTrace(width: number, height: number): Trace {
  const lifetime = 7 + Math.random() * 7;
  return {
    points: [{
      x: Math.floor(Math.random() * Math.max(1, width / GRID_SIZE)) * GRID_SIZE,
      y: Math.floor(Math.random() * Math.max(1, height / GRID_SIZE)) * GRID_SIZE,
      distance: 0,
    }],
    direction: randomDirection(),
    segmentProgress: 0,
    distance: 0,
    speed: 60 + Math.random() * 60,
    age: Math.random() * lifetime * 0.6,
    lifetime,
    color: TRACE_COLORS[Math.floor(Math.random() * TRACE_COLORS.length)],
  };
}

function createStaticTrace(width: number, height: number): Trace {
  const trace = createTrace(width, height);
  const columns = Math.max(1, Math.floor(width / GRID_SIZE));
  const rows = Math.max(1, Math.floor(height / GRID_SIZE));
  let x = Math.floor(Math.random() * columns) * GRID_SIZE;
  let y = Math.floor(Math.random() * rows) * GRID_SIZE;
  let distance = 0;
  trace.lifetime = 20;
  trace.age = 10;
  trace.segmentProgress = 0;
  trace.points = [{ x, y, distance }];

  const segmentCount = 4 + Math.floor(Math.random() * 5);
  for (let index = 0; index < segmentCount; index += 1) {
    if (index > 0 && Math.random() < 0.32) {
      const turn = Math.random() < 0.5 ? -1 : 1;
      trace.direction = { x: -trace.direction.y * turn, y: trace.direction.x * turn };
    }

    let nextX = x + trace.direction.x * GRID_SIZE;
    let nextY = y + trace.direction.y * GRID_SIZE;
    if (nextX < 0 || nextX > width || nextY < 0 || nextY > height) {
      trace.direction = { x: -trace.direction.y, y: trace.direction.x };
      nextX = x + trace.direction.x * GRID_SIZE;
      nextY = y + trace.direction.y * GRID_SIZE;
    }
    x = nextX;
    y = nextY;
    distance += GRID_SIZE;
    trace.points.push({ x, y, distance });
  }

  trace.distance = distance;
  return trace;
}

function advanceTrace(trace: Trace, delta: number) {
  trace.age += delta;
  let distanceToAdvance = trace.speed * delta;

  while (distanceToAdvance > 0) {
    const step = Math.min(distanceToAdvance, GRID_SIZE - trace.segmentProgress);
    trace.segmentProgress += step;
    trace.distance += step;
    distanceToAdvance -= step;

    if (trace.segmentProgress >= GRID_SIZE) {
      const previous = trace.points[trace.points.length - 1];
      const next = {
        x: previous.x + trace.direction.x * GRID_SIZE,
        y: previous.y + trace.direction.y * GRID_SIZE,
        distance: trace.distance,
      };
      trace.points.push(next);
      trace.segmentProgress = 0;

      if (Math.random() < 0.3) {
        const turn = Math.random() < 0.5 ? -1 : 1;
        trace.direction = { x: -trace.direction.y * turn, y: trace.direction.x * turn };
      }
    }
  }
}

function drawTrace(context: CanvasRenderingContext2D, trace: Trace, width: number, height: number) {
  const fadeIn = Math.min(1, trace.age / 0.8);
  const fadeOut = Math.min(1, (trace.lifetime - trace.age) / 1.8);
  const opacity = Math.max(0, Math.min(fadeIn, fadeOut));
  if (opacity <= 0) return;

  const tailLength = 280;
  const visibleFrom = Math.max(0, trace.distance - tailLength);
  const last = trace.points[trace.points.length - 1];
  const points = [
    ...trace.points,
    {
      x: last.x + trace.direction.x * trace.segmentProgress,
      y: last.y + trace.direction.y * trace.segmentProgress,
      distance: trace.distance,
    },
  ];

  context.save();
  context.lineWidth = 2;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.shadowBlur = 9;
  context.shadowColor = trace.color.color;

  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index];
    const end = points[index + 1];
    if (end.distance <= visibleFrom) continue;

    const segmentLength = end.distance - start.distance;
    const trim = segmentLength > 0 ? Math.max(0, (visibleFrom - start.distance) / segmentLength) : 0;
    const startX = start.x + (end.x - start.x) * trim;
    const startY = start.y + (end.y - start.y) * trim;
    const distanceBehind = trace.distance - start.distance;
    const startOpacity = Math.max(0.015, 0.5 * (1 - distanceBehind / tailLength)) * opacity;
    const gradient = context.createLinearGradient(startX, startY, end.x, end.y);
    gradient.addColorStop(0, `rgba(${trace.color.rgb}, ${startOpacity})`);
    gradient.addColorStop(1, `rgba(${trace.color.rgb}, ${0.72 * opacity})`);

    context.strokeStyle = gradient;
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(end.x, end.y);
    context.stroke();
  }

  const head = points[points.length - 1];
  if (head.x >= 0 && head.x <= width && head.y >= 0 && head.y <= height) {
    context.globalAlpha = opacity;
    context.shadowBlur = 12;
    context.fillStyle = "#fff";
    context.strokeStyle = trace.color.color;
    context.lineWidth = 2;
    context.beginPath();
    context.arc(head.x, head.y, 4, 0, Math.PI * 2);
    context.fill();
    context.stroke();
  }

  context.restore();
}

export default function HomeCircuitHero() {
  const heroRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!hero || !canvas || !context) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let animationFrame = 0;
    let lastFrameTime = 0;
    let traces: Trace[] = [];

    const drawStaticTraces = () => {
      context.clearRect(0, 0, width, height);
      const count = Math.max(8, Math.min(26, Math.round((width * height) / 52000)));
      for (let index = 0; index < count; index += 1) {
        drawTrace(context, createStaticTrace(width, height), width, height);
      }
    };

    const resize = () => {
      const bounds = hero.getBoundingClientRect();
      const nextWidth = bounds.width;
      const nextHeight = bounds.height;
      const nextPixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      if (nextWidth === width && nextHeight === height && nextPixelRatio === pixelRatio) return;

      width = nextWidth;
      height = nextHeight;
      pixelRatio = nextPixelRatio;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const targetCount = Math.max(8, Math.min(26, Math.round((width * height) / 52000)));
      traces = Array.from({ length: targetCount }, () => createTrace(width, height));
      if (motionPreference.matches) drawStaticTraces();
    };

    const render = (time: number) => {
      if (motionPreference.matches) {
        drawStaticTraces();
        animationFrame = 0;
        lastFrameTime = 0;
        return;
      }

      const delta = lastFrameTime ? Math.min((time - lastFrameTime) / 1000, 0.05) : 0;
      lastFrameTime = time;
      context.clearRect(0, 0, width, height);

      for (let index = traces.length - 1; index >= 0; index -= 1) {
        const trace = traces[index];
        advanceTrace(trace, delta);
        drawTrace(context, trace, width, height);

        if (trace.age >= trace.lifetime) {
          traces[index] = createTrace(width, height);
        }
      }

      animationFrame = window.requestAnimationFrame(render);
    };

    const stop = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      lastFrameTime = 0;
    };

    const start = () => {
      if (motionPreference.matches || animationFrame) return;
      animationFrame = window.requestAnimationFrame(render);
    };

    const handleMotionChange = () => {
      if (motionPreference.matches) stop();
      else start();
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      const bounds = hero.getBoundingClientRect();
      hero.style.setProperty("--pointer-x", `${event.clientX - bounds.left}px`);
      hero.style.setProperty("--pointer-y", `${event.clientY - bounds.top}px`);
      hero.dataset.pointer = "true";
    };
    const clearPointer = () => { hero.dataset.pointer = "false"; };
    const observer = new ResizeObserver(resize);

    observer.observe(hero);
    hero.addEventListener("pointermove", handlePointerMove, { passive: true });
    hero.addEventListener("pointerleave", clearPointer);
    motionPreference.addEventListener("change", handleMotionChange);
    resize();
    start();

    return () => {
      observer.disconnect();
      hero.removeEventListener("pointermove", handlePointerMove);
      hero.removeEventListener("pointerleave", clearPointer);
      motionPreference.removeEventListener("change", handleMotionChange);
      stop();
      context.clearRect(0, 0, width, height);
    };
  }, []);

  return (
    <section ref={heroRef} className="circuit-hero" aria-labelledby="circuit-title" data-pointer="false">
      <div className="circuit-halos" aria-hidden="true">
        <span className="circuit-halo circuit-halo-pink" />
        <span className="circuit-halo circuit-halo-blue" />
        <span className="circuit-halo circuit-halo-green" />
      </div>
      <canvas ref={canvasRef} className="circuit-canvas" aria-hidden="true" />
      <div className="circuit-grid" aria-hidden="true" />
      <div className="circuit-cursor-glow" aria-hidden="true" />

      <div className="circuit-content">
        <svg className="masora-mark" viewBox="0 0 120 92" role="img" aria-label="Symbole M de Masora Technologies">
          <g fill="none" strokeLinecap="round" strokeWidth="7">
            <path d="M22 10v48" stroke="#E91E7A" />
            <path d="M60 10v48" stroke="#1E88E5" />
            <path d="M98 10v48" stroke="#2EC050" />
          </g>
          <g fill="none" strokeWidth="4">
            <circle cx="22" cy="72" r="10" stroke="#E91E7A" />
            <circle cx="60" cy="72" r="10" stroke="#1E88E5" />
            <circle cx="98" cy="72" r="10" stroke="#2EC050" />
          </g>
        </svg>

        <div className="circuit-brand-card">
          <img
            src="/masora_technologies_logo.png"
            alt="MASORA Technologies"
            className="circuit-wordmark"
          />
        </div>

        <h1 id="circuit-title">Le numérique, pensé pour aller plus loin.</h1>
        <p>Des solutions digitales conçues pour faire avancer vos idées.</p>

        <div className="circuit-actions">
          <Link href="#services" className="circuit-button circuit-button-primary">
            Découvrir nos services
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
          </Link>
          <Link href="/contact" className="circuit-button circuit-button-secondary">
            Nous contacter
          </Link>
        </div>
      </div>

      <style jsx>{`
        .circuit-hero {
          --pointer-x: 50%;
          --pointer-y: 50%;
          position: relative;
          display: grid;
          min-height: max(660px, calc(100svh - 78px));
          padding: max(52px, env(safe-area-inset-top)) max(24px, env(safe-area-inset-right)) max(52px, env(safe-area-inset-bottom)) max(24px, env(safe-area-inset-left));
          overflow: hidden;
          isolation: isolate;
          place-items: center;
          color: #3C4043;
          background: #F5F7F9;
          text-align: center;
        }
        .circuit-halos, .circuit-canvas, .circuit-grid, .circuit-cursor-glow {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        .circuit-halos { z-index: -3; overflow: hidden; }
        .circuit-halo {
          position: absolute;
          display: block;
          width: clamp(240px, 34vw, 480px);
          aspect-ratio: 1;
          border-radius: 50%;
          filter: blur(82px);
          opacity: .28;
          will-change: transform;
        }
        .circuit-halo-pink {
          top: -25%;
          left: -9%;
          background: #E91E7A;
          animation: halo-pink 29s ease-in-out infinite alternate;
        }
        .circuit-halo-blue {
          top: 16%;
          right: -16%;
          background: #1E88E5;
          animation: halo-blue 26s ease-in-out infinite alternate;
        }
        .circuit-halo-green {
          bottom: -34%;
          left: 36%;
          background: #2EC050;
          animation: halo-green 32s ease-in-out infinite alternate;
        }
        .circuit-canvas { z-index: -2; }
        .circuit-grid {
          z-index: -1;
          background-image: radial-gradient(circle, rgba(60, 64, 67, .08) 1px, transparent 1.35px);
          background-size: 56px 56px;
        }
        .circuit-cursor-glow {
          z-index: 0;
          inset: auto;
          top: var(--pointer-y);
          left: var(--pointer-x);
          width: min(44vw, 560px);
          aspect-ratio: 1;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(30, 136, 229, .09), rgba(30, 136, 229, .025) 38%, transparent 70%);
          opacity: 0;
          transform: translate(-50%, -50%);
          transition: opacity .45s ease;
        }
        .circuit-hero[data-pointer="true"] .circuit-cursor-glow { opacity: 1; }
        .circuit-content {
          z-index: 1;
          display: flex;
          width: min(100%, 720px);
          align-items: center;
          flex-direction: column;
          animation: content-appear .9s cubic-bezier(.2, .75, .2, 1) both;
        }
        .masora-mark {
          width: clamp(78px, 9vw, 108px);
          height: auto;
          margin-bottom: 20px;
          overflow: visible;
          filter: drop-shadow(0 10px 20px rgba(30, 136, 229, .12));
          animation: mark-float 5s ease-in-out infinite;
        }
        .circuit-brand-card {
          display: grid;
          width: min(100%, 390px);
          min-height: 0;
          padding: 0;
          place-items: center;
        }
        .circuit-wordmark {
          display: block;
          width: min(100%, 320px);
          height: auto;
          object-fit: contain;
        }
        h1 {
          max-width: 16ch;
          margin: 32px 0 12px;
          color: #3C4043;
          font-size: clamp(2.35rem, 5.5vw, 4.7rem);
          font-weight: 720;
          letter-spacing: -.065em;
          line-height: 1.02;
          text-wrap: balance;
        }
        .circuit-content > p {
          max-width: 48ch;
          margin: 0;
          color: #667078;
          font-size: clamp(1rem, 1.7vw, 1.16rem);
          line-height: 1.7;
        }
        .circuit-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 12px;
          margin-top: 30px;
        }
        :global(.circuit-button) {
          display: inline-flex;
          min-height: 52px;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 0 22px;
          border: 1px solid transparent;
          border-radius: 999px;
          font-size: .92rem;
          font-weight: 700;
          text-decoration: none;
          transition: color .22s ease, background .22s ease, border-color .22s ease, box-shadow .22s ease, transform .22s ease;
        }
        :global(.circuit-button:hover) { transform: translateY(-3px); }
        :global(.circuit-button:focus-visible) { outline: 3px solid #1E88E5; outline-offset: 4px; }
        :global(.circuit-button-primary) {
          color: #fff;
          background: #3C4043;
          box-shadow: 0 10px 24px rgba(60, 64, 67, .16);
        }
        :global(.circuit-button-primary:hover) {
          color: #fff;
          background: #1E88E5;
          box-shadow: 0 14px 28px rgba(30, 136, 229, .24);
        }
        :global(.circuit-button-primary) svg {
          width: 18px;
          height: 18px;
          fill: none;
          stroke: currentColor;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-width: 1.8;
        }
        :global(.circuit-button-secondary) {
          color: #3C4043;
          background: rgba(255, 255, 255, .5);
          border-color: rgba(60, 64, 67, .16);
        }
        :global(.circuit-button-secondary:hover) {
          color: #1E88E5;
          background: rgba(255, 255, 255, .88);
          border-color: rgba(30, 136, 229, .45);
        }
        @keyframes halo-pink {
          from { transform: translate3d(0, 0, 0) scale(.92); }
          to { transform: translate3d(15vw, 12vh, 0) scale(1.08); }
        }
        @keyframes halo-blue {
          from { transform: translate3d(0, 0, 0) scale(1.04); }
          to { transform: translate3d(-14vw, 16vh, 0) scale(.9); }
        }
        @keyframes halo-green {
          from { transform: translate3d(-10vw, 0, 0) scale(.95); }
          to { transform: translate3d(12vw, -13vh, 0) scale(1.08); }
        }
        @keyframes mark-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-9px); }
        }
        @keyframes content-appear {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 600px) {
          .circuit-hero {
            min-height: max(620px, calc(100svh - 72px));
            padding-right: max(20px, env(safe-area-inset-right));
            padding-left: max(20px, env(safe-area-inset-left));
          }
          .circuit-halo { width: 78vw; filter: blur(64px); }
          .circuit-actions { width: 100%; gap: 10px; }
          :global(.circuit-button) { min-height: 50px; padding: 0 17px; font-size: .86rem; }
        }
        @media (max-width: 380px) {
          .circuit-actions { align-items: stretch; flex-direction: column; }
          :global(.circuit-button) { width: 100%; }
        }
        @media (hover: none), (pointer: coarse) {
          .circuit-cursor-glow { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .circuit-halo, .masora-mark, .circuit-content { animation: none; }
          .circuit-cursor-glow { display: none; }
          :global(.circuit-button) { transition: none; }
        }
      `}</style>
    </section>
  );
}
