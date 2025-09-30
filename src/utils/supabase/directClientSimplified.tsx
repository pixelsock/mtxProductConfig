import { createClient } from '@supabase/supabase-js'
import { COLLECTION_MAPPINGS } from '../../types/database'
import type { CollectionKey } from '../../types/database'
import type { Database } from '../../types/database'

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL as string
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY as string

console.log('DirectClient: Initializing simplified client with URL:', supabaseUrl)

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

type SkuIndexRow = Database['public']['Tables']['sku_index']['Row']

interface ProductLineCache {
  skuIndexRows: SkuIndexRow[]
  options: Record<CollectionKey, any[]>
  totalSkus: number
  lastLoaded: number
}

export interface ProductLineContext {
  productLineId: number
  skuRows: SkuIndexRow[]
  optionMetadata: Record<CollectionKey, any[]>
  totalSkus: number
}

type NormalizedSelections = Record<string, number>

const PRODUCT_LINE_CACHE_TTL = 5 * 60 * 1000

const COLUMN_LOOKUP: Record<string, string> = (() => {
  const lookup: Record<string, string> = {
    product_id: 'product_id',
    productId: 'product_id'
  }

  Object.entries(COLLECTION_MAPPINGS).forEach(([collection, meta]) => {
    lookup[`${collection}_id`] = meta.column
    lookup[meta.column] = meta.column
  })

  return lookup
})()

export interface ProductLinesResponse {
  productLines: ConfiguratorProductLine[]
  totalProducts: number
  totalSkus: number
}

export interface ConfiguratorProductLine {
  id: string
  numericId: number
  label: string
  value: string
  count: number
  description?: string
  defaultOptions?: Record<string, any[]>
}

export interface DynamicConfigurationOptions {
  options: Record<string, any[]>
  totalProducts: number
  totalSkus: number
  remainingSkus: number
  remainingSkuCount: number
  productLineId: number | null
  configurationUI: any[]
  rules: any[]
  defaultOptions: Record<string, any[]>
  availableProducts: any[]
}

export interface ConfigurationState {
  [key: string]: number | string | null | undefined
}

export class SimplifiedDirectSupabaseClient {
  private productLineCache = new Map<number, ProductLineCache>()
  private configurationUICache: any[] | null = null
  private rulesCache: any[] | null = null
  private optionMetadataCache: Record<string, any[]> | null = null
  private optionMetadataCacheLoadedAt = 0
  
  clearCaches() {
    this.productLineCache.clear()
    this.configurationUICache = null
    this.rulesCache = null
    this.optionMetadataCache = null
    this.optionMetadataCacheLoadedAt = 0
  }
  
  
  async getProductLines(): Promise<ProductLinesResponse> {
    console.log('SimplifiedDirectClient: Fetching product lines with default options...')
    
    try {
      // Get product lines with junction table data
      const { data: productLineData, error: productLineError } = await supabase
        .from('product_lines')
        .select(`
          id, 
          name, 
          sku_code, 
          active, 
          sort, 
          description,
          product_lines_default_options (
            collection,
            item
          )
        `)
        .eq('active', true)
        .order('sort', { ascending: true })

      if (productLineError) {
        console.error('SimplifiedDirectClient: Error fetching product lines:', productLineError)
        throw new Error(`Failed to fetch product lines: ${productLineError.message}`)
      }

      console.log('SimplifiedDirectClient: Found product lines:', productLineData?.length || 0)

      // Process product lines and build default options
      const processedProductLines: ConfiguratorProductLine[] = []
      
      for (const productLine of productLineData || []) {
        console.log(`SimplifiedDirectClient: Processing product line: ${productLine.name}`)
        
        // Group default options by collection
        const defaultOptions: Record<string, any[]> = {}
        
        if (productLine.product_lines_default_options) {
          const groupedOptions: Record<string, string[]> = {}
          
          productLine.product_lines_default_options.forEach((option: any) => {
            if (!groupedOptions[option.collection]) {
              groupedOptions[option.collection] = []
            }
            groupedOptions[option.collection].push(option.item)
          })
          
          // Fetch actual option details for each collection
          for (const [collection, itemIds] of Object.entries(groupedOptions)) {
            if (itemIds.length > 0) {
              console.log(`SimplifiedDirectClient: Fetching ${collection} options:`, itemIds)
              
              try {
                const { data: collectionData, error: collectionError } = await supabase
                  .from(collection as any)
                  .select('*')
                  .in('id', itemIds.map(id => parseInt(id)))
                  .eq('active', true)
                  .order('sort', { ascending: true, nullsFirst: false })

                if (collectionError) {
                  console.warn(`SimplifiedDirectClient: Error fetching ${collection}:`, collectionError.message)
                  defaultOptions[collection] = []
                } else {
                  defaultOptions[collection] = collectionData || []
                  console.log(`SimplifiedDirectClient: Loaded ${collectionData?.length || 0} ${collection} options`)
                }
              } catch (err) {
                console.warn(`SimplifiedDirectClient: Exception fetching ${collection}:`, err)
                defaultOptions[collection] = []
              }
            }
          }
        }

        // Get product count for this product line
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('id')
          .eq('product_line', productLine.id)
          .eq('active', true)

        const productCount = products?.length || 0
        
        processedProductLines.push({
          id: productLine.id.toString(),
          numericId: productLine.id,
          label: productLine.name || 'Unnamed Product Line',
          value: productLine.id.toString(),
          count: productCount,
          description: productLine.description || undefined,
          defaultOptions
        })
      }

      const totalProducts = processedProductLines.reduce((sum, pl) => sum + pl.count, 0)
      
      console.log('SimplifiedDirectClient: Processed product lines:', processedProductLines.length)
      console.log('SimplifiedDirectClient: Total products:', totalProducts)

      return {
        productLines: processedProductLines,
        totalProducts,
        totalSkus: totalProducts // Legacy compatibility - using product count
      }
      
    } catch (error) {
      console.error('SimplifiedDirectClient: Exception in getProductLines:', error)
      throw error
    }
  }

  async getConfigurationUI(forceRefresh = false): Promise<any[]> {
    if (!forceRefresh && this.configurationUICache) {
      return this.configurationUICache
    }

    console.log('SimplifiedDirectClient: Fetching configuration UI...')
    
    try {
      const { data, error } = await supabase
        .from('configuration_ui')
        .select('*')
        .order('sort', { ascending: true, nullsFirst: false })

      if (error) {
        console.error('SimplifiedDirectClient: Error fetching configuration UI:', error)
        throw new Error(`Failed to fetch configuration UI: ${error.message}`)
      }

      console.log('SimplifiedDirectClient: Found configuration UI items:', data?.length || 0)
      this.configurationUICache = data || []
      return this.configurationUICache
      
    } catch (error) {
      console.error('SimplifiedDirectClient: Exception in getConfigurationUI:', error)
      throw error
    }
  }

  async getRules(forceRefresh = false): Promise<any[]> {
    if (!forceRefresh && this.rulesCache) {
      return this.rulesCache
    }

    console.log('SimplifiedDirectClient: Fetching rules...')
    
    try {
      // Try simple junction query first
      const { data: rulesData, error: rulesError } = await supabase
        .from('rules')
        .select(`
          *,
          rules_if_selected (
            collection,
            item
          ),
          rules_required (
            collection,
            item
          ),
          rules_disabled (
            collection,
            item
          )
        `)
        .order('priority', { ascending: true, nullsFirst: false })

      if (rulesError) {
        console.warn('SimplifiedDirectClient: Junction rules query failed, trying basic query:', rulesError.message)
        
        // Fallback to basic rules query
        const { data: basicRules, error: basicError } = await supabase
          .from('rules')
          .select('*')
          .order('priority', { ascending: true, nullsFirst: false })
        
        if (basicError) {
          console.error('SimplifiedDirectClient: Error fetching basic rules:', basicError)
          throw new Error(`Failed to fetch rules: ${basicError.message}`)
        }
        
        console.log('SimplifiedDirectClient: Found basic rules:', basicRules?.length || 0)
        this.rulesCache = basicRules || []
        return this.rulesCache
      }

      console.log('SimplifiedDirectClient: Found rules with junction data:', rulesData?.length || 0)
      
      // Process rules to include junction table data
      const processedRules = (rulesData || []).map((rule: any) => ({
        ...rule,
        if_selected: rule.rules_if_selected || [],
        required: rule.rules_required || [],
        disabled: rule.rules_disabled || []
      }))
      
      this.rulesCache = processedRules
      return this.rulesCache
      
    } catch (error) {
      console.error('SimplifiedDirectClient: Exception in getRules:', error)
      throw error
    }
  }

  async getGlobalOptionMetadata(forceRefresh = false): Promise<Record<CollectionKey, any[]>> {
    const now = Date.now()
    if (!forceRefresh && this.optionMetadataCache && now - this.optionMetadataCacheLoadedAt < PRODUCT_LINE_CACHE_TTL) {
      return this.optionMetadataCache
    }

    const optionPromises = Object.entries(COLLECTION_MAPPINGS).map(async ([collection, meta]) => {
      let query = supabase
        .from(meta.table as any)
        .select(meta.fields.join(','))

      if (meta.fields.includes('active')) {
        query = query.eq('active', true)
      }

      if (meta.fields.includes('sort')) {
        query = query.order('sort', { ascending: true, nullsFirst: false })
      }

      const { data, error } = await query

      if (error) {
        console.warn(`SimplifiedDirectClient: Error fetching global ${collection} metadata:`, error.message)
        return [collection, []]
      }

      return [collection, data || []]
    })

    const optionResults = await Promise.all(optionPromises)
    const metadata = optionResults.reduce((acc, [collection, items]) => {
      acc[collection as CollectionKey] = items as any[]
      return acc
    }, {} as Record<CollectionKey, any[]>)

    this.optionMetadataCache = metadata
    this.optionMetadataCacheLoadedAt = now
    return metadata
  }

  private isCacheValid(cache: ProductLineCache | undefined) {
    if (!cache) return false
    return Date.now() - cache.lastLoaded < PRODUCT_LINE_CACHE_TTL
  }

  private normalizeSelections(selections: ConfigurationState = {}): NormalizedSelections {
    const normalized: NormalizedSelections = {}

    Object.entries(selections).forEach(([rawKey, rawValue]) => {
      if (rawValue === null || rawValue === undefined || rawValue === '') {
        return
      }

      const column = COLUMN_LOOKUP[rawKey]
      if (!column) {
        return
      }

      let parsedValue: number | null = null

      if (typeof rawValue === 'number') {
        parsedValue = rawValue
      } else if (typeof rawValue === 'string') {
        const numeric = parseInt(rawValue, 10)
        if (!Number.isNaN(numeric)) {
          parsedValue = numeric
        }
      }

      if (parsedValue !== null) {
        normalized[column] = parsedValue
      }
    })

    return normalized
  }

  private filterSkus(skus: SkuIndexRow[], selections: NormalizedSelections): SkuIndexRow[] {
    if (!skus?.length) {
      return []
    }

    const selectionEntries = Object.entries(selections)
    if (selectionEntries.length === 0) {
      return skus
    }

    return skus.filter(sku => {
      return selectionEntries.every(([column, value]) => {
        return (sku as any)[column] === value
      })
    })
  }

  private buildOptionIdSets(skus: SkuIndexRow[]) {
    const optionSets: Record<CollectionKey, Set<number>> = {} as any

    Object.keys(COLLECTION_MAPPINGS).forEach(key => {
      optionSets[key as CollectionKey] = new Set<number>()
    })

    skus.forEach(sku => {
      Object.entries(COLLECTION_MAPPINGS).forEach(([collection, meta]) => {
        const value = (sku as any)[meta.column]
        if (typeof value === 'number' && !Number.isNaN(value)) {
          optionSets[collection as CollectionKey].add(value)
        }
      })
    })

    return optionSets
  }

  private buildAvailableOptions(
    cache: ProductLineCache,
    filteredSkus: SkuIndexRow[]
  ): Record<string, any[]> {
    if (!filteredSkus.length) {
      const empty: Record<string, any[]> = {}
      Object.keys(COLLECTION_MAPPINGS).forEach(collection => {
        empty[collection] = []
      })
      return empty
    }

    const optionSets = this.buildOptionIdSets(filteredSkus)
    const availableOptions: Record<string, any[]> = {}

    Object.entries(COLLECTION_MAPPINGS).forEach(([collection, _meta]) => {
      const set = optionSets[collection as CollectionKey]
      const options = cache.options[collection as CollectionKey] || []

      if (!set || set.size === 0) {
        availableOptions[collection] = []
        return
      }

      availableOptions[collection] = options.filter(option => set.has(option.id))
    })

    return availableOptions
  }

  private async loadProductLineCache(productLineId: number): Promise<ProductLineCache> {
    const existing = this.productLineCache.get(productLineId)
    if (this.isCacheValid(existing)) {
      return existing as ProductLineCache
    }

    console.log('SimplifiedDirectClient: Loading SKU index for product line', productLineId)

    const { data: skuIndexRows, error: skuError } = await supabase
      .from('sku_index')
      .select(`
        id,
        sku_code,
        product_id,
        product_line_id,
        mirror_style_id,
        light_direction_id,
        size_id,
        light_output_id,
        color_temperature_id,
        driver_id,
        mounting_option_id,
        accessory_id,
        frame_color_id,
        hanging_technique_id,
        frame_thickness_id
      `)
      .eq('product_line_id', productLineId)

    if (skuError) {
      console.error('SimplifiedDirectClient: Error fetching SKU index:', skuError)
      throw new Error(`Failed to fetch SKU index: ${skuError.message}`)
    }

    const skus = skuIndexRows || []

    const optionIdSets = this.buildOptionIdSets(skus)

    const optionPromises = Object.entries(COLLECTION_MAPPINGS).map(async ([collection, meta]) => {
      const ids = Array.from(optionIdSets[collection as CollectionKey])
      if (ids.length === 0) {
        return [collection, []]
      }

      let query = supabase
        .from(meta.table as any)
        .select(meta.fields.join(','))
        .in('id', ids)

      if (meta.fields.includes('active')) {
        query = query.eq('active', true)
      }

      if (meta.fields.includes('sort')) {
        query = query.order('sort', { ascending: true, nullsFirst: false })
      }

      const { data, error } = await query

      if (error) {
        console.warn(`SimplifiedDirectClient: Error fetching ${collection} options:`, error.message)
        return [collection, []]
      }

      return [collection, data || []]
    })

    const optionResults = await Promise.all(optionPromises)
    const options = optionResults.reduce((acc, [collection, items]) => {
      acc[collection as CollectionKey] = items as any[]
      return acc
    }, {} as Record<CollectionKey, any[]>)

    const cacheEntry: ProductLineCache = {
      skuIndexRows: skus,
      options,
      totalSkus: skus.length,
      lastLoaded: Date.now()
    }

    this.productLineCache.set(productLineId, cacheEntry)
    return cacheEntry
  }

  async getProductOverrides(productId: number): Promise<Record<string, number[]>> {
    console.log('SimplifiedDirectClient: Fetching product overrides for product:', productId)

    try {
      const { data, error } = await supabase
        .from('products_options_overrides')
        .select('collection, item')
        .eq('products_id', productId)

      if (error) {
        console.error('SimplifiedDirectClient: Error fetching product overrides:', error)
        return {}
      }

      // Group by collection
      const overrides: Record<string, number[]> = {}

      (data || []).forEach((row: any) => {
        if (!row.collection || !row.item) return

        if (!overrides[row.collection]) {
          overrides[row.collection] = []
        }

        const itemId = parseInt(row.item, 10)
        if (!Number.isNaN(itemId)) {
          overrides[row.collection].push(itemId)
        }
      })

      console.log('SimplifiedDirectClient: Product overrides loaded:', overrides)
      return overrides

    } catch (error) {
      console.error('SimplifiedDirectClient: Exception in getProductOverrides:', error)
      return {}
    }
  }

  async getProductLineContext(productLineId: number): Promise<ProductLineContext> {
    const cache = await this.loadProductLineCache(productLineId)
    return {
      productLineId,
      skuRows: cache.skuIndexRows,
      optionMetadata: cache.options,
      totalSkus: cache.totalSkus
    }
  }

  async getDynamicConfigurationOptions(
    productLineId: number | string | null = null,
    currentSelections: ConfigurationState = {}
  ): Promise<DynamicConfigurationOptions> {
    console.log('SimplifiedDirectClient: Fetching dynamic configuration options...', {
      productLineId,
      currentSelections
    })

    const numericProductLineId = typeof productLineId === 'string'
      ? parseInt(productLineId, 10)
      : productLineId

    if (!numericProductLineId || Number.isNaN(numericProductLineId)) {
      return {
        options: {},
        totalProducts: 0,
        totalSkus: 0,
        remainingSkus: 0,
        remainingSkuCount: 0,
        productLineId: null,
        configurationUI: [],
        rules: [],
        defaultOptions: {},
        availableProducts: []
      }
    }

    try {
      const [cache, configurationUI, rules] = await Promise.all([
        this.loadProductLineCache(numericProductLineId),
        this.getConfigurationUI(),
        this.getRules()
      ])

      const normalizedSelections = this.normalizeSelections(currentSelections)
      const filteredSkus = this.filterSkus(cache.skuIndexRows, normalizedSelections)
      let availableOptions = this.buildAvailableOptions(cache, filteredSkus)

      // Apply product-specific overrides if a product is selected
      const selectedProductId = currentSelections.product_id
      if (selectedProductId && typeof selectedProductId === 'number') {
        console.log('SimplifiedDirectClient: Product selected, applying overrides for product:', selectedProductId)
        const productOverrides = await this.getProductOverrides(selectedProductId)

        // For each collection that has overrides, replace the options
        for (const [collection, itemIds] of Object.entries(productOverrides)) {
          if (itemIds.length > 0) {
            console.log(`SimplifiedDirectClient: Applying override for ${collection}: ${itemIds.length} items`)

            // Fetch the actual option data with sort order
            try {
              const { data: overrideOptions, error: overrideError } = await supabase
                .from(collection as any)
                .select('*')
                .in('id', itemIds)
                .eq('active', true)
                .order('sort', { ascending: true, nullsFirst: false })

              if (!overrideError && overrideOptions) {
                // Replace the options for this collection
                availableOptions[collection] = overrideOptions
                console.log(`SimplifiedDirectClient: Replaced ${collection} with ${overrideOptions.length} override options`)
              } else if (overrideError) {
                console.warn(`SimplifiedDirectClient: Error fetching override options for ${collection}:`, overrideError.message)
              }
            } catch (err) {
              console.warn(`SimplifiedDirectClient: Exception fetching override options for ${collection}:`, err)
            }
          }
        }
      }

      const uniqueProductIds = new Set<number>()
      filteredSkus.forEach(sku => {
        if (typeof sku.product_id === 'number') {
          uniqueProductIds.add(sku.product_id)
        }
      })

      const availableProducts = (cache.options.products || []).filter(product =>
        uniqueProductIds.has(product.id)
      )

      return {
        options: availableOptions,
        totalProducts: uniqueProductIds.size,
        totalSkus: filteredSkus.length,
        remainingSkus: filteredSkus.length,
        remainingSkuCount: filteredSkus.length,
        productLineId: numericProductLineId,
        configurationUI,
        rules,
        defaultOptions: cache.options,
        availableProducts
      }
    } catch (error) {
      console.error('SimplifiedDirectClient: Exception in getDynamicConfigurationOptions:', error)
      throw error
    }
  }
}

// Export singleton instance
export const simplifiedDirectSupabaseClient = new SimplifiedDirectSupabaseClient()
