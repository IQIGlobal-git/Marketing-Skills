/**
 * Global state management via React Context.
 *
 * AgentProvider wraps the entire app and manages:
 * - Selected skills and agent configuration
 * - Chat messages with auto-persistence to localStorage
 * - Google Gemini API key
 * - Selected AI model
 * - Theme preferences
 * - Saved agents (create, update, delete, load)
 *
 * All state is persisted to localStorage for cross-session continuity.
 */
"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { ChatMessage, SavedAgent, Skill, ThemeName, ApiKeys, AIProvider } from "./types";

interface AgentContextType {
  // Skills
  selectedSkills: Skill[];
  addSkill: (skill: Skill) => void;
  removeSkill: (slug: string) => void;
  clearSkills: () => void;
  isSelected: (slug: string) => boolean;
  // Chat
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  updateLastMessage: (content: string) => void;
  clearMessages: () => void;
  // Agent identity
  agentName: string;
  setAgentName: (name: string) => void;
  // Gemini API key (stored in localStorage)
  apiKeys: ApiKeys;
  setProviderKey: (provider: AIProvider, key: string) => void;
  // Model selection
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  // Theme
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  // Saved agents
  savedAgents: SavedAgent[];
  saveCurrentAgent: () => string | null;
  deleteAgent: (id: string) => void;
  loadAgent: (agent: SavedAgent) => void;
  currentAgentId: string | null;
}

const AgentContext = createContext<AgentContextType | null>(null);

const DEFAULT_KEYS: ApiKeys = { gemini: "" };

/** Safely read a JSON value from localStorage with a fallback */
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

/** Safely write a JSON value to localStorage */
function writeLocal(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota exceeded — silently fail */
  }
}

export function AgentProvider({ children }: { children: ReactNode }) {
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [agentName, setAgentName] = useState("");
  const [currentAgentId, setCurrentAgentId] = useState<string | null>(() =>
    readLocal<string | null>("current-agent-id", null)
  );

  // Gemini API key from localStorage
  const [apiKeys, setApiKeys] = useState<ApiKeys>(() => {
    return readLocal<ApiKeys>("api-keys", DEFAULT_KEYS);
  });

  // Currently selected AI model (defaults to Gemini 2.0 Flash)
  const [selectedModel, setSelectedModelState] = useState(() =>
    readLocal<string>("selected-model", "gemini-2.0-flash")
  );

  const [theme, setThemeState] = useState<ThemeName>(() => readLocal<ThemeName>("theme", "midnight"));
  const [savedAgents, setSavedAgents] = useState<SavedAgent[]>(() => readLocal<SavedAgent[]>("saved-agents", []));

  // Restore active session state from localStorage on mount
  useEffect(() => {
    if (currentAgentId) {
      const stored = readLocal<ChatMessage[]>(`chat-history-${currentAgentId}`, []);
      if (stored.length > 0) setMessages(stored);
    } else {
      const unsaved = readLocal<ChatMessage[]>("chat-history-unsaved", []);
      if (unsaved.length > 0) setMessages(unsaved);
    }
    const storedSkills = readLocal<Skill[]>("current-skills", []);
    const storedName = readLocal<string>("current-agent-name", "");
    if (storedSkills.length > 0) setSelectedSkills(storedSkills);
    if (storedName) setAgentName(storedName);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-persist messages to localStorage (skips mid-stream empty placeholders)
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.content === "") return; // mid-stream placeholder, don't persist yet

    const key = currentAgentId ? `chat-history-${currentAgentId}` : "chat-history-unsaved";
    writeLocal(key, messages);

    // Also sync to the savedAgents list if this is a saved agent
    if (currentAgentId) {
      setSavedAgents((prev) => {
        const idx = prev.findIndex((a) => a.id === currentAgentId);
        if (idx === -1) return prev;
        const updated = [...prev];
        updated[idx] = { ...updated[idx], chatHistory: messages };
        writeLocal("saved-agents", updated);
        return updated;
      });
    }
  }, [messages, currentAgentId]);

  // Persist skills, agent name, and agent ID whenever they change
  useEffect(() => { writeLocal("current-skills", selectedSkills); }, [selectedSkills]);
  useEffect(() => { writeLocal("current-agent-name", agentName); }, [agentName]);
  useEffect(() => { writeLocal("current-agent-id", currentAgentId); }, [currentAgentId]);

  // Apply theme to DOM and persist
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    writeLocal("theme", theme);
  }, [theme]);

  /** Set API key for a specific provider and persist to localStorage */
  const setProviderKey = (provider: AIProvider, key: string) => {
    setApiKeys((prev) => {
      const updated = { ...prev, [provider]: key };
      writeLocal("api-keys", updated);
      return updated;
    });
  };

  /** Set the selected AI model and persist to localStorage */
  const setSelectedModel = (model: string) => {
    setSelectedModelState(model);
    writeLocal("selected-model", model);
  };

  const setTheme = (t: ThemeName) => setThemeState(t);

  // --- Skill management ---
  const addSkill = (skill: Skill) => {
    setSelectedSkills((prev) => {
      if (prev.some((s) => s.slug === skill.slug)) return prev; // prevent duplicates
      return [...prev, skill];
    });
  };

  const removeSkill = (slug: string) => {
    setSelectedSkills((prev) => prev.filter((s) => s.slug !== slug));
  };

  const clearSkills = () => {
    setSelectedSkills([]);
    setCurrentAgentId(null);
  };

  const isSelected = (slug: string) =>
    selectedSkills.some((s) => s.slug === slug);

  // --- Chat message management ---
  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  /** Update the last message content (used during streaming to accumulate chunks) */
  const updateLastMessage = useCallback((content: string) => {
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
  }, []);

  const clearMessages = () => {
    setMessages([]);
    const key = currentAgentId ? `chat-history-${currentAgentId}` : "chat-history-unsaved";
    writeLocal(key, []);
    if (currentAgentId) {
      setSavedAgents((prev) => {
        const idx = prev.findIndex((a) => a.id === currentAgentId);
        if (idx === -1) return prev;
        const updated = [...prev];
        updated[idx] = { ...updated[idx], chatHistory: [] };
        writeLocal("saved-agents", updated);
        return updated;
      });
    }
  };

  // --- Saved agent management ---

  /** Save or update the current agent. Returns the agent ID or null if no skills selected. */
  const saveCurrentAgent = (): string | null => {
    if (selectedSkills.length === 0) return null;

    // Update existing saved agent
    if (currentAgentId) {
      setSavedAgents((prev) => {
        const idx = prev.findIndex((a) => a.id === currentAgentId);
        if (idx === -1) return prev;
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          name: agentName.trim() || "Untitled Agent",
          skills: selectedSkills,
          chatHistory: messages,
        };
        writeLocal("saved-agents", updated);
        return updated;
      });
      return currentAgentId;
    }

    // Create new saved agent
    const agent: SavedAgent = {
      id: crypto.randomUUID(),
      name: agentName.trim() || "Untitled Agent",
      skills: selectedSkills,
      createdAt: new Date().toISOString(),
      chatHistory: messages,
    };
    const updated = [...savedAgents, agent];
    setSavedAgents(updated);
    writeLocal("saved-agents", updated);
    setCurrentAgentId(agent.id);
    writeLocal("chat-history-unsaved", []); // Clean up unsaved session
    return agent.id;
  };

  const deleteAgent = (id: string) => {
    const updated = savedAgents.filter((a) => a.id !== id);
    setSavedAgents(updated);
    writeLocal("saved-agents", updated);
    try { localStorage.removeItem(`chat-history-${id}`); } catch { /* */ }
    if (currentAgentId === id) setCurrentAgentId(null);
  };

  /** Load a saved agent into the current session (skills, name, chat history) */
  const loadAgent = (agent: SavedAgent) => {
    setSelectedSkills(agent.skills);
    setAgentName(agent.name);
    setCurrentAgentId(agent.id);
    const history = agent.chatHistory || readLocal<ChatMessage[]>(`chat-history-${agent.id}`, []);
    setMessages(history);
  };

  return (
    <AgentContext.Provider
      value={{
        selectedSkills, addSkill, removeSkill, clearSkills, isSelected,
        messages, addMessage, updateLastMessage, clearMessages,
        agentName, setAgentName,
        apiKeys, setProviderKey,
        selectedModel, setSelectedModel,
        theme, setTheme,
        savedAgents, saveCurrentAgent, deleteAgent, loadAgent,
        currentAgentId,
      }}
    >
      {children}
    </AgentContext.Provider>
  );
}

/** Hook to access the agent context. Must be used within AgentProvider. */
export function useAgent() {
  const ctx = useContext(AgentContext);
  if (!ctx) throw new Error("useAgent must be used within AgentProvider");
  return ctx;
}
