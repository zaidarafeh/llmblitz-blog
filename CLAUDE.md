## Project Overview
LLMBlitz Blog (blog.llmblitz.io) — Astro 6 static blog backed by Sanity.io CMS, deployed to Cloudflare Workers.
Dev: `npm run dev` | Build: `npm run build` | Preview: `npm run preview`

## Architecture
- **Pages** live in `src/pages/` — `index.astro` (post list), `posts/[slug].astro` (post detail)
- **All pages are fully static** (`export const prerender = true`). No SSR. Content is fetched from Sanity at build time via `getStaticPaths()`.
- **Sanity client, GROQ queries, and TypeScript types** all live in `src/lib/sanity.ts` — add queries there, not inline in pages.
- **Studio** is a separate app in `/studio/` with its own `package.json`. Run it independently with `cd studio && npm run dev`.

## Content Authoring
Posts are Sanity documents — do not create markdown files. Edit content via the Sanity Studio UI, not in code.

Post schema fields: `title`, `slug` (auto from title), `description` (max 160 chars for SEO), `publishedAt`, `tags[]`, `tool`, `toolHref`, `body` (Portable Text).

Rich block types available in the body editor: Hero Image, Image Pair, Image + Text, Image Block, Code Block, Callout (info/warning/tip), Rich Table.

`/blog-archive/` contains legacy MDX files from before the Sanity migration — do not edit or use them.

## Portable Text Rendering
The `@portabletext/to-html` library renders post bodies. Custom type handlers are defined inline in `posts/[slug].astro`. When adding a new Sanity block type, add its schema to `studio/schemaTypes/` AND its HTML renderer in the page.

Images are served from Sanity's asset CDN via `asset-> { url }` in GROQ — never copy image files into `/public/`.

## Environment Variables
```
PUBLIC_SANITY_PROJECT_ID=8k1laq6c   # public, safe to commit
PUBLIC_SANITY_DATASET=production     # public, safe to commit
SANITY_TOKEN=...                     # editor token — never commit, only needed for migration script
```
The project ID is also hardcoded in `studio/sanity.config.ts` — keep them in sync.

## Styling Conventions
- Hand-written CSS only — no Tailwind, no CSS-in-JS, no component library.
- Global styles in `src/styles/global.css`.
- Accent color: `#22c55e` (green). Fonts: Orbitron (logo), Roboto Mono (nav/code), Inter (body).
- Add component-scoped styles inside `<style>` blocks in `.astro` files.

## Deployment
- `npm run build` outputs to `/dist/` — static assets served by Cloudflare Workers.
- Cloudflare config: `wrangler.jsonc`. API version pinned to `2026-04-10`.
- Studio deploys separately: `cd studio && npm run deploy` (pushes to Sanity cloud).
- OAuth handlers in `/functions/oauth/` are Cloudflare Worker functions — treat as separate from the Astro build.

## TypeScript
- Strict mode via `astro/tsconfigs/strict`.
- Path alias `@/*` → `src/*` — use it instead of relative imports from `src/`.
