# Marketing Skills Agent Builder

## Project Overview
Next.js web app that fetches marketing skills from `coreyhaines31/marketingskills` GitHub repo, lets users select skills to build custom AI agents, and chat with those agents via multiple AI providers.

## Tech Stack
- **Framework**: Next.js 16+ (App Router, TypeScript)
- **Styling**: Tailwind CSS 4 with CSS custom properties for theming
- **AI Providers**:
  - Groq via `groq-sdk` (Llama 3.3 70B, Llama 3.1 8B) — free tier
  - OpenAI via `openai` (GPT-4o, GPT-4o Mini) — paid
  - Anthropic via `@anthropic-ai/sdk` (Claude Sonnet 4, Claude Haiku 4.5) — paid
  - Google Gemini via `@google/generative-ai` (2.0 Flash, 2.0 Flash Lite) — free tier
- **Skills Source**: GitHub API → `coreyhaines31/marketingskills`
- **Markdown**: `react-markdown` for rendering, `gray-matter` for YAML parsing

## Architecture
- Skills are fetched dynamically from GitHub (cached 1 hour via Next.js revalidate)
- `raw.githubusercontent.com` is used for SKILL.md content (no rate limit)
- GitHub Contents API is used only for directory listing
- Chat streams via server-side API route using provider-specific SDKs
- API key resolution: client header → server environment variable
- Model selection determines which provider handles the request (model → provider mapping in `chat/route.ts`)
- Client state manages skill selection, chat messages, and API keys (no database)
- All state persisted to localStorage with legacy migration support

## Key Directories
- `src/lib/` — Types (with AI model/provider definitions), GitHub fetching, category mapping, React context
- `src/app/api/` — API routes: skills list, multi-provider streaming chat, key validation
- `src/components/` — Reusable UI: SkillBrowser, ChatInterface, ModelSelector, ApiKeyInput, ThemePicker
- `src/app/` — Pages: home, skills browser, agent builder, chat, saved agents, settings

## Commands
- `npm run dev` — Start dev server on localhost:3000
- `npm run build` — Production build
- `npm start` — Start production server
- `npm run lint` — Run ESLint

## Environment Variables
All optional (users can add keys via Settings page):
- `GROQ_API_KEY` — Server-side fallback for Groq
- `OPENAI_API_KEY` — Server-side fallback for OpenAI
- `ANTHROPIC_API_KEY` — Server-side fallback for Anthropic
- `GEMINI_API_KEY` — Server-side fallback for Google Gemini

## Multi-Provider System
- Models are defined in `src/lib/types.ts` (`AI_MODELS` array)
- Provider metadata (name, key prefix, dashboard URLs) in `PROVIDER_INFO`
- API keys stored per-provider in localStorage as `api-keys` JSON object
- Legacy single `groq-api-key` auto-migrated to new format
- `ModelSelector` component lets users switch models in the chat UI
- `/api/chat` route maps model ID → provider and calls the appropriate SDK
- `/api/check-key` route validates keys against all 4 providers
- Settings page shows per-provider key input, validation, and dashboard links

## Category Mapping
Skills from the GitHub repo don't have a category field in their YAML frontmatter. The category mapping is hardcoded in `src/lib/categories.ts` based on the source repo's README. If new skills are added to the repo, update this mapping.

## Theming
5 themes defined in `globals.css` via CSS custom properties on `[data-theme]`:
- midnight (default dark blue), snow (light), forest, sunset, ocean
- Theme flash prevented by inline script in layout.tsx
- ThemePicker dropdown in Header
