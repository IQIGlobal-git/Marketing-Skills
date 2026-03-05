"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ChatMessage, SavedAgent, Skill, ThemeName } from "./types";

interface AgentContextType {
  selectedSkills: Skill[];
  addSkill: (skill: Skill) => void;
  removeSkill: (slug: string) => void;
  clearSkills: () => void;
  isSelected: (slug: string) => boolean;
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  updateLastMessage: (content: string) => void;
  clearMessages: () => void;
  agentName: string;
  setAgentName: (name: string) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  savedAgents: SavedAgent[];
  saveCurrentAgent: () => string | null;
  deleteAgent: (id: string) => void;
  loadAgent: (agent: SavedAgent) => void;
}

const AgentContext = createContext<AgentContextType | null>(null);

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const val = localStorage.getItem(key);
    if (val === null) return fallback;
    return JSON.parse(val) as T;
  } catch {
    return fallback;
  }
}

function writeLocal(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota exceeded */
  }
}

export function AgentProvider({ children }: { children: ReactNode }) {
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [agentName, setAgentName] = useState("");
  const [apiKey, setApiKeyState] = useState(() => readLocal<string>("groq-api-key", ""));
  const [theme, setThemeState] = useState<ThemeName>(() => readLocal<ThemeName>("theme", "midnight"));
  const [savedAgents, setSavedAgents] = useState<SavedAgent[]>(() => readLocal<SavedAgent[]>("saved-agents", []));

  // Sync theme to DOM
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    writeLocal("theme", theme);
  }, [theme]);

  // Sync API key to localStorage
  const setApiKey = (key: string) => {
    setApiKeyState(key);
    writeLocal("groq-api-key", key);
  };

  const setTheme = (t: ThemeName) => setThemeState(t);

  // Skills
  const addSkill = (skill: Skill) => {
    setSelectedSkills((prev) => {
      if (prev.some((s) => s.slug === skill.slug)) return prev;
      return [...prev, skill];
    });
  };

  const removeSkill = (slug: string) => {
    setSelectedSkills((prev) => prev.filter((s) => s.slug !== slug));
  };

  const clearSkills = () => setSelectedSkills([]);

  const isSelected = (slug: string) =>
    selectedSkills.some((s) => s.slug === slug);

  // Messages
  const addMessage = (msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  };

  const updateLastMessage = (content: string) => {
    setMessages((prev) => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content,
        };
      }
      return updated;
    });
  };

  const clearMessages = () => setMessages([]);

  // Saved agents
  const saveCurrentAgent = (): string | null => {
    if (selectedSkills.length === 0) return null;
    const agent: SavedAgent = {
      id: crypto.randomUUID(),
      name: agentName.trim() || "Untitled Agent",
      skills: selectedSkills,
      createdAt: new Date().toISOString(),
    };
    const updated = [...savedAgents, agent];
    setSavedAgents(updated);
    writeLocal("saved-agents", updated);
    return agent.id;
  };

  const deleteAgent = (id: string) => {
    const updated = savedAgents.filter((a) => a.id !== id);
    setSavedAgents(updated);
    writeLocal("saved-agents", updated);
  };

  const loadAgent = (agent: SavedAgent) => {
    setSelectedSkills(agent.skills);
    setAgentName(agent.name);
    setMessages([]);
  };

  return (
    <AgentContext.Provider
      value={{
        selectedSkills,
        addSkill,
        removeSkill,
        clearSkills,
        isSelected,
        messages,
        addMessage,
        updateLastMessage,
        clearMessages,
        agentName,
        setAgentName,
        apiKey,
        setApiKey,
        theme,
        setTheme,
        savedAgents,
        saveCurrentAgent,
        deleteAgent,
        loadAgent,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  const ctx = useContext(AgentContext);
  if (!ctx) throw new Error("useAgent must be used within AgentProvider");
  return ctx;
}
