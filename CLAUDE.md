# Marketing Skills Agent Builder

## Project Overview
Next.js web app that fetches marketing skills from `coreyhaines31/marketingskills` GitHub repo, lets users select skills to build custom AI agents, and chat with those agents via the OpenAI API (GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo).

## Tech Stack
- **Framework**: Next.js 14+ (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **AI**: OpenAI API via `openai` SDK (user-selectable model)
- **Skills Source**: GitHub API → `coreyhaines31/marketingskills`

## Architecture
- Skills are fetched dynamically from GitHub (cached 1 hour via Next.js revalidate)
- `raw.githubusercontent.com` is used for SKILL.md content (no rate limit)
- GitHub Contents API is used only for directory listing
- Chat streams via server-side API route (key never exposed to client)
- Client state manages skill selection and chat messages (no database)

## Key Directories
- `src/lib/` - Types, GitHub fetching, category mapping, React context
- `src/app/api/` - API routes (skills list, chat streaming)
- `src/components/` - Reusable UI components
- `src/app/` - Pages (home, skills browser, agent builder, chat)

## Commands
- `npm run dev` - Start dev server on localhost:3000
- `npm run build` - Production build
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables
- `OPENAI_API_KEY` - Required. Set in `.env.local` (not committed). Get one at platform.openai.com/api-keys.

## Category Mapping
Skills from the GitHub repo don't have a category field in their YAML frontmatter. The category mapping is hardcoded in `src/lib/categories.ts` based on the source repo's README. If new skills are added to the repo, update this mapping.
