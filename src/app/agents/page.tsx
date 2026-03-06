/**
 * Saved Agents page — Lists all saved agent configurations.
 *
 * Each agent card shows its name, skill count, creation date, and message count.
 * Actions: continue chat, edit skills, or delete the agent.
 */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAgent } from "@/lib/agent-context";

export default function AgentsPage() {
  const { savedAgents, deleteAgent, loadAgent } = useAgent();
  const router = useRouter();

  const handleLoad = (agent: (typeof savedAgents)[0]) => {
    loadAgent(agent);
    router.push("/agent");
  };

  const handleChat = (agent: (typeof savedAgents)[0]) => {
    loadAgent(agent);
    router.push("/agent/chat");
  };

  const handleDelete = (id: string) => {
    deleteAgent(id);
  };

  if (savedAgents.length === 0) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-4 text-2xl font-bold text-[var(--foreground)]">
          No Saved Agents
        </h1>
        <p className="mb-6 text-sm text-[var(--muted)]">
          Build an agent from skills and save it here for quick access.
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
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-[var(--foreground)]">
        Saved Agents
      </h1>
      <p className="mb-6 text-sm text-[var(--muted)]">
        Your saved marketing agents. Load one to chat or edit its skills.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {savedAgents.map((agent) => (
          <div
            key={agent.id}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4"
          >
            <div className="mb-3">
              <h2 className="text-base font-semibold text-[var(--foreground)]">
                {agent.name}
              </h2>
              <div className="mt-1 flex items-center gap-2 text-xs text-[var(--muted)]">
                <span>
                  {agent.skills.length} skill{agent.skills.length !== 1 ? "s" : ""}
                </span>
                <span>·</span>
                <span>{new Date(agent.createdAt).toLocaleDateString()}</span>
                {agent.chatHistory && agent.chatHistory.length > 0 && (
                  <>
                    <span>·</span>
                    <span>{agent.chatHistory.length} messages</span>
                  </>
                )}
              </div>
            </div>

            <div className="mb-3 flex flex-wrap gap-1">
              {agent.skills.slice(0, 4).map((s) => (
                <span
                  key={s.slug}
                  className="rounded-full bg-[var(--accent-subtle)] px-2 py-0.5 text-[10px] text-[var(--accent-text)]"
                >
                  {s.name}
                </span>
              ))}
              {agent.skills.length > 4 && (
                <span className="rounded-full bg-[var(--accent-subtle)] px-2 py-0.5 text-[10px] text-[var(--accent-text)]">
                  +{agent.skills.length - 4} more
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleChat(agent)}
                className="flex-1 rounded-md bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--accent-hover)]"
              >
                {agent.chatHistory && agent.chatHistory.length > 0 ? "Continue Chat" : "Chat"}
              </button>
              <button
                onClick={() => handleLoad(agent)}
                className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted)] hover:bg-[var(--accent-subtle)] hover:text-[var(--foreground)]"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(agent.id)}
                className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted)] hover:text-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
