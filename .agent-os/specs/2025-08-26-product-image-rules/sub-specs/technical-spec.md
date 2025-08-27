# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-26-product-image-rules/spec.md

## Technical Requirements

### Rules Processing System
- Load and parse rules from the rules collection in Directus
- Rules should define conditions (e.g., product_line = "Deco" AND frame_thickness = "Thin") 
- Rules should specify SKU overrides (e.g., use "T01" instead of default)
- Apply rules in priority order if multiple rules match
- Cache processed rules for performance

### SKU Generation Algorithm
- Base SKU from product line selection (e.g., "W" for Deco)
- Apply rule overrides (e.g., "T01" for Deco + Thin Frame)
- Append frame thickness code if applicable (e.g., "01" for specific style)
- Append light direction suffix (e.g., "D" for direct, "B" for both, "I" for indirect)
- Format: [BASE_SKU][STYLE_CODE][LIGHT_SUFFIX]

### Product Matching Logic
- Query products collection using generated SKU
- Match products based on:
  - product_line relationship
  - SKU code pattern matching
  - Available light directions for the product variant
- Handle cases where product doesn't exist (fallback to closest match)
- Validate product availability before displaying

### Image Selection Algorithm
- Check mounting orientation selection (Portrait/Landscape)
- For Portrait: Use vertical_image field from matched product
- For Landscape: Use horizontal_image field from matched product
- Fallback logic:
  - If requested orientation not available, use alternate orientation
  - If no images available, use placeholder
- Construct image URLs using Directus assets endpoint

### Real-time Update Mechanism
- React to configuration state changes using useEffect hooks
- Debounce rapid configuration changes (100ms delay)
- Update image immediately after SKU generation and product matching
- Maintain loading state during image transitions
- Handle image loading errors gracefully

### Data Structure Requirements
```typescript
interface Rule {
  id: string;
  priority: number;
  conditions: {
    product_line?: string;
    frame_thickness?: string;
    mirror_style?: string;
    [key: string]: any;
  };
  sku_override: string;
  active: boolean;
}

interface Product {
  id: string;
  sku_code: string;
  product_line: number;
  vertical_image?: string;
  horizontal_image?: string;
  mirror_style?: number;
  light_direction?: number;
  frame_thickness?: number;
}

interface ImageSelectionResult {
  productId: string;
  imageUrl: string;
  orientation: 'vertical' | 'horizontal';
  isFullback: boolean;
}
```

### Performance Criteria
- Rule processing: < 10ms
- SKU generation: < 5ms
- Product matching: < 100ms (with caching)
- Image load time: < 2 seconds
- Configuration change to image update: < 200ms total

### Integration Points
- Directus rules collection for SKU override rules
- Directus products collection for product data and images
- Existing configuration state management in App.tsx
- ImageWithFallback component for image display
- Directus service layer for data fetching

### Error Handling
- Log all rule application failures
- Provide fallback images when product not found
- Handle network failures gracefully
- Display user-friendly error messages
- Maintain last successful image during errors