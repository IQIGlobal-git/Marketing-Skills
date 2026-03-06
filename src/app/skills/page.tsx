/** Skills page — Renders the SkillBrowser component for browsing and selecting skills. */
import SkillBrowser from "@/components/SkillBrowser";

export default function SkillsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-[var(--foreground)]">
        Marketing Skills
      </h1>
      <p className="mb-8 text-sm text-[var(--muted)]">
        Select skills to build your custom marketing agent. Skills are loaded
        from GitHub.
      </p>
      <SkillBrowser />
    </main>
  );
}
