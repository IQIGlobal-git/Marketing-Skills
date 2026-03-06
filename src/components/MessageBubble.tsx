/**
 * MessageBubble — Renders a single chat message.
 *
 * User messages: right-aligned, accent color, plain text with whitespace preserved.
 * Assistant messages: left-aligned, surface color, rendered as markdown via react-markdown.
 */
"use client";

import ReactMarkdown from "react-markdown";
import { ChatMessage } from "@/lib/types";

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-[var(--accent)] text-white"
            : "bg-[var(--surface)] text-[var(--foreground)]"
        }`}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
