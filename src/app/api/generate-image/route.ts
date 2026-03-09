/**
 * POST /api/generate-image — Image generation via fal.ai
 *
 * Uses fal.ai's FLUX models to generate marketing images from text prompts.
 *
 * Request body:
 *   - prompt: string — image description
 *   - model?: string — fal.ai model ID (defaults to "fal-ai/flux/schnell")
 *   - width?: number — image width (default 1024)
 *   - height?: number — image height (default 1024)
 *
 * API key: x-fal-api-key header → FAL_KEY env var
 *
 * Returns: { imageUrl: string } or { error: string }
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      prompt,
      model = "fal-ai/flux/schnell",
      width = 1024,
      height = 1024,
    } = body;

    if (!prompt) {
      return Response.json({ error: "No prompt provided" }, { status: 400 });
    }

    // Resolve fal.ai API key
    const apiKey = request.headers.get("x-fal-api-key") || process.env.FAL_KEY || "";
    if (!apiKey) {
      return Response.json(
        { error: "No fal.ai API key provided. Add your key in Settings." },
        { status: 401 }
      );
    }

    // Call fal.ai REST API directly (no SDK needed server-side)
    const falRes = await fetch(`https://queue.fal.run/${model}`, {
      method: "POST",
      headers: {
        Authorization: `Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        image_size: { width, height },
        num_images: 1,
      }),
    });

    if (!falRes.ok) {
      const errText = await falRes.text();
      console.error("fal.ai error:", falRes.status, errText);
      return Response.json(
        { error: `fal.ai error: ${falRes.status} — ${errText}` },
        { status: falRes.status }
      );
    }

    const data = await falRes.json();

    // fal.ai returns images in data.images array
    const imageUrl = data.images?.[0]?.url || data.image?.url;
    if (!imageUrl) {
      return Response.json(
        { error: "No image returned from fal.ai" },
        { status: 500 }
      );
    }

    return Response.json({ imageUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image generation failed";
    console.error("Image generation error:", message, error);
    return Response.json({ error: message }, { status: 500 });
  }
}
