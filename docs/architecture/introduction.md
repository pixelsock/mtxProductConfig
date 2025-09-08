# Introduction

This document outlines the architectural approach for enhancing mtxProductConfig with a fully data-driven configurator based on Directus. Its primary goal is to serve as the guiding architectural blueprint for AI-driven development of new features while ensuring seamless integration with the existing system.

**Relationship to Existing Architecture:**
This document supplements existing project architecture by defining how new components will integrate with current systems. Where conflicts arise between new and existing patterns, this document provides guidance on maintaining consistency while implementing enhancements.

## Existing Project Analysis

**Current Project State:**
- **Primary Purpose:** React-based product configurator for mirror/lighting products with quote generation and customer data collection
- **Current Tech Stack:** React 18 + TypeScript + Vite, TailwindCSS + shadcn/ui, Directus SDK v17.0.2 for API integration
- **Architecture Style:** Service layer pattern with centralized API abstraction through `src/services/directus.ts`
- **Deployment Method:** UMD library build for embedding in external websites

**Available Documentation:**
- Comprehensive PRD with epic/story structure (sharded in docs/prd/)
- Brownfield architecture analysis (docs/brownfield-architecture.md)
- Migration history documentation showing complete Supabase→Directus transition
- CLAUDE.md with detailed development standards and API patterns

**Identified Constraints:**
- Must maintain UMD library compatibility for embedding
- Cannot break existing API patterns during enhancement
- Performance must remain under 3-second page load
- Build process uses Vite with TypeScript strict mode

## Change Log
| Date | Version | Description | Author |
|------|---------|-------------|---------|
| 2025-09-05 | 1.0 | Initial brownfield architecture based on PRD | Winston, the Architect |
