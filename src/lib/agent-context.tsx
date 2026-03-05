"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { ChatMessage, Skill } from "./types";

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
}

const AgentContext = createContext<AgentContextType | null>(null);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

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
