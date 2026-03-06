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

/** Supported AI provider identifiers */
export type AIProvider = "groq" | "openai" | "anthropic" | "gemini";

/** Model definition linking a model ID to its display name and provider */
export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
}

/**
 * Available AI models grouped by provider.
 * Users select from these in the ModelSelector dropdown.
 * The model ID is sent to the chat API which routes to the correct provider.
 */
export const AI_MODELS: AIModel[] = [
  // Groq - free tier, fast inference via custom hardware
  { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B", provider: "groq" },
  { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B", provider: "groq" },
  // OpenAI - high quality, paid
  { id: "gpt-4o", name: "GPT-4o", provider: "openai" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", provider: "openai" },
  // Anthropic - top reasoning, paid
  { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4", provider: "anthropic" },
  { id: "claude-haiku-4-5-20251001", name: "Claude Haiku 4.5", provider: "anthropic" },
  // Google Gemini - free tier available, fast
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "gemini" },
  { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash Lite", provider: "gemini" },
];

/** Per-provider API key storage. Each key is stored separately in localStorage. */
export interface ApiKeys {
  groq: string;
  openai: string;
  anthropic: string;
  gemini: string;
}

/** Provider metadata used in the Settings page and ModelSelector UI */
export const PROVIDER_INFO: Record<AIProvider, { name: string; keyPrefix: string; dashboardUrl: string; getKeyUrl: string }> = {
  groq: { name: "Groq", keyPrefix: "gsk_", dashboardUrl: "https://console.groq.com", getKeyUrl: "https://console.groq.com/keys" },
  openai: { name: "OpenAI", keyPrefix: "sk-", dashboardUrl: "https://platform.openai.com/usage", getKeyUrl: "https://platform.openai.com/api-keys" },
  anthropic: { name: "Anthropic", keyPrefix: "sk-ant-", dashboardUrl: "https://console.anthropic.com/settings/billing", getKeyUrl: "https://console.anthropic.com/settings/keys" },
  gemini: { name: "Google Gemini", keyPrefix: "AI", dashboardUrl: "https://aistudio.google.com", getKeyUrl: "https://aistudio.google.com/apikey" },
};
