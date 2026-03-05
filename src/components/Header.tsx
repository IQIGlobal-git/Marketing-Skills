"use client";

import Link from "next/link";
import { useAgent } from "@/lib/agent-context";

export default function Header() {
  const { selectedSkills } = useAgent();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-zinc-900 dark:text-white">
          Marketing Skills
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            Home
          </Link>
          <Link
            href="/skills"
            className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            Skills
          </Link>
          <Link
            href="/agent"
            className="relative text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            Agent
            {selectedSkills.length > 0 && (
              <span className="absolute -right-4 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                {selectedSkills.length}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
