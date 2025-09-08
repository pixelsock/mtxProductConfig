// Validation: configuration_ui vs product_lines.default_options
// - Ensures every collection in default_options has a ui config row
// - Reports extra ui rows without defaults
// - Prints final render order per product line based on configuration_ui.sort
// Usage: node scripts/validate-configuration-ui.js

import { createDirectus, rest, staticToken, readItems } from '@directus/sdk';

const DIRECTUS_URL = process.env.VITE_DIRECTUS_URL || process.env.DIRECTUS_URL || 'https://pim.dude.digital:8056';
const API_KEY = process.env.VITE_DIRECTUS_API_KEY || process.env.DIRECTUS_API_KEY || '';

const client = createDirectus(DIRECTUS_URL).with(rest()).with(API_KEY ? staticToken(API_KEY) : (c) => c);

async function fetchConfigurationUi() {
  const rows = await client.request(readItems('configuration_ui', { limit: -1, sort: ['sort'] }));
  return (rows || []).map((r) => ({
    collection: (r.collection || '').trim(),
    item: (r.item || '').trim?.() || undefined,
    ui_type: r.ui_type || null,
    sort: typeof r.sort === 'number' ? r.sort : null,
  }));
}

async function fetchProductLines() {
  const lines = await client.request(readItems('product_lines', { fields: ['id', 'name', 'sku_code', 'default_options.*'], limit: -1, sort: ['sort'] }));
  return lines || [];
}

function keyFromUiRow(r) {
  // If `item` exists, it denotes the target option collection
  return (r.item && String(r.item).trim()) || (r.collection && String(r.collection).trim()) || '';
}

function groupDefaultsByCollection(defaults) {
  const by = {};
  for (const d of defaults || []) {
    const coll = d?.collection;
    const item = d?.item;
    if (!coll || item === undefined || item === null) continue;
    if (!by[coll]) by[coll] = [];
    by[coll].push(item);
  }
  return by;
}

async function main() {
  console.log(`Validating configuration_ui against product_lines.default_options…`);
  console.log(`Directus: ${DIRECTUS_URL}`);
  const uiRows = await fetchConfigurationUi();
  const lines = await fetchProductLines();

  const uiByKey = new Map();
  for (const r of uiRows) {
    const key = keyFromUiRow(r);
    if (!key) continue;
    if (!uiByKey.has(key)) uiByKey.set(key, r);
  }

  const allDefaultCollections = new Set();
  for (const pl of lines) {
    const groups = groupDefaultsByCollection(pl.default_options);
    Object.keys(groups).forEach((k) => allDefaultCollections.add(k));
  }

  const missingUi = [];
  for (const coll of Array.from(allDefaultCollections)) {
    if (!uiByKey.has(coll)) missingUi.push(coll);
  }

  const extraUi = [];
  for (const r of uiRows) {
    const key = keyFromUiRow(r);
    if (key && !allDefaultCollections.has(key)) extraUi.push(key);
  }

  console.log(`\nCollections with defaults but missing configuration_ui rows:`);
  if (missingUi.length === 0) console.log('  ✓ None');
  else missingUi.forEach((c) => console.log(`  - ${c}`));

  console.log(`\nconfiguration_ui rows without any defaults across product lines:`);
  if (extraUi.length === 0) console.log('  ✓ None');
  else Array.from(new Set(extraUi)).forEach((c) => console.log(`  - ${c}`));

  console.log(`\nPer-product line render order (by configuration_ui.sort, filtered by defaults):`);
  for (const pl of lines) {
    const groups = groupDefaultsByCollection(pl.default_options);
    const keys = Object.keys(groups);
    const withSort = keys.map((k) => ({ k, s: uiByKey.get(k)?.sort ?? Number.MAX_SAFE_INTEGER }));
    withSort.sort((a, b) => a.s - b.s);
    const ordered = withSort.map((x) => x.k);
    console.log(`  - ${pl.name} (${pl.sku_code}): ${ordered.join(', ') || '(none)'}`);
  }

  console.log(`\nDone.`);
}

main().catch((e) => {
  console.error('Validation failed:', e?.message || e);
  process.exit(1);
});
