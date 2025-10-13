# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-10-11-cleanup-preview-build/spec.md

## Technical Requirements

### 1. Identify Unused Code

**Analysis Tools:**
- Run `npm run preview` and capture all TypeScript errors
- Use `find-unused-exports` or similar tools to identify unused exports
- Grep for imports to find orphaned files
- Check `/src` directory structure for legacy patterns

**Key Areas to Investigate:**
- UI components in `/src/components/ui/` that are not imported
- Legacy Vite-specific code and utilities
- Duplicate or old Supabase client implementations
- Test utilities and mock data no longer in use
- Old hooks or services superseded by newer implementations

### 2. Remove or Exclude Unused Code

**Approach:**
- **Delete** files that are clearly unused and have no future value
- **Move to archive** files that might be reference material
- **Update tsconfig.json** to exclude specific directories from compilation
- **Add .eslintignore** entries for files to skip linting

**Priority Files/Directories:**
- Legacy components not used in the current app structure
- Old API/service layers replaced by direct Supabase calls
- Test fixtures and mock data not in active test suites
- Devlink components if not actively used

### 3. Fix Type Errors

**Strategy:**
- Address type errors in actively used code
- Ensure imports resolve correctly for the OpenNext build
- Fix any @/* path resolution issues
- Update type definitions that conflict with Next.js 15 types

### 4. Configure Build Exclusions

**TypeScript Configuration:**
```json
{
  "exclude": [
    "node_modules",
    "src/supabase/functions",
    "src/test",
    ".next",
    ".open-next",
    "dist",
    "vite.config.ts.old",
    // Add other directories to exclude
  ]
}
```

**ESLint Configuration:**
- Add `.eslintignore` file if needed
- Configure ESLint to skip archived or legacy code

### 5. Document Workflow Differences

**Create README section explaining:**

**`npm run dev` - Standard Development**
- Uses Next.js development server with Turbopack
- Fast refresh and hot module replacement
- Standard Node.js runtime
- Environment variables from `.env.local`
- Access at `http://localhost:3000/config`

**`npm run preview` - Edge Runtime Testing**
- Uses OpenNext Cloudflare adapter + Wrangler
- Tests Edge runtime compatibility (same as Webflow Cloud production)
- Slower build but accurate production simulation
- Environment variables from Wrangler/Cloudflare bindings
- Access at `http://localhost:8788/config`

**When to use each:**
- Use `dev` for rapid feature development and UI work
- Use `preview` before deploying to verify Edge runtime compatibility
- Always test with `preview` when:
  - Using new npm packages (check Edge compatibility)
  - Modifying API routes
  - Working with environment variables
  - Before pushing to deploy on Webflow Cloud

### 6. Validation Criteria

**Success means:**
- `npm run preview` completes build without errors
- App loads at `http://localhost:8788/config`
- Main configurator features work in preview mode:
  - Product line selection
  - Option configuration
  - SKU generation
  - Quote functionality
- No console errors in browser when running preview
- TypeScript compilation passes for active codebase
