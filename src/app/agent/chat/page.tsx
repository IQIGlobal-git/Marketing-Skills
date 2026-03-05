"use client";

import { useAgent } from "@/lib/agent-context";
import ChatInterface from "@/components/ChatInterface";
import Link from "next/link";

export default function ChatPage() {
  const { selectedSkills } = useAgent();

  if (selectedSkills.length === 0) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-4 text-2xl font-bold text-zinc-900 dark:text-white">
          No Skills Selected
        </h1>
        <p className="mb-6 text-sm text-zinc-500">
          Go back and select skills for your agent.
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

  return <ChatInterface />;
}
