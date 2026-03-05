"use client";

import { useState } from "react";
import { useAgent } from "@/lib/agent-context";
import ApiKeyInput from "@/components/ApiKeyInput";

export default function SettingsPage() {
  const { apiKey } = useAgent();
  const [checking, setChecking] = useState(false);
  const [keyStatus, setKeyStatus] = useState<"untested" | "valid" | "invalid">("untested");
  const [statusMessage, setStatusMessage] = useState("");

  const checkKey = async () => {
    const keyToCheck = apiKey;
    if (!keyToCheck) {
      setKeyStatus("invalid");
      setStatusMessage("No API key saved. Enter a key above first.");
      return;
    }

    setChecking(true);
    setKeyStatus("untested");
    setStatusMessage("");

    try {
      const res = await fetch("/api/check-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: keyToCheck }),
      });
      const data = await res.json();

      if (data.valid) {
        setKeyStatus("valid");
        setStatusMessage("Key is valid and working.");
      } else {
        setKeyStatus("invalid");
        setStatusMessage(data.error || "Key is invalid.");
      }
    } catch {
      setKeyStatus("invalid");
      setStatusMessage("Failed to validate key. Check your connection.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-[var(--foreground)]">Settings</h1>
      <p className="mb-8 text-sm text-[var(--muted)]">
        Manage your API keys and preferences.
      </p>

      {/* API Key Section */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">API Key</h2>

        <div className="mb-4 rounded-lg border border-[var(--border)] bg-[var(--accent-subtle)] p-3 text-xs text-[var(--accent-text)]">
          A default API key is configured on the server. Your personal key (if provided) will override it, giving you your own usage quota.
        </div>

        <ApiKeyInput />

        {/* Validate & Usage */}
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={checkKey}
            disabled={checking}
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--foreground)] transition-colors hover:bg-[var(--surface)] disabled:opacity-50"
          >
            {checking ? "Checking..." : "Validate Key"}
          </button>

          {keyStatus !== "untested" && (
            <span
              className={`text-xs font-medium ${
                keyStatus === "valid" ? "text-green-400" : "text-red-400"
              }`}
            >
              {keyStatus === "valid" ? "\u2713" : "\u2717"} {statusMessage}
            </span>
          )}
        </div>

        {/* Current key status */}
        <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <h3 className="mb-2 text-sm font-medium text-[var(--foreground)]">Current Key Status</h3>
          <div className="space-y-2 text-xs text-[var(--muted)]">
            <div className="flex justify-between">
              <span>Personal key</span>
              <span className={apiKey ? "text-green-400" : "text-[var(--muted)]"}>
                {apiKey ? `gsk_...${apiKey.slice(-8)}` : "Not set (using server default)"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Server default</span>
              <span className="text-green-400">Available</span>
            </div>
          </div>
        </div>
      </section>

      {/* Usage & Dashboard */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Usage & Billing</h2>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="mb-3 text-sm text-[var(--muted)]">
            View your API usage, rate limits, and billing details on the Groq dashboard.
          </p>
          <a
            href="https://console.groq.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
          >
            Open Groq Dashboard
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </section>

      {/* Info */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">About API Keys</h2>
        <div className="space-y-3 text-sm text-[var(--muted)]">
          <p>
            This app uses the <strong className="text-[var(--foreground)]">Groq API</strong> with the Llama 3.3 70B model to power chat responses.
          </p>
          <p>
            Your personal API key is stored locally in your browser and never sent to our servers. It is only sent directly to Groq when making chat requests.
          </p>
          <p>
            Get a free API key at{" "}
            <a
              href="https://console.groq.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline"
            >
              console.groq.com
            </a>.
          </p>
        </div>
      </section>
    </main>
  );
}
