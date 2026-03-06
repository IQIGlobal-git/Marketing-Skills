/**
 * SkillDetailModal — Full-screen modal showing a skill's complete details.
 *
 * Displays skill name, category, description, and the full SKILL.md content
 * rendered as markdown. Includes add/remove button for agent skill selection.
 * Closes on backdrop click or close button.
 */
"use client";

import ReactMarkdown from "react-markdown";
import { Skill } from "@/lib/types";
import { useAgent } from "@/lib/agent-context";

interface SkillDetailModalProps {
  skill: Skill;
  onClose: () => void;
}

export default function SkillDetailModal({ skill, onClose }: SkillDetailModalProps) {
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative mx-4 max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-4 pr-8">
          <h2 className="text-xl font-bold text-[var(--foreground)]">{skill.name}</h2>
          <span className="mt-1 inline-block rounded-full bg-[var(--accent-subtle)] px-2.5 py-0.5 text-xs font-medium text-[var(--accent-text)]">
            {skill.category}
          </span>
        </div>

        {/* Description */}
        <p className="mb-4 text-sm text-[var(--muted)]">{skill.description}</p>

        {/* Full content */}
        {skill.content && (
          <div className="mb-6 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
            <div className="prose prose-sm dark:prose-invert max-w-none text-[var(--foreground)]">
              <ReactMarkdown>{skill.content}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${
              selected
                ? "border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                : "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
            }`}
          >
            {selected ? "Remove from Agent" : "Add to Agent"}
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-[var(--border)] px-5 py-2.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
