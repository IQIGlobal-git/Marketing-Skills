/**
 * Settings page — Manage API keys for all AI providers and fal.ai.
 *
 * Keys are stored in localStorage and never sent to our servers.
 * Keys can be validated with the /api/check-key endpoint.
 */
"use client";

import { useState } from "react";
import { useAgent } from "@/lib/agent-context";
import { AIProvider, PROVIDER_INFO } from "@/lib/types";
import ApiKeyInput from "@/components/ApiKeyInput";

/** Providers displayed in the settings page */
const CHAT_PROVIDERS: AIProvider[] = ["gemini", "groq", "openai", "anthropic"];
const IMAGE_PROVIDERS: (AIProvider | "fal")[] = ["fal"];

export default function SettingsPage() {
  const { apiKeys } = useAgent();
  const [checking, setChecking] = useState<string | null>(null);
  const [keyStatuses, setKeyStatuses] = useState<Record<string, { status: "untested" | "valid" | "invalid"; message: string }>>({});

  /** Validate an API key by calling the server-side check endpoint */
  const checkKey = async (provider: AIProvider | "fal") => {
    const key = apiKeys[provider as keyof typeof apiKeys];
    if (!key) {
      setKeyStatuses((prev) => ({ ...prev, [provider]: { status: "invalid", message: "No API key saved. Enter a key above first." } }));
      return;
    }

    setChecking(provider);
    setKeyStatuses((prev) => ({ ...prev, [provider]: { status: "untested", message: "" } }));

    try {
      const res = await fetch("/api/check-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: key, provider }),
      });
      const data = await res.json();

      if (data.valid) {
        setKeyStatuses((prev) => ({ ...prev, [provider]: { status: "valid", message: "Key is valid and working." } }));
      } else {
        setKeyStatuses((prev) => ({ ...prev, [provider]: { status: "invalid", message: data.error || "Key is invalid." } }));
      }
    } catch {
      setKeyStatuses((prev) => ({ ...prev, [provider]: { status: "invalid", message: "Failed to validate key. Check your connection." } }));
    } finally {
      setChecking(null);
    }
  };

  const renderProvider = (provider: AIProvider | "fal") => {
    const info = PROVIDER_INFO[provider];
    const keyStatus = keyStatuses[provider];
    const key = apiKeys[provider as keyof typeof apiKeys];

    return (
      <section key={provider} className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">{info.name}</h2>

        <ApiKeyInput provider={provider} />

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={() => checkKey(provider)}
            disabled={checking === provider}
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--surface)] disabled:opacity-50"
          >
            {checking === provider ? "Checking..." : "Validate Key"}
          </button>

          {keyStatus && keyStatus.status !== "untested" && (
            <span
              className={`text-xs font-medium ${
                keyStatus.status === "valid" ? "text-green-400" : "text-red-400"
              }`}
            >
              {keyStatus.status === "valid" ? "\u2713" : "\u2717"} {keyStatus.message}
            </span>
          )}
        </div>

        <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="flex justify-between text-xs text-[var(--muted)]">
            <span>Key status</span>
            <span className={key ? "text-green-400" : "text-[var(--muted)]"}>
              {key ? `${info.keyPrefix}...${key.slice(-6)}` : "Not set"}
            </span>
          </div>
        </div>

        <div className="mt-3">
          <a
            href={info.dashboardUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--accent)] hover:underline"
          >
            Open {info.name} Dashboard
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </section>
    );
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-[var(--foreground)]">Settings</h1>
      <p className="mb-8 text-sm text-[var(--muted)]">
        Manage your API keys for chat and image generation. Keys are stored locally in your browser.
      </p>

      {/* Chat Provider Keys */}
      <h2 className="mb-6 text-xl font-bold text-[var(--foreground)]">Chat Models</h2>
      {CHAT_PROVIDERS.map(renderProvider)}

      {/* Image Generation Keys */}
      <h2 className="mb-6 text-xl font-bold text-[var(--foreground)]">Image Generation</h2>
      {IMAGE_PROVIDERS.map(renderProvider)}

      {/* Info Section */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">About API Keys</h2>
        <div className="space-y-3 text-sm text-[var(--muted)]">
          <p>
            This app supports multiple AI providers. Select your preferred model in the chat interface. Free tiers are available for <strong className="text-[var(--foreground)]">Google Gemini</strong> and <strong className="text-[var(--foreground)]">Groq</strong>.
          </p>
          <p>
            <strong className="text-[var(--foreground)]">fal.ai</strong> powers image generation using FLUX models. Add a fal.ai key to generate marketing images directly in the chat.
          </p>
          <p>
            Your API keys are stored locally in your browser and never sent to our servers. They are only sent directly to the respective providers when making requests.
          </p>
        </div>
      </section>
    </main>
  );
}
