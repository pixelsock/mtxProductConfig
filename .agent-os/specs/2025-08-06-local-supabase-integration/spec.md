# Spec Requirements Document

> Spec: Local Supabase Integration
> Created: 2025-08-06
> Status: Planning

## Overview

Replace the remote pim.dude.digital API endpoint with a local Supabase instance running on localhost:8075 to enable offline development and faster iteration cycles. This will provide developers with a complete local environment for testing and development without dependency on external services.

## User Stories

### Local Development Environment

As a developer, I want to run the configurator against a local Supabase instance, so that I can develop and test features without internet connectivity or affecting production data.

The developer starts their local Supabase instance, runs the configurator application, and all API calls are routed to localhost:8075 instead of the remote pim.dude.digital endpoint. This enables rapid development cycles with instant feedback and the ability to modify database schema and data locally.

### Environment Configuration Management

As a developer, I want to easily switch between local and production environments, so that I can test against different data sets and verify production readiness.

The developer uses environment variables or configuration files to toggle between local (localhost:8075) and production (remote API) endpoints. The application automatically detects which environment is active and routes API calls accordingly, with clear indicators showing which environment is currently in use.

### Data Synchronization

As a team lead, I want to ensure local development data stays consistent with production schema, so that features developed locally work correctly when deployed.

The team uses migration scripts to keep local Supabase instances synchronized with the production schema. Seed data provides consistent test scenarios across all developer environments, ensuring feature parity and reducing integration issues.

## Spec Scope

1. **Environment Configuration** - Create environment-based API endpoint configuration system
2. **Service Layer Updates** - Modify all API service functions to use configurable endpoints
3. **Local Supabase Setup** - Document and automate local Supabase instance configuration
4. **Connection Testing** - Implement health checks for local vs remote connectivity
5. **Developer Documentation** - Create setup guide for local development environment

## Out of Scope

- Production deployment changes
- Database schema modifications
- Authentication system changes
- Data migration from production to local
- Supabase Edge Functions setup

## Expected Deliverable

1. Application connects successfully to localhost:8075 when configured for local development
2. All existing features work identically with local Supabase as with remote API
3. Clear documentation enables any developer to set up local environment in under 10 minutes