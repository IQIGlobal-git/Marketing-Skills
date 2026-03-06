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

/** AI provider identifier (Gemini only) */
export type AIProvider = "gemini";

/** Model definition linking a model ID to its display name and provider */
export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
}

/**
 * Available AI models. Users select from these in the ModelSelector dropdown.
 * The model ID is sent to the chat API for Google Gemini.
 */
export const AI_MODELS: AIModel[] = [
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", provider: "gemini" },
  { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash Lite", provider: "gemini" },
];

/** API key storage (Gemini only). Stored in localStorage. */
export interface ApiKeys {
  gemini: string;
}

/** Provider metadata used in the Settings page and ModelSelector UI */
export const PROVIDER_INFO: Record<AIProvider, { name: string; keyPrefix: string; dashboardUrl: string; getKeyUrl: string }> = {
  gemini: { name: "Google Gemini", keyPrefix: "AI", dashboardUrl: "https://aistudio.google.com", getKeyUrl: "https://aistudio.google.com/apikey" },
};
