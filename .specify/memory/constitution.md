<!--
Sync Impact Report
==================
Version Change: Initial → 1.0.0 (First constitution creation)

NEW PRINCIPLES:
- I. API-First Architecture (NON-NEGOTIABLE): All configuration options, product definitions, and business rules must be API-driven
- II. Zero-Deployment Updates: Backend administrators can modify products without frontend deployments 
- III. Real-Time Visual Feedback: Dynamic SVG rendering based on backend rules
- IV. Rules-Based Configuration Logic: All business logic processed from backend-defined rules
- V. Type Safety Throughout: Strict TypeScript typing with runtime validation

NEW SECTIONS:
- Technical Standards: Performance, security, and technology stack requirements
- Development Workflow: API-first design, TDD, and code review requirements  

TEMPLATES UPDATED:
✅ .specify/templates/plan-template.md - Constitution Check section updated with specific gates (v1.0.0)
⚠ .specify/templates/spec-template.md - No updates required (constitution-agnostic)
⚠ .specify/templates/tasks-template.md - No updates required (constitution-agnostic)

FOLLOW-UP TODOS:
- None - all placeholders resolved
-->

# MTX Product Configurator Constitution

## Core Principles

### I. API-First Architecture (NON-NEGOTIABLE)
All configuration options, product definitions, and business rules MUST be driven by API data from Supabase. No hard-coded product logic, compatibility rules, or SKU generation in the frontend code. The configurator adapts its behavior entirely based on real-time API responses.

**Rationale**: This enables zero-deployment product updates and ensures the frontend remains a pure presentation layer that can adapt to any backend changes without code modifications.

### II. Zero-Deployment Updates
Backend administrators MUST be able to add new product lines, modify options, change business rules, and update pricing without requiring frontend code changes or deployments. All product taxonomy and relationships are data-driven.

**Rationale**: Reduces time-to-market for new products and eliminates development bottlenecks for business changes.

### III. Real-Time Visual Feedback
All configuration changes MUST provide instant visual feedback through dynamic SVG rendering. Visual styling rules and image selection are controlled by backend data, not hardcoded in components.

**Rationale**: Reduces customer revision requests by 60% and provides immediate validation of configuration choices.

### IV. Rules-Based Configuration Logic
All product compatibility, option filtering, and availability logic MUST be processed from backend-defined rules stored in Supabase. No business logic embedded in UI components.

**Rationale**: Ensures consistent business rules across all touchpoints and enables A/B testing of different rule configurations.

### V. Type Safety Throughout
All API contracts, data models, and component interfaces MUST be strictly typed using TypeScript. Runtime validation required for all external data using Zod schemas.

**Rationale**: Prevents configuration errors and ensures reliable product quotes, critical for customer trust and order accuracy.

## Technical Standards

All features must maintain compatibility with the established technology stack: React 18 + TypeScript + Vite frontend, Supabase backend with PostgreSQL database. Performance targets include sub-200ms configuration updates and real-time SVG rendering at 60fps. API responses must be cached appropriately to minimize database load while ensuring data freshness.

Security requirements mandate that all customer data collection follows configured backend field definitions, with proper validation and sanitization. Product pricing and availability calculations must use server-side validation to prevent manipulation.

## Development Workflow

All new features require API-first design: define Supabase schema changes first, then implement frontend consumption. Test-driven development is required for all business logic components, with integration tests covering API contract changes and cross-product compatibility scenarios.

Code reviews must verify: no hardcoded product logic, proper TypeScript usage, API-driven behavior, and real-time visual updates. Performance impact assessment required for any changes affecting configuration rendering or API query patterns.

## Governance

This Constitution supersedes all other development practices and guidelines. All pull requests and code reviews must verify compliance with these principles, particularly the API-first architecture and zero-deployment requirements.

Amendments to this Constitution require documentation of the rationale, approval from project maintainers, and a migration plan for any affected code. Complexity that violates these principles must be justified with specific business requirements and approved exceptions.

Use `AGENTS.md` for runtime development guidance and agent-specific implementation patterns.

**Version**: 1.0.0 | **Ratified**: 2025-09-25 | **Last Amended**: 2025-09-25