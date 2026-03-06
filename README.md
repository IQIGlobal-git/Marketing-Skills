# Marketing Skills Agent Builder

A web application that lets you browse 32+ marketing skills, build custom AI agents with selected expertise, and chat with them in real-time. Powered by **Google Gemini** (2.0 Flash and 2.0 Flash Lite).

Skills sourced from [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills).

## Features

- **Skills Browser** — Browse and search 32+ marketing skills organized by 10 categories (SEO, Copywriting, CRO, Paid Ads, Analytics, and more)
- **Agent Builder** — Select skills to create a custom marketing agent with a name and persona
- **Live Chat with Streaming** — Chat in real-time with streaming responses from Google Gemini
- **Model Selector** — Switch between Gemini 2.0 Flash and Gemini 2.0 Flash Lite
- **Saved Agents** — Save agent configurations with full chat history for later use
- **Conversation Memory** — Agents maintain context across sessions via persisted chat history
- **5 Color Themes** — Midnight (dark blue), Snow (light), Forest (dark green), Sunset (dark orange), Ocean (dark cyan)
- **Local Storage Persistence** — API key, preferences, agents, and chat history stored in the browser
- **Dynamic Skills** — Skills are fetched from GitHub and stay up-to-date automatically (cached 1 hour)

## How It Works

1. **Browse Skills** — Explore 32+ marketing skills organized by category
2. **Build Your Agent** — Select the skills your agent needs and give it a name
3. **Start Chatting** — Chat with your custom marketing expert with real-time streaming

## Getting Started

### Prerequisites

- Node.js 18+
- A [Google Gemini API key](https://aistudio.google.com/apikey) (free tier available)

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/IQIGlobal-git/Marketing-Skills.git
   cd Marketing-Skills
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables (optional server-side default):**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local`:
   ```
   GEMINI_API_KEY=your-gemini-api-key-here
   ```
   > Note: Users can also add their key in Settings. The server key is an optional fallback.

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open the app:** Visit [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

## Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import your repository
3. Add the `GEMINI_API_KEY` environment variable in the Vercel dashboard
4. Click Deploy

Alternatively:
```bash
npm install -g vercel
vercel
```

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, TypeScript)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with CSS custom properties for theming
- **AI**: [Google Gemini](https://ai.google.dev/) via `@google/generative-ai` — Gemini 2.0 Flash, Gemini 2.0 Flash Lite
- **Skills Source**: [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) fetched via GitHub API
- **Markdown**: `react-markdown` for rendering skill content and chat responses
- **Frontmatter**: `gray-matter` for parsing SKILL.md YAML metadata

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                # Root layout (AgentProvider, Header, theme flash prevention)
│   ├── page.tsx                  # Homepage (hero, how-it-works, category grid)
│   ├── globals.css               # 5 color themes via CSS custom properties
│   ├── skills/page.tsx           # Skills browser page
│   ├── agent/
│   │   ├── page.tsx              # Agent builder (name, review skills, save)
│   │   └── chat/page.tsx         # Chat interface page
│   ├── agents/page.tsx           # Saved agents list
│   ├── settings/page.tsx         # Gemini API key management
│   └── api/
│       ├── skills/route.ts       # GET: fetch & categorize skills from GitHub
│       ├── chat/route.ts         # POST: streaming chat via Google Gemini
│       └── check-key/route.ts    # POST: validate Gemini API key
├── components/
│   ├── Header.tsx                # Navigation bar with badge counters
│   ├── SkillBrowser.tsx          # Skills grid with search and category filters
│   ├── SkillCard.tsx             # Individual skill card with selection checkbox
│   ├── SkillDetailModal.tsx      # Full skill detail modal with markdown content
│   ├── ChatInterface.tsx         # Chat UI with streaming and model selector
│   ├── MessageBubble.tsx         # Chat message renderer (markdown for assistant)
│   ├── ModelSelector.tsx         # Gemini model selector dropdown
│   ├── ApiKeyInput.tsx           # Gemini API key input component
│   └── ThemePicker.tsx           # Color theme switcher dropdown
└── lib/
    ├── types.ts                  # TypeScript types, Gemini model definitions
    ├── categories.ts             # Skill-to-category mapping (hardcoded from repo README)
    ├── github.ts                 # GitHub API integration for fetching skills
    └── agent-context.tsx         # React Context for global state (skills, chat, key, theme)
```

## Architecture

### Data Flow

```
GitHub Repo (coreyhaines31/marketingskills)
    ↓ fetched via raw.githubusercontent.com (cached 1 hour)
/api/skills → organizes into categories
    ↓
SkillBrowser → SkillCard → selection stored in AgentContext
    ↓
Agent Builder → name + review skills
    ↓
ChatInterface → sends to /api/chat with selected Gemini model
    ↓
/api/chat → Google Gemini streaming response
    ↓
MessageBubble → renders markdown
    ↓
localStorage → persists everything for next session
```

### API Key Resolution

The chat API resolves the Gemini key in this order:
1. **Client header** (`x-gemini-api-key`) — user's personal key from Settings
2. **Server environment variable** (`GEMINI_API_KEY`) — server-side fallback

### Category Mapping

Skills from the GitHub repo don't include categories in their YAML frontmatter. Categories are mapped in `src/lib/categories.ts` based on the repo's README. If new skills are added upstream, this file must be updated.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on localhost:3000 |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Using with Claude Code Desktop

You can also install the marketing skills directly into Claude Code:
```bash
npx skills add coreyhaines31/marketingskills
```

This installs the skills into `.claude/skills/` for use as slash commands in Claude Code.

## License

MIT
