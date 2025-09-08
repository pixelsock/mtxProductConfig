import { readItems } from '@directus/sdk';
import { directusClient } from './directus-client';

export type UiType = 'multi' | 'color-swatch' | 'size-grid' | 'grid-2' | string;

export interface ConfigurationUiItem {
  id: string;
  collection: string | null;
  // When present, `item` denotes the underlying option collection this UI config targets.
  // If absent, fall back to `collection` as the option collection key.
  item?: string | null;
  ui_type?: UiType | null;
  sort?: number | null;
  // Optional extended fields (safe to ignore if absent)
  label?: string | null;
  value_field?: string | null;
  display_field?: string | null;
  image_field?: string | null;
  status_mode?: 'status' | 'active' | 'none' | null;
  published_values?: string[] | null;
  sort_field?: string | null;
  group?: string | null;
  section_label?: string | null;
  section_sort?: number | null;
}

let cache: { byCollection: Record<string, UiType>, sortByCollection: Record<string, number> } | null = null;

export async function getConfigurationUi(): Promise<{ byCollection: Record<string, UiType>, sortByCollection: Record<string, number> } > {
  if (cache) return cache;
  try {
    const rows = await directusClient.request<ConfigurationUiItem[]>(
      readItems('configuration_ui' as any, { limit: -1, sort: ['sort'] } as any)
    );
    const byCollection: Record<string, UiType> = {};
    const sortByCollection: Record<string, number> = {};
    for (const r of rows || []) {
      const coll = (r.collection || '').trim();
      const ui = (r.ui_type || '').trim() as UiType;
      if (!coll || !ui) continue;
      if (!r.item) {
        byCollection[coll] = ui;
        if (typeof r.sort === 'number') sortByCollection[coll] = r.sort;
      }
    }
    cache = { byCollection, sortByCollection };
    return cache;
  } catch {
    return { byCollection: {}, sortByCollection: {} };
  }
}

export function invalidateConfigUiCache() { cache = null; }

// Returns raw configuration_ui rows (sorted) with all optional fields if present
export async function getConfigurationUiRows(): Promise<ConfigurationUiItem[]> {
  const rows = await directusClient.request<ConfigurationUiItem[]>(
    readItems('configuration_ui' as any, { limit: -1, sort: ['sort'] } as any)
  );
  return rows || [];
}
