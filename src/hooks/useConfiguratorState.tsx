import { useState, useEffect, useCallback } from 'react'
import { simplifiedDirectSupabaseClient } from '../utils/supabase/directClientSimplified'
import type {
  ConfigurationState,
  DynamicConfigurationOptions,
  ProductLineContext
} from '../utils/supabase/directClientSimplified'
import { filterOptions } from '../utils/configurator/engine'

// Define collection key type inline
type CollectionKey = string;

// Define collection mappings inline (minimal subset needed)
const COLLECTION_MAPPINGS: Record<string, { column: string }> = {
  mirror_styles: { column: 'mirrorStyle' },
  light_directions: { column: 'lighting' },
  frame_thicknesses: { column: 'frameThickness' },
  frame_colors: { column: 'frameColor' },
  mounting_options: { column: 'mounting' },
  drivers: { column: 'driver' },
  light_outputs: { column: 'lightOutput' },
  color_temperatures: { column: 'colorTemperature' },
  accessories: { column: 'accessories' },
  sizes: { column: 'size' },
};

export interface ConfiguratorState {
  // Product selection
  selectedProductLineId: number | null
  selectedProductId: number | null
  
  // User selections
  selections: ConfigurationState
  
  // Available options (filtered based on current selections)
  availableOptions: DynamicConfigurationOptions | null
  
  // UI state
  loading: boolean
  error: string | null
  remainingSkuCount: number
  
  // Configuration metadata
  configurationUI: any[]
  rules: any[]
  defaultOptions: Record<string, any[]>
}

export interface ConfiguratorActions {
  // Product selection
  selectProductLine: (productLineId: number) => Promise<void>
  selectProduct: (productId: number | null) => Promise<void>
  
  // Option selection
  updateSelection: (collection: string, optionId: number | null) => Promise<void>
  updateMultipleSelections: (updates: Partial<ConfigurationState>) => Promise<void>
  
  // State management
  resetSelections: () => void
  resetAll: () => void
  
  // Utility
  refreshAvailableOptions: () => Promise<void>
}

const resolveColumnKey = (key: string): string => {
  if (!key) return key

  if (key === 'productId') {
    return 'product_id'
  }

  if (COLLECTION_MAPPINGS[key as CollectionKey]) {
    return COLLECTION_MAPPINGS[key as CollectionKey].column
  }

  if (key.endsWith('_id')) {
    const base = key.replace(/_id$/, '')
    if (COLLECTION_MAPPINGS[base as CollectionKey]) {
      return COLLECTION_MAPPINGS[base as CollectionKey].column
    }
  }

  return key
}

export function useConfiguratorState(): [ConfiguratorState, ConfiguratorActions] {
  // Core state
  const [selectedProductLineId, setSelectedProductLineId] = useState<number | null>(null)
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [selections, setSelections] = useState<ConfigurationState>({})
  
  // Derived state
  const [availableOptions, setAvailableOptions] = useState<DynamicConfigurationOptions | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [remainingSkuCount, setRemainingSkuCount] = useState(0)
  
  // Configuration metadata
  const [configurationUI, setConfigurationUI] = useState<any[]>([])
  const [rules, setRules] = useState<any[]>([])
  const [defaultOptions, setDefaultOptions] = useState<Record<string, any[]>>({})
  const [productLineContexts, setProductLineContexts] = useState<Record<number, ProductLineContext>>({})

  const ensureContext = useCallback(async (productLineId: number): Promise<ProductLineContext | null> => {
    let context = productLineContexts[productLineId]
    if (context) {
      return context
    }

    setLoading(true)
    try {
      const contextPromise = simplifiedDirectSupabaseClient.getProductLineContext(productLineId)
      const configurationPromise = configurationUI.length > 0
        ? Promise.resolve(null)
        : simplifiedDirectSupabaseClient.getConfigurationUI()
      const rulesPromise = rules.length > 0
        ? Promise.resolve(null)
        : simplifiedDirectSupabaseClient.getRules()

      const [contextPayload, configurationData, rulesData] = await Promise.all([
        contextPromise,
        configurationPromise,
        rulesPromise
      ])

      if (configurationData) {
        setConfigurationUI(configurationData)
      }

      if (rulesData) {
        setRules(rulesData)
      }

      setProductLineContexts(prev => ({
        ...prev,
        [productLineId]: contextPayload
      }))

      setDefaultOptions(contextPayload.optionMetadata)

      return contextPayload
    } catch (err) {
      console.error('❌ Failed to load product line context:', err)
      setError(err instanceof Error ? err.message : 'Failed to load configuration context')
      return null
    } finally {
      setLoading(false)
    }
  }, [productLineContexts, configurationUI, rules])

  // Refresh available options based on current state
  const refreshAvailableOptions = useCallback(async () => {
    if (!selectedProductLineId) {
      setAvailableOptions(null)
      setRemainingSkuCount(0)
      return
    }

    try {
      setError(null)

      const context = await ensureContext(selectedProductLineId)
      if (!context) {
        return
      }

      const filterResult = filterOptions(
        {
          productLineId: context.productLineId,
          skuRows: context.skuRows,
          optionMetadata: context.optionMetadata,
          totalSkus: context.totalSkus
        },
        selections
      )

      setDefaultOptions(context.optionMetadata)

      const dynamicConfig: DynamicConfigurationOptions = {
        options: filterResult.options,
        totalProducts: filterResult.productCount,
        totalSkus: filterResult.totalSkus,
        remainingSkus: filterResult.remainingSkus,
        remainingSkuCount: filterResult.remainingSkus,
        productLineId: context.productLineId,
        configurationUI,
        rules,
        defaultOptions: context.optionMetadata,
        availableProducts: filterResult.availableProducts
      }

      setAvailableOptions(dynamicConfig)
      setRemainingSkuCount(filterResult.remainingSkus)
    } catch (err) {
      console.error('❌ Error refreshing available options:', err)
      setError(err instanceof Error ? err.message : 'Failed to load configuration options')
    }
  }, [selectedProductLineId, selections, ensureContext, configurationUI, rules])

  // Update available options when product line or selections change
  useEffect(() => {
    refreshAvailableOptions()
  }, [refreshAvailableOptions])

  // Actions
  const selectProductLine = useCallback(async (productLineId: number) => {
    console.log('🏢 Selecting product line:', productLineId)
    setSelectedProductLineId(productLineId)
    setSelectedProductId(null) // Reset product selection
    setSelections({}) // Reset all selections
    setAvailableOptions(null)
    setRemainingSkuCount(0)
    setError(null)
  }, [])

  const selectProduct = useCallback(async (productId: number | null) => {
    console.log('📦 Selecting product:', productId)
    setSelectedProductId(productId)
    setSelections(prev => {
      const draft = { ...prev }
      const numericValue = typeof productId === 'number' ? productId : Number(productId)

      if (productId === null || Number.isNaN(numericValue)) {
        delete draft.product_id
      } else {
        draft.product_id = numericValue
      }
      return draft
    })
    setError(null)
  }, [])

  const updateSelection = useCallback(async (collection: string, optionId: number | null) => {
    console.log('🎯 Updating selection:', { collection, optionId })

    const resolvedColumn = resolveColumnKey(collection)
    const numericValue = typeof optionId === 'number' ? optionId : optionId === null ? null : parseInt(String(optionId), 10)

    setSelections(prev => {
      const draft: ConfigurationState = { ...prev }
      if (numericValue === null || Number.isNaN(numericValue)) {
        delete draft[resolvedColumn]
      } else {
        draft[resolvedColumn] = numericValue
      }

      return draft
    })
    setError(null)
  }, [])

  const updateMultipleSelections = useCallback(async (updates: Partial<ConfigurationState>) => {
    console.log('🎯 Updating multiple selections:', updates)

    setSelections(prev => {
      const draft: ConfigurationState = { ...prev }

      Object.entries(updates).forEach(([key, value]) => {
        const resolvedColumn = resolveColumnKey(key)
        if (value === null || value === undefined || value === '') {
          delete draft[resolvedColumn]
          return
        }

        const numericValue = typeof value === 'number' ? value : parseInt(String(value), 10)
        if (!Number.isNaN(numericValue)) {
          draft[resolvedColumn] = numericValue
        }
      })

      return draft
    })
    setError(null)
  }, [])

  const resetSelections = useCallback(() => {
    console.log('🔄 Resetting selections')
    setSelections({})
    setError(null)
  }, [])

  const resetAll = useCallback(() => {
    console.log('🔄 Resetting all state')
    setSelectedProductLineId(null)
    setSelectedProductId(null)
    setSelections({})
    setAvailableOptions(null)
    setRemainingSkuCount(0)
    setConfigurationUI([])
    setRules([])
    setDefaultOptions({})
    setError(null)
  }, [])

  // State object
  const state: ConfiguratorState = {
    selectedProductLineId,
    selectedProductId,
    selections,
    availableOptions,
    loading,
    error,
    remainingSkuCount,
    configurationUI,
    rules,
    defaultOptions
  }

  // Actions object
  const actions: ConfiguratorActions = {
    selectProductLine,
    selectProduct,
    updateSelection,
    updateMultipleSelections,
    resetSelections,
    resetAll,
    refreshAvailableOptions
  }

  return [state, actions]
}
