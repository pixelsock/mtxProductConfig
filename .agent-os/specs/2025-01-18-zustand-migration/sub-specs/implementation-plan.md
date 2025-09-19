# Implementation Plan

This document outlines the detailed implementation approach for migrating from useState to Zustand while maintaining the dynamic Supabase-driven architecture.

## Current State Analysis

### Identified useState Patterns

**App.tsx State (29 useState calls):**
- `productOptions` - API data state
- `currentProduct` - Selected product entity
- `currentProductLine` - Active product line
- `availableProductLines` - Product line options
- `disabledOptionIds` - Dynamic filtering state
- `currentConfig` - Core configuration object
- `quoteItems` - Quote management
- `customerInfo` - Customer form data
- `isLoadingApp`, `isLoadingProductLine` - Loading states
- `error` - Error handling
- `showQuoteForm`, `showFloatingBar` - UI modal states
- `useCustomSize` - UI toggle state
- `isLightboxOpen`, `lightboxIndex` - Gallery state
- `thumbnailsRef`, `canScrollLeft`, `canScrollRight` - UI interaction state

**Hook Patterns (useEnhancedDynamicConfigurator.ts):**
- `productLines`, `selectedProductLineId` - Product line management
- `currentSelections` - Configuration selections
- `availableOptions`, `selectionGuidance` - Dynamic options
- `configurationSummary` - Processing results
- Multiple loading states and error handling

## Zustand Store Architecture

### Slice Design

**ConfigurationSlice:**
```typescript
interface ConfigurationSlice {
  // State
  currentConfig: ProductConfig | null;
  currentProduct: DecoProduct | null;
  currentProductLine: ProductLine | null;
  currentSelections: CurrentSelection;

  // Actions
  updateConfiguration: (field: keyof ProductConfig, value: any) => void;
  setCurrentProduct: (product: DecoProduct | null) => void;
  setCurrentProductLine: (productLine: ProductLine) => void;
  resetConfiguration: () => void;

  // Computed
  isConfigurationValid: () => boolean;
  getGeneratedSKU: () => string | null;
}
```

**UISlice:**
```typescript
interface UISlice {
  // Modal States
  showQuoteForm: boolean;
  showFloatingBar: boolean;
  isLightboxOpen: boolean;
  lightboxIndex: number;

  // UI Controls
  useCustomSize: boolean;
  canScrollLeft: boolean;
  canScrollRight: boolean;

  // Actions
  toggleQuoteForm: () => void;
  setFloatingBarVisible: (visible: boolean) => void;
  openLightbox: (index: number) => void;
  closeLightbox: () => void;
  setScrollState: (left: boolean, right: boolean) => void;
  toggleCustomSize: () => void;
}
```

**APISlice:**
```typescript
interface APISlice {
  // Data
  productOptions: ProductOptions | null;
  availableProductLines: ProductLine[];
  disabledOptionIds: Record<string, number[]>;

  // Loading States
  isLoadingApp: boolean;
  isLoadingProductLine: boolean;
  isComputingAvailability: boolean;

  // Error Handling
  error: string | null;

  // Actions
  setProductOptions: (options: ProductOptions) => void;
  setAvailableProductLines: (lines: ProductLine[]) => void;
  setDisabledOptions: (disabled: Record<string, number[]>) => void;
  setLoadingStates: (states: Partial<LoadingStates>) => void;
  setError: (error: string | null) => void;

  // Async Actions
  loadProductLineOptions: (productLine: ProductLine) => Promise<void>;
  recomputeFiltering: (productLine: ProductLine, config: ProductConfig) => Promise<void>;
}
```

**QuoteSlice:**
```typescript
interface QuoteSlice {
  // State
  quoteItems: ProductConfig[];
  customerInfo: CustomerInfo;

  // Actions
  addToQuote: (config: ProductConfig) => void;
  removeFromQuote: (configId: string) => void;
  clearQuote: () => void;
  updateCustomerInfo: (info: Partial<CustomerInfo>) => void;

  // Computed
  getTotalItems: () => number;
  getQuoteDescription: (config: ProductConfig) => string;
}
```

## Migration Phases

### Phase 1: Foundation Setup (Day 1)

**Tasks:**
1. Install Zustand dependency
2. Create base store structure with slice interfaces
3. Setup middleware stack (DevTools, Persist, Immer)
4. Create store provider wrapper (if needed)

**Success Criteria:**
- Zustand store compiles without errors
- DevTools integration working
- TypeScript inference functional

### Phase 2: API/Cache Migration (Day 2)

**Tasks:**
1. Migrate `productOptions`, `availableProductLines`, `disabledOptionIds` to APISlice
2. Migrate loading states (`isLoadingApp`, `isLoadingProductLine`, `isComputingAvailability`)
3. Migrate error handling state
4. Update service layer calls to use store actions

**Success Criteria:**
- API data loading works through Zustand
- Dynamic filtering state updates correctly
- No regressions in Supabase integration

### Phase 3: UI State Migration (Day 3)

**Tasks:**
1. Migrate modal states (`showQuoteForm`, `isLightboxOpen`, `lightboxIndex`)
2. Migrate UI controls (`useCustomSize`, scroll states, `showFloatingBar`)
3. Update component event handlers to use store actions
4. Test all UI interactions

**Success Criteria:**
- All modals and UI controls work identically
- No visual or interaction regressions
- Floating bar behavior preserved

### Phase 4: Configuration Migration (Day 4-5)

**Tasks:**
1. Migrate core configuration state (`currentConfig`, `currentProduct`, `currentProductLine`)
2. Migrate configuration update logic
3. Update all configuration change handlers
4. Preserve rules engine integration

**Success Criteria:**
- Product configuration works identically
- Rules engine processing unchanged
- SKU generation maintains accuracy
- Dynamic filtering continues to work

### Phase 5: Quote Management Migration (Day 6)

**Tasks:**
1. Migrate quote state (`quoteItems`, `customerInfo`)
2. Migrate quote actions (add, remove, clear)
3. Update quote form and download functionality
4. Test complete quote workflow

**Success Criteria:**
- Quote management works identically
- Customer information handling preserved
- Quote export functionality unchanged

### Phase 6: Optimization & Cleanup (Day 7)

**Tasks:**
1. Implement selective subscriptions for performance
2. Add transient updates for real-time operations
3. Remove old useState patterns and clean up
4. Performance testing and optimization

**Success Criteria:**
- Performance improvements measurable
- Code cleanup completed
- No unused useState imports remain

## Implementation Guidelines

### Maintaining Supabase Integration

**Critical Requirements:**
- Never modify existing service layer APIs
- Preserve all dynamic filtering logic
- Maintain rules engine processing patterns
- Keep evaluation lifecycle deterministic

**Store Integration Pattern:**
```typescript
// Store action that preserves service layer
const loadProductLineOptions = async (productLine: ProductLine) => {
  set((state) => ({
    ...state,
    isLoadingProductLine: true,
    error: null
  }));

  try {
    // Use existing service - DO NOT MODIFY
    const options = await existingServiceCall(productLine);

    set((state) => ({
      ...state,
      productOptions: options,
      isLoadingProductLine: false
    }));
  } catch (error) {
    set((state) => ({
      ...state,
      error: error.message,
      isLoadingProductLine: false
    }));
  }
};
```

### TypeScript Patterns

**Store Definition:**
```typescript
export const useConfiguratorStore = create<ConfiguratorStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...createConfigurationSlice(set, get),
        ...createUISlice(set, get),
        ...createAPISlice(set, get),
        ...createQuoteSlice(set, get),
      }))
    ),
    { name: 'product-configurator' }
  )
);
```

**Component Usage:**
```typescript
// Selective subscription for performance
const currentConfig = useConfiguratorStore(state => state.currentConfig);
const updateConfiguration = useConfiguratorStore(state => state.updateConfiguration);

// Multiple properties with shallow comparison
const { isLoading, error } = useConfiguratorStore(
  useShallow(state => ({
    isLoading: state.isLoadingApp,
    error: state.error
  }))
);
```

### Testing Strategy

**Unit Testing:**
- Test store actions independently
- Verify state updates with mock data
- Test selectors and computed properties

**Integration Testing:**
- Test complete configuration workflows
- Verify Supabase integration unchanged
- Test rules engine processing

**Performance Testing:**
- Measure re-render frequency
- Compare useState vs Zustand performance
- Verify selective subscription benefits

## Rollback Plan

**Immediate Rollback:**
- Keep original useState patterns commented during migration
- Maintain feature branch for rollback capability
- Document any Supabase integration changes

**Risk Mitigation:**
- Incremental migration allows partial rollback
- TypeScript compilation prevents major breakage
- Existing service layer remains untouched