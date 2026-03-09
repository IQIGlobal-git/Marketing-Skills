/**
 * ChatInterface — Main chat UI for interacting with the marketing agent.
 *
 * Features:
 * - Real-time streaming responses from multiple AI providers
 * - Model selector dropdown (Gemini, Groq, OpenAI, Anthropic)
 * - Image generation via fal.ai (FLUX models)
 * - Auto-scrolling message list with markdown rendering
 * - Auto-resizing textarea with Enter-to-send (Shift+Enter for newline)
 * - Conversation memory (previous history passed to API for context)
 * - Shows API key banner on 401 errors
 * - Suggested prompt buttons on empty state
 */
"use client";

import { useState, useRef, useEffect } from "react";
import { useAgent } from "@/lib/agent-context";
import { AI_MODELS, FAL_MODELS } from "@/lib/types";
import MessageBubble from "./MessageBubble";
import ApiKeyInput from "./ApiKeyInput";
import ModelSelector from "./ModelSelector";

export default function ChatInterface() {
  const {
    selectedSkills,
    messages,
    addMessage,
    updateLastMessage,
    clearMessages,
    agentName,
    apiKeys,
    selectedModel,
    currentAgentId,
    savedAgents,
  } = useAgent();
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [showImagePrompt, setShowImagePrompt] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [selectedFalModel, setSelectedFalModel] = useState<string>(FAL_MODELS[0].id);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasScrolled = useRef(false);

  useEffect(() => {
    if (!hasScrolled.current && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
      hasScrolled.current = true;
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
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

    let previousHistory: { role: string; content: string }[] = [];
    if (currentAgentId) {
      const savedAgent = savedAgents.find((a) => a.id === currentAgentId);
      if (savedAgent?.chatHistory && savedAgent.chatHistory.length > 0) {
        previousHistory = [];
      }
    }

    const modelInfo = AI_MODELS.find((m) => m.id === selectedModel);
    const provider = modelInfo?.provider || "gemini";
    const providerKey = apiKeys[provider];

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (providerKey) {
        headers[`x-${provider}-api-key`] = providerKey;
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: allMessages,
          skillSlugs: selectedSkills.map((s) => s.slug),
          agentName: agentName || undefined,
          previousHistory: previousHistory.length > 0 ? previousHistory : undefined,
          model: selectedModel,
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

  const generateImage = async () => {
    const prompt = imagePrompt.trim();
    if (!prompt || isGeneratingImage) return;

    const falKey = apiKeys.fal;
    if (!falKey) {
      setShowKeyInput(true);
      return;
    }

    setIsGeneratingImage(true);
    setShowImagePrompt(false);
    setImagePrompt("");

    // Add user message showing what was requested
    addMessage({ role: "user", content: `Generate image: ${prompt}` });
    addMessage({ role: "assistant", content: "Generating image..." });

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-fal-api-key": falKey,
        },
        body: JSON.stringify({
          prompt,
          model: selectedFalModel,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Image generation failed");
      }

      const data = await res.json();
      // Update the last message with the image
      updateLastMessage("");
      // We need to set imageUrl on the last message — replace it
      addMessage({ role: "assistant", content: prompt, imageUrl: data.imageUrl });
    } catch (error) {
      updateLastMessage(
        `Error: ${error instanceof Error ? error.message : "Image generation failed"}`
      );
    } finally {
      setIsGeneratingImage(false);
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

  const messageCount = messages.length;

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
        <div className="ml-auto flex items-center gap-3">
          {messageCount > 0 && (
            <span className="text-[10px] text-[var(--muted)]">
              {messageCount} message{messageCount !== 1 ? "s" : ""}
            </span>
          )}
          <button
            onClick={clearMessages}
            className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            Clear chat
          </button>
        </div>
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

      {/* Image generation prompt panel */}
      {showImagePrompt && (
        <div className="border-t border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="mx-auto max-w-3xl">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--foreground)]">Generate Image</span>
              <div className="flex items-center gap-2">
                <select
                  value={selectedFalModel}
                  onChange={(e) => setSelectedFalModel(e.target.value)}
                  className="rounded border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-[10px] text-[var(--foreground)] outline-none"
                >
                  {FAL_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowImagePrompt(false)}
                  className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  Cancel
                </button>
              </div>
            </div>
            <div className="flex items-end gap-2">
              <input
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") generateImage(); }}
                placeholder="Describe the marketing image you want to generate..."
                className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                autoFocus
              />
              <button
                onClick={generateImage}
                disabled={isGeneratingImage || !imagePrompt.trim()}
                className="rounded-xl bg-purple-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
              >
                {isGeneratingImage ? "..." : "Generate"}
              </button>
            </div>
            {!apiKeys.fal && (
              <p className="mt-2 text-[10px] text-amber-400">
                Add a fal.ai API key in Settings to generate images.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-[var(--border)] p-4">
        <div className="mx-auto max-w-3xl">
          <div className="mb-2 flex items-center justify-between">
            <ModelSelector />
            <button
              onClick={() => setShowImagePrompt(!showImagePrompt)}
              disabled={isStreaming || isGeneratingImage}
              className="flex items-center gap-1 rounded-lg border border-[var(--border)] px-2.5 py-1 text-[11px] text-[var(--muted)] transition-colors hover:bg-[var(--surface)] hover:text-[var(--foreground)] disabled:opacity-50"
              title="Generate an image with fal.ai"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
              <span>Image</span>
            </button>
          </div>
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              placeholder={messages.length > 0 ? "Continue the conversation..." : "Type your message..."}
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
    </div>
  );
}
