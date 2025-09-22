# Technical Stack

## Core Technologies

### Application Framework
React 18.2.0 with Vite 4.4.5

### Database System
Supabase 2.50.0 (PostgreSQL)

### Frontend Framework
React 18.2.0 with TypeScript 5.0.2

### Backend Framework
Supabase REST API + Edge Functions

### Import Strategy
ESM (ES Modules)

### CSS Framework
TailwindCSS 3.3.3

### UI Component Library
Radix UI primitives with custom components

### Fonts Provider
System fonts

### Icon Library
Lucide React 0.263.1

### Application Hosting
Vercel / Netlify / Cloudflare Pages (static build)

### Database Hosting
Supabase (managed PostgreSQL)

### Asset Hosting
Supabase Storage

### Deployment Solution
Vite production build

### Code Repository URL
(Private repository)

## Build & Development Tools

### Build Tool
Vite 4.4.5

### Package Manager
npm

### Linting
ESLint 8.45.0 with TypeScript support

### Development Server
Vite dev server (port 5173)

## API Architecture

### Primary API
Supabase REST API with TypeScript client

### API Access Pattern
@supabase/supabase-js client library

### Authentication
Supabase Auth (when needed)

### Data Access Pattern
Direct Supabase queries with real-time subscriptions

## Data Management

### Core Tables (Supabase)
- products
- product_lines
- mirror_styles
- light_directions
- frame_thicknesses
- frame_colors
- mounting_options
- drivers
- light_outputs
- color_temperatures
- accessories
- sizes
- rules
- configuration_ui
- sku_code_order

### Caching Strategy
Browser-level caching with Supabase real-time updates

### State Management
Zustand 5.0.8 for application state

## Deployment Configuration

### Build Output
Static assets compiled by Vite

### Target Environment
Static hosting with API calls to Supabase

### Production Build
```bash
npm run build
```

### Environment Variables
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

## Performance Targets

### Page Load
< 3 seconds

### API Response
< 500ms

### Cache Hit Ratio
> 80%

### Error Rate
< 1%

## Testing & Validation

### Type Checking
TypeScript strict mode

### Runtime Validation
Zod 3.25.76 for schema validation

### Integration Testing
Phase validation scripts

### Schema Validation
Supabase introspection and validation tools

## Documentation Tools

### API Documentation
Context7 for library documentation

### Schema Management
- introspect-schema.js
- generate-types.js
- validate-queries.js

## Future Technology Considerations

### Planned Additions
- Enhanced real-time features with Supabase subscriptions
- Edge Functions for complex business logic
- Progressive Web App capabilities
- Advanced caching strategies

### Migration Path
- Complete transition from Directus to Supabase ✅
- Implement Zustand for complex state management ✅
- Add Edge Functions for complex calculations
- Integrate advanced caching strategies