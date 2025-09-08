# Coding Standards and Conventions

## Existing Standards Compliance

**Code Style:** TypeScript strict mode with 2-space indentation, single quotes for strings, PascalCase for components (ProductCard.tsx), kebab-case for services (directus.ts), consistent import organization with type imports separated

**Linting Rules:** ESLint configuration enforces React hooks rules, TypeScript standards, and import ordering. Current `.eslintrc` shows preference for clean, consistent code organization

**Testing Patterns:** Development-focused validation using browser console tests in `src/test/`, script-based validation tools in `scripts/` directory, no formal test runner but comprehensive data validation patterns

**Documentation Style:** Inline JSDoc comments for complex business logic, comprehensive README-style documentation in CLAUDE.md, detailed architectural documentation with clear examples and code snippets

## Enhancement-Specific Standards

- **OptionRegistry Naming:** Follow existing service patterns - `loadOptionRegistry()`, `getOptionSetMetadata()` using camelCase method naming consistent with `getActiveFrameColors()`
- **Generic Type Safety:** New `getOptions<T>()` function maintains same type guard patterns as existing `validateProductConfiguration()` 
- **Component Props:** Dynamic UI components follow existing prop patterns with destructured interfaces and TypeScript strict typing
- **Error Handling:** New components use same error boundary patterns and graceful fallback mechanisms as existing `ImageWithFallback` component

## Critical Integration Rules

**Existing API Compatibility:** All current functions like `getActiveFrameColors()`, `getProductLines()` remain functional during transition - new `getOptions()` provides alternative path, not replacement initially

**Database Integration:** New collections (sku_formulas, enhanced configuration_ui) use same active boolean filtering and sort field patterns as existing collections

**Error Handling:** Maintain existing error logging patterns and fallback mechanisms - new OptionRegistry cache failures fall back to individual collection fetchers

**Logging Consistency:** Extend existing console logging patterns with same format and detail level - new services log cache hits, validation results, and performance metrics using established patterns
