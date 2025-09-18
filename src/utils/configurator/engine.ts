import { COLLECTION_MAPPINGS, type CollectionKey, type ConfiguratorOption } from '../../types/database'
import type { Database } from '../../types/database'
import type { ConfigurationState } from '../supabase/directClientSimplified'

export type SkuIndexRow = Database['public']['Tables']['sku_index']['Row']

export interface FilterContext {
  productLineId: number
  skuRows: SkuIndexRow[]
  optionMetadata: Record<CollectionKey, ConfiguratorOption[] | any[]>
  totalSkus: number
}

export interface FilterResult {
  options: Record<string, any[]>
  remainingSkus: number
  totalSkus: number
  productCount: number
  matchingSkus: SkuIndexRow[]
  availableProducts: any[]
}

const COLUMN_LOOKUP: Record<string, string> = (() => {
  const lookup: Record<string, string> = {
    productId: 'product_id',
    product_id: 'product_id'
  }

  Object.entries(COLLECTION_MAPPINGS).forEach(([collection, meta]) => {
    lookup[collection] = meta.column
    lookup[`${collection}_id`] = meta.column
    lookup[meta.column] = meta.column
  })

  return lookup
})()

const normalizeSelections = (selections: ConfigurationState = {}): [string, number][] => {
  const entries: [string, number][] = []

  Object.entries(selections).forEach(([rawKey, rawValue]) => {
    if (rawValue === null || rawValue === undefined || rawValue === '') {
      return
    }

    const column = COLUMN_LOOKUP[rawKey]
    if (!column) {
      return
    }

    let parsed: number | null = null

    if (typeof rawValue === 'number') {
      parsed = rawValue
    } else if (typeof rawValue === 'string') {
      const numeric = parseInt(rawValue, 10)
      if (!Number.isNaN(numeric)) {
        parsed = numeric
      }
    }

    if (parsed !== null) {
      entries.push([column, parsed])
    }
  })

  return entries
}

const buildOptionIdSets = (skuRows: SkuIndexRow[]) => {
  const optionSets: Record<CollectionKey, Set<number>> = {} as any

  Object.keys(COLLECTION_MAPPINGS).forEach(collection => {
    optionSets[collection as CollectionKey] = new Set<number>()
  })

  skuRows.forEach(sku => {
    Object.entries(COLLECTION_MAPPINGS).forEach(([collection, meta]) => {
      const value = (sku as any)[meta.column]
      if (typeof value === 'number' && !Number.isNaN(value)) {
        optionSets[collection as CollectionKey].add(value)
      }
    })
  })

  return optionSets
}

export const filterOptions = (
  context: FilterContext,
  selections: ConfigurationState
): FilterResult => {
  const normalizedSelections = normalizeSelections(selections)

  const activeSkus = normalizedSelections.length === 0
    ? context.skuRows
    : context.skuRows.filter(sku =>
        normalizedSelections.every(([column, value]) => (sku as any)[column] === value)
      )

  const optionSets = buildOptionIdSets(activeSkus)

  const options: Record<string, any[]> = {}

  Object.entries(COLLECTION_MAPPINGS).forEach(([collection]) => {
    const ids = optionSets[collection as CollectionKey]
    const metadata = context.optionMetadata[collection as CollectionKey] || []

    if (!ids || ids.size === 0) {
      options[collection] = []
      return
    }

    const filteredOptions = Array.isArray(metadata)
      ? metadata.filter(option => ids.has((option as any).id))
      : []

    options[collection] = filteredOptions
  })

  const productIds = optionSets.products || new Set<number>()
  const productMetadata = context.optionMetadata.products || []
  const availableProducts = Array.isArray(productMetadata)
    ? productMetadata.filter(product => productIds.has(product.id))
    : []

  const uniqueProductCount = availableProducts.length

  return {
    options,
    remainingSkus: activeSkus.length,
    totalSkus: context.totalSkus,
    productCount: uniqueProductCount,
    matchingSkus: activeSkus,
    availableProducts
  }
}
