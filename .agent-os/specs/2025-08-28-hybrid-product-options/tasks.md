# Spec Tasks

## Tasks

- [ ] 1. Update Product Data Fetching
  - [ ] 1.1 Write tests for getAllProducts with options_overrides field
  - [ ] 1.2 Add options_overrides fields to getAllProducts query
  - [ ] 1.3 Update DecoProduct interface to include OptionsOverride type
  - [ ] 1.4 Implement data validation for options_overrides structure
  - [ ] 1.5 Test fetching Deco products with frame_thickness overrides
  - [ ] 1.6 Verify all product fetching tests pass

- [ ] 2. Implement Hybrid Filtering Logic
  - [ ] 2.1 Write tests for hybrid filtering with various override scenarios
  - [ ] 2.2 Create getProductSpecificOptions function
  - [ ] 2.3 Modify filterOptionsByProductLine to accept optional product parameter
  - [ ] 2.4 Implement cascade logic (product overrides → product line defaults)
  - [ ] 2.5 Add support for all collection types (sizes, mirror_styles, etc.)
  - [ ] 2.6 Verify all filtering tests pass

- [ ] 3. Update Service Layer Functions
  - [ ] 3.1 Write tests for getFilteredOptionsForProductLine with product overrides
  - [ ] 3.2 Update getFilteredOptionsForProductLine to use hybrid logic
  - [ ] 3.3 Implement caching for hybrid lookups
  - [ ] 3.4 Add performance monitoring for hybrid queries
  - [ ] 3.5 Verify backward compatibility with non-migrated products
  - [ ] 3.6 Verify all service layer tests pass

- [ ] 4. Integrate with Configuration UI
  - [ ] 4.1 Write tests for configuration form with product-specific options
  - [ ] 4.2 Update configuration form to pass product data to filtering functions
  - [ ] 4.3 Test Deco products show correct frame_thickness options
  - [ ] 4.4 Verify non-Deco products continue using defaults
  - [ ] 4.5 Add console logging for debugging option sources
  - [ ] 4.6 Verify all UI integration tests pass

- [ ] 5. Performance and Final Validation
  - [ ] 5.1 Write performance benchmarks for hybrid system
  - [ ] 5.2 Optimize caching strategy if needed
  - [ ] 5.3 Test with all Deco products having options_overrides
  - [ ] 5.4 Validate fallback behavior for products without overrides
  - [ ] 5.5 Run full test suite and fix any regressions
  - [ ] 5.6 Document hybrid system usage in CLAUDE.md