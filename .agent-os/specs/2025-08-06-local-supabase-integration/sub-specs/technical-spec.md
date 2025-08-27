# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-06-local-supabase-integration/spec.md

## Technical Requirements

### Environment Configuration System
- Implement environment variable support for API endpoint configuration
- Use VITE_SUPABASE_URL to determine target endpoint (localhost:8075 vs remote)
- Support .env.local for local development configuration
- Maintain .env.production for production settings
- Add environment detection logic to determine active configuration

### Service Layer Modifications
- Update all pim.dude.digital references to use configurable endpoints
- Modify supabase-graphql.ts to use environment-based URL
- Update directus.ts service layer to support endpoint switching
- Ensure GraphQL client initialization uses correct endpoint
- Maintain backward compatibility with existing API calls

### Connection Health Monitoring
- Implement connection test function for localhost:8075
- Add fallback logic if local instance is unavailable
- Display connection status in development mode
- Log endpoint being used for debugging purposes
- Implement retry logic for local connection failures

### Local Supabase Configuration
- Document required Supabase CLI installation steps
- Create initialization script for local database setup
- Configure local Supabase to run on port 8075
- Set up GraphQL endpoint at localhost:8075/graphql/v1
- Ensure all 13 collections are available locally

### Asset Handling
- Configure local Supabase Storage for SVG assets
- Update fetchDirectusSvg function for local storage URLs
- Ensure configuration-images bucket exists locally
- Support both local and remote asset URLs
- Implement asset URL resolution based on environment

### Development Experience
- Add npm script for starting local Supabase
- Create setup script for first-time configuration
- Implement data seeding for consistent test data
- Add environment indicator to UI (dev bar or badge)
- Provide clear console logging of active environment

## Performance Considerations

- Local API calls should have < 50ms response time
- No external network dependencies in local mode
- Cache configuration should work identically for local/remote
- Hot reload should work seamlessly with local Supabase
- Build process should handle environment switching