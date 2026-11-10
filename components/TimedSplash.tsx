"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const DISPLAY_TIME = 1300;
const FADE_TIME = 350;
const SESSION_KEY = "mms-home-splash-shown";

export default function TimedSplash() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(pathname === "/");
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (pathname !== "/" || sessionStorage.getItem(SESSION_KEY)) {
      setVisible(false);
      return;
    }

    setVisible(true);
    setExiting(false);

    const fadeTimer = window.setTimeout(() => setExiting(true), DISPLAY_TIME - FADE_TIME);
    const hideTimer = window.setTimeout(() => {
      sessionStorage.setItem(SESSION_KEY, "true");
      setVisible(false);
    }, DISPLAY_TIME);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className={`timed-splash${exiting ? " exiting" : ""}`} aria-hidden={exiting}>
      <div className="loading-content" role="status" aria-live="polite">
        <div className="loading-mark" aria-hidden="true">
          <span className="loading-orbit loading-orbit-one" />
          <span className="loading-orbit loading-orbit-two" />
          <span className="loading-node loading-node-one" />
          <span className="loading-node loading-node-two" />
          <img src="/masora_technologies_icon.png" alt="" />
        </div>
        <span className="loading-label">MASORA TECHNOLOGIES</span>
        <p>Préparation de votre expérience numérique</p>
        <div className="loading-track" aria-hidden="true"><span /></div>
      </div>
    </div>
  );
}
