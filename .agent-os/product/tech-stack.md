# Technical Stack

## Core Technologies

### Application Framework
Payload CMS 3.x with Next.js 15 (unified backend + frontend)

### Database System
PostgreSQL 15 (managed by Payload)

### Frontend Framework
Next.js App Router with React 18.2.0

### Backend Framework
Payload CMS with Local API access

### Import Strategy
node

### CSS Framework
TailwindCSS 3.3.3

### UI Component Library
shadcn/ui (custom Radix UI components)

### Fonts Provider
System fonts

### Icon Library
Lucide React 0.263.1

### Application Hosting
Vercel / Railway / Render (full-stack Next.js)

### Database Hosting
PostgreSQL (managed service)

### Asset Hosting
Payload Media Library (integrated file management)

### Deployment Solution
Next.js production build with Payload

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
Payload Local API (no network calls)

### API Access Pattern
Direct database access via getPayload() in server components

### Authentication
Payload Admin Authentication system

### Data Access Pattern
Payload REST/GraphQL API with Local API optimizations

## Data Management

### Collections (13 total)
- product_lines
- frame_colors
- frame_thicknesses
- mirror_controls
- mirror_styles
- mounting_options
- light_directions
- color_temperatures
- light_outputs
- drivers
- sizes
- accessories
- products

### Caching Strategy
5-minute cache with stale-while-revalidate

### State Management
React useState hooks (no external state library)

## Deployment Configuration

### Build Output
Next.js production build with Payload CMS

### Target Environment
Full-stack Next.js application with public frontend and admin panel

### Production Build
```bash
npm run build
```

### Environment Variables
- PAYLOAD_SECRET
- DATABASE_URI
- NEXT_PUBLIC_SERVER_URL

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
Type guards for all API responses

### Integration Testing
Phase validation scripts (test-phase3.js)

### Schema Validation
GraphQL introspection and validation tools

## Documentation Tools

### API Documentation
Context7 for library documentation

### Schema Management
- introspect-schema.js
- generate-types.js
- validate-queries.js

## Future Technology Considerations

### Planned Additions
- Supabase Edge Functions for business logic
- Enhanced GraphQL subscriptions for real-time updates
- Local Supabase for development environment
- Product SKU management system

### Migration Path
- Complete transition from Directus to Supabase ✅
- Implement local Supabase development environment
- Add Edge Functions for complex calculations
- Integrate advanced caching strategies