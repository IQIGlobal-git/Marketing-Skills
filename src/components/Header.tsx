"use client";

import Link from "next/link";
import { useAgent } from "@/lib/agent-context";
import ThemePicker from "./ThemePicker";

export default function Header() {
  const { selectedSkills, savedAgents } = useAgent();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold text-[var(--foreground)]">
          Marketing Skills
        </Link>
        <nav className="flex items-center gap-5">
          <Link
            href="/"
            className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            Home
          </Link>
          <Link
            href="/skills"
            className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            Skills
          </Link>
          <Link
            href="/agent"
            className="relative text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            Agent
            {selectedSkills.length > 0 && (
              <span className="absolute -right-4 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-[9px] font-bold text-white">
                {selectedSkills.length}
              </span>
            )}
          </Link>
          <Link
            href="/agents"
            className="relative text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            Saved Agents
            {savedAgents.length > 0 && (
              <span className="absolute -right-5 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-[9px] font-bold text-white">
                {savedAgents.length}
              </span>
            )}
          </Link>
          <Link
            href="/settings"
            className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            Settings
          </Link>
          <ThemePicker />
        </nav>
      </div>
    </header>
  );
}
