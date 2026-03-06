/**
 * SkillBrowser — Fetches and displays all marketing skills in a searchable grid.
 *
 * Skills are fetched from /api/skills on mount, then organized by category.
 * Users can search by name/description and filter by category.
 * A floating action bar appears when skills are selected, linking to the agent builder.
 */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skill, Category } from "@/lib/types";
import { useAgent } from "@/lib/agent-context";
import SkillCard from "./SkillCard";

export default function SkillBrowser() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { selectedSkills } = useAgent();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/skills")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch skills");
        return res.json();
      })
      .then((data) => {
        setCategories(data.categories);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filteredCategories = categories
    .map((cat) => ({
      ...cat,
      skills: cat.skills.filter(
        (s: Skill) =>
          (!search ||
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.description.toLowerCase().includes(search.toLowerCase())) &&
          (!activeCategory || cat.name === activeCategory)
      ),
    }))
    .filter((cat) => cat.skills.length > 0);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-[var(--muted)]">Loading skills from GitHub...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <p className="text-red-500">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-[var(--foreground)] px-4 py-2 text-sm text-[var(--background)]"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and filters */}
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Search skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              !activeCategory
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() =>
                setActiveCategory(
                  activeCategory === cat.name ? null : cat.name
                )
              }
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeCategory === cat.name
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Skills grid */}
      {filteredCategories.map((cat) => (
        <div key={cat.name}>
          <h2 className="mb-3 text-lg font-semibold text-[var(--foreground)]">
            {cat.name}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cat.skills.map((skill: Skill) => (
              <SkillCard key={skill.slug} skill={skill} />
            ))}
          </div>
        </div>
      ))}

      {/* Floating action bar */}
      {selectedSkills.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-[var(--border)] bg-[var(--surface)]/90 p-4 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <span className="text-sm text-[var(--muted)]">
              {selectedSkills.length} skill{selectedSkills.length > 1 ? "s" : ""} selected
            </span>
            <button
              onClick={() => router.push("/agent")}
              className="rounded-lg bg-[var(--accent)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
            >
              Build Agent
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
