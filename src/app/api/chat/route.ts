/**
 * POST /api/chat — Multi-provider streaming chat endpoint.
 *
 * Supports Google Gemini, Groq, OpenAI, and Anthropic models.
 * The model ID determines which provider SDK is used.
 *
 * API key resolution per provider:
 *   - Client header (x-{provider}-api-key) → server env var ({PROVIDER}_API_KEY)
 *
 * Request body:
 *   - messages: ChatMessage[] — current conversation
 *   - skillSlugs: string[] — selected skill slugs (fetched from GitHub for system prompt)
 *   - model: string — model ID (defaults to "gemini-2.0-flash")
 *   - agentName?: string — optional custom agent name
 *   - previousHistory?: ChatMessage[] — prior conversation context for memory
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { AI_MODELS } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Maps model IDs to their provider */
const MODEL_PROVIDERS: Record<string, string> = {};
for (const m of AI_MODELS) MODEL_PROVIDERS[m.id] = m.provider;

/**
 * Builds the system prompt from skill contents and conversation memory.
 */
function buildSystemPrompt(
  skillContents: { slug: string; content: string }[],
  agentName?: string,
  previousHistory?: { role: string; content: string }[]
): string {
  let memorySection = "";
  if (previousHistory && previousHistory.length > 0) {
    const recentHistory = previousHistory.slice(-40);
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

/** Stream from Google Gemini */
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

/** Stream from Groq (Llama models) */
async function streamGroq(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: { role: string; content: string }[]
): Promise<ReadableStream> {
  const groq = new Groq({ apiKey });
  const stream = await groq.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    ],
    stream: true,
    max_tokens: 4096,
  });
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || "";
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

/** Stream from OpenAI */
async function streamOpenAI(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: { role: string; content: string }[]
): Promise<ReadableStream> {
  const openai = new OpenAI({ apiKey });
  const stream = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    ],
    stream: true,
    max_tokens: 4096,
  });
  const encoder = new TextEncoder();
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || "";
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

/** Stream from Anthropic */
async function streamAnthropic(
  apiKey: string,
  model: string,
  systemPrompt: string,
  messages: { role: string; content: string }[]
): Promise<ReadableStream> {
  const anthropic = new Anthropic({ apiKey });
  const stream = await anthropic.messages.stream({
    model,
    system: systemPrompt,
    messages: messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    max_tokens: 4096,
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, skillSlugs, agentName, previousHistory, model = "gemini-2.0-flash" } = body;

    // Determine provider from model
    const provider = MODEL_PROVIDERS[model] || "gemini";

    // Resolve API key: client header → server environment variable
    const headerKey = request.headers.get(`x-${provider}-api-key`) || "";
    const envKeyMap: Record<string, string> = {
      gemini: process.env.GEMINI_API_KEY || "",
      groq: process.env.GROQ_API_KEY || "",
      openai: process.env.OPENAI_API_KEY || "",
      anthropic: process.env.ANTHROPIC_API_KEY || "",
    };
    const apiKey = headerKey || envKeyMap[provider] || "";

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: `No ${provider} API key provided. Add your key in Settings.` }),
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

    // Route to the correct provider
    let readable: ReadableStream;
    switch (provider) {
      case "groq":
        readable = await streamGroq(apiKey, model, systemPrompt, messages);
        break;
      case "openai":
        readable = await streamOpenAI(apiKey, model, systemPrompt, messages);
        break;
      case "anthropic":
        readable = await streamAnthropic(apiKey, model, systemPrompt, messages);
        break;
      default:
        readable = await streamGemini(apiKey, model, systemPrompt, messages);
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
