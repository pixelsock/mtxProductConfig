import React from 'react';
import DynamicOptions from './dynamic-options';
import type { DefaultOption } from '../../services/directus-client';
import { loadOptionRegistry, getOptions } from '../../services/option-registry';

interface Props {
  productLineDefaults: DefaultOption[] | undefined;
  currentConfig: any;
  onChange: (key: string, value: string | string[]) => void;
  availableOptionIds?: Record<string, number[]>;
  customSize?: boolean;
  onToggleCustomSize?: (v: boolean) => void;
  // Optional: preloaded options map to avoid fetching per-collection
  preloadedOptionsByCollection?: Record<string, any[]>;
}

export const DynamicOptionsContainer: React.FC<Props> = ({
  productLineDefaults,
  currentConfig,
  onChange,
  availableOptionIds = {},
  customSize = false,
  onToggleCustomSize,
  preloadedOptionsByCollection,
}) => {
  const [optionsByCollection, setOptionsByCollection] = React.useState<Record<string, any[]>>({});
  const [uiByCollection, setUiByCollection] = React.useState<Record<string, string>>({});
  const [uiSortByCollection, setUiSortByCollection] = React.useState<Record<string, number>>({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const reg = await loadOptionRegistry();

        // Build UI maps for collections present in defaults (if provided)
        const defaults = Array.isArray(productLineDefaults) ? productLineDefaults : [];
        // Group default IDs by collection; we will fetch only these IDs
        const idsByCollection = defaults.reduce((acc: Record<string, (string | number)[]>, d: any) => {
          const coll = d?.collection;
          const item = d?.item;
          if (!coll || item === undefined || item === null) return acc;
          if (!acc[coll]) acc[coll] = [];
          acc[coll].push(item);
          return acc;
        }, {} as Record<string, (string | number)[]>);
        const collections = Object.keys(idsByCollection);

        const uiMap: Record<string, string> = {};
        const uiSort: Record<string, number> = {};
        for (const coll of collections) {
          const meta = reg.byCollection[coll];
          if (meta) {
            uiMap[coll] = meta.uiType as string;
            if (typeof meta.sort === 'number') uiSort[coll] = meta.sort as number;
          }
        }
        if (!cancelled) {
          setUiByCollection(uiMap);
          setUiSortByCollection(uiSort);
        }

        // Use preloaded options if provided; otherwise fetch dynamically
        if (preloadedOptionsByCollection && Object.keys(preloadedOptionsByCollection).length > 0) {
          // Preserve requested order based on defaults
          const byColl: Record<string, any[]> = {};
          for (const coll of collections) {
            const idList = (idsByCollection[coll] || []).map((x) => (typeof x === 'number' ? x : String(x)));
            const rows = preloadedOptionsByCollection[coll] || [];
            const indexMap = new Map(idList.map((v, i) => [String(v), i]));
            const sorted = (rows || []).sort((a: any, b: any) => (indexMap.get(String(a.id)) ?? 0) - (indexMap.get(String(b.id)) ?? 0));
            byColl[coll] = sorted;
          }
          if (!cancelled) setOptionsByCollection(byColl);
        } else {
          const byColl: Record<string, any[]> = {};
          await Promise.all(
            collections.map(async (coll) => {
              const idList = (idsByCollection[coll] || []).map((x) => (typeof x === 'number' ? x : String(x)));
              if (idList.length === 0) { byColl[coll] = []; return; }
              const rows = await getOptions<any>(coll, { filter: { id: { _in: idList } }, limit: -1 });
              const indexMap = new Map(idList.map((v, i) => [String(v), i]));
              const sorted = (rows || []).sort((a: any, b: any) => (indexMap.get(String(a.id)) ?? 0) - (indexMap.get(String(b.id)) ?? 0));
              byColl[coll] = sorted;
            })
          );
          if (!cancelled) setOptionsByCollection(byColl);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load options');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productLineDefaults, preloadedOptionsByCollection]);

  if (error) {
    return <div className="text-sm text-red-600">{error}</div>;
  }

  if (loading) {
    return <div className="text-sm text-gray-500">Loading options…</div>;
  }

  return (
    <DynamicOptions
      productLineDefaults={productLineDefaults}
      optionsByCollection={optionsByCollection}
      uiByCollection={uiByCollection}
      uiSortByCollection={uiSortByCollection}
      currentConfig={currentConfig}
      availableOptionIds={availableOptionIds}
      customSize={customSize}
      onToggleCustomSize={onToggleCustomSize}
      onChange={onChange}
    />
  );
};

export default DynamicOptionsContainer;
