"use client";

import { useState } from "react";
import { Skill } from "@/lib/types";
import { useAgent } from "@/lib/agent-context";
import SkillDetailModal from "./SkillDetailModal";

interface SkillCardProps {
  skill: Skill;
}

export default function SkillCard({ skill }: SkillCardProps) {
  const { addSkill, removeSkill, isSelected } = useAgent();
  const selected = isSelected(skill.slug);
  const [showModal, setShowModal] = useState(false);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selected) {
      removeSkill(skill.slug);
    } else {
      addSkill(skill);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`group relative flex flex-col gap-2 rounded-xl border p-4 text-left transition-all ${
          selected
            ? "border-[var(--accent)] bg-[var(--accent-subtle)]"
            : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--muted)]"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            {skill.name}
          </h3>
          <div
            onClick={toggle}
            className={`flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded border transition-colors ${
              selected
                ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                : "border-[var(--muted)] hover:border-[var(--accent)]"
            }`}
          >
            {selected && (
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
        <span className="inline-block w-fit rounded-full bg-[var(--accent-subtle)] px-2 py-0.5 text-[10px] font-medium text-[var(--accent-text)]">
          {skill.category}
        </span>
        <p className="line-clamp-2 text-xs text-[var(--muted)]">
          {skill.description}
        </p>
        <span className="mt-auto text-[10px] text-[var(--accent)] opacity-0 transition-opacity group-hover:opacity-100">
          Click to read more
        </span>
      </button>

      {showModal && (
        <SkillDetailModal skill={skill} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
