/**
 * ApiKeyInput — Reusable API key input component for any provider.
 *
 * Supports two modes:
 * - Full mode: Shows input for a specific provider with save/show/hide
 * - Compact mode: Returns null if the key is already set (used in chat banner)
 *
 * Props:
 *   - provider: which provider's key to manage (defaults to "groq")
 *   - compact: if true, hides when key is already set
 */
"use client";

import { useState } from "react";
import { useAgent } from "@/lib/agent-context";
import { AIProvider, PROVIDER_INFO } from "@/lib/types";

interface ApiKeyInputProps {
  compact?: boolean;
  provider?: AIProvider;
}

export default function ApiKeyInput({ compact = false, provider = "gemini" }: ApiKeyInputProps) {
  const { apiKeys, setProviderKey } = useAgent();
  const currentKey = apiKeys[provider];
  const info = PROVIDER_INFO[provider];

  const [value, setValue] = useState(currentKey);
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setProviderKey(provider, value.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // In compact mode, hide if key is already set
  if (compact && currentKey) return null;

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium text-[var(--foreground)]">
          {info.name} API Key
        </h3>
        <a
          href={info.getKeyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-[var(--accent)] hover:underline"
        >
          Get a key
        </a>
      </div>
      <p className="mb-3 text-xs text-[var(--muted)]">
        {currentKey
          ? "Your key is saved. Enter a new one to replace it."
          : "Enter your API key to start chatting. Keys are stored locally in your browser."}
      </p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type={show ? "text" : "password"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`${info.keyPrefix}...`}
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
