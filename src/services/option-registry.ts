// OptionRegistry — central place to discover option sets and fetch their items
// Phase 1 scaffold: reads configuration_ui and exposes minimal metadata.

import { readItems } from '@directus/sdk';
import { directusClient } from './directus-client';
import { getConfigurationUiRows, UiType } from './config-ui';

export type StatusMode = 'status' | 'active' | 'none';

export interface OptionSetMeta {
  // Key used to match product_line.default_options.collection
  collection: string;
  uiType: UiType;
  sort?: number;
  // Optional, planned extensions via configuration_ui in Directus
  // UI block label/category can come from the original configuration_ui.collection
  uiBlock?: string;
  label?: string;
  valueField?: string; // e.g., 'id' | 'sku_code'
  displayField?: string; // e.g., 'name'
  imageField?: string; // e.g., 'image' or relation
  statusMode?: StatusMode; // default inferred: 'active'
  publishedValues?: string[]; // for status-mode 'status'
  sortField?: string; // fallback to 'sort'
  group?: string;
  sectionLabel?: string;
  sectionSort?: number;
}

export interface OptionRegistrySnapshot {
  byCollection: Record<string, OptionSetMeta>;
  orderedCollections: string[];
}

let registryCache: OptionRegistrySnapshot | null = null;

export async function loadOptionRegistry(): Promise<OptionRegistrySnapshot> {
  if (registryCache) return registryCache;

  const rows = await getConfigurationUiRows();
  const byCollection: Record<string, OptionSetMeta> = {};
  const orderedCollections: string[] = [];

  for (const r of rows) {
    const rawCollection = (r.collection || '').trim();
    const target = (r.item || '').trim();
    const collectionKey = (target || rawCollection);
    const uiType = (r.ui_type || '').trim() as UiType;
    if (!collectionKey || !uiType) continue;
    // collectionKey is what matches default_options.collection
    const meta: OptionSetMeta = {
      collection: collectionKey,
      uiType,
      sort: typeof r.sort === 'number' ? r.sort : undefined,
      uiBlock: rawCollection || undefined,
      label: r.label || undefined,
      valueField: r.value_field || undefined,
      displayField: r.display_field || undefined,
      imageField: r.image_field || undefined,
      statusMode: (r.status_mode as any) || 'active',
      publishedValues: Array.isArray(r.published_values) ? r.published_values : undefined,
      sortField: r.sort_field || 'sort',
      group: r.group || undefined,
      sectionLabel: r.section_label || undefined,
      sectionSort: typeof r.section_sort === 'number' ? r.section_sort : undefined,
    };
    byCollection[collectionKey] = meta;
    orderedCollections.push(collectionKey);
  }
  // Sort by configuration_ui.sort where available
  orderedCollections.sort((a, b) => ((byCollection[a].sort ?? 0) - (byCollection[b].sort ?? 0)));

  registryCache = { byCollection, orderedCollections };
  return registryCache;
}

export function invalidateOptionRegistry() {
  registryCache = null;
}

// Generic fetch for an option set. Honors basic status/active patterns.
export async function getOptions<T = any>(
  optionSetOrCollection: string,
  extraQuery?: Record<string, any>
): Promise<T[]> {
  const reg = await loadOptionRegistry();
  const meta = reg.byCollection[optionSetOrCollection] || reg.byCollection[optionSetOrCollection.toLowerCase()];
  const collection = meta?.collection || optionSetOrCollection;

  const filter: Record<string, any> = {};
  const sort: string[] = [];

  // Status filtering
  const mode: StatusMode = meta?.statusMode || 'active';
  if (mode === 'active') {
    filter.active = { _neq: false }; // include true and null; exclude explicit false
  } else if (mode === 'status') {
    const values = meta?.publishedValues && meta.publishedValues.length > 0 ? meta.publishedValues : ['published'];
    filter.status = { _in: values };
  }

  // Sorting
  if (meta?.sortField) sort.push(meta.sortField);
  else sort.push('sort');

  const query = {
    limit: -1,
    sort,
    filter,
    ...(extraQuery || {}),
  } as any;

  return await directusClient.request<T[]>(readItems(collection as any, query));
}
