# TypeScript Patterns & Standards

## Context

Project-specific TypeScript patterns for the MTX Product Configurator's dynamic, API-driven architecture.

## Naming Conventions

### Variables and Functions
- Use **camelCase** for variables, functions, and methods
- Use descriptive names that indicate purpose and data type
```typescript
// ✅ Good
const currentSelections = useCurrentSelections();
const updateConfiguration = useUpdateConfiguration();
const isLoadingProductOptions = false;

// ❌ Avoid
const current_selections = getCurrentSelections();
const data = useData();
const flag = false;
```

### Types and Interfaces
- Use **PascalCase** for types, interfaces, and classes
- Prefix interfaces with descriptive domain terms
- Use discriminated unions for API responses
```typescript
// ✅ Good
export interface ProductConfiguration {
  id: string;
  productLineId: number;
  mirrorStyle: string;
  frameColor: string;
}

export type APIResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

// ❌ Avoid
interface config {
  id: string;
}
```

## State Management Patterns (Zustand)

### Store Structure
- Use slice-based architecture for complex stores
- Separate state, actions, and computed values
- Use granular selector hooks to prevent unnecessary re-renders

```typescript
// Store definition with slices
export const useConfiguratorStore = create<ConfiguratorStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...createConfigurationSlice(set, get),
      ...createAPISlice(set, get),
      ...createUISlice(set, get),
    }))
  )
);

// Granular selectors
export const useCurrentConfig = () =>
  useConfiguratorStore((state) => state.currentConfig);
export const useProductOptions = () =>
  useConfiguratorStore((state) => state.productOptions);
```

### Action Patterns
- Use async actions for API operations
- Include loading and error states
- Provide clear action names that describe the operation

```typescript
// Async actions with error handling
loadProductLineOptions: async (productLine: ProductLine) => {
  const { setLoadingProductLine, setError, setProductOptions } = get();

  try {
    setLoadingProductLine(true);
    setError(null);

    const options = await fetchProductOptions(productLine.id);
    setProductOptions(options);

    // Initialize configuration after loading options
    const { resetConfiguration } = get();
    resetConfiguration();
  } catch (error) {
    setError(error instanceof Error ? error.message : 'Failed to load options');
  } finally {
    setLoadingProductLine(false);
  }
}
```

## Database Integration Patterns (Supabase)

### Type-Safe Queries
- Use generated TypeScript types from database schema
- Implement graceful fallbacks for enhanced functions
- Handle errors consistently across all database operations

```typescript
// Type-safe database queries
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('product_line_id', productLineId)
  .eq('active', true);

if (error) {
  throw new Error(`Database query failed: ${error.message}`);
}
```

### Fallback Patterns
- Always provide fallback mechanisms for enhanced database functions
- Use simulation when real data is unavailable
- Log fallback usage for debugging

```typescript
// Graceful fallback implementation
try {
  const { data: enhancedData, error: enhancedError } = await supabase
    .rpc('get_dynamic_options', params);

  if (!enhancedError && enhancedData) {
    return enhancedData;
  }

  // Fallback to simulation
  console.warn('Enhanced function unavailable, using simulation');
  return await this.simulateDynamicOptions(productLineId, currentSelections);
} catch (error) {
  console.error('Database operation failed:', error);
  return await this.simulateDynamicOptions(productLineId, currentSelections);
}
```

## API-Driven Architecture Patterns

### Dynamic Configuration
- Load all configuration options from the API
- Never hard-code business logic in the frontend
- Adapt UI based on backend-provided configuration

```typescript
// Configuration-driven UI rendering
const renderConfigurationOptions = (options: ConfigurationOptions) => {
  return options.map((option) => {
    switch (option.ui_type) {
      case 'single':
        return <SingleSelectOption key={option.id} option={option} />;
      case 'multi':
        return <MultiSelectOption key={option.id} option={option} />;
      case 'grid':
        return <GridOption key={option.id} option={option} />;
      default:
        return <DefaultOption key={option.id} option={option} />;
    }
  });
};
```

### Error Handling
- Provide meaningful error messages to users
- Log detailed errors for debugging
- Gracefully degrade functionality when possible

```typescript
// Comprehensive error handling
const handleApiError = (error: unknown, context: string) => {
  const message = error instanceof Error ? error.message : 'Unknown error';

  console.error(`${context}: ${message}`, error);

  // User-friendly message
  setError(`Unable to load ${context.toLowerCase()}. Please try again.`);

  // Optional: Report to error tracking service
  errorTracker.captureException(error, { context });
};
```

## Performance Optimization Patterns

### Memoization
- Use React.useMemo for expensive computations
- Memoize complex objects to prevent unnecessary re-renders
- Cache API responses with appropriate TTL

```typescript
// Memoized computed values
const configurationSummary = useMemo(() => {
  if (!currentConfig || !productOptions) return null;

  return {
    productName: generateProductName(currentConfig),
    totalPrice: calculatePrice(currentConfig),
    isValid: validateConfiguration(currentConfig),
  };
}, [currentConfig, productOptions]);
```

### Selective Subscriptions
- Use shallow comparison for Zustand selectors
- Subscribe only to necessary state slices
- Avoid subscribing to entire store

```typescript
// Selective state subscription
const { isLoading, error } = useConfiguratorStore(
  useShallow((state) => ({
    isLoading: state.isLoadingProductLine,
    error: state.error,
  }))
);
```

## Import Organization

### Order of Imports
1. React and external libraries
2. Internal types (with `type` prefix)
3. Internal utilities and services
4. Internal components
5. Relative imports

```typescript
// ✅ Correct import organization
import React, { useEffect, useMemo } from 'react';
import { create } from 'zustand';

import type { Database } from '../types/database';
import type { ProductConfiguration } from '../store/types';

import { supabase } from '../services/supabase';
import { validateConfiguration } from '../utils/validation';

import { Button } from './ui/button';
import { ProductSelector } from './ProductSelector';

import './configurator.css';
```

## Documentation Standards

### Function Documentation
- Document complex business logic
- Explain API integration patterns
- Include examples for reusable utilities

```typescript
/**
 * Processes backend rules to determine configuration overrides
 * @param configContext - Current configuration state as primitive values
 * @returns Processed configuration with any rule-based overrides applied
 *
 * @example
 * const processedConfig = await processRules({
 *   product_line: 1,
 *   mirror_style: 2,
 *   light_direction: 1
 * });
 */
export const processRules = async (configContext: ConfigContext) => {
  // Implementation...
};
```

### Type Documentation
- Document complex type relationships
- Explain discriminated union patterns
- Provide usage examples for generic types

```typescript
/**
 * Represents the current state of the product configurator
 * All fields are driven by API data and can change based on backend configuration
 */
export interface ConfigurationState {
  /** Currently selected product configuration */
  currentConfig: ProductConfiguration | null;
  /** Available options loaded from the API */
  productOptions: ProductOptions | null;
  /** Dynamic product line loaded from backend */
  currentProductLine: ProductLine | null;
}
```