# Spec Tasks

## Tasks

- [ ] 1. Create Rules Service Layer
  - [ ] 1.1 Write tests for rules fetching and caching
  - [ ] 1.2 Create getRules() function to fetch from Directus API
  - [ ] 1.3 Implement rules caching mechanism
  - [ ] 1.4 Add types for Rule interface matching API structure
  - [ ] 1.5 Verify all tests pass

- [ ] 2. Implement Rules Processing Engine
  - [ ] 2.1 Write tests for rule evaluation logic
  - [ ] 2.2 Create evaluateRules() function to check if_this conditions
  - [ ] 2.3 Implement rule priority sorting (handle null priorities)
  - [ ] 2.4 Build applyRuleActions() to process than_that overrides
  - [ ] 2.5 Add configuration state evaluation against rules
  - [ ] 2.6 Verify all tests pass

- [ ] 3. Build SKU Generation System
  - [ ] 3.1 Write tests for SKU generation with rules
  - [ ] 3.2 Create generateProductSKU() function
  - [ ] 3.3 Apply rule-based SKU overrides (e.g., T for Deco+Thin)
  - [ ] 3.4 Append light direction suffixes (D, B, I)
  - [ ] 3.5 Handle mirror style codes
  - [ ] 3.6 Verify all tests pass

- [ ] 4. Implement Product Matching Logic
  - [ ] 4.1 Write tests for product matching
  - [ ] 4.2 Create findProductBySKU() function
  - [ ] 4.3 Query products with generated SKU
  - [ ] 4.4 Implement fallback logic for missing products
  - [ ] 4.5 Expand image fields in query
  - [ ] 4.6 Verify all tests pass

- [ ] 5. Create Image Selection System
  - [ ] 5.1 Write tests for image orientation selection
  - [ ] 5.2 Build selectProductImage() function
  - [ ] 5.3 Check mounting orientation (Portrait/Landscape)
  - [ ] 5.4 Select vertical_image or horizontal_image accordingly
  - [ ] 5.5 Implement fallback when preferred orientation unavailable
  - [ ] 5.6 Construct Directus asset URLs
  - [ ] 5.7 Verify all tests pass

- [ ] 6. Integrate with React Component
  - [ ] 6.1 Write tests for configuration change handling
  - [ ] 6.2 Add useEffect hook for configuration changes
  - [ ] 6.3 Implement debouncing for rapid changes
  - [ ] 6.4 Update ImageWithFallback component integration
  - [ ] 6.5 Add loading states during image updates
  - [ ] 6.6 Verify all tests pass

- [ ] 7. End-to-End Testing
  - [ ] 7.1 Test Deco + Thin Frame = T01 SKU generation
  - [ ] 7.2 Test Deco + Wide Frame = W SKU generation
  - [ ] 7.3 Verify T01D shows for Direct light selection
  - [ ] 7.4 Verify T01B shows for Both light selection
  - [ ] 7.5 Test portrait/landscape image switching
  - [ ] 7.6 Verify fallback behavior for missing products
  - [ ] 7.7 Confirm all integration tests pass