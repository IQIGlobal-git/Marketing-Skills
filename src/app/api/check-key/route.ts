/**
 * POST /api/check-key — Validates a Google Gemini API key.
 *
 * Makes a minimal request to the Gemini API to verify the key is valid.
 * Request body: { apiKey: string }
 * Returns: { valid: true } or { valid: false, error: string }
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return Response.json({ valid: false, error: "No API key provided" }, { status: 400 });
    }

    // Validate by making a minimal request to Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    await model.generateContent("hi");
    return Response.json({ valid: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid API key";
    return Response.json({ valid: false, error: message });
  }
}
