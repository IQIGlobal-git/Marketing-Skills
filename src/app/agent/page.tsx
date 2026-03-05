"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAgent } from "@/lib/agent-context";

export default function AgentPage() {
  const { selectedSkills, removeSkill, clearSkills } = useAgent();
  const router = useRouter();

  if (selectedSkills.length === 0) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-white">
          No Skills Selected
        </h1>
        <p className="mb-6 text-sm text-zinc-500">
          Select marketing skills to build your custom agent.
        </p>
        <Link
          href="/skills"
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Browse Skills
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-white">
        Your Agent
      </h1>
      <p className="mb-6 text-sm text-zinc-500">
        Review selected skills, then start chatting with your custom marketing
        agent.
      </p>

      {/* Selected skills */}
      <div className="mb-6 space-y-2">
        {selectedSkills.map((skill) => (
          <div
            key={skill.slug}
            className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
          >
            <div>
              <span className="text-sm font-medium text-zinc-900 dark:text-white">
                {skill.name}
              </span>
              <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-500 dark:bg-zinc-800">
                {skill.category}
              </span>
            </div>
            <button
              onClick={() => removeSkill(skill.slug)}
              className="text-xs text-zinc-400 hover:text-red-500"
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
      <div className="flex gap-3">
        <button
          onClick={() => router.push("/agent/chat")}
          className="flex-1 rounded-lg bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700"
        >
          Start Chatting
        </button>
        <Link
          href="/skills"
          className="rounded-lg border border-zinc-200 px-4 py-3 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
        >
          Add More
        </Link>
        <button
          onClick={clearSkills}
          className="rounded-lg border border-zinc-200 px-4 py-3 text-sm text-zinc-400 hover:text-red-500 dark:border-zinc-800"
        >
          Clear All
        </button>
      </div>
    </main>
  );
}
