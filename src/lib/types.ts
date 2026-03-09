/**
 * Core type definitions for the Marketing Skills Agent Builder.
 * Shared across components, API routes, and context providers.
 */

/** A marketing skill fetched from the GitHub repository */
export interface Skill {
  slug: string;        // URL-safe identifier (matches the GitHub directory name)
  name: string;        // Human-readable skill name from YAML frontmatter
  description: string; // Brief description from YAML frontmatter
  category: string;    // Assigned category (from categories.ts mapping, not GitHub)
  content: string;     // Full SKILL.md markdown content (used as agent instructions)
}

/** A group of skills under the same category, used for the skills browser */
export interface Category {
  name: string;
  skills: Skill[];
}

/** A single message in the chat conversation */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string; // Optional fal.ai generated image URL
}

/** A saved agent configuration with its associated skills and chat history */
export interface SavedAgent {
  id: string;             // UUID generated on save
  name: string;           // User-defined agent name
  skills: Skill[];        // Selected skills that define this agent's expertise
  createdAt: string;      // ISO date string
  chatHistory: ChatMessage[]; // Persisted conversation for continuity
}

/** Available color themes for the UI */
export type ThemeName = "midnight" | "snow" | "forest" | "sunset" | "ocean";

/** AI provider identifiers for chat models */
export type AIProvider = "gemini" | "groq" | "openai" | "anthropic";

/** Model definition linking a model ID to its display name and provider */
export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
}

/**
 * Available AI models. Users select from these in the ModelSelector dropdown.
 * Grouped by provider in the UI.
 */
export const AI_MODELS: AIModel[] = [
  // Google Gemini (free tier)
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "gemini" },
  { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash Lite", provider: "gemini" },
  // Groq (free tier)
  { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B", provider: "groq" },
  { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B", provider: "groq" },
  // OpenAI (paid)
  { id: "gpt-4o", name: "GPT-4o", provider: "openai" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "openai" },
  // Anthropic (paid)
  { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4", provider: "anthropic" },
  { id: "claude-haiku-4-5-20251001", name: "Claude Haiku 4.5", provider: "anthropic" },
];

/** API key storage per provider. Stored in localStorage. */
export interface ApiKeys {
  gemini: string;
  groq: string;
  openai: string;
  anthropic: string;
  fal: string; // fal.ai key for image generation
}

/** Provider metadata used in the Settings page and ModelSelector UI */
export const PROVIDER_INFO: Record<AIProvider | "fal", { name: string; keyPrefix: string; dashboardUrl: string; getKeyUrl: string }> = {
  gemini: { name: "Google Gemini", keyPrefix: "AI", dashboardUrl: "https://aistudio.google.com", getKeyUrl: "https://aistudio.google.com/apikey" },
  groq: { name: "Groq", keyPrefix: "gsk_", dashboardUrl: "https://console.groq.com", getKeyUrl: "https://console.groq.com/keys" },
  openai: { name: "OpenAI", keyPrefix: "sk-", dashboardUrl: "https://platform.openai.com", getKeyUrl: "https://platform.openai.com/api-keys" },
  anthropic: { name: "Anthropic", keyPrefix: "sk-ant-", dashboardUrl: "https://console.anthropic.com", getKeyUrl: "https://console.anthropic.com/settings/keys" },
  fal: { name: "fal.ai", keyPrefix: "fal_", dashboardUrl: "https://fal.ai/dashboard", getKeyUrl: "https://fal.ai/dashboard/keys" },
};

/** fal.ai image model options */
export const FAL_MODELS = [
  { id: "fal-ai/flux/schnell", name: "FLUX Schnell (Fast)" },
  { id: "fal-ai/flux/dev", name: "FLUX Dev (Quality)" },
] as const;
