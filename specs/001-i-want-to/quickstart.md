# Quickstart: Product Line Default Options Integration

**Feature**: Product Line Default Options Integration  
**Date**: 2025-09-25  
**Estimated Implementation**: 2-3 days

## Getting Started

### Prerequisites
- Node.js and npm installed
- Supabase project access
- Chrome browser (for MCP DevTools testing)
- VS Code with TypeScript support

### Setup Commands
```bash
# Install/verify state management dependencies (2025 best practices)
npm install zustand@latest zod@latest

# Consider modern state management optimizations
# npm install @tanstack/react-query (for remote state caching)
# npm install nuqs (for URL state management)

# Verify Supabase connection
npm run introspect-schema

# Start development server
npm run dev
```

### State Management Strategy (2025 Best Practices)
Based on latest React state management patterns:

**Remote State**: Supabase data with potential TanStack Query wrapper for caching/deduplication  
**Shared State**: Zustand for configuration state (validated as optimal choice)  
**URL State**: Consider nuqs integration for shareable configuration links  
**Local State**: useState for component-specific UI states (dropdowns, tooltips)

### Implementation Checklist

#### Phase 1: Database Queries (Day 1)
- [ ] Create Supabase query functions for M2A relationships
- [ ] Implement product line default options loading
- [ ] Implement product option overrides loading
- [ ] Test queries using Supabase MCP tools
- [ ] Validate response schemas with Zod

#### Phase 2: State Management (Day 1-2)
- [ ] Set up Zustand store for option state
- [ ] Implement option loading actions
- [ ] Add error handling and loading states
- [ ] Create computed selectors for effective options
- [ ] Test state transitions with Chrome DevTools

#### Phase 3: UI Integration (Day 2)
- [ ] Update configurator components to use new store
- [ ] Implement smooth transitions for option changes
- [ ] Add error messaging for missing configurations
- [ ] Test 100ms performance requirement
- [ ] Validate visual feedback with Chrome DevTools

#### Phase 4: Rules Engine Integration (Day 2-3)
- [ ] Connect to existing rules table
- [ ] Implement option filtering based on rules
- [ ] Add rule violation handling
- [ ] Test rule evaluation performance
- [ ] Validate business logic with MCP tools

#### Phase 5: Testing & Validation (Day 3)
- [ ] Test all edge cases defined in spec
- [ ] Validate schema queries with Supabase MCP
- [ ] Test UI interactions with Chrome DevTools MCP
- [ ] Performance testing (100ms requirement)
- [ ] Error handling validation

### Key Files to Modify

```
src/
├── services/
│   ├── productLineOptionsService.ts    # New: API service
│   ├── rulesEngineService.ts           # New: Rules integration
│   └── supabaseClient.ts               # Update: Add new queries
├── store/
│   └── optionsStore.ts                 # New: Zustand store
├── components/
│   ├── ConfiguratorOptions.tsx         # Update: Use new store
│   └── OptionSetSelector.tsx           # Update: Add transitions
└── types/
    └── options.ts                      # Update: Add new interfaces
```

### Testing Strategy with MCP Tools

#### Supabase MCP Testing
```bash
# Validate schema structure
mcp supabase list-tables

# Test M2A relationship queries
mcp supabase query "SELECT * FROM product_line_default_options..."

# Validate rules table structure
mcp supabase describe-table rules
```

#### Chrome DevTools MCP Testing
```bash
# Monitor network performance
mcp chrome network-monitor --filter "supabase"

# Test UI transitions
mcp chrome interact --selector ".option-selector"

# Validate 100ms performance
mcp chrome performance-trace --duration 5s
```

### Configuration

#### Environment Variables
```bash
# Already configured in existing project
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### Zustand Store Configuration
```typescript
// src/store/optionsStore.ts - Basic setup
import { create } from 'zustand';
import { ConfiguratorState } from '../types/options';

export const useOptionsStore = create<ConfiguratorState>((set, get) => ({
  // Initial state
  selectedProductLine: null,
  selectedProduct: null,
  availableOptionSets: [],
  // ... actions implementation
}));
```

### Success Criteria
- [ ] Options load from product_line_default_options M2A field
- [ ] Product overrides properly supersede defaults
- [ ] 100ms response time for option switching
- [ ] Smooth transitions without loading spinners
- [ ] Proper error handling for missing configurations
- [ ] Rules engine integration working
- [ ] All edge cases from spec handled
- [ ] No new test files created (MCP validation only)

### Troubleshooting

#### Common Issues
1. **M2A Query Performance**: Check indexing on junction table
2. **State Update Delays**: Verify Zustand subscriptions
3. **Rules Engine Timeouts**: Check rules table query optimization
4. **UI Transition Glitches**: Validate CSS animation timing

#### MCP Tool Debugging
- Use Supabase MCP to inspect query performance
- Use Chrome MCP to monitor network timing
- Check console for Zod validation errors
- Monitor React DevTools for state changes