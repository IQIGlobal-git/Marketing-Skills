# Marketing Skills Agent Builder

## Project Overview
Next.js web app that fetches marketing skills from `coreyhaines31/marketingskills` GitHub repo, lets users select skills to build custom AI agents, and chat with those agents via Google Gemini.

## Tech Stack
- **Framework**: Next.js 16+ (App Router, TypeScript)
- **Styling**: Tailwind CSS 4 with CSS custom properties for theming
- **AI Provider**: Google Gemini via `@google/generative-ai` (2.0 Flash, 2.0 Flash Lite) — free tier available
- **Skills Source**: GitHub API → `coreyhaines31/marketingskills`
- **Markdown**: `react-markdown` for rendering, `gray-matter` for YAML parsing

## Architecture
- Skills are fetched dynamically from GitHub (cached 1 hour via Next.js revalidate)
- `raw.githubusercontent.com` is used for SKILL.md content (no rate limit)
- GitHub Contents API is used only for directory listing
- Chat streams via server-side API route using Google Gemini SDK
- API key resolution: client header (`x-gemini-api-key`) → `GEMINI_API_KEY` env var
- Client state manages skill selection, chat messages, and API key (no database)
- All state persisted to localStorage

## Key Directories
- `src/lib/` — Types (with Gemini model definitions), GitHub fetching, category mapping, React context
- `src/app/api/` — API routes: skills list, Gemini streaming chat, key validation
- `src/components/` — Reusable UI: SkillBrowser, ChatInterface, ModelSelector, ApiKeyInput, ThemePicker
- `src/app/` — Pages: home, skills browser, agent builder, chat, saved agents, settings

## Commands
- `npm run dev` — Start dev server on localhost:3000
- `npm run build` — Production build
- `npm start` — Start production server
- `npm run lint` — Run ESLint

## Environment Variables
All optional (users can add key via Settings page):
- `GEMINI_API_KEY` — Server-side fallback for Google Gemini

## Category Mapping
Skills from the GitHub repo don't have a category field in their YAML frontmatter. The category mapping is hardcoded in `src/lib/categories.ts` based on the source repo's README. If new skills are added to the repo, update this mapping.

## Theming
5 themes defined in `globals.css` via CSS custom properties on `[data-theme]`:
- midnight (default dark blue), snow (light), forest, sunset, ocean
- Theme flash prevented by inline script in layout.tsx
- ThemePicker dropdown in Header
