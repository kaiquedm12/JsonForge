<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# JsonForge - Project Guide

## Stack
- Next.js 16.2.9 (Turbopack), React 19, TypeScript 5
- Zustand for state management
- Tailwind CSS v4 with Radix UI primitives (shadcn/ui-style)
- Monaco Editor, React Flow (@xyflow/react), dagre for graph layout
- Vitest + Testing Library for unit/integration tests
- Playwright for E2E tests
- Google Gemini API for AI Assistant

## Commands
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm test` - Run unit/integration tests
- `npm run test:watch` - Watch mode
- `npm run test:coverage` - With coverage
- `npm run test:e2e` - E2E tests (requires dev server)
- `npm run lint` - ESLint

## Key Architecture
- `src/lib/` - Pure utility functions (testable, no React)
- `src/stores/` - Zustand stores
- `src/components/` - React components organized by domain
- `src/app/api/` - REST API routes
- `src/types/` - TypeScript type definitions

## Features Added
1. **Vitest + Testing Library** - 66+ tests covering all lib utilities
2. **Playwright E2E** - Browser tests for welcome screen, editor, and API
3. **GitHub Actions CI/CD** - Lint, test, e2e, build pipeline
4. **JSON Schema Validation** - Validate JSON against user-defined schemas (AJV)
5. **AI Assistant** - Google Gemini integration for JSON analysis, transformation, schema generation
6. **JSONPath Query** - Query JSON using JSONPath expressions
7. **Advanced Diff** - Three-way merge and RFC 6902 patch generation
8. **Visual Transformations** - Rename, pick, omit, filter, sort operations
9. **Authentication** - Basic user accounts (localStorage)
10. **i18n** - Portuguese (BR), English (US), Spanish
11. **Custom Themes** - Color picker for background, foreground, primary, muted, border
12. **Sample Data Generator** - Generate mock data from inferred schema
13. **GitHub Gist Sharing** - Direct upload to GitHub Gists
14. **Schema-Aware Editor** - Monaco editor with schema validation hints
15. **Accessibility** - Tooltips on all icon buttons, keyboard navigation

## Environment Variables
- `API_TOKEN` - Auth token for /api/visualize
- `GEMINI_API_KEY` - Google Gemini API key for AI Assistant
