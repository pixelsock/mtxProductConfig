# MTX Product Configurator

## Overview

The MTX Product Configurator is a React-based web application that allows users to configure Matrix Engineering lighting products with real-time visualization and quote generation capabilities.

### Key Features

- Fully dynamic configuration sourced from Directus collections
- Deterministic SKU assembly based on `sku_code_order`
- Directus-backed full SKU search via `searchable_skus`

## Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: Directus CMS (Headless)
- **Database**: PostgreSQL
- **Cache**: Redis

## Port Configuration

### Production Deployment (Coolify)
- **Directus API**: `https://pim.dude.digital:8056`
- **Container Internal Port**: `8056`
- **Database (PostgreSQL)**: Port `5432` (internal)
- **Cache (Redis)**: Port `6379` (internal)

### Development Environment
- **Vite Dev Server**: `http://localhost:5173`
- **Vite API Proxy**: `/api/*` → `http://localhost:8056`
- **Static File Server**: `http://localhost:3333` (via `npm run serve`)

## Networking & Reverse Proxy Configuration

The application is deployed using **Coolify** with both **Traefik** and **Caddy** reverse proxy configurations for maximum flexibility.

### Traefik Configuration

The `coolify.compose.yml` includes Traefik labels for:

```yaml
# HTTP to HTTPS redirect
- traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https

# HTTP router (redirects to HTTPS)
- traefik.http.routers.http-0-*.rule=Host(`pim.dude.digital`) && PathPrefix(`/`)
- traefik.http.routers.http-0-*.middlewares=redirect-to-https

# HTTPS router with gzip compression
- traefik.http.routers.https-0-*.rule=Host(`pim.dude.digital`) && PathPrefix(`/`)
- traefik.http.routers.https-0-*.middlewares=gzip
- traefik.http.routers.https-0-*.tls.certresolver=letsencrypt

# Load balancer pointing to container port 8056
- traefik.http.services.*.loadbalancer.server.port=8056
```

### Caddy Configuration

Alternative Caddy labels are also included:

```yaml
# Automatic HTTPS and compression
- caddy_0=https://pim.dude.digital
- caddy_0.encode=zstd gzip
- caddy_0.handle_path.0_reverse_proxy={{upstreams 8056}}
- caddy_0.handle_path=/*
- caddy_0.header=-Server
```

### Important Networking Notes

1. **Container Port**: The Directus container **must** expose port `8056` internally
2. **Health Check**: Container health check uses `http://127.0.0.1:8056/admin/login`
3. **CORS Configuration**: Includes both development and production origins
4. **SSL/TLS**: Automatic certificate management via Let's Encrypt
5. **Compression**: Both Traefik (gzip) and Caddy (zstd/gzip) support enabled

### CORS Configuration

The deployment includes comprehensive CORS settings:

```yaml
CORS_ENABLED: 'true'
CORS_ORIGIN: 'https://pim.dude.digital,http://localhost:5173,http://localhost:3000'
CORS_METHODS: 'GET,POST,PATCH,DELETE,PUT,HEAD,OPTIONS'
CORS_ALLOWED_HEADERS: 'Content-Type,Authorization,Accept,Origin,X-Requested-With,Cache-Control,Pragma'
CORS_CREDENTIALS: 'true'
```

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server (with proxy)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Serve built files
npm run serve
```

### Environment Variables

Create a `.env` file with:

```env
# Development API endpoint (uses Vite proxy)
VITE_DIRECTUS_URL=http://localhost:8056

# Directus admin credentials
VITE_DIRECTUS_EMAIL=admin@example.com
VITE_DIRECTUS_PASSWORD=your_admin_password

# Supabase configuration (if using)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

## Deployment

### Using Coolify

1. **Upload Configuration Files**:
   - `coolify.compose.yml` - Docker Compose configuration
   - `coolify.env` - Environment variables

2. **Set Environment Variables** in Coolify dashboard:
   - `SERVICE_PASSWORD_ADMIN` - Directus admin password
   - `SERVICE_PASSWORD_POSTGRESQL` - Database password
   - `SERVICE_USER_POSTGRESQL` - Database username
   - `SERVICE_BASE64_64_KEY` - Directus encryption key
   - `SERVICE_BASE64_64_SECRET` - Directus secret key

3. **Deploy the Service** via Coolify interface

### Port Change Considerations

If you need to change from port `8056` to a different port:

1. **Update `coolify.compose.yml`**:
   - `COOLIFY_URL` and `COOLIFY_FQDN` values
   - Health check URL
   - Traefik service port labels
   - Caddy reverse proxy configuration

2. **Update Environment Files**:
   - `coolify.env` - `SERVICE_FQDN_DIRECTUS`
   - `.env` - `VITE_DIRECTUS_URL` for development

3. **Update Development Configuration**:
   - `vite.config.ts` - Proxy target URL

## API Documentation

### Collections Available
- Product Lines
- Frame Colors
- Frame Thicknesses
- Mounting Options
- Light Directions
- Mirror Styles
- Mirror Controls
- Configuration Images
- And more...

### GraphQL Endpoint
- **Production**: `https://pim.dude.digital:8056/graphql`
- **Development**: `http://localhost:5173/api/graphql` (via proxy)

### REST API
- **Production**: `https://pim.dude.digital:8056/items/{collection}`
- **Development**: `http://localhost:5173/api/items/{collection}` (via proxy)

## Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Development guidelines and SOD rules
- **[docs/README.md](./docs/README.md)** - Documentation index
- **[PROXY_REMOVAL_COMPLETE.md](./PROXY_REMOVAL_COMPLETE.md)** - Proxy architecture details
- **[deploy-server-changes.md](./deploy-server-changes.md)** - CORS deployment guide

## Architecture Notes

### Removed Components
- ✅ Standalone proxy server (`proxy-server.js`) - Removed for simplified architecture
- ✅ Express/CORS dependencies - Replaced with Vite built-in proxy for development

### Current Flow
- **Development**: React App → Vite Proxy → Directus API
- **Production**: React App → Direct Directus API (with proper CORS)

This architecture provides a clean separation between development and production environments while maintaining full functionality and performance.
