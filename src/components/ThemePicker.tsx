/**
 * ThemePicker — Dropdown for switching between 5 color themes.
 *
 * Themes: Midnight (dark blue), Snow (light), Forest (dark green),
 * Sunset (dark orange), Ocean (dark cyan).
 * Theme is applied via data-theme attribute on <html> and persisted to localStorage.
 */
"use client";

import { useState, useRef, useEffect } from "react";
import { useAgent } from "@/lib/agent-context";
import { ThemeName } from "@/lib/types";

const themes: { name: ThemeName; label: string; colors: [string, string] }[] = [
  { name: "midnight", label: "Midnight", colors: ["#0f172a", "#3b82f6"] },
  { name: "snow", label: "Snow", colors: ["#fafafa", "#2563eb"] },
  { name: "forest", label: "Forest", colors: ["#0c1a0e", "#22c55e"] },
  { name: "sunset", label: "Sunset", colors: ["#1a0f0a", "#f97316"] },
  { name: "ocean", label: "Ocean", colors: ["#0a1628", "#0ea5e9"] },
];

export default function ThemePicker() {
  const { theme, setTheme } = useAgent();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = themes.find((t) => t.name === theme) || themes[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-[var(--surface)]"
        title="Change theme"
      >
        <span
          className="h-3 w-3 rounded-full border border-[var(--border)]"
          style={{ background: current.colors[1] }}
        />
        <span className="hidden text-[var(--muted)] sm:inline">{current.label}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-40 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 shadow-lg">
          {themes.map((t) => (
            <button
              key={t.name}
              onClick={() => {
                setTheme(t.name);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs transition-colors hover:bg-[var(--accent-subtle)] ${
                theme === t.name ? "text-[var(--accent)]" : "text-[var(--foreground)]"
              }`}
            >
              <span className="flex gap-1">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ background: t.colors[0], border: "1px solid var(--border)" }}
                />
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ background: t.colors[1] }}
                />
              </span>
              {t.label}
              {theme === t.name && <span className="ml-auto">&#10003;</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
