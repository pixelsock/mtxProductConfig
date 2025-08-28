# MTX Product Configurator Documentation

## Current Documentation
- **[CLAUDE.md](../CLAUDE.md)** - Primary SOD rules and guidelines for Claude Code
- **[projectplan.md](../projectplan.md)** - Active project planning and Phase 3 roadmap
- **[api-checks.md](./api-checks.md)** - Terminal-first Directus API/schema validation recipes (keep updated with any schema/rules changes)

## Archive
The `archive/` directory contains historical documentation from completed phases:

### Migration Documentation
- **MIGRATION_COMPLETE.md** - Phase 1 migration summary (static data to API)
- **PHASE2_COMPLETE.md** - Phase 2 enhancement summary (validation & relationships)

### Implementation Guides
- **mcp-removal-guide.md** - Technical guide for removing MCP abstraction
- **static-data-audit.md** - Comprehensive audit of original static data structure
- **task-management.md** - Task management procedures and templates

## Documentation Standards

### Active Files (Root Level)
- **CLAUDE.md** - SOD rules and development guidelines
- **projectplan.md** - Current project status and planning
- **README.md** - Project overview and setup instructions
 - **api-checks.md** - Quick validation commands for live Directus data

### Archive Files (docs/archive/)
- Completed phase summaries
- Historical implementation guides
- Reference documentation

### File Naming Conventions
- **CAPS.md** - Status reports and major milestones
- **kebab-case.md** - Implementation guides and procedures
- **lowercase.md** - Current project documentation

## Usage for Claude Code
The CLAUDE.md file contains all necessary SOD rules for effective development:
- File management standards
- Task management protocols
- API integration requirements
- Quality assurance standards
- Troubleshooting procedures

This structure ensures Claude Code has immediate access to current guidelines while maintaining historical context in the archive.

## Update Policy
- Update `api-checks.md` whenever Directus schema, collections, or rules change, or when new validation patterns are introduced.
- Reference `api-checks.md` before coding tasks to confirm live data shapes and avoid fallback data.
- If a validation reveals drift or errors, fix the Directus configuration or adjust the code—do not add mock data.
