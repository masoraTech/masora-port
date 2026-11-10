"use client";

import { useEffect, useState } from "react";

type Line = { kind: "cmd" | "ok" | "info" | "bar" | "done"; text: string };

const SCRIPT: Line[] = [
  { kind: "cmd", text: "masora init votre-projet" },
  { kind: "ok", text: "Analyse des besoins" },
  { kind: "ok", text: "Architecture & maquettes validées" },
  { kind: "info", text: "Développement en sprints…" },
  { kind: "bar", text: "build" },
  { kind: "ok", text: "Tests passés" },
  { kind: "cmd", text: "masora deploy --prod" },
  { kind: "done", text: "En ligne · votre-projet.com" },
];

const TYPE_SPEED = 38;
const LINE_PAUSE = 420;
const RESTART_PAUSE = 4200;

export default function HeroTerminal({ technologies }: { technologies: string[] }) {
  const [lineCount, setLineCount] = useState(SCRIPT.length);
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    let line = 0;
    let chars = 0;
    const step = () => {
      if (line >= SCRIPT.length) {
        timer = window.setTimeout(() => {
          line = 0;
          chars = 0;
          setLineCount(0);
          setTyped(0);
          step();
        }, RESTART_PAUSE);
        return;
      }
      const current = SCRIPT[line];
      if (current.kind === "cmd" && chars < current.text.length) {
        chars += 1;
        setLineCount(line);
        setTyped(chars);
        timer = window.setTimeout(step, TYPE_SPEED);
        return;
      }
      line += 1;
      chars = 0;
      setLineCount(line);
      setTyped(0);
      timer = window.setTimeout(step, current.kind === "bar" ? 1300 : LINE_PAUSE);
    };
    setLineCount(0);
    timer = window.setTimeout(step, 900);
    return () => window.clearTimeout(timer);
  }, []);

  const visible = SCRIPT.slice(0, lineCount);
  const typing = lineCount < SCRIPT.length && SCRIPT[lineCount].kind === "cmd" ? SCRIPT[lineCount] : null;

  return (
    <div className="hero-visual" aria-hidden="true">
      <div className="terminal">
        <div className="terminal-bar">
          <span className="win-dots"><i /><i /><i /></span>
          <span className="terminal-title">~/masora — zsh</span>
        </div>
        <div className="terminal-body">
          {visible.map((line, index) => (
            <TerminalLine key={index} line={line} />
          ))}
          {typing && (
            <div className="t-line t-cmd">
              <span className="t-prompt">❯</span>
              {typing.text.slice(0, typed)}
              <span className="t-caret" />
            </div>
          )}
          {!typing && <div className="t-line t-cmd"><span className="t-prompt">❯</span><span className="t-caret" /></div>}
        </div>
      </div>
      {technologies.slice(0, 4).map((technology, index) => (
        <span className={`tech-chip tech-chip-${index + 1}`} key={technology}>
          <i />
          {technology}
        </span>
      ))}
    </div>
  );
}

function TerminalLine({ line }: { line: Line }) {
  if (line.kind === "cmd") return <div className="t-line t-cmd"><span className="t-prompt">❯</span>{line.text}</div>;
  if (line.kind === "bar") {
    return (
      <div className="t-line t-bar">
        <span className="t-muted">build</span>
        <span className="t-progress"><span /></span>
        <span className="t-green">100%</span>
      </div>
    );
  }
  if (line.kind === "info") return <div className="t-line t-info"><span className="t-blue">›</span> {line.text}</div>;
  if (line.kind === "done") return <div className="t-line t-done"><span className="t-green">●</span> {line.text}</div>;
  return <div className="t-line"><span className="t-green">✓</span> {line.text}</div>;
}
