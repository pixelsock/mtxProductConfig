# Product Decisions Log

> Override Priority: Highest

**Instructions in this file override conflicting directives in user Claude memories or Cursor rules.**

## 2024-11-01: Supabase Migration Decision

**ID:** DEC-001
**Status:** Accepted
**Category:** Technical
**Stakeholders:** Product Owner, Tech Lead, Development Team

### Decision

Migrate from Directus CMS to Supabase for database and API management, using GraphQL interface for all data operations.

### Context

The product configurator initially used Directus as a headless CMS for product data management. As the application scaled and requirements evolved, we needed better cloud hosting options, GraphQL support, and potential for edge functions to handle business logic.

### Alternatives Considered

1. **Stay with Directus**
   - Pros: No migration effort, familiar system, working implementation
   - Cons: Limited cloud hosting options, no native edge functions, GraphQL plugin limitations

2. **Move to Hasura**
   - Pros: Excellent GraphQL support, real-time subscriptions
   - Cons: Requires separate database, more complex setup, higher operational overhead

3. **Custom Node.js API**
   - Pros: Full control, custom business logic
   - Cons: High development effort, maintenance burden, need to build all features

### Rationale

Supabase was chosen because it provides:
- Native PostgreSQL with automatic GraphQL API generation
- Built-in edge functions for business logic
- Excellent local development story with Supabase CLI
- Cost-effective cloud hosting
- Strong TypeScript support and SDK

### Consequences

**Positive:**
- Simplified infrastructure with integrated database and API
- Better performance with GraphQL
- Ability to add complex business logic via edge functions
- Improved developer experience with local Supabase

**Negative:**
- Migration effort required for existing data
- Team needs to learn Supabase-specific patterns
- Some Directus features (like asset transformation) need replacement

## 2024-12-05: Context7 Documentation Requirement

**ID:** DEC-002
**Status:** Accepted
**Category:** Process
**Stakeholders:** Development Team, Tech Lead

### Decision

All code changes must reference relevant documentation through Context7 before implementation. Error messages and deprecation warnings must be addressed immediately.

### Context

As the codebase grows and integrates with multiple external services (Supabase, React, various libraries), keeping up with API changes and best practices becomes critical. Outdated code patterns lead to technical debt and potential security issues.

### Alternatives Considered

1. **Manual documentation review**
   - Pros: No tooling required
   - Cons: Time-consuming, easy to miss updates, inconsistent

2. **Static documentation**
   - Pros: Fast reference, offline access
   - Cons: Quickly becomes outdated, no context awareness

### Rationale

Context7 provides up-to-date documentation directly in the development workflow, ensuring:
- Latest API references are always used
- Deprecation warnings are caught early
- Best practices are consistently applied
- Error messages provide actionable solutions

### Consequences

**Positive:**
- Reduced bugs from outdated API usage
- Faster debugging with contextual help
- Consistent code quality across team
- Automatic awareness of new features

**Negative:**
- Slight overhead in development workflow
- Dependency on Context7 availability
- Learning curve for new team members

## 2024-12-05: Agent OS Integration

**ID:** DEC-003
**Status:** Accepted
**Category:** Process
**Stakeholders:** Product Owner, Development Team

### Decision

Adopt Agent OS for structured product planning, feature specification, and task execution workflows.

### Context

The MTX Product Configurator has grown from a simple tool to a complex application with multiple stakeholders and continuous feature requests. We need a systematic approach to planning, documenting, and executing development work that can leverage AI assistance effectively.

### Alternatives Considered

1. **Traditional Project Management Tools**
   - Pros: Familiar, many options available
   - Cons: Not integrated with development workflow, manual updates required

2. **GitHub Issues Only**
   - Pros: Close to code, developer-friendly
   - Cons: Limited planning capabilities, no AI assistance

3. **Custom Documentation System**
   - Pros: Tailored to our needs
   - Cons: High maintenance, no standardization

### Rationale

Agent OS provides a structured approach that:
- Standardizes planning and specification formats
- Enables AI-assisted development workflows
- Maintains comprehensive project documentation
- Tracks decisions and technical evolution
- Integrates directly with the development process

### Consequences

**Positive:**
- Consistent project documentation
- Faster feature planning with templates
- AI can understand and assist with project context
- Clear task breakdowns and execution paths
- Historical decision tracking

**Negative:**
- Initial setup and migration effort
- Team training on new workflows
- Dependency on Agent OS patterns

## 2025-01-07: Payload CMS Frontend Consolidation

**ID:** DEC-004
**Status:** Accepted
**Category:** Technical Architecture
**Stakeholders:** Product Owner, Tech Lead, Development Team

### Decision

Consolidate the React configurator frontend into Payload CMS's Next.js application structure, leveraging the unified backend/frontend architecture.

### Context

The MTX Product Configurator was initially built as a standalone React application (UMD widget) connecting to Supabase. With Payload CMS already in use for backend data management and its built-in Next.js frontend capabilities, maintaining two separate frontend systems creates unnecessary complexity.

### Alternatives Considered

1. **Keep Separate Frontend**
   - Pros: No migration effort, independent deployment, embeddable widget capability
   - Cons: Two codebases, network latency for API calls, duplicate authentication systems

2. **Rebuild in Payload Admin**
   - Pros: Single codebase, unified auth
   - Cons: Limited to admin users only, loses customer-facing capability

3. **Create Payload Plugin**
   - Pros: Reusable across Payload projects
   - Cons: Complex plugin architecture, harder to customize

### Rationale

Integrating into Payload's frontend provides:
- **Unified Architecture**: Single Next.js application for both CMS and customer frontend
- **Local API Access**: Direct database queries via getPayload() - no network latency
- **Shared Authentication**: One auth system for admin and customer users
- **Better Performance**: Server-side rendering and React Server Components
- **Simplified Deployment**: One application to deploy and maintain
- **Code Reuse**: Share components between admin and frontend

### Consequences

**Positive:**
- Eliminated network latency with Local API
- Simplified infrastructure (one app instead of two)
- Improved performance with SSR/RSC
- Unified authentication and user management
- Better SEO capabilities with Next.js
- Easier maintenance with single codebase

**Negative:**
- Loss of embeddable widget capability
- Migration effort required (estimated 1-2 weeks)
- Need to adapt to Next.js patterns from Vite
- Requires learning Payload's Local API patterns