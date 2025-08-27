Standard Workflow
1. First think through the problem, read the codebase for relevant files, and write a plan to projectplan.md.
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Please every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. Finally, add a review section to the projectplan.md file with a summary of the changes you made and any other relevant information.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# MTX Product Configurator - Claude Code SOD Rules

## Project Overview
React product configurator using Supabase GraphQL API integration. Features product configuration, quote generation, and customer data collection for mirror/lighting products. Successfully migrated from Directus to Supabase for improved performance and GraphQL capabilities.

## Development Commands

### Build & Development
```bash
npm run dev          # Start development server (port 5173) with direct API connection
npm run build        # TypeScript compile + Vite build (UMD library)
npm run preview      # Preview production build
npm run lint         # ESLint with TypeScript support
```

### Testing & Validation
```bash
node test-phase3.js  # Run Phase 3 validation tests
npm run lint         # MUST run before commits to ensure code quality
```

### Build Configuration
- **Target**: UMD library for embedding in other applications
- **Entry**: `src/main.tsx`
- **Output**: Single bundle with CSS inlined
- **Environment**: Production builds drop console logs and debugger statements

## Core Development Rules

### File Management Standards
1. **Always use absolute paths** - Never use relative paths in tool calls
2. **Read before editing** - Use Read tool before any Edit/Write operations
3. **Prefer editing over creating** - Always edit existing files when possible
4. **Atomic operations** - Complete one task fully before starting another

### Task Management Protocol
1. **Use TodoWrite for complex tasks** - Any task requiring 3+ steps needs todo tracking
2. **Single task in-progress** - Only one todo should be "in_progress" at a time
3. **Priority levels**: CRITICAL > HIGH > MEDIUM > LOW
4. **Mark completed immediately** - Update todo status as soon as task finishes

### Data Migration Standards
1. **Incremental migration** - Replace static data sources one at a time
2. **Preserve functionality** - Ensure all features work during migration
3. **Type safety maintained** - Keep TypeScript interfaces consistent
4. **Test before removing** - Verify API integration before deleting static files

### API Integration Requirements
1. **Connection testing** - Always test API connectivity before operations
2. **Data validation** - Implement type guards for all API responses
3. **Error handling** - Graceful degradation with fallback mechanisms
4. **Caching strategy** - Use 5-minute cache with expired fallback
5. **Comprehensive logging** - Log all API calls with performance metrics

## Service Layer Architecture

### Supabase GraphQL Functions
```typescript
// Core GraphQL fetcher
getSupabaseGraphQLItems<T>(query: string): Promise<T[]>

// Collection data retrieval
getProductLines(): Promise<ProductLine[]>
getActiveFrameColors(): Promise<FrameColor[]>
getActiveFrameThicknesses(): Promise<FrameThickness[]>
getActiveMountingOptions(): Promise<MountingOption[]>
getActiveLightDirections(): Promise<LightDirection[]>
getActiveMirrorStyles(): Promise<MirrorStyle[]>
getActiveMirrorControls(): Promise<MirrorControl[]>
getActiveLightOutputs(): Promise<LightOutput[]>
getActiveColorTemperatures(): Promise<ColorTemperature[]>
getActiveDrivers(): Promise<Driver[]>
getActiveSizes(): Promise<Size[]>
getAllConfigurationImages(): Promise<ConfigurationImage[]>

// Storage and filtered data
fetchDirectusSvg(fileId: string): Promise<string>
getFilteredOptionsForProductLine(productLineId: string | number): Promise<Record<string, any[]>>
```

### GraphQL Query Pattern
```typescript
export const getActiveFrameColors = () => getSupabaseGraphQLItems(`
  query {
    frame_colorsCollection(filter: { active: { eq: true } }) {
      edges {
        node {
          id
          name
          hex_code
        }
      }
    }
  }
`);
```

## Quality Assurance Standards

### Validation Requirements
1. **Type guards** - Implement for all data structures
2. **Field validation** - Check required fields exist and have correct types
3. **Relationship integrity** - Validate foreign key relationships
4. **Business logic validation** - Ensure data meets business requirements

### Testing Checklist
- [ ] API connection successful
- [ ] All collections return data
- [ ] Required relationships exist (Deco product line)
- [ ] Data validation passes
- [ ] Quote generation works
- [ ] Configuration logic intact
- [ ] Performance within limits

### Performance Standards
- Page load time < 3 seconds
- API response time < 500ms
- Cache hit ratio > 80%
- Error rate < 1%

## Architecture Overview

### Application Architecture
- **Framework**: React 18 with TypeScript and Vite
- **Styling**: TailwindCSS + shadcn/ui component library
- **State Management**: React useState hooks (no external state manager)
- **API Layer**: Directus SDK with custom service layer abstraction
- **Build Target**: UMD library for embedding in external websites

### Key Design Patterns
1. **Service Layer Pattern**: All API calls abstracted through `src/services/directus.ts`
2. **Configuration State**: Single `ProductConfig` object manages entire form state
3. **Validation Layer**: Type guards and data consistency checking for API responses
4. **Fallback Strategy**: Graceful degradation with cached data when API fails
5. **Real-time Updates**: Product images update dynamically based on configuration

### Component Architecture
- **App.tsx**: Main application container with state management
- **UI Components**: Reusable shadcn/ui components with consistent styling
- **ImageWithFallback**: Custom component for dynamic product image loading
- **Configuration Sections**: Inline configuration forms within main component

## Project Structure Standards

### Directory Organization
```
src/
  components/         # Reusable UI components
    ui/              # shadcn/ui component library (30+ components)
    figma/           # Design-specific components (ImageWithFallback)
  services/          # API integration layer
    directus.ts      # Main service with validation & caching
  test/              # Testing utilities and data comparison
  styles/            # Global styles and themes
docs/                # Documentation and migration guides
```

### File Naming Conventions
- **Components**: PascalCase (ProductCard.tsx)
- **Services**: kebab-case (directus.ts)
- **Documentation**: CAPS for status (MIGRATION_COMPLETE.md), kebab-case for guides (mcp-removal-guide.md)
- **Configuration**: lowercase (vite.config.ts, tailwind.config.js)

## Data Collections Reference

### Core Collections (13 total)
1. **product_lines** - Product line definitions with SKU codes
2. **frame_colors** - Color options with hex codes and SKU mapping
3. **mirror_controls** - Control types (Wall Switch, CCTSync, Touch Sensor)
4. **mirror_styles** - Style configurations with SVG variants
5. **mounting_options** - Orientation options (Portrait/Landscape)
6. **light_directions** - Lighting options (Direct, Indirect, Both)
7. **color_temperatures** - Temperature settings (2700K-6500K + adjustable)
8. **light_outputs** - Output levels (Standard, High)
9. **drivers** - Driver types (Non-dimming, 0-10V, ELV)
10. **frame_thicknesses** - Thickness options (Wide, Thin)
11. **sizes** - Dimensions with width/height in numeric format
12. **accessories** - Available accessories (filter for Nightlight, Anti-Fog)
13. **products** - Product catalog with relationships

### Data Relationships
- Product lines have default_options arrays (foreign keys)
- Products belong to product_lines via sku_code matching
- Accessories filtered by name patterns for specific types
- Sizes include numeric width/height for calculations

## Business Logic Rules

### Product Configuration
1. **Default initialization** - Use first available option for each field
2. **Accessory filtering** - Only show Nightlight and Anti-Fog accessories
3. **Size handling** - Support both preset and custom dimensions
4. **SKU generation** - Product codes follow pattern (e.g., "T01D")

### Quote Generation
1. **Configuration validation** - Verify all options exist before quote
2. **Customer data required** - Name, email, company, phone
3. **Export format** - JSON with timestamp and configuration details
4. **Quantity handling** - Support multiple quantities per configuration

### Image Management
1. **Dynamic URLs** - Construct as `https://pim.dude.digital/assets/${productId}`
2. **Fallback images** - Use Unsplash placeholder for missing products
3. **Product naming** - Generate from configuration options

## Environment Configuration

### Required Variables
```env
VITE_SUPABASE_URL=https://akwhptzlqgtlcpzvcnjl.supabase.co  # Supabase project URL
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Supabase anon key
```

### Development Workflow
1. **Local Development**: `npm run dev` - Vite dev server on port 5173 with Supabase GraphQL
2. **API Connection**: Direct GraphQL connection to Supabase API
3. **Data Filtering**: All collections use `active: true` boolean filtering
4. **Build Process**: `npm run build` creates UMD library in dist/
5. **Storage**: SVG assets stored in Supabase Storage bucket 'configuration-images'

## Migration History

### Phase 1: Directus Integration ✅
- Service layer architecture established
- Directus SDK integration completed
- Caching mechanism implemented
- Type interfaces aligned

### Phase 2: Data Migration ✅
- All 13 collections migrated from static files to API
- Comprehensive data validation implemented
- Enhanced relationship mapping added
- Automated consistency checking deployed

### Phase 3: Supabase Migration ✅
- Migrated from Directus to Supabase GraphQL API
- Updated all collection queries to use `active` boolean filtering
- Fixed field mappings (hex_code, sku_code vs value)
- Supabase Storage integration for SVG assets
- Build and TypeScript validation completed

## Troubleshooting Guide

### Common Issues
1. **API Connection Failed**
   - Check DIRECTUS_URL environment variable
   - Verify network connectivity to pim.dude.digital
   - Test with curl: `curl -s "https://pim.dude.digital/items/frame_colors"`

2. **Data Validation Failures**
   - Check console for specific validation errors
   - Run `checkDataConsistency()` function
   - Verify required fields in Directus collections

3. **Performance Issues**
   - Clear cache with `clearCache()` function
   - Check network latency to API
   - Review console for slow queries

4. **Configuration Errors**
   - Validate product configuration with `validateProductConfiguration()`
   - Check that all referenced IDs exist in collections
   - Verify Deco product line (SKU: D) exists

### Debug Commands
```typescript
// Test API connection
await testConnection();

// Check data consistency
const report = await checkDataConsistency();

// Validate specific configuration
const validation = await validateProductConfiguration(config);

// Clear cache for fresh data
clearCache();
```

## Success Criteria
- ✅ Zero functionality regression from original static data version
- ✅ All 13 collections successfully integrated with API
- ✅ Data validation and error handling comprehensive
- ✅ Performance maintained or improved
- ✅ Quote generation fully functional
- ✅ Enhanced relationship mapping and validation

## Development Best Practices

### Code Quality Standards
- TypeScript strict mode enabled with comprehensive type checking
- ESLint configuration enforces React hooks rules and TypeScript standards
- All API responses must have type guards and validation
- Error boundaries and graceful fallbacks required for all external dependencies

### Performance Considerations
- Directus service layer implements 5-minute caching with stale-while-revalidate pattern
- Product images load dynamically with fallback handling via ImageWithFallback component
- Large form state managed efficiently through single configuration object
- Build output optimized as single UMD bundle for easy embedding

### Integration Points
- **API**: Supabase GraphQL at akwhptzlqgtlcpzvcnjl.supabase.co with 14 product data collections
- **Embedding**: UMD library designed for integration into external websites
- **Storage**: Supabase Storage for SVG assets and configuration images
- **Database**: PostgreSQL 15 with GraphQL auto-generated from schema

---

**Status**: Supabase Migration Complete ✅ - Production ready
**Last Updated**: Supabase migration completion  
**Next Milestone**: Performance optimization and enhanced filtering
- remember to NEVER use fallback data when developing code for this project. It's important that we use the api data only so we can focus on getting it working correctly.