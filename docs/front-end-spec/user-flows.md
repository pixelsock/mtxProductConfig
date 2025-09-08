# User Flows

## Primary Configuration Flow (Existing Implementation)

**User Goal:** Configure a mirror/lighting product in real-time with immediate visual feedback

**Entry Points:** Direct URL, embedded configurator widget, SKU search parameter (`?search=D03L24x36`)

**Success Criteria:** User completes configuration, sees live product visualization, adds to quote, submits customer information

### Flow Diagram

```mermaid
graph TD
    A[Load Configurator] --> B[Initialize Product Line]
    B --> C[Load Default Configuration]
    C --> D[Display Split Layout]
    
    D --> D1[Left: Product Visualization]
    D --> D2[Right: Dynamic Options]
    
    D1 --> D1A[Main Product Image]
    D1A --> D1B[Thumbnail Gallery]
    D1B --> D1C[Lightbox Modal]
    D1 --> D1D[SKU Display Card]
    D1 --> D1E[Quote Summary Card]
    
    D2 --> D2A[Current Configuration Card]
    D2A --> D2B[Dynamic Options Container]
    D2B --> D2C{UI Type}
    
    D2C -->|color-swatch| D2D[Color Swatches]
    D2C -->|size-grid| D2E[Size Grid + Custom Toggle]
    D2C -->|grid-2| D2F[2-Column Option Grid]
    D2C -->|multi| D2G[Multi-Select Accessories]
    
    D2D --> E[Real-time Update]
    D2E --> E
    D2F --> E
    D2G --> E
    
    E --> F[Rules Engine Validation]
    F --> G[Product Matching]
    G --> H[Image Selection]
    H --> I[SKU Generation]
    I --> J[URL Update]
    J --> K{Add to Quote?}
    
    K -->|Yes| L[Quote Item Added]
    K -->|No| D2
    
    L --> M[Floating Configuration Bar]
    M --> N{Request Quote?}
    N -->|Yes| O[Quote Request Modal]
    O --> P[Customer Information Form]
    P --> Q[Submit Quote]
```

### Edge Cases & Error Handling:
- **Rules Engine Conflicts:** Invalid combinations automatically adjust dependent options with visual feedback
- **Product Image Missing:** Fallback to placeholder with clear messaging and orientation indicator
- **API Connection Loss:** Cached data continues working with connection status indicator
- **Invalid SKU Search:** Parse partial matches and suggest corrections
- **Custom Size Limits:** Enforce 12-120 inch range with clear validation messages

**Notes:** The existing implementation uses real-time updates with sophisticated rules engine validation. Every configuration change triggers immediate visual feedback, SKU regeneration, and URL updates for sharing.

## Administrative Data Management Flow (Existing Implementation)

**User Goal:** Manage product configuration through Directus without code changes

**Entry Points:** Directus admin dashboard, configuration_ui collection

**Success Criteria:** Changes appear immediately in configurator with proper validation

### Flow Diagram

```mermaid
graph TD
    A[Access Directus Admin] --> B[Navigate to Collections]
    B --> C[Modify Configuration Data]
    C --> D[Real-time Cache Invalidation]
    D --> E[Option Registry Refresh]
    E --> F[UI Auto-Updates]
    
    C --> C1[Update configuration_ui]
    C --> C2[Modify option collections]
    C --> C3[Adjust rules]
    C --> C4[Update product relationships]
    
    F --> G[Rules Engine Revalidation]
    G --> H[Available Options Recalculation]
    H --> I[SKU Generation Updates]
```

### Edge Cases & Error Handling:
- **Invalid UI Type:** System falls back to default grid layout
- **Missing Collection References:** Clear error messages with suggested fixes
- **Rules Validation Failure:** Block creation with specific field guidance
- **Cache Sync Failure:** Manual refresh option available

**Notes:** The established system uses real-time WebSocket updates with polling fallback. All changes propagate immediately to active configurator instances.
