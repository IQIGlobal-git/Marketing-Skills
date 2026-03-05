"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
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
  currentAgentId: string | null;
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
  const [currentAgentId, setCurrentAgentId] = useState<string | null>(() =>
    readLocal<string | null>("current-agent-id", null)
  );
  const [apiKey, setApiKeyState] = useState(() => readLocal<string>("groq-api-key", ""));
  const [theme, setThemeState] = useState<ThemeName>(() => readLocal<ThemeName>("theme", "midnight"));
  const [savedAgents, setSavedAgents] = useState<SavedAgent[]>(() => readLocal<SavedAgent[]>("saved-agents", []));

  // On mount, restore active session from localStorage
  useEffect(() => {
    if (currentAgentId) {
      const stored = readLocal<ChatMessage[]>(`chat-history-${currentAgentId}`, []);
      if (stored.length > 0) {
        setMessages(stored);
      }
    } else {
      // Restore unsaved session chat
      const unsaved = readLocal<ChatMessage[]>("chat-history-unsaved", []);
      if (unsaved.length > 0) {
        setMessages(unsaved);
      }
    }
    // Also restore skills and name for unsaved sessions
    const storedSkills = readLocal<Skill[]>("current-skills", []);
    const storedName = readLocal<string>("current-agent-name", "");
    if (storedSkills.length > 0) {
      setSelectedSkills(storedSkills);
    }
    if (storedName) {
      setAgentName(storedName);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist messages whenever they change (debounced by React batching)
  useEffect(() => {
    // Only persist non-empty message lists and completed messages (not mid-stream empty ones)
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.content === "") return; // mid-stream placeholder

    const key = currentAgentId ? `chat-history-${currentAgentId}` : "chat-history-unsaved";
    writeLocal(key, messages);

    // Also update savedAgent's chatHistory if this is a saved agent
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

  // Persist current skills and name
  useEffect(() => {
    writeLocal("current-skills", selectedSkills);
  }, [selectedSkills]);

  useEffect(() => {
    writeLocal("current-agent-name", agentName);
  }, [agentName]);

  useEffect(() => {
    writeLocal("current-agent-id", currentAgentId);
  }, [currentAgentId]);

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

  const clearSkills = () => {
    setSelectedSkills([]);
    setCurrentAgentId(null);
  };

  const isSelected = (slug: string) =>
    selectedSkills.some((s) => s.slug === slug);

  // Messages
  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

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
    // Also clear from saved agent
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

  // Saved agents
  const saveCurrentAgent = (): string | null => {
    if (selectedSkills.length === 0) return null;

    // If already a saved agent, update it
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
    // Clean up unsaved chat
    writeLocal("chat-history-unsaved", []);
    return agent.id;
  };

  const deleteAgent = (id: string) => {
    const updated = savedAgents.filter((a) => a.id !== id);
    setSavedAgents(updated);
    writeLocal("saved-agents", updated);
    // Clean up chat history
    try { localStorage.removeItem(`chat-history-${id}`); } catch { /* */ }
    if (currentAgentId === id) {
      setCurrentAgentId(null);
    }
  };

  const loadAgent = (agent: SavedAgent) => {
    setSelectedSkills(agent.skills);
    setAgentName(agent.name);
    setCurrentAgentId(agent.id);
    // Restore chat history from saved agent
    const history = agent.chatHistory || readLocal<ChatMessage[]>(`chat-history-${agent.id}`, []);
    setMessages(history);
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
        currentAgentId,
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
