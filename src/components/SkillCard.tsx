"use client";

import { Skill } from "@/lib/types";
import { useAgent } from "@/lib/agent-context";

interface SkillCardProps {
  skill: Skill;
}

export default function SkillCard({ skill }: SkillCardProps) {
  const { addSkill, removeSkill, isSelected } = useAgent();
  const selected = isSelected(skill.slug);

  const toggle = () => {
    if (selected) {
      removeSkill(skill.slug);
    } else {
      addSkill(skill);
    }
  };

  return (
    <button
      onClick={toggle}
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
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
            selected
              ? "border-[var(--accent)] bg-[var(--accent)] text-white"
              : "border-[var(--muted)]"
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
    </button>
  );
}
