# Development Workflows

This document explains the different development and testing workflows for the MTX Product Configurator.

## Quick Reference

| Command | Runtime | Port | Use Case |
|---------|---------|------|----------|
| `npm run dev` | Node.js | 3000 | Rapid development |
| `npm run preview` | Cloudflare Workers (Edge) | 8788 | Pre-deployment testing |
| `npm run build` | N/A | N/A | Production build only |

## npm run dev - Standard Development

### What It Does
Starts Next.js 15 development server with Turbopack for fast iteration.

### Runtime Environment
- **Runtime:** Node.js (v22 LTS)
- **Port:** `http://localhost:3000/config`
- **Environment Variables:** Loaded from `.env.local`
- **Hot Reload:** ✅ Instant (Turbopack)
- **Build Time:** ~1-2 seconds startup

### When to Use
- ✅ Daily feature development
- ✅ UI/UX iteration and styling
- ✅ Component development
- ✅ Quick bug fixes
- ✅ Rapid prototyping

### Advantages
- **Fast:** Near-instant hot module replacement
- **Debugging:** Full Node.js debugging capabilities
- **DevTools:** React DevTools, Redux DevTools work seamlessly
- **Logs:** Detailed console output and stack traces

### Limitations
- ❌ Not representative of production Edge runtime
- ❌ Some Node.js APIs work here but fail in Edge
- ❌ Environment variable behavior differs from production
- ❌ Bundle size not optimized

### Example Session
```bash
npm run dev

# Output:
# ▲ Next.js 15.5.4
# - Local:        http://localhost:3000/config
# - Environment: .env.local
# ✓ Starting...
# ✓ Ready in 1.8s
```

## npm run preview - Edge Runtime Testing

### What It Does
Builds the app with OpenNext Cloudflare adapter and runs it with Wrangler for local Edge runtime simulation.

### Known Issue (Manual Workaround Required)
⚠️ **Current behavior:** `npm run preview` builds successfully but doesn't start the dev server automatically.

**Workaround:**
```bash
# Build the app
npm run preview
# Wait for build to complete, then manually start the server:
cd .open-next && npx wrangler dev worker.js --port 8788
```

### Runtime Environment
- **Runtime:** Cloudflare Workers (Edge runtime)
- **Port:** `http://localhost:8788/config`
- **Environment Variables:** From Wrangler bindings (or .env if configured)
- **Hot Reload:** ❌ None (must rebuild)
- **Build Time:** ~10-30 seconds per rebuild

### When to Use
- ✅ Before deploying to Webflow Cloud
- ✅ Testing new npm packages for Edge compatibility
- ✅ Validating API routes work in Edge runtime
- ✅ Testing environment variable injection
- ✅ Verifying production bundle size
- ✅ Debugging Edge-specific issues

### Advantages
- **Accurate:** Exact same runtime as Webflow Cloud production
- **Validation:** Catches Edge compatibility issues early
- **Bundle:** Tests actual production bundle
- **Environment:** Tests runtime environment variable injection

### Limitations
- ⏱️ **Slow:** 10-30 second rebuild on every change
- ❌ **No Hot Reload:** Must manually restart after changes
- 🐛 **Harder Debugging:** Limited debugging capabilities
- 📊 **Limited DevTools:** Some browser devtools features unavailable

### Example Session
```bash
npm run preview

# Output:
# ┌─────────────────────────────┐
# │ OpenNext — Cloudflare build │
# └─────────────────────────────┘
#
# Building Next.js app...
# ✓ Compiled successfully in 2.7s
#
# Bundling middleware function...
# Bundling server function: default...
#
# Worker saved in `.open-next/worker.js` 🚀
# OpenNext build complete.
#
# ⎔ Starting local server...
# [wrangler:inf] Ready on http://localhost:8788/config
```

## Environment Variables

### Development (`npm run dev`)
Environment variables are read from `.env.local` at **build time** and **runtime**.

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**Behavior:**
- ✅ Available immediately
- ✅ Can be changed and reloaded on restart
- ✅ Standard Node.js `process.env` access

### Preview/Production (`npm run preview` + Webflow Cloud)
Environment variables are injected at **runtime only** (not build time).

**Important:** Supabase client uses **lazy initialization** to support this:

```typescript
// src/services/supabase.ts
let supabaseInstance: SupabaseClient<Database> | null = null;

function getSupabaseClient(): SupabaseClient<Database> {
  if (supabaseInstance) return supabaseInstance;

  // Environment variables are read at RUNTIME (first use)
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  supabaseInstance = createClient<Database>(url, key);
  return supabaseInstance;
}
```

**Behavior:**
- ⏳ Available only after Cloudflare injects them at runtime
- ⚠️ Not available during build/bundling
- ✅ Configured in Webflow Cloud dashboard
- ✅ Accessed via lazy initialization pattern

## Testing Edge Compatibility

### Node.js APIs That DON'T Work in Edge
These work in `npm run dev` but fail in `npm run preview`:
- `fs` filesystem operations
- `child_process` spawning
- `http`/`https` servers
- Most Node.js built-ins

### APIs That DO Work in Edge
- `fetch()` - Standard Web API
- `Response`, `Request` - Web APIs
- `crypto` (Web Crypto API)
- `URL`, `URLSearchParams`
- `TextEncoder`, `TextDecoder`

### Example: Package Compatibility Check
```bash
# Install new package
npm install some-package

# ❌ DON'T just test in dev
npm run dev
# Visit http://localhost:3000/config
# Works? Great! But...

# ✅ ALWAYS test in preview before deploying
npm run preview
# Visit http://localhost:8788/config
# Still works? Safe to deploy!
```

## Common Issues & Troubleshooting

### Issue: "Missing Supabase environment variables"

**Symptom:** Error in preview/production but dev works fine

**Cause:** Environment variables not yet injected at build time

**Solution:** Already fixed with lazy initialization pattern. If you see this error:
1. Verify environment variables are set in Webflow Cloud
2. Check `src/services/supabase.ts` uses lazy initialization
3. Don't access env vars at module load time

### Issue: Preview build fails with type errors

**Symptom:** `npm run preview` shows TypeScript errors

**Cause:** Unused code or incorrect imports

**Solution:**
1. Check `tsconfig.json` excludes unused directories
2. Verify imports use `@/*` aliases correctly
3. Run `npm run build` first to isolate the issue

### Issue: Package works in dev but fails in preview

**Symptom:** App crashes in preview with "X is not defined"

**Cause:** Package uses Node.js APIs not available in Edge runtime

**Solution:**
1. Find Edge-compatible alternative package
2. Wrap Node.js-dependent code in conditional imports
3. Use dynamic imports with fallbacks

### Issue: Slow preview iteration

**Symptom:** Takes 30 seconds to see changes

**Reality:** This is expected behavior

**Workflow:**
1. Use `npm run dev` for rapid iteration (99% of time)
2. Use `npm run preview` only before commits/deploys
3. Batch changes and test periodically in preview
4. Don't try to develop primarily in preview mode

## Deployment Workflow

### Recommended Process

1. **Develop** with `npm run dev`
   ```bash
   npm run dev
   # Make changes, iterate quickly
   ```

2. **Test locally** with `npm run preview` (before commit)
   ```bash
   npm run preview
   # Visit http://localhost:8788/config
   # Test all major features
   # Check browser console for errors
   ```

3. **Commit and push** (triggers automatic deploy)
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin main
   ```

4. **Monitor** Webflow Cloud deployment
   - Check build logs in Webflow dashboard
   - Verify deployment succeeded
   - Test production URL

5. **Rollback** if needed
   ```bash
   git revert HEAD
   git push origin main
   ```

## Performance Comparison

| Metric | npm run dev | npm run preview |
|--------|-------------|-----------------|
| Initial startup | 1-2 seconds | 10-30 seconds |
| Hot reload | <100ms | N/A (must rebuild) |
| Full rebuild | <100ms | 10-30 seconds |
| Bundle size check | ❌ No | ✅ Yes |
| Edge compatibility | ❌ No | ✅ Yes |
| Debugging experience | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

## Best Practices

### For Daily Development
1. ✅ Start with `npm run dev`
2. ✅ Develop and iterate quickly
3. ✅ Use React DevTools freely
4. ✅ Check browser console often
5. ⚠️ Remember: this is NOT production environment

### Before Deploying
1. ✅ Run `npm run preview`
2. ✅ Test all major user flows
3. ✅ Check for console errors
4. ✅ Verify environment variables work
5. ✅ Test with production Supabase data (if different)

### When Adding Dependencies
1. ✅ Install package: `npm install xyz`
2. ✅ Test in dev: `npm run dev`
3. ✅ **Always test in preview:** `npm run preview`
4. ✅ Check package is Edge-compatible
5. ❌ Don't commit if preview fails

### Troubleshooting Strategy
1. Does it work in dev? → Start with `npm run dev`
2. Does it work in preview? → Try `npm run preview`
3. Does it work in production? → Check Webflow Cloud logs
4. If only fails in preview/production → Edge compatibility issue
5. If only fails in production → Environment variables issue

## Summary

- **`npm run dev`**: Fast iteration (use 95% of the time)
- **`npm run preview`**: Production validation (use before deploys)
- **Edge runtime**: What actually runs in Webflow Cloud
- **Lazy initialization**: Required for runtime env vars
- **Test in preview**: Before every deployment
