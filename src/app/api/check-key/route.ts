import OpenAI from "openai";

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return Response.json({ valid: false, error: "No API key provided" }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey });
    const models = await openai.models.list();

    return Response.json({
      valid: true,
      models: models.data?.map((m) => m.id).slice(0, 5) || [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid API key";
    return Response.json({ valid: false, error: message });
  }
}
