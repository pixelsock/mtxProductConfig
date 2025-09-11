# Research: Troubleshoot Product Options Visibility

## Overview
This research focuses on debugging why product line default_options are not appearing in the current configurator section despite being visible as option sets elsewhere in the MTX Product Configurator.

## Research Areas

### 1. Data Flow Analysis
**Decision**: Trace data flow from Directus API → React state → UI rendering  
**Rationale**: Need to identify where the default_options data is being lost or filtered out between the API and the current configurator display  
**Alternatives considered**: 
- Frontend-only debugging: Rejected because need to verify API data integrity
- Backend schema analysis only: Rejected because issue is with frontend display

### 2. API Endpoint Validation
**Decision**: Use curl commands to validate Directus API endpoints and filtering parameters  
**Rationale**: User specifically requested curl validation to ensure API returns correct data structure for default_options  
**Alternatives considered**:
- Browser dev tools only: Rejected because curl provides more controlled testing
- Postman/Insomnia: Rejected to follow user preference for curl

### 3. Component Rendering Investigation  
**Decision**: Debug React component hierarchy to identify where default_options should be rendered vs where they actually appear  
**Rationale**: Options appear as "option sets" elsewhere but not in "current configurator section" - suggests component-specific issue  
**Alternatives considered**:
- Full rewrite: Rejected because this is debugging existing functionality
- CSS display issue: Will investigate but likely deeper data issue

### 4. State Management Analysis
**Decision**: Examine React state flow for ProductConfig object and default_options handling  
**Rationale**: Need to verify if default_options are being loaded into state but not displayed, or not loaded at all  
**Alternatives considered**: N/A - state analysis is essential for React debugging

## Technical Research Findings

### Directus API Structure
- Product lines contain `default_options` array with collection/item references
- Collections affected: All product lines (accessories), specifically Polished product line
- API endpoint pattern: `/items/product_lines` with nested default_options

### Current Codebase Context
- React 18 with TypeScript and Vite build system
- State managed via useState hooks in ProductConfig object
- Service layer in `src/services/directus.ts` handles API integration
- UI components in `src/components/` with dynamic options in `ui/dynamic-options.tsx`

### Code Order and Configuration UI Collections
- `code_order` collection defines SKU building sequence
- `configuration_ui` collection determines display order in configurator
- These collections should control the rendering order of options

### Debugging Approach
**Decision**: Systematic debugging using validate→debug→fix→test cycle  
**Rationale**: This is troubleshooting existing functionality, not implementing new features  
**Process**:
1. Validate API endpoints with curl
2. Debug React component data flow
3. Fix identified issues
4. Test with actual product configurations

## Key Investigation Points

1. **API Data Integrity**: Verify default_options are correctly returned by Directus API
2. **Service Layer Processing**: Check if `src/services/directus.ts` properly handles default_options
3. **Component Rendering**: Identify why options appear in some components but not others
4. **State Synchronization**: Ensure default_options reach the current configurator section components
5. **Collection References**: Verify code_order and configuration_ui collections are properly utilized

## Tools and Methods

### Curl Commands for API Validation
- Test product_lines endpoint with default_options expansion
- Validate filtering parameters for active collections
- Check nested relation queries for accessories and other options

### React Debugging Techniques
- Console logging at component boundaries
- React DevTools for state inspection
- Network tab analysis for API calls
- Component tree analysis for data flow

### Code Analysis Focus Areas
- `src/services/directus.ts` - API integration layer
- `src/components/ui/dynamic-options.tsx` - Dynamic option rendering
- `src/App.tsx` - Main state management
- Any components handling current configurator section vs option sets

## Success Criteria
- API endpoints return complete default_options data
- React components receive and process default_options correctly  
- Current configurator section displays same options as option sets
- Polished product line shows all assigned options
- Accessories appear for all product lines as configured