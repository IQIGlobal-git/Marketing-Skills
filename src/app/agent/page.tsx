"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAgent } from "@/lib/agent-context";

export default function AgentPage() {
  const {
    selectedSkills,
    removeSkill,
    clearSkills,
    agentName,
    setAgentName,
    saveCurrentAgent,
  } = useAgent();
  const router = useRouter();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");

  const handleSave = () => {
    const id = saveCurrentAgent();
    if (id) {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }
  };

  if (selectedSkills.length === 0) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-4 text-2xl font-bold text-[var(--foreground)]">
          No Skills Selected
        </h1>
        <p className="mb-6 text-sm text-[var(--muted)]">
          Select marketing skills to build your custom agent.
        </p>
        <Link
          href="/skills"
          className="rounded-lg bg-[var(--accent)] px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
        >
          Browse Skills
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-[var(--foreground)]">
        Your Agent
      </h1>
      <p className="mb-6 text-sm text-[var(--muted)]">
        Name your agent, review selected skills, then start chatting.
      </p>

      {/* Agent name input */}
      <div className="mb-6">
        <input
          type="text"
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
          placeholder="Name your agent..."
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
        />
      </div>

      {/* Selected skills */}
      <div className="mb-6 space-y-2">
        {selectedSkills.map((skill) => (
          <div
            key={skill.slug}
            className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3"
          >
            <div>
              <span className="text-sm font-medium text-[var(--foreground)]">
                {skill.name}
              </span>
              <span className="ml-2 rounded-full bg-[var(--accent-subtle)] px-2 py-0.5 text-[10px] text-[var(--accent-text)]">
                {skill.category}
              </span>
            </div>
            <button
              onClick={() => removeSkill(skill.slug)}
              className="text-xs text-[var(--muted)] hover:text-red-500"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Tip */}
      {!selectedSkills.some((s) => s.slug === "product-marketing-context") && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
          Tip: Add the &quot;Product Marketing Context&quot; skill from the
          Skills page to help your agent understand your product before
          analyzing.
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => router.push("/agent/chat")}
          className="flex-1 rounded-lg bg-[var(--accent)] py-3 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
        >
          Start Chatting
        </button>
        <button
          onClick={handleSave}
          className="rounded-lg border border-[var(--accent)] px-4 py-3 text-sm font-medium text-[var(--accent)] transition-colors hover:bg-[var(--accent-subtle)]"
        >
          {saveStatus === "saved" ? "Saved!" : "Save Agent"}
        </button>
        <Link
          href="/skills"
          className="rounded-lg border border-[var(--border)] px-4 py-3 text-sm text-[var(--muted)] hover:bg-[var(--surface)]"
        >
          Add More
        </Link>
        <button
          onClick={clearSkills}
          className="rounded-lg border border-[var(--border)] px-4 py-3 text-sm text-[var(--muted)] hover:text-red-500"
        >
          Clear All
        </button>
      </div>
    </main>
  );
}
