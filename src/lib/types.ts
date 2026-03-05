export interface Skill {
  slug: string;
  name: string;
  description: string;
  category: string;
  content: string;
}

export interface Category {
  name: string;
  skills: Skill[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface SavedAgent {
  id: string;
  name: string;
  skills: Skill[];
  createdAt: string;
}

export type ThemeName = "midnight" | "snow" | "forest" | "sunset" | "ocean";
