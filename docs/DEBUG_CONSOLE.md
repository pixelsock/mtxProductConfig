# Debug Console Configuration

## Overview

The application includes a debug console overlay that displays real-time configuration information and SVG layer details. This console can be controlled independently from the development/production environment setting.

## Environment Variable

### `VITE_DEBUG_CONSOLE`

Controls whether the debug console overlay is visible in the application.

**Location**: `.env` file  
**Type**: String (boolean-like)  
**Default**: `true`  
**Valid Values**: `'true'` | `'false'`

## Usage

### Enable Debug Console
```bash
# In .env file
VITE_DEBUG_CONSOLE=true
```

### Disable Debug Console
```bash
# In .env file
VITE_DEBUG_CONSOLE=false
```

## Behavior

The debug console will only appear when **BOTH** conditions are met:

1. `process.env.NODE_ENV === 'development'` (development environment)
2. `VITE_DEBUG_CONSOLE === 'true'` (debug console enabled)

This means:
- In **production**: Debug console never appears (regardless of VITE_DEBUG_CONSOLE value)
- In **development** with `VITE_DEBUG_CONSOLE=true`: Debug console appears
- In **development** with `VITE_DEBUG_CONSOLE=false`: Debug console hidden

## Debug Console Information

When enabled, the debug console displays:

- **Configuration Values**: Current product configuration (productLineId, frameThickness, frameColor, etc.)
- **Image Statistics**: Number of available configuration images
- **Layer Information**: List of visible SVG layers with their z-index values
- **Real-time Updates**: Timestamps showing when data was last updated
- **Layer Details**: Individual layer names and rendering status

## Hot Reloading

Changes to the `VITE_DEBUG_CONSOLE` environment variable require a development server restart to take effect:

```bash
# Stop the dev server (Ctrl+C)
# Then restart
npm run dev
```

**Note**: Vite environment variables are loaded at build time, so runtime changes to `.env` files require a server restart. This is a limitation of Vite's environment variable system.

### Alternative: Runtime Toggle (Advanced)

For development convenience, you could temporarily modify the helper function in `ProductImageLayers.tsx`:

```typescript
// Temporary override for testing (remove before committing)
const shouldShowDebugConsole = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isDebugEnabled = true; // Force enable for testing
  return isDevelopment && isDebugEnabled;
};
```

## Use Cases

### Development Debugging
Set `VITE_DEBUG_CONSOLE=true` when:
- Debugging SVG layer rendering issues
- Investigating configuration state problems
- Monitoring real-time data updates
- Troubleshooting image loading

### Clean Development UI
Set `VITE_DEBUG_CONSOLE=false` when:
- Demonstrating the application to stakeholders
- Taking screenshots or recordings
- Testing user experience without debug clutter
- Working on UI/UX improvements

## Location in Code

The debug console is implemented in:
- **File**: `src/components/ProductImageLayers.tsx`
- **Lines**: ~540-577
- **Condition**: `process.env.NODE_ENV === 'development' && import.meta.env.VITE_DEBUG_CONSOLE === 'true'`

## Styling

The debug console appears as:
- **Position**: Fixed to top-right corner
- **Background**: Semi-transparent black (`rgba(0,0,0,0.9)`)
- **Font**: Monospace, 10px
- **Size**: Max 350px width, 250px height
- **Z-index**: 1000 (appears above other content)
- **Scrollable**: When content exceeds max height
