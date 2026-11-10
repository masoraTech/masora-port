"use client";

import { useEffect, useRef, useState } from "react";

// Counts from 0 to `value` once the number scrolls into view.
export default function CountUp({ value, pad = 2, duration = 1600 }: { value: number; pad?: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setShown(0);
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        setShown(Math.round(value * (1 - Math.pow(1 - t, 3))));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return <span ref={ref}>{String(shown).padStart(pad, "0")}</span>;
}
