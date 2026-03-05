"use client";

import { useState, useRef, useEffect } from "react";
import { useAgent } from "@/lib/agent-context";
import MessageBubble from "./MessageBubble";
import ApiKeyInput from "./ApiKeyInput";

export default function ChatInterface() {
  const {
    selectedSkills,
    messages,
    addMessage,
    updateLastMessage,
    clearMessages,
    agentName,
    apiKey,
  } = useAgent();
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const userMessage = { role: "user" as const, content: text };
    addMessage(userMessage);

    const allMessages = [...messages, userMessage];
    addMessage({ role: "assistant", content: "" });
    setIsStreaming(true);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (apiKey) {
        headers["x-groq-api-key"] = apiKey;
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: allMessages,
          skillSlugs: selectedSkills.map((s) => s.slug),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        if (res.status === 401) {
          setShowKeyInput(true);
        }
        throw new Error(err.error || "Chat request failed");
      }

      setShowKeyInput(false);
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value);
        updateLastMessage(accumulated);
      }
    } catch (error) {
      updateLastMessage(
        `Error: ${error instanceof Error ? error.message : "Something went wrong"}`
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Agent header bar */}
      <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-2">
        <span className="text-sm font-medium text-[var(--foreground)]">
          {agentName || "Custom Agent"}
        </span>
        <div className="flex flex-wrap gap-1">
          {selectedSkills.map((s) => (
            <span
              key={s.slug}
              className="rounded-full bg-[var(--accent-subtle)] px-2 py-0.5 text-[10px] font-medium text-[var(--accent-text)]"
            >
              {s.name}
            </span>
          ))}
        </div>
        <button
          onClick={clearMessages}
          className="ml-auto text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          Clear chat
        </button>
      </div>

      {/* API key banner */}
      {showKeyInput && (
        <div className="border-b border-[var(--border)] p-4">
          <ApiKeyInput compact />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <h2 className="mb-2 text-lg font-semibold text-[var(--foreground)]">
              Start a conversation
            </h2>
            <p className="mb-6 max-w-md text-sm text-[var(--muted)]">
              Your agent has {selectedSkills.length} skill
              {selectedSkills.length !== 1 ? "s" : ""} loaded. Ask it anything
              about marketing.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                "Help me optimize my landing page",
                "Write a cold email sequence",
                "Audit my SEO strategy",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                    textareaRef.current?.focus();
                  }}
                  className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs text-[var(--muted)] transition-colors hover:bg-[var(--surface)]"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-[var(--border)] p-4">
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
          />
          <button
            onClick={sendMessage}
            disabled={isStreaming || !input.trim()}
            className="rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-50"
          >
            {isStreaming ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
