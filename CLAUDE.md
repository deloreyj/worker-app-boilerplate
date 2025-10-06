# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack application built with React, Vite, Hono, and Cloudflare Workers. It combines a modern React frontend with an edge-computed backend, all deployable to Cloudflare's global network.

**Key Technologies:**
- **React 19** - Frontend UI library
- **Vite** - Build tool and dev server
- **Hono** - Lightweight backend framework running on Cloudflare Workers
- **Cloudflare Workers** - Edge runtime environment
- **Tailwind CSS v4** - Utility-first CSS framework
- **shadcn/ui** - Component library built on Radix UI
- **Vitest** - Testing framework (3 separate test suites)
- **Storybook 9** - Component development environment

## Architecture

### Dual-Context Build System

The project uses a **split compilation model** with three separate TypeScript contexts:

1. **React App** (`src/react-app/`) - Client-side React application
2. **Worker** (`src/worker/`) - Cloudflare Workers backend (Hono API)
3. **Shared Code** (`src/components/`, `src/lib/`, `src/hooks/`) - Reusable UI components and utilities

**TypeScript Configurations:**
- `tsconfig.json` - Root config with project references
- `tsconfig.app.json` - React app config, includes: `src/react-app`, `src/components`, `src/hooks`, `src/lib`, `src/stories`
- `tsconfig.worker.json` - Worker backend config, includes: `src/worker`
- `tsconfig.node.json` - Node/build tooling config

**Important:** When adding new directories under `src/`, update `tsconfig.app.json`'s `include` array to ensure TypeScript can resolve the `@/*` path aliases.

### Build Output Structure

- `dist/client/` - Static React assets (served via Workers Assets)
- `dist/worker/` - Compiled Worker code
- The Worker serves the React app and handles API routes under `/api/*`

### Path Aliases

All imports use the `@/*` alias pointing to `src/`:
```typescript
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
```

## Development Commands

### Primary Workflows

```bash
# Development server (both frontend and backend)
pnpm dev
# Runs on http://localhost:5173

# Storybook (component development)
pnpm storybook
# Runs on http://localhost:6006

# Type checking and dry-run deploy
pnpm check

# Lint code
pnpm lint
```

### Testing

The project has **three separate test suites** with dedicated configs:

```bash
# Run all tests (builds first, then runs all 3 suites)
pnpm test

# Run individual test suites
pnpm test:worker    # Backend/API tests (vitest.worker.config.ts)
pnpm test:ui        # React component tests (vitest.ui.config.ts)
pnpm test:storybook # Storybook component tests (vitest.storybook.config.ts)
```

### Deployment

```bash
# Build for production
pnpm build

# Preview production build locally
pnpm preview

# Deploy to Cloudflare Workers
pnpm deploy

# Monitor deployed worker
npx wrangler tail
```

## Storybook Guidelines

### Story Requirements

**ALWAYS write a Storybook story for any UI component.** Stories should:

1. Import from `@storybook/react-vite` (not `@storybook/react`)
2. Use `storybook/test` for test utilities (not `@storybook/test`)
3. Include `tags: ["autodocs"]` for automatic documentation
4. Be located in `src/stories/` directory

Example story structure:
```typescript
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MyComponent } from "@/components/MyComponent";

const meta = {
  title: "Category/MyComponent",
  component: MyComponent,
  parameters: { layout: "centered" }, // or "fullscreen" for layouts
  tags: ["autodocs"],
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { /* props */ },
};
```

### After Making UI Changes

After modifying any UI component or story, **ALWAYS provide story URLs** to the user using the `mcp__storybook-mcp__get_story_urls` tool. This allows immediate visual inspection of changes.

## Component Development

This project uses component-driven development with a systematic workflow to ensure consistency and reusability.

### Frontend Component Development Workflow

When working on UI components, follow this progressive workflow:

**1. Understand Requirements**
- Clarify design requirements (responsive behavior, accessibility needs, variants needed)
- Identify the component's purpose and scope
- Determine if this is a standalone component, variant, or composition

**2. Check Existing Components**
Review existing component files and Storybook stories:
- **Component exists?** → Use it directly
- **Can compose from existing?** → Compose new component from existing ones + document the pattern
- **Can add variant?** → Extend existing component + update stories
  - Variant criteria: Shares base structure/behavior, won't make component too complex, semantically the same

**3. Check shadcn Registry (MCP Tool)**
If no existing solution, search the shadcn registry:
- Use `search_items_in_registries` to find components
- Use `get_item_examples_from_registries` to get usage examples
- **Found viable option?** → Install via `pnpm dlx shadcn@latest add <component-name>` + create stories
- **Not found?** → Discuss bespoke component approach with user

**4. After Any Addition/Modification**
Always complete these steps:
- Update or create Storybook stories with all variants
- Add Playwright visual/interaction tests in Storybook
- Add Vitest unit tests for component logic (if applicable)
- Run test suites to verify (`pnpm test:storybook`, `pnpm test:ui`)
- Update CLAUDE.md if new pattern is established
- Provide story URLs to user via `mcp__storybook-mcp__get_story_urls` for review

### MCP Servers for Component Development

You have two MCP servers to aid in development:
- **storybook-mcp**: Provides `get_ui_building_instructions` for component development guidance
- **shadcn**: Provides `search_items_in_registries` and `get_item_examples_from_registries` for finding and using shadcn components

### Testing Strategy

**Storybook Tests (vitest.storybook.config.ts)**
- Visual regression tests via Playwright
- Component interaction tests
- Run with: `pnpm test:storybook`

**UI Unit Tests (vitest.ui.config.ts)**
- Component unit tests (props, events, edge cases)
- React component logic testing
- Run with: `pnpm test:ui`

**Integration Tests**
- User flows across multiple components
- End-to-end scenarios
- Included in UI test suite

### shadcn/ui Components

This project uses shadcn/ui components. To add new components:

```bash
pnpm dlx shadcn@latest add <component-name>
```

Components are installed to `src/components/ui/` and can be customized directly.

### Layout Components

Reusable layout components are in `src/components/layouts/`. These should be:
- Generic and reusable
- Accept configuration via props (e.g., `sidebarItems` for `TwoColumnLayout`)
- Have corresponding Storybook stories

### Styling

- Uses Tailwind CSS v4 with `@tailwindcss/vite` plugin
- Dark mode support via `theme-provider.tsx` component
- Custom CSS variables defined in `src/react-app/index.css`
- Use `cn()` utility from `@/lib/utils` for conditional classes

## API Development
You have two backend-focused mcp servers available:
- The cloudflare-bindings mcp server (`cloudflare-bindings`) provides tools to manage all resources on our Cloudflare account
- The cloudflare-docs mcp server (`cloudflare-docs`) provides tools to `get_docs` to get the docs on all Cloudflare services

Whenever you are designing a new feature, you should begin by searching the Cloudflare docs for the product's we'll be using to understand their usage and capabilities. If you need to deploy a new resource on Cloudflare, you should use the `cloudflare-bindings` mcp server to create it, get its ID, and then update our local wrangler.jsonc file to include it.

### Backend Structure

Backend code lives in `src/worker/` using Hono for routing:

```typescript
// src/worker/index.ts
import { Hono } from "hono";

const app = new Hono<{ Bindings: Env }>();

app.get("/api/endpoint", (c) => {
  return c.json({ data: "response" });
});
```

### Shared Types

Type definitions in `src/types/` are shared between frontend and backend:
- `ApiResponse<T>` - Standard API response wrapper
- Add domain types here for end-to-end type safety

## Cloudflare Workers Configuration

Configuration in `wrangler.jsonc`:
- `main` - Entry point: `src/worker/index.ts`
- `assets.directory` - Static assets: `dist/client`
- `assets.not_found_handling` - SPA mode enabled
- `observability.enabled` - Built-in monitoring enabled
- `compatibility_flags: ["nodejs_compat"]` - Node.js compatibility enabled

### Environment-Specific Config

Use `env.staging` or `env.production` blocks in `wrangler.jsonc` for environment-specific settings. This project has no top-level environment. Any wrangler command needs to be scoped to an environment, typically `staging`.

If you ever need to make changes to the `production` environment, then you should manually verify every command with the user to ensure we don't break prod.

## Important Notes

- **Package Manager:** This project uses `pnpm`, not `npm`
- **React Version:** Using React 19 (check compatibility with libraries)
- **Build Before Deploy:** Always run `pnpm build` before `pnpm deploy`
- **Hot Module Replacement:** Available in dev mode for rapid iteration
- **Type Generation:** Run `pnpm cf-typegen` to generate Cloudflare bindings types
- **Barrel Files:** I do not like barrel files. Avoid them wherever possible
- **Prefer jsonc:** use wrangler.jsonc over wrangler.toml or wrangler.json so we can include comments
- **Maintain AI files:** whenever changes are made to the style guide, a new library is introduced, or major changes are made to the codebase, update CLAUDE.md and AGENTS.md so they are always relevant
