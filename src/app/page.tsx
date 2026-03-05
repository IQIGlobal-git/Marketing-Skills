import Link from "next/link";

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
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
          AI-Powered Marketing Expertise
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          Browse 32+ marketing skills, build a custom AI agent with the
          expertise you need, and chat with it instantly. Powered by Claude.
        </p>
        <Link
          href="/skills"
          className="inline-block rounded-lg bg-blue-600 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Browse Skills
        </Link>
      </section>

      {/* How it works */}
      <section className="mb-20">
        <h2 className="mb-8 text-center text-2xl font-bold text-zinc-900 dark:text-white">
          How It Works
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {[
            { step: "1", title: "Browse Skills", desc: "Explore 32+ marketing skills organized by category" },
            { step: "2", title: "Build Your Agent", desc: "Select the skills your agent needs" },
            { step: "3", title: "Start Chatting", desc: "Chat with your custom marketing expert" },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                {item.step}
              </div>
              <h3 className="mb-2 font-semibold text-zinc-900 dark:text-white">
                {item.title}
              </h3>
              <p className="text-sm text-zinc-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories grid */}
      <section>
        <h2 className="mb-8 text-center text-2xl font-bold text-zinc-900 dark:text-white">
          Skill Categories
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href="/skills"
              className="rounded-xl border border-zinc-200 p-5 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
            >
              <h3 className="mb-1 text-sm font-semibold text-zinc-900 dark:text-white">
                {cat.name}
              </h3>
              <p className="mb-2 text-xs text-zinc-500">{cat.desc}</p>
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                {cat.count} skills
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
