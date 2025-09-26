# Agent Implementation Guidance: Product Line Default Options Integration

**Feature**: Product Line Default Options Integration  
**For**: AI Development Agents (Claude, GitHub Copilot, etc.)  
**Date**: 2025-09-25

## Constitutional Compliance

This implementation MUST adhere to the MTX Product Configurator Constitution:

### ✅ API-First Architecture
- ALL option loading driven by Supabase API queries
- NO hardcoded product logic in components
- ALL business rules from backend data

### ✅ Zero-Deployment Updates  
- Backend admins can modify product line defaults without code changes
- Product overrides configurable via Supabase admin
- All taxonomy data-driven

### ✅ Real-Time Visual Feedback
- 100ms response time for option changes
- Smooth transitions using CSS animations
- Dynamic SVG updates controlled by API data

### ✅ Rules-Based Logic
- Rules engine queries for all business logic
- NO embedded business rules in UI components  
- All compatibility logic from rules table

### ✅ Type Safety
- Strict TypeScript interfaces for all API contracts
- Zod schemas for runtime validation
- Proper error handling with typed responses

## Implementation Priorities

### 1. Database Integration (CRITICAL)
```typescript
// Priority: Implement M2A relationship queries first
// Location: src/services/productLineOptionsService.ts

const getProductLineDefaultOptions = async (productLineId: string) => {
  // Use Supabase client with proper joins
  // Handle M2A relationship correctly
  // Return typed response with Zod validation
};
```

### 2. State Management Setup
```typescript
// Priority: Zustand store for option state
// Location: src/store/optionsStore.ts

interface ConfiguratorState {
  selectedProductLine: ProductLine | null;
  availableOptionSets: OptionSet[];
  // Focus on computed effective options logic
}
```

### 3. Rules Engine Integration
```typescript
// Priority: Connect to existing rules table
// Location: src/services/rulesEngineService.ts

const filterOptionsByRules = async (
  optionSets: OptionSet[],
  context: ProductContext
) => {
  // Query rules table
  // Apply business logic filtering
  // Return filtered options with reasons
};
```

## Testing Approach with MCP Tools

### DO NOT Create Test Files
- Use Supabase MCP server for database validation
- Use Chrome DevTools MCP for UI testing
- Test performance with browser tools
- Validate schemas with MCP commands

### MCP Testing Workflow
```bash
# 1. Schema validation
supabase-mcp list-tables
supabase-mcp query "SELECT * FROM product_line_default_options LIMIT 5"

# 2. Performance testing  
chrome-mcp performance-start
# Run option switching operations
chrome-mcp performance-stop

# 3. Network monitoring
chrome-mcp network-monitor --filter "supabase"
# Test option loading requests
```

## Critical Implementation Details

### M2A Relationship Handling
```typescript
// CORRECT: Join through junction table
const query = supabase
  .from('product_lines')
  .select(`
    *,
    product_line_default_options (
      option_sets (
        *,
        options (*)
      )
    )
  `)
  .eq('id', productLineId);

// Handle empty results gracefully
const optionSets = data?.product_line_default_options?.map(
  item => item.option_sets
) || [];
```

### Product Override Logic
```typescript
// CRITICAL: Override precedence handling
const computeEffectiveOptions = (
  defaults: OptionSet[],
  overrides: OptionOverride[]
) => {
  const effectiveOptions = [...defaults];
  
  // Override by category - product takes precedence
  overrides.forEach(override => {
    const index = effectiveOptions.findIndex(
      set => set.category === override.category
    );
    if (index >= 0) {
      effectiveOptions[index] = override.optionSet;
    }
  });
  
  return effectiveOptions;
};
```

### Performance Requirements
```typescript
// MUST meet 100ms response time
const loadOptionsWithTimeout = async (productLineId: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 100);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    // Handle timeout gracefully
    if (error.name === 'AbortError') {
      console.warn('Option loading timeout - using cached data');
    }
  }
};
```

### Error Handling Patterns
```typescript
// Constitutional requirement: Graceful error handling
const handleOptionLoadError = (error: Error, context: string) => {
  // Log for admin intervention
  console.error(`Option load error in ${context}:`, error);
  
  // User-friendly fallback
  return {
    success: false,
    message: context === 'product_line_defaults' 
      ? "No options available for this product line"
      : "Configuration error. Admin intervention required."
  };
};
```

## UI Integration Patterns

### Smooth Transitions
```css
/* Use transitions instead of loading spinners */
.option-selector {
  transition: opacity 0.2s ease-in-out;
}

.option-selector.loading {
  opacity: 0.7;
}
```

### State-Driven Components
```typescript
// Connect to Zustand store properly
const ConfiguratorOptions = () => {
  const { 
    availableOptionSets, 
    isLoadingOptions,
    loadOptionsForProduct 
  } = useOptionsStore();
  
  // React to product selection changes
  useEffect(() => {
    if (selectedProduct?.id) {
      loadOptionsForProduct(selectedProduct.id);
    }
  }, [selectedProduct?.id]);
};
```

## Common Pitfalls to Avoid

### ❌ Hardcoded Business Logic
```typescript
// DON'T: Embed product rules in components
if (productLine === 'Deco' && size === 'Large') {
  // This violates constitutional principles
}
```

### ❌ Ignoring M2A Relationships
```typescript
// DON'T: Simple foreign key queries for M2A
const options = await supabase
  .from('option_sets')
  .select('*')
  .eq('product_line_id', id); // Wrong - no M2A support
```

### ❌ Blocking UI During Loads
```typescript
// DON'T: Show loading spinners
setIsLoading(true);
// Use smooth transitions instead
```

## Success Validation

Before considering implementation complete:

1. ✅ All options load from M2A relationship
2. ✅ Product overrides properly supersede defaults  
3. ✅ Rules engine integration working
4. ✅ 100ms response time achieved
5. ✅ Smooth transitions implemented
6. ✅ Error handling for all edge cases
7. ✅ MCP tool validation passed
8. ✅ Constitutional principles followed

## Debugging with MCP Tools

When issues arise:
1. Use Supabase MCP to inspect database queries
2. Use Chrome MCP to monitor network performance
3. Check console for TypeScript/Zod validation errors
4. Monitor React state changes with browser DevTools
5. Validate rule evaluation with MCP query testing

Remember: This integration is a critical part of the API-first architecture. Every decision should prioritize backend-driven configuration over frontend hardcoding.