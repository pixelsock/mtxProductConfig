# Spec Requirements Document

> Spec: Clean Up Unused Code and Fix Preview Build
> Created: 2025-10-11

## Overview

Clean up unused code and components causing type errors in `npm run preview`, and establish a working local development workflow using Wrangler for Edge runtime testing before Webflow Cloud deployment.

## User Stories

### Fix Preview Build for Edge Runtime Testing

As a developer, I want to run `npm run preview` successfully without type errors, so that I can test the Edge runtime configuration locally before deploying to Webflow Cloud.

The current `npm run preview` command (which uses `opennextjs-cloudflare build && opennextjs-cloudflare dev`) is failing with numerous TypeScript errors from unused components and legacy Vite-based code. This prevents local testing of the Edge runtime that will be used in production on Webflow Cloud.

### Clean Up Unused Legacy Code

As a developer, I want to remove unused components and legacy code, so that the codebase is cleaner and builds faster without unnecessary type checking overhead.

There are many unused UI components, legacy Vite configuration remnants, and code from the previous architecture that are no longer needed but are causing type errors during the OpenNext build process.

## Spec Scope

1. **Analyze and identify unused code** - Find components, utilities, and files that are not imported or used anywhere in the active codebase
2. **Remove or disable unused code** - Either delete unused files or exclude them from TypeScript compilation
3. **Fix remaining type errors** - Address any legitimate type errors that prevent the preview build from succeeding
4. **Document preview vs dev workflows** - Clarify when to use `npm run dev` (standard Next.js development) vs `npm run preview` (Edge runtime testing)
5. **Validate Edge runtime compatibility** - Ensure the app runs correctly with Wrangler in the local preview environment

## Out of Scope

- Refactoring active/used components
- Changing the architecture or structure of working features
- Optimizing performance beyond fixing build errors
- Adding new features or functionality

## Expected Deliverable

1. `npm run preview` executes successfully without type errors
2. The configurator loads and functions correctly in the local Edge runtime preview at `http://localhost:8788/config`
3. Clear documentation of which code was removed and why
4. Updated TypeScript configuration if needed to exclude certain directories
5. README section explaining the difference between `npm run dev` and `npm run preview` workflows
