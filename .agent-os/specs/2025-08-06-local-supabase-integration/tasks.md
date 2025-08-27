# Spec Tasks

## Tasks

- [x] 1. Configure Environment Variables
  - [x] 1.1 Write tests for environment configuration loading
  - [x] 1.2 Create .env.local with localhost:8075 configuration
  - [x] 1.3 Update .env.example with new environment variables
  - [x] 1.4 Add environment detection utility function
  - [x] 1.5 Verify all environment variables load correctly

- [ ] 2. Update Service Layer for Configurable Endpoints
  - [ ] 2.1 Write tests for endpoint configuration in services
  - [ ] 2.2 Update supabase-graphql.ts to use VITE_SUPABASE_URL
  - [ ] 2.3 Remove hardcoded pim.dude.digital references
  - [ ] 2.4 Update directus.ts service layer for endpoint flexibility
  - [ ] 2.5 Test all API functions with new endpoint configuration
  - [ ] 2.6 Verify GraphQL queries work with localhost:8075

- [ ] 3. Implement Connection Health Checks
  - [ ] 3.1 Write tests for connection health monitoring
  - [ ] 3.2 Create connection test utility function
  - [ ] 3.3 Add connection status indicator component
  - [ ] 3.4 Implement fallback logic for connection failures
  - [ ] 3.5 Add console logging for active endpoint
  - [ ] 3.6 Verify health checks work for both environments

- [ ] 4. Set Up Local Supabase Configuration
  - [ ] 4.1 Write documentation for local Supabase setup
  - [ ] 4.2 Create supabase-local.config.js configuration file
  - [ ] 4.3 Add npm script "dev:local" for local environment
  - [ ] 4.4 Create database initialization script
  - [ ] 4.5 Configure local storage bucket for assets
  - [ ] 4.6 Verify local Supabase runs on port 8075

- [ ] 5. Update Asset Handling for Local Storage
  - [ ] 5.1 Write tests for local asset URL resolution
  - [ ] 5.2 Update fetchDirectusSvg for local storage URLs
  - [ ] 5.3 Implement environment-based asset URL logic
  - [ ] 5.4 Test SVG loading from local storage
  - [ ] 5.5 Verify fallback images work locally