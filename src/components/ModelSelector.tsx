/**
 * ModelSelector — Dropdown to pick the AI model for chat.
 *
 * Shows all available models grouped by provider (Gemini, Groq, OpenAI, Anthropic).
 * Warns when a provider has no API key set.
 * Selection is persisted to localStorage via the agent context.
 */
"use client";

import { useState, useRef, useEffect } from "react";
import { useAgent } from "@/lib/agent-context";
import { AI_MODELS, PROVIDER_INFO } from "@/lib/types";

export default function ModelSelector() {
  const { selectedModel, setSelectedModel, apiKeys } = useAgent();
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

  const current = AI_MODELS.find((m) => m.id === selectedModel) || AI_MODELS[0];
  const providerInfo = PROVIDER_INFO[current.provider];

  // Group models by provider
  const grouped = AI_MODELS.reduce((acc, model) => {
    if (!acc[model.provider]) acc[model.provider] = [];
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, typeof AI_MODELS>);

  const hasKey = (provider: string) => {
    return !!apiKeys[provider as keyof typeof apiKeys];
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-2.5 py-1 text-[11px] text-[var(--muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
      >
        <span className="font-medium">{current.name}</span>
        <span className="text-[9px] opacity-60">{providerInfo.name}</span>
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute bottom-full left-0 z-50 mb-1 w-64 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 shadow-lg">
          {Object.entries(grouped).map(([provider, models]) => (
            <div key={provider}>
              <div className="flex items-center justify-between px-2.5 py-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                  {PROVIDER_INFO[provider as keyof typeof PROVIDER_INFO].name}
                </span>
                {!hasKey(provider) && (
                  <span className="text-[9px] text-amber-400">No key</span>
                )}
              </div>
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    setSelectedModel(model.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-xs transition-colors hover:bg-[var(--accent-subtle)] ${
                    selectedModel === model.id
                      ? "text-[var(--accent)]"
                      : "text-[var(--foreground)]"
                  }`}
                >
                  <span>{model.name}</span>
                  <span className="text-[9px] text-[var(--muted)]">{model.id.length > 25 ? model.id.slice(0, 22) + "..." : model.id}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
