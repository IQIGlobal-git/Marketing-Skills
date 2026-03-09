/**
 * Homepage — Landing page with hero section, how-it-works steps, and category grid.
 * Categories are hardcoded for fast rendering (not fetched from the API).
 */
import Link from "next/link";

/** Hardcoded category summary for the homepage grid */
const CATEGORIES = [
  { name: "Conversion Optimization", count: 6, desc: "Optimize pages, signups, onboarding, forms, popups, and paywalls" },
  { name: "Content & Copy", count: 5, desc: "Write compelling copy, emails, and social content" },
  { name: "SEO & Discovery", count: 6, desc: "Audit SEO, optimize for AI search, build site architecture" },
  { name: "Paid & Distribution", count: 2, desc: "Create and optimize paid ad campaigns" },
  { name: "Measurement & Testing", count: 2, desc: "Set up analytics tracking and A/B tests" },
  { name: "Growth Engineering", count: 2, desc: "Build free tools and referral programs" },
  { name: "Strategy & Monetization", count: 4, desc: "Marketing ideas, psychology, launch and pricing strategy" },
  { name: "Sales & RevOps", count: 2, desc: "Revenue operations and sales enablement" },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16">
      {/* Hero */}
      <section className="mb-20 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl">
          AI-Powered Marketing Expertise
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-[var(--muted)]">
          Browse 32+ marketing skills, build a custom AI agent with the
          expertise you need, and chat with it instantly. Powered by Gemini, Groq, OpenAI, and Anthropic.
        </p>
        <Link
          href="/skills"
          className="inline-block rounded-lg bg-[var(--accent)] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
        >
          Browse Skills
        </Link>
      </section>

      {/* How it works */}
      <section className="mb-20">
        <h2 className="mb-8 text-center text-2xl font-bold text-[var(--foreground)]">
          How It Works
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {[
            { step: "1", title: "Browse Skills", desc: "Explore 32+ marketing skills organized by category" },
            { step: "2", title: "Build Your Agent", desc: "Select the skills your agent needs" },
            { step: "3", title: "Start Chatting", desc: "Chat with your custom marketing expert" },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-subtle)] text-lg font-bold text-[var(--accent)]">
                {item.step}
              </div>
              <h3 className="mb-2 font-semibold text-[var(--foreground)]">
                {item.title}
              </h3>
              <p className="text-sm text-[var(--muted)]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories grid */}
      <section>
        <h2 className="mb-8 text-center text-2xl font-bold text-[var(--foreground)]">
          Skill Categories
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href="/skills"
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--muted)]"
            >
              <h3 className="mb-1 text-sm font-semibold text-[var(--foreground)]">
                {cat.name}
              </h3>
              <p className="mb-2 text-xs text-[var(--muted)]">{cat.desc}</p>
              <span className="text-xs font-medium text-[var(--accent)]">
                {cat.count} skills
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
