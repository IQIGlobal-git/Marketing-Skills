import Groq from "groq-sdk";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const apiKey = request.headers.get("x-groq-api-key") || process.env.GROQ_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "No API key provided. Please enter your Groq API key in settings." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const groq = new Groq({ apiKey });
    const { messages, skillSlugs } = await request.json();

    if (!skillSlugs || skillSlugs.length === 0) {
      return new Response(
        JSON.stringify({ error: "No skills selected" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fetch all selected skill contents directly (avoid Next.js cache issues in route handlers)
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

    // Build system prompt from skills
    const systemPrompt = [
      `You are a marketing expert assistant with specialized skills.

IMPORTANT BEHAVIORAL RULES — follow these for EVERY interaction:
1. Before answering any request, ALWAYS ask the user for relevant context about their business, product, target audience, current situation, and goals. Do not make assumptions — gather information first.
2. ALWAYS clarify what the user is asking for. Restate your understanding of their request and confirm before providing a detailed response.
3. Be conversational and guide the user step by step. Ask focused follow-up questions as needed to give the best possible advice.
4. Only provide a full detailed response AFTER you have gathered sufficient context and confirmed the user's intent.
5. When the user provides context, acknowledge it and use it to tailor your response specifically to their situation.

Use the following skill instructions to guide your responses:\n`,
      ...skillContents
        .filter(({ content }) => content)
        .map(
          ({ slug, content }) =>
            `=== SKILL: ${slug} ===\n${content}\n=== END SKILL ===`
        ),
    ].join("\n\n");

    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 4096,
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content;
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        }
      },
    });

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
