# Quickstart: Debug Product Options Visibility

## Prerequisites
- Access to terminal with curl command
- Access to browser dev tools
- MTX Product Configurator running locally (`npm run dev`)
- Environment variables configured (VITE_DIRECTUS_URL, etc.)

## Quick Validation Steps

### 1. API Endpoint Validation (5 minutes)

Test Directus API connectivity and data structure:

```bash
# Test basic product lines endpoint
curl -X GET "https://pim.dude.digital/items/product_lines" \
  -H "Content-Type: application/json" \
  -G \
  -d "filter[active][_eq]=true" \
  -d "fields=*,default_options.*"

# Expected: Should return array with Polished product line containing default_options
```

### 2. Frontend Data Flow Check (3 minutes)

Open browser to `http://localhost:5173`:

1. Open browser DevTools Console
2. Select "Polished" product line in configurator
3. Look for console logs showing API calls and data
4. Check Network tab for API requests to `/items/product_lines`

**Expected Result**: Should see API call returning default_options data

### 3. Component Comparison (2 minutes)

In the configurator interface:

1. Locate where "option sets" are displayed (working)
2. Locate "current configurator section" (broken)
3. Compare what options appear in each section
4. Note specifically if accessories are missing

**Expected Issue**: Option sets show complete data, current configurator shows incomplete

## Systematic Debugging Process

### Phase 1: API Validation (10 minutes)

```bash
# 1. Test product lines with nested default_options
curl -X GET "https://pim.dude.digital/items/product_lines" \
  -H "Content-Type: application/json" \
  -G \
  -d "filter[active][_eq]=true" \
  -d "fields=id,name,sku_code,active,default_options.collection,default_options.item"

# 2. Test specific Polished product line  
curl -X GET "https://pim.dude.digital/items/product_lines" \
  -H "Content-Type: application/json" \
  -G \
  -d "filter[sku_code][_eq]=P" \
  -d "fields=*,default_options.*"

# 3. Test accessories collection specifically
curl -X GET "https://pim.dude.digital/items/accessories" \
  -H "Content-Type: application/json" \
  -G \
  -d "filter[active][_eq]=true"

# 4. Test code_order collection
curl -X GET "https://pim.dude.digital/items/code_order" \
  -H "Content-Type: application/json" \
  -G \
  -d "filter[active][_eq]=true" \
  -d "sort=order"

# 5. Test configuration_ui collection  
curl -X GET "https://pim.dude.digital/items/configuration_ui" \
  -H "Content-Type: application/json" \
  -G \
  -d "filter[active][_eq]=true" \
  -d "sort=display_order"
```

### Phase 2: Service Layer Debugging (15 minutes)

1. **Examine `src/services/directus.ts`**:
   - Find function that loads product line data
   - Add console.log for default_options processing
   - Verify data transformation steps

2. **Check Dynamic Options Service**:
   - Look for `getFilteredOptionsForProductLine` function
   - Verify it processes default_options correctly
   - Add logging to see what data reaches this function

3. **Validate Data Flow**:
   ```javascript
   // Add temporary debugging in service layer
   console.log('Raw API Response:', apiResponse);
   console.log('Default Options:', apiResponse.data.default_options);
   console.log('Processed Options:', processedOptions);
   ```

### Phase 3: Component Debugging (15 minutes)

1. **Find Current Configurator Component**:
   - Look in `src/components/` for current configurator section
   - Find where option data should be rendered
   - Add console.log to see what props/data component receives

2. **Compare with Working Option Sets**:
   - Find option sets component that works correctly
   - Compare data props between working and broken components
   - Identify differences in data structure or processing

3. **Check State Management**:
   - In `src/App.tsx`, verify ProductConfig state
   - Add console.log when product line changes
   - Verify default_options reach component state

### Phase 4: Fix Validation (10 minutes)

After identifying and fixing the issue:

1. **Retest API Endpoints**: Ensure curl commands still work
2. **Test Frontend Flow**: Verify configurator shows all options
3. **Test Specific Cases**:
   - Polished product line shows complete options
   - Accessories appear for all product lines
   - Options appear in correct order per configuration_ui
4. **Cross-browser Test**: Verify fix works in different browsers

## Success Criteria Checklist

- [ ] **API Returns Complete Data**: curl commands show default_options populated
- [ ] **Service Layer Processes Data**: console logs show data flowing through service
- [ ] **Components Receive Data**: React components get option data in props
- [ ] **UI Displays Options**: Current configurator section shows same options as option sets
- [ ] **Polished Product Line Works**: All expected options visible when Polished selected
- [ ] **Accessories Universal**: Accessories appear for all product lines
- [ ] **Order Respected**: Options appear in sequence defined by configuration_ui collection
- [ ] **No Regressions**: Existing functionality still works (option sets, quote generation)

## Common Issues and Solutions

### Issue: API returns empty default_options
**Solution**: Check product line configuration in Directus admin, verify relationships

### Issue: Service layer not processing default_options  
**Solution**: Check function parameters and data transformation logic

### Issue: Components receive undefined/null data
**Solution**: Verify React state updates and prop passing

### Issue: Options appear in wrong order
**Solution**: Check configuration_ui collection and sorting logic

## Time Estimate
- Initial validation: 10 minutes
- Systematic debugging: 40 minutes  
- Fix implementation: 20 minutes
- Validation and testing: 15 minutes
- **Total**: ~1.5 hours