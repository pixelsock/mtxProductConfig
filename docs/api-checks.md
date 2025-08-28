# Directus API Checks (Terminal-First)

Purpose: quick, reliable terminal and Node one-liners to validate live Directus data, schemas, and assets. Use these before coding changes and whenever errors suggest schema or data drift.

Environment
- `VITE_DIRECTUS_URL` (e.g., https://pim.dude.digital)
- `VITE_DIRECTUS_API_KEY` (non-sensitive static token suitable for browser)

Quick Checks (cURL)
- Ping API: `curl -sS "$VITE_DIRECTUS_URL" | head -n1`
- List collections (count): `curl -sS "$VITE_DIRECTUS_URL"/collections | jq '.data | length'`
- Rules sample: `curl -sS -H "Authorization: Bearer $VITE_DIRECTUS_API_KEY" "$VITE_DIRECTUS_URL/items/rules?limit=3" | jq '.data[] | {id,name,priority}'`
- Products fields (images): `curl -sS -H "Authorization: Bearer $VITE_DIRECTUS_API_KEY" "$VITE_DIRECTUS_URL/items/products?limit=3&fields=id,name,vertical_image,horizontal_image,additional_images.directus_files_id.id" | jq '.data'`
- Filter example (Deco by product_line.sku_code=D): `curl -sS -H "Authorization: Bearer $VITE_DIRECTUS_API_KEY" "$VITE_DIRECTUS_URL/items/products?filter[product_line][sku_code][_eq]=D&limit=3&fields=id,name,product_line,mirror_style,light_direction" | jq '.data'`
- Pagination (page through products): `for o in 0 200 400; do curl -sS -H "Authorization: Bearer $VITE_DIRECTUS_API_KEY" "$VITE_DIRECTUS_URL/items/products?limit=200&offset=$o" | jq '.data | length'; done`
- Asset HEAD check: `curl -sI "$VITE_DIRECTUS_URL/assets/<file_id>" | head -n1`

Node (SDK) Snippets
- Client: 
  ```js
  import { createDirectus, rest, graphql, staticToken, readItems } from '@directus/sdk';
  const url = process.env.VITE_DIRECTUS_URL;
  const key = process.env.VITE_DIRECTUS_API_KEY;
  const client = createDirectus(url).with(rest()).with(graphql()).with(staticToken(key));
  ```
- Products (images + active):
  ```js
  const page = await client.request(readItems('products', {
    fields: ['id','name','vertical_image','horizontal_image','additional_images.directus_files_id.id','active'],
    filter: { active: { _neq: false } },
    limit: 3
  }));
  console.log(page);
  ```
- Rules (ordered):
  ```js
  const rules = await client.request(readItems('rules'));
  rules.sort((a,b)=>(a.priority ?? 1e15) - (b.priority ?? 1e15));
  console.log(rules.map(r=>({id:r.id,name:r.name,priority:r.priority})));
  ```

SKU-Oriented Checks
- Exact SKU by `name` (if SKU naming): `curl -sS -H "Authorization: Bearer $VITE_DIRECTUS_API_KEY" "$VITE_DIRECTUS_URL/items/products?filter[name][_eq]=T01D&fields=id,name,vertical_image,horizontal_image" | jq '.data'`
- Prefix match (API supports `_contains` on strings): `curl -sS -H "Authorization: Bearer $VITE_DIRECTUS_API_KEY" "$VITE_DIRECTUS_URL/items/products?filter[name][_contains]=T01&limit=10&fields=id,name" | jq '.data'`
- Distinct availability by attributes (IDs):
  ```bash
  curl -sS -H "Authorization: Bearer $VITE_DIRECTUS_API_KEY" \
    "$VITE_DIRECTUS_URL/items/products?filter[product_line][_eq]=<id>&fields=mirror_style,light_direction&limit=-1" \
    | jq '.data | map({ms:.mirror_style, ld:.light_direction}) | unique'
  ```

Schema/Introspection
- Collections: `curl -sS "$VITE_DIRECTUS_URL/collections" | jq '.data[].collection'`
- Fields (products): `curl -sS "$VITE_DIRECTUS_URL/fields/products" | jq '.data[] | {field,type} | select(.field|test("image|additional"))'`
- Use `node scripts/introspect-schema.js` and `node scripts/validate-queries.js` for deeper checks.

Rules Engine Sanity
- Show first matching rule (manual): fetch rules (above), examine `if_this` and `than_that` structure, then validate an example config object against operators `_and`, `_or`, `_eq`, `_in`.
- Confirm SKU overrides exist only via rules or product line.

When To Update This Doc
- After any schema change in Directus (new fields/collections or renamed fields)
- After adding/adjusting rules that affect availability/SKU overrides
- When adding new checks (e.g., pricing, drivers) or encountering new error classes
- At least once per feature that touches data contracts

How Agents Should Use This
- Before coding: run relevant checks to confirm live data shapes
- During PRs: paste the exact commands and brief outputs you used to validate
- If checks fail: fix Directus config or adjust code accordingly—never insert fallback data

