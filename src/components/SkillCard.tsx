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
          ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/30"
          : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
          {skill.name}
        </h3>
        <div
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
            selected
              ? "border-blue-500 bg-blue-500 text-white"
              : "border-zinc-300 dark:border-zinc-600"
          }`}
        >
          {selected && (
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      <span className="inline-block w-fit rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
        {skill.category}
      </span>
      <p className="line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
        {skill.description}
      </p>
    </button>
  );
}
