import Groq from "groq-sdk";
import { fetchSkillContent } from "@/lib/github";

const groq = new Groq();

export async function POST(request: Request) {
  try {
    const { messages, skillSlugs } = await request.json();

    if (!skillSlugs || skillSlugs.length === 0) {
      return new Response(
        JSON.stringify({ error: "No skills selected" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fetch all selected skill contents
    const skillContents = await Promise.all(
      skillSlugs.map(async (slug: string) => {
        const content = await fetchSkillContent(slug);
        return { slug, content };
      })
    );

    // Build system prompt from skills
    const systemPrompt = [
      "You are a marketing expert assistant with specialized skills. Use the following skill instructions to guide your responses:\n",
      ...skillContents.map(
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
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process chat request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
