# MCP Dependency Removal - Implementation Guide

> **Archived Note (2025-09 Supabase Migration):** MCP/Directus guidance is obsolete after the Supabase-only rewrite. Retained for reference.

## 🚨 CRITICAL TASK: Remove MCP Wrapper and Implement Direct Directus SDK

**Priority**: CRITICAL (Production Blocker)
**Estimated Time**: 4-6 hours
**Assigned to**: Development Agent
**Deadline**: ASAP

---

## 📋 Task Overview

The application is currently using a mock "MCP tool" wrapper around the Directus SDK. This wrapper needs to be removed and replaced with direct SDK calls to enable production deployment.

**Current Flow**: App.tsx → directus.ts → mcp-directus.ts → @directus/sdk
**Target Flow**: App.tsx → directus.ts → @directus/sdk (direct)

---

## 🎯 Files to Modify

### 1. Update `src/services/directus.ts`

**Current problematic code** (line 108):
```typescript
import { getDirectusItems as mcpGetDirectusItems } from './mcp-directus';
```

**Current MCP wrapper function** (lines 114-116):
```typescript
async function getDirectusItems(collection: string, query?: any): Promise<any[]> {
  console.log(`Fetching ${collection} from Directus via MCP tool...`);
  return await mcpGetDirectusItems(collection, query);
}
```

### 2. Delete `src/services/mcp-directus.ts`
This entire file should be deleted as it only exists as a wrapper.

---

## 🔧 Implementation Steps

### Step 1: Add Direct Directus SDK Import
Replace the MCP import with direct SDK imports in `directus.ts`:

```typescript
// Remove this line:
import { getDirectusItems as mcpGetDirectusItems } from './mcp-directus';

// Add these imports instead:
import { createDirectus, rest, readItems } from '@directus/sdk';
```

### Step 2: Create Directus Client
Add the client configuration at the top of `directus.ts` (after imports):

```typescript
// Directus client configuration
const DIRECTUS_URL = 'https://pim.dude.digital';
const directusClient = createDirectus(DIRECTUS_URL).with(rest());
```

### Step 3: Replace MCP Wrapper Function
Replace the existing `getDirectusItems` function (lines 114-116) with:

```typescript
// Direct Directus SDK implementation - no MCP wrapper
async function getDirectusItems(collection: string, query?: any): Promise<any[]> {
  console.log(`Fetching ${collection} from Directus...`);
  
  try {
    const items = await directusClient.request(readItems(collection, query || {}));
    return Array.isArray(items) ? items : [];
  } catch (error) {
    console.error(`Error fetching ${collection} from Directus:`, error);
    throw error;
  }
}
```

### Step 4: Delete MCP File
Delete the entire file: `src/services/mcp-directus.ts`

---

## 📝 Complete Code Changes

### File: `src/services/directus.ts`

**Lines 1-10 (imports section):**
```typescript
// Directus Service Layer - Direct API Integration
import { createDirectus, rest, readItems } from '@directus/sdk';

// Remove this MCP import:
// import { getDirectusItems as mcpGetDirectusItems } from './mcp-directus';
```

**Add after imports (around line 110):**
```typescript
// Directus client configuration
const DIRECTUS_URL = 'https://pim.dude.digital';
const directusClient = createDirectus(DIRECTUS_URL).with(rest());
```

**Replace lines 114-116:**
```typescript
// Direct Directus SDK implementation - no MCP wrapper needed
async function getDirectusItems(collection: string, query?: any): Promise<any[]> {
  console.log(`Fetching ${collection} from Directus...`);
  
  try {
    const items = await directusClient.request(readItems(collection, query || {}));
    return Array.isArray(items) ? items : [];
  } catch (error) {
    console.error(`Error fetching ${collection} from Directus:`, error);
    throw error;
  }
}
```

### File: `src/services/mcp-directus.ts`
**Action**: DELETE this entire file

---

## 🧪 Testing Steps

### 1. Test Application Startup
```bash
npm run dev
```
- ✅ App should start without errors
- ✅ No MCP-related error messages
- ✅ Console should show "Directus service initialized successfully"

### 2. Test Data Loading
Check browser console for successful data loading:
```
✓ Loaded X mirror controls
✓ Loaded X frame colors
✓ Loaded X mirror styles
✓ Loaded X size options
```

### 3. Test Product Configuration
- ✅ All dropdown options populate correctly
- ✅ Product image updates when configuration changes
- ✅ Quote generation works properly
- ✅ No API error messages in console

### 4. Test API Endpoints
All these collections should load successfully:
- product_lines (12 items)
- frame_colors (3 items)
- mirror_controls (~12 items)
- mirror_styles (~25 items)
- mounting_options (~6 items)
- light_directions (~8 items)
- color_temperatures (~8 items)
- light_outputs (~10 items)
- drivers (~12 items)
- frame_thicknesses (~8 items)
- sizes (~40 items)
- accessories (~40 items, filtered to ~2)
- products (deco collection, ~500 items)

---

## 🚨 Troubleshooting Guide

### Common Issues and Solutions

#### Issue 1: "Cannot resolve module '@directus/sdk'"
**Solution**: SDK is already installed in package.json, restart dev server
```bash
npm install
npm run dev
```

#### Issue 2: CORS errors
**Solution**: Directus instance should already be configured for public access
- Check if `https://pim.dude.digital` is accessible
- Verify API returns data: `https://pim.dude.digital/items/product_lines`

#### Issue 3: Authentication errors  
**Solution**: API appears to be public, no auth should be needed
- If auth is required, add token to client configuration
- Check with project stakeholders for API credentials

#### Issue 4: Empty data arrays
**Solution**: Check collection names and query formatting
- Verify collection names match exactly (underscore vs dash)
- Check that filters use correct Directus query syntax

#### Issue 5: TypeScript errors
**Solution**: All interfaces should already be compatible
- Existing interfaces in `directus.ts` match API responses
- No typing changes should be needed

---

## ✅ Success Criteria

### Functional Tests
- [ ] Application starts without MCP-related errors
- [ ] All 14 data collections load successfully  
- [ ] Product configurator works end-to-end
- [ ] Image generation works for product configurations
- [ ] Quote generation functions properly
- [ ] No console errors during normal usage

### Performance Tests
- [ ] Initial data load completes within 10 seconds
- [ ] Subsequent loads use cache (5-minute TTL)
- [ ] API responses are reasonably fast (<2 seconds per collection)

### Code Quality
- [ ] No references to MCP remain in codebase
- [ ] TypeScript compilation succeeds
- [ ] ESLint passes with no new warnings
- [ ] Console logs are clean and informative

---

## 🎯 Post-Implementation Steps

### 1. Verify Production Readiness
- Test that app works without any MCP dependencies
- Confirm all features function correctly
- Check for any remaining development-only code

### 2. Static File Cleanup (Separate Task)
After confirming API integration works:
- Delete all files in `/data` directory
- Remove `/data` directory entirely
- Update any build configurations if needed

### 3. Environment Configuration
- Add `VITE_DIRECTUS_URL` environment variable if needed
- Update deployment documentation
- Prepare production build configuration

---

## 📞 Support Contacts

**Task Manager**: Available for coordination and blocker resolution
**API Researcher**: Available for endpoint verification and troubleshooting
**Project Lead**: Escalation for any production readiness concerns

---

## 📊 Progress Tracking

### Implementation Checklist
- [ ] Import statements updated in `directus.ts`
- [ ] Directus client configuration added
- [ ] `getDirectusItems` function replaced
- [ ] `mcp-directus.ts` file deleted
- [ ] Application starts successfully
- [ ] All collections load properly
- [ ] End-to-end functionality verified
- [ ] No MCP references remain

### Time Estimates
- **Planning & Setup**: 30 minutes ✅
- **Code Implementation**: 1-2 hours
- **Testing & Debugging**: 2-3 hours  
- **Verification & Documentation**: 1 hour
- **Total**: 4-6 hours

---

*Implementation guide prepared by Task Planning Agent*
*Status: Ready for immediate development*
*Priority: CRITICAL - Production blocker*
