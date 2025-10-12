# Spec Tasks

## Tasks

- [ ] 1. Analyze codebase and identify unused code
  - [ ] 1.1 Run `npm run preview` and capture all TypeScript error output to a file for analysis
  - [ ] 1.2 Identify unused UI components by checking imports in `/src/components/ui/`
  - [ ] 1.3 Find legacy Vite-specific code and utilities that are no longer needed
  - [ ] 1.4 Locate duplicate or superseded Supabase client implementations
  - [ ] 1.5 Document findings in a cleanup report listing all unused files

- [ ] 2. Remove or exclude unused code from compilation
  - [ ] 2.1 Update `tsconfig.json` to exclude legacy directories and unused code paths
  - [ ] 2.2 Create `.eslintignore` file to skip linting of archived code
  - [ ] 2.3 Delete or move to archive directory: unused UI components
  - [ ] 2.4 Delete or move to archive directory: legacy Vite utilities and test fixtures
  - [ ] 2.5 Verify that removed code is not referenced anywhere in active codebase

- [ ] 3. Fix remaining type errors in active code
  - [ ] 3.1 Run `npm run preview` again and capture any remaining type errors
  - [ ] 3.2 Fix import path resolution issues for @/* aliases in OpenNext build
  - [ ] 3.3 Address type conflicts between Next.js 15 types and existing code
  - [ ] 3.4 Ensure all actively used components have correct type definitions
  - [ ] 3.5 Verify `npm run preview` builds successfully without errors

- [ ] 4. Document development workflows
  - [ ] 4.1 Create or update README section explaining `npm run dev` vs `npm run preview`
  - [ ] 4.2 Document when to use each workflow (rapid dev vs Edge runtime testing)
  - [ ] 4.3 Add troubleshooting tips for common preview build issues
  - [ ] 4.4 Include examples of environment variable differences between dev and preview

- [ ] 5. Validate Edge runtime compatibility
  - [ ] 5.1 Run `npm run preview` and verify app builds successfully
  - [ ] 5.2 Test app at `http://localhost:8788/config` - verify it loads
  - [ ] 5.3 Test product line selection in preview mode
  - [ ] 5.4 Test option configuration and SKU generation in preview mode
  - [ ] 5.5 Test quote functionality in preview mode
  - [ ] 5.6 Check browser console for any runtime errors in preview
  - [ ] 5.7 Document any Edge runtime limitations or differences discovered
