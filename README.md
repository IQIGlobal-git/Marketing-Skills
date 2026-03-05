# Marketing Skills Agent Builder

A web application that lets you browse 32+ marketing skills, build custom AI agents with selected expertise, and chat with them in real-time. Powered by Claude and skills from [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills).

## Features

- **Skills Browser** - Browse and search 32+ marketing skills organized by category (SEO, Copywriting, CRO, Paid Ads, Analytics, and more)
- **Agent Builder** - Select one or more skills to create a custom marketing agent
- **Live Chat** - Chat with your agent in real-time with streaming responses
- **Dynamic Skills** - Skills are fetched from GitHub and stay up-to-date automatically

## Skills Source

Skills are imported from [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) via:
```bash
npx skills add coreyhaines31/marketingskills
```

The web app fetches these skills dynamically from GitHub - no manual installation needed.

## Getting Started

### Prerequisites

- Node.js 18+
- An [Anthropic API key](https://console.anthropic.com/)

### Local Development (localhost)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/IQIGlobal-git/Marketing-Skills.git
   cd Marketing-Skills
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` and add your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open the app:**
   Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build (localhost)

```bash
npm run build
npm start
```

The production server runs on [http://localhost:3000](http://localhost:3000) by default.

## Deploy to Vercel

The easiest way to deploy is via Vercel:

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import your repository
3. Add the `ANTHROPIC_API_KEY` environment variable in the Vercel dashboard
4. Click Deploy

Alternatively, deploy via the Vercel CLI:
```bash
npm install -g vercel
vercel
```

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **AI**: [Claude API](https://docs.anthropic.com/) via `@anthropic-ai/sdk`
- **Skills**: Fetched from [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills)

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Homepage
│   ├── skills/page.tsx       # Skills browser
│   ├── agent/
│   │   ├── page.tsx          # Agent builder
│   │   └── chat/page.tsx     # Chat interface
│   └── api/
│       ├── skills/route.ts   # GET: fetch skills from GitHub
│       └── chat/route.ts     # POST: stream Claude responses
├── components/
│   ├── Header.tsx            # Navigation header
│   ├── SkillBrowser.tsx      # Skills grid with filters
│   ├── SkillCard.tsx         # Individual skill card
│   ├── ChatInterface.tsx     # Chat UI with streaming
│   └── MessageBubble.tsx     # Chat message display
└── lib/
    ├── types.ts              # TypeScript interfaces
    ├── categories.ts         # Skill-to-category mapping
    ├── github.ts             # GitHub API data fetching
    └── agent-context.tsx     # React context for app state
```

## Using with Claude Code Desktop

You can also install the marketing skills directly into Claude Code:
```bash
npx skills add coreyhaines31/marketingskills
```

This installs the skills into `.claude/skills/` for use as slash commands in Claude Code.

## License

MIT
