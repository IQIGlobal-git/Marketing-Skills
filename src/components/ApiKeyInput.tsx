"use client";

import { useState } from "react";
import { useAgent } from "@/lib/agent-context";

export default function ApiKeyInput({ compact = false }: { compact?: boolean }) {
  const { apiKey, setApiKey } = useAgent();
  const [value, setValue] = useState(apiKey);
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setApiKey(value.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (compact && apiKey) return null;

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium text-[var(--foreground)]">
          OpenAI API Key
        </h3>
        <a
          href="https://platform.openai.com/api-keys"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-[var(--accent)] hover:underline"
        >
          Get an API key
        </a>
      </div>
      <p className="mb-3 text-xs text-[var(--muted)]">
        {apiKey
          ? "Your key is saved. Enter a new one to replace it."
          : "Enter your API key to start chatting. Keys are stored locally in your browser."}
      </p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type={show ? "text" : "password"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="sk-..."
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
          />
          <button
            onClick={() => setShow(!show)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>
        <button
          onClick={handleSave}
          disabled={!value.trim()}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-50"
        >
          {saved ? "Saved!" : "Save"}
        </button>
      </div>
    </div>
  );
}
