/**
 * POST /api/chat — Streaming chat endpoint with multi-provider LLM support.
 *
 * Accepts a model ID in the request body, determines the provider (Groq, OpenAI,
 * Anthropic, or Gemini), and streams the response back as plain text.
 *
 * API key resolution: request header (x-{provider}-api-key) → environment variable.
 * This allows users to provide personal keys while falling back to server defaults.
 *
 * Request body:
 *   - messages: ChatMessage[] — current conversation
 *   - skillSlugs: string[] — selected skill slugs (fetched from GitHub for system prompt)
 *   - model: string — model ID (e.g., "gpt-4o", "llama-3.3-70b-versatile")
 *   - agentName?: string — optional custom agent name
 *   - previousHistory?: ChatMessage[] — prior conversation context for memory
 */

import Groq from "groq-sdk";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Maps model IDs to their provider for routing */
const MODEL_PROVIDERS: Record<string, string> = {
  "llama-3.3-70b-versatile": "groq",
  "llama-3.1-8b-instant": "groq",
  "gpt-4o": "openai",
  "gpt-4o-mini": "openai",
  "claude-sonnet-4-20250514": "anthropic",
  "claude-haiku-4-5-20251001": "anthropic",
  "gemini-2.0-flash": "gemini",
  "gemini-2.0-flash-lite": "gemini",
};

/**
 * Builds the system prompt from skill contents and conversation memory.
 * Includes behavioral rules that make the agent ask for context before answering.
 */
function buildSystemPrompt(
  skillContents: { slug: string; content: string }[],
  agentName?: string,
  previousHistory?: { role: string; content: string }[]
): string {
  // Build conversation memory section from prior sessions
  let memorySection = "";
  if (previousHistory && previousHistory.length > 0) {
    const recentHistory = previousHistory.slice(-40); // 40 messages = ~20 exchanges
    const memoryLines = recentHistory.map(
      (m) =>
        `${m.role === "user" ? "User" : "Assistant"}: ${m.content.slice(0, 300)}${m.content.length > 300 ? "..." : ""}`
    );
    memorySection = `\n\n=== CONVERSATION MEMORY ===
You have an ongoing relationship with this user from previous conversations. Here is the context from your prior interactions. Use this to maintain continuity, remember their business details, preferences, and any advice you previously gave. Reference this history naturally when relevant.

${memoryLines.join("\n")}
=== END CONVERSATION MEMORY ===`;
  }

  return [
    `You are a marketing expert assistant${agentName ? ` named "${agentName}"` : ""} with specialized skills.

IMPORTANT BEHAVIORAL RULES — follow these for EVERY interaction:
1. Before answering any request, ALWAYS ask the user for relevant context about their business, product, target audience, current situation, and goals. Do not make assumptions — gather information first.
2. ALWAYS clarify what the user is asking for. Restate your understanding of their request and confirm before providing a detailed response.
3. Be conversational and guide the user step by step. Ask focused follow-up questions as needed to give the best possible advice.
4. Only provide a full detailed response AFTER you have gathered sufficient context and confirmed the user's intent.
5. When the user provides context, acknowledge it and use it to tailor your response specifically to their situation.
6. If you have conversation memory from previous sessions, use it to maintain continuity. Reference the user's business, goals, and previous discussions naturally without making the user repeat themselves.

Use the following skill instructions to guide your responses:\n`,
    ...skillContents
      .filter(({ content }) => content)
      .map(
        ({ slug, content }) =>
          `=== SKILL: ${slug} ===\n${content}\n=== END SKILL ===`
      ),
    memorySection,
  ].join("\n\n");
}

// --- Provider-specific streaming functions ---
// Each function creates a client, makes a streaming request, and returns a ReadableStream.

/** Stream chat completion from Groq (Llama models) */
async function streamGroq(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: { role: string; content: string }[]
): Promise<ReadableStream> {
  const groq = new Groq({ apiKey });
  const stream = await groq.chat.completions.create({
    model,
    max_tokens: 4096,
    stream: true,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ],
  });

  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content;
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      } catch (error) {
        console.error("Groq stream error:", error);
        controller.error(error);
      }
    },
  });
}

/** Stream chat completion from OpenAI (GPT models) */
async function streamOpenAI(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: { role: string; content: string }[]
): Promise<ReadableStream> {
  const openai = new OpenAI({ apiKey });
  const stream = await openai.chat.completions.create({
    model,
    max_tokens: 4096,
    stream: true,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ],
  });

  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content;
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      } catch (error) {
        console.error("OpenAI stream error:", error);
        controller.error(error);
      }
    },
  });
}

/** Stream chat completion from Anthropic (Claude models) */
async function streamAnthropic(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: { role: string; content: string }[]
): Promise<ReadableStream> {
  const anthropic = new Anthropic({ apiKey });
  // Anthropic uses a separate 'system' parameter instead of a system message
  const stream = anthropic.messages.stream({
    model,
    max_tokens: 4096,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  });

  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (error) {
        console.error("Anthropic stream error:", error);
        controller.error(error);
      }
    },
  });
}

/** Stream chat completion from Google Gemini */
async function streamGemini(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: { role: string; content: string }[]
): Promise<ReadableStream> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const genModel = genAI.getGenerativeModel({
    model,
    systemInstruction: systemPrompt,
    generationConfig: { maxOutputTokens: 4096 },
  });

  // Gemini uses a chat session with history (all but the last message)
  const geminiHistory = messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" as const : "user" as const,
    parts: [{ text: m.content }],
  }));

  const chat = genModel.startChat({ history: geminiHistory });
  const lastMessage = messages[messages.length - 1];
  const response = await chat.sendMessageStream(lastMessage.content);

  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of response.stream) {
          const text = chunk.text();
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      } catch (error) {
        console.error("Gemini stream error:", error);
        controller.error(error);
      }
    },
  });
}

// --- Main request handler ---

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, skillSlugs, agentName, previousHistory, model = "llama-3.3-70b-versatile" } = body;

    // Determine which provider to use based on the model ID
    const provider = MODEL_PROVIDERS[model] || "groq";

    // Resolve API key: client header → server environment variable
    let apiKey = request.headers.get(`x-${provider}-api-key`) || "";
    if (!apiKey) {
      const envKeys: Record<string, string | undefined> = {
        groq: process.env.GROQ_API_KEY,
        openai: process.env.OPENAI_API_KEY,
        anthropic: process.env.ANTHROPIC_API_KEY,
        gemini: process.env.GEMINI_API_KEY,
      };
      apiKey = envKeys[provider] || "";
    }

    if (!apiKey) {
      const providerNames: Record<string, string> = {
        groq: "Groq", openai: "OpenAI", anthropic: "Anthropic", gemini: "Google Gemini",
      };
      return new Response(
        JSON.stringify({ error: `No ${providerNames[provider]} API key provided. Add your key in Settings.` }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!skillSlugs || skillSlugs.length === 0) {
      return new Response(
        JSON.stringify({ error: "No skills selected" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fetch all selected skill markdown contents from GitHub in parallel
    const skillContents = await Promise.all(
      skillSlugs.map(async (slug: string) => {
        const rawUrl = `https://raw.githubusercontent.com/coreyhaines31/marketingskills/main/skills/${slug}/SKILL.md`;
        const res = await fetch(rawUrl);
        if (!res.ok) {
          console.error(`Failed to fetch skill ${slug}: ${res.status}`);
          return { slug, content: "" };
        }
        const content = await res.text();
        return { slug, content };
      })
    );

    const systemPrompt = buildSystemPrompt(skillContents, agentName, previousHistory);

    // Route to the correct provider's streaming function
    let readable: ReadableStream;
    switch (provider) {
      case "openai":
        readable = await streamOpenAI(apiKey, model, systemPrompt, messages);
        break;
      case "anthropic":
        readable = await streamAnthropic(apiKey, model, systemPrompt, messages);
        break;
      case "gemini":
        readable = await streamGemini(apiKey, model, systemPrompt, messages);
        break;
      default:
        readable = await streamGroq(apiKey, model, systemPrompt, messages);
        break;
    }

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Chat API error:", message, error);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
