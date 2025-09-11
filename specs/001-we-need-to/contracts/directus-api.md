# Directus API Contracts for Troubleshooting

## Product Lines Endpoint

### GET /items/product_lines
**Purpose**: Retrieve product lines with default_options for debugging  
**Required Parameters**:
- `filter[active][_eq]=true` - Only active product lines
- `fields=*,default_options.*` - Include nested default_options

**Expected Response Structure**:
```json
{
  "data": [
    {
      "id": 1,
      "name": "Polished",
      "sku_code": "P", 
      "active": true,
      "default_options": [
        {
          "collection": "frame_colors",
          "item": "1"
        },
        {
          "collection": "accessories", 
          "item": "5"
        }
      ]
    }
  ]
}
```

**Curl Test Command**:
```bash
curl -X GET "https://pim.dude.digital/items/product_lines" \
  -H "Content-Type: application/json" \
  -G \
  -d "filter[active][_eq]=true" \
  -d "fields=*,default_options.*"
```

### GET /items/product_lines/{id}
**Purpose**: Get specific product line with complete default_options  
**Required Parameters**:
- `fields=*,default_options.*` - Include nested relationships

**Expected Response**:
```json
{
  "data": {
    "id": 1,
    "name": "Polished",
    "sku_code": "P",
    "active": true,
    "default_options": [...]
  }
}
```

## Configuration Collections Endpoints

### GET /items/{collection_name}
**Purpose**: Retrieve items referenced in default_options  
**Collections**: frame_colors, accessories, mirror_controls, etc.  
**Required Parameters**:
- `filter[active][_eq]=true` - Only active items
- `filter[id][_in]=[id1,id2,id3]` - Filter by IDs from default_options

**Example for Accessories**:
```bash
curl -X GET "https://pim.dude.digital/items/accessories" \
  -H "Content-Type: application/json" \
  -G \
  -d "filter[active][_eq]=true" \
  -d "filter[id][_in]=5,6,7"
```

## Code Order and Configuration UI

### GET /items/code_order  
**Purpose**: Get SKU building order for collections  
**Expected Response**:
```json
{
  "data": [
    {
      "id": 1,
      "collection": "frame_colors",
      "order": 1,
      "active": true
    }
  ]
}
```

### GET /items/configuration_ui
**Purpose**: Get display order for configurator interface  
**Expected Response**:
```json
{
  "data": [
    {
      "id": 1,
      "collection": "frame_colors", 
      "display_order": 1,
      "active": true
    }
  ]
}
```

## Contract Validation Requirements

### API Response Validation
1. **Status Code**: 200 for successful requests
2. **Content-Type**: application/json
3. **Data Structure**: Valid JSON with expected schema
4. **Nested Relations**: default_options properly expanded
5. **Filter Compliance**: Only active=true items returned

### Data Integrity Validation  
1. **Reference Integrity**: All default_options items exist
2. **Active Status**: Referenced items have active=true
3. **Collection Validity**: Referenced collections exist
4. **Order Consistency**: code_order and configuration_ui have valid sequences

### Error Handling Contracts
1. **404 Not Found**: When product line doesn't exist
2. **400 Bad Request**: When invalid filter parameters provided
3. **500 Server Error**: When database connection fails
4. **Graceful Degradation**: Partial success when some references invalid

## Debug Validation Checklist

### Curl Command Validation
- [ ] Product lines endpoint returns data
- [ ] Default_options are populated (not empty arrays)
- [ ] Referenced collections are accessible
- [ ] Active filtering works correctly
- [ ] Nested field expansion works

### Data Consistency Validation
- [ ] Polished product line exists and has default_options
- [ ] Accessories appear in default_options for all product lines
- [ ] All referenced items have valid IDs
- [ ] Code_order collection has entries for all option types
- [ ] Configuration_ui collection defines display sequence

### Integration Validation
- [ ] Same data available to both option sets and current configurator
- [ ] No data transformation errors between API and frontend
- [ ] Filtering parameters match between different UI components
- [ ] Order collections properly utilized for display sequence