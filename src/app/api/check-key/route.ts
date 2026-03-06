/**
 * POST /api/check-key — Validates an API key for a given provider.
 *
 * Makes a minimal request to the provider's API to verify the key is valid.
 * Request body: { apiKey: string, provider: "groq" | "openai" | "anthropic" | "gemini" }
 * Returns: { valid: true } or { valid: false, error: string }
 */

import Groq from "groq-sdk";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
  try {
    const { apiKey, provider = "groq" } = await request.json();

    if (!apiKey) {
      return Response.json({ valid: false, error: "No API key provided" }, { status: 400 });
    }

    // Each provider is validated with a lightweight API call
    switch (provider) {
      case "groq": {
        const groq = new Groq({ apiKey });
        await groq.models.list();
        return Response.json({ valid: true });
      }
      case "openai": {
        const openai = new OpenAI({ apiKey });
        await openai.models.list();
        return Response.json({ valid: true });
      }
      case "anthropic": {
        const anthropic = new Anthropic({ apiKey });
        // No models.list endpoint — validate with a minimal completion
        await anthropic.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1,
          messages: [{ role: "user", content: "hi" }],
        });
        return Response.json({ valid: true });
      }
      case "gemini": {
        const genAI = new GoogleGenerativeAI(apiKey);
        // Validate by making a minimal request
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
        await model.generateContent("hi");
        return Response.json({ valid: true });
      }
      default:
        return Response.json({ valid: false, error: "Unknown provider" });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid API key";
    return Response.json({ valid: false, error: message });
  }
}
