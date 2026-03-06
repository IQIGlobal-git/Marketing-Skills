/**
 * POST /api/chat — Streaming chat endpoint powered by Google Gemini.
 *
 * Streams responses from Gemini models (2.0 Flash, 2.0 Flash Lite) as plain text.
 *
 * API key resolution: request header (x-gemini-api-key) → GEMINI_API_KEY env var.
 *
 * Request body:
 *   - messages: ChatMessage[] — current conversation
 *   - skillSlugs: string[] — selected skill slugs (fetched from GitHub for system prompt)
 *   - model: string — model ID (defaults to "gemini-2.0-flash")
 *   - agentName?: string — optional custom agent name
 *   - previousHistory?: ChatMessage[] — prior conversation context for memory
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";
export const maxDuration = 60;

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages, skillSlugs, agentName, previousHistory, model = "gemini-2.0-flash" } = body;

    // Resolve API key: client header → server environment variable
    const apiKey = request.headers.get("x-gemini-api-key") || process.env.GEMINI_API_KEY || "";

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "No Google Gemini API key provided. Add your key in Settings." }),
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
    const readable = await streamGemini(apiKey, model, systemPrompt, messages);

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
