/**
 * POST /api/check-key — Validates API keys for all supported providers.
 *
 * Makes a minimal request to the provider's API to verify the key is valid.
 * Request body: { apiKey: string, provider: "gemini" | "groq" | "openai" | "anthropic" | "fal" }
 * Returns: { valid: true } or { valid: false, error: string }
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(request: Request) {
  try {
    const { apiKey, provider = "gemini" } = await request.json();

    if (!apiKey) {
      return Response.json({ valid: false, error: "No API key provided" }, { status: 400 });
    }

    switch (provider) {
      case "gemini": {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
        await model.generateContent("hi");
        break;
      }
      case "groq": {
        const groq = new Groq({ apiKey });
        await groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: "hi" }],
          max_tokens: 1,
        });
        break;
      }
      case "openai": {
        const openai = new OpenAI({ apiKey });
        await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: "hi" }],
          max_tokens: 1,
        });
        break;
      }
      case "anthropic": {
        const anthropic = new Anthropic({ apiKey });
        await anthropic.messages.create({
          model: "claude-haiku-4-5-20251001",
          messages: [{ role: "user", content: "hi" }],
          max_tokens: 1,
        });
        break;
      }
      case "fal": {
        // Validate fal.ai key by checking account info
        const res = await fetch("https://rest.alpha.fal.ai/tokens/", {
          headers: { Authorization: `Key ${apiKey}` },
        });
        if (!res.ok) throw new Error("Invalid fal.ai API key");
        break;
      }
      default:
        return Response.json({ valid: false, error: `Unknown provider: ${provider}` }, { status: 400 });
    }

    return Response.json({ valid: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid API key";
    return Response.json({ valid: false, error: message });
  }
}
