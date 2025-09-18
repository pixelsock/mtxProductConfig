import { useState, useEffect, useCallback } from 'react'
import { simplifiedDirectSupabaseClient } from '../utils/supabase/directClientSimplified'
import { COLLECTION_MAPPINGS } from '../types/database'
import type { CollectionKey } from '../types/database'
import type { ConfigurationState, DynamicConfigurationOptions } from '../utils/supabase/directClientSimplified'

interface EnhancedConfigurationState {
  // Current selections (legacy format for compatibility)
  configuration: any
  
  // Dynamic backend data
  availableOptions: DynamicConfigurationOptions | null
  configurationUI: any[]
  rules: any[]
  defaultOptions: Record<string, any>
  
  // State
  loading: boolean
  error: string | null
  remainingSkuCount: number
  selectedProductLineId: number | null
}

interface EnhancedConfigurationActions {
  updateConfiguration: (key: string, value: any) => Promise<void>
  selectProductLine: (productLineId: number) => Promise<void>
  refreshOptions: () => Promise<void>
}

/**
 * Enhanced configuration hook that bridges legacy interface with dynamic backend
 */
export function useEnhancedConfiguration(
  initialProductLine?: string,
  initialConfiguration?: any
): [EnhancedConfigurationState, EnhancedConfigurationActions] {
  // Legacy configuration state (for compatibility)
  const [configuration, setConfiguration] = useState(initialConfiguration || {
    frameColor: '',
    size: '',
    lightOutput: '',
    colorTemperature: '',
    accessory: '',
    driver: '',
    mounting: '',
    hangingTechnique: '',
    mirrorStyle: '',
    product: '',
    customWidth: '',
    customHeight: '',
    useCustomSize: false
  })

  // Dynamic backend state
  const [selectedProductLineId, setSelectedProductLineId] = useState<number | null>(
    initialProductLine ? parseInt(initialProductLine) : null
  )
  const [availableOptions, setAvailableOptions] = useState<DynamicConfigurationOptions | null>(null)
  const [configurationUI, setConfigurationUI] = useState<any[]>([])
  const [rules, setRules] = useState<any[]>([])
  const [defaultOptions, setDefaultOptions] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [remainingSkuCount, setRemainingSkuCount] = useState(0)

  // Convert legacy configuration to dynamic selections
  const convertToSelections = useCallback((config: any): ConfigurationState => {
    const selections: ConfigurationState = {}
    
    // Map legacy keys to dynamic keys
    const keyMapping: Record<string, string> = {
      frameColor: COLLECTION_MAPPINGS.frame_colors.column,
      size: COLLECTION_MAPPINGS.sizes.column,
      lightOutput: COLLECTION_MAPPINGS.light_outputs.column,
      colorTemperature: COLLECTION_MAPPINGS.color_temperatures.column,
      accessory: COLLECTION_MAPPINGS.accessories.column,
      driver: COLLECTION_MAPPINGS.drivers.column,
      mounting: COLLECTION_MAPPINGS.mounting_options.column,
      hangingTechnique: COLLECTION_MAPPINGS.hanging_techniques.column,
      mirrorStyle: COLLECTION_MAPPINGS.mirror_styles.column
    }

    Object.entries(keyMapping).forEach(([legacyKey, dynamicKey]) => {
      if (config[legacyKey] && config[legacyKey] !== '') {
        // Convert string values to numbers if they're numeric
        const value = config[legacyKey]
        selections[dynamicKey] = isNaN(value) ? value : parseInt(value)
      }
    })

    return selections
  }, [])

  // Refresh available options based on current state
  const refreshOptions = useCallback(async () => {
    if (!selectedProductLineId) {
      setAvailableOptions(null)
      setRemainingSkuCount(0)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Enhanced: Refreshing options for product line:', selectedProductLineId)
      
      // Convert legacy configuration to dynamic selections
      const selections = convertToSelections(configuration)
      
      const dynamicConfig = await simplifiedDirectSupabaseClient.getDynamicConfigurationOptions(
        selectedProductLineId,
        selections
      )
      
      console.log('✅ Enhanced: Dynamic configuration loaded:', dynamicConfig)
      
      setAvailableOptions(dynamicConfig)
      const remaining = dynamicConfig.remainingSkuCount ?? dynamicConfig.remainingSkus ?? dynamicConfig.totalSkus ?? 0
      setRemainingSkuCount(remaining)
      setConfigurationUI(dynamicConfig.configurationUI || [])
      setRules(dynamicConfig.rules || [])
      setDefaultOptions(dynamicConfig.defaultOptions || {})
      
    } catch (err) {
      console.error('❌ Enhanced: Error refreshing options:', err)
      setError(err instanceof Error ? err.message : 'Failed to load configuration options')
    } finally {
      setLoading(false)
    }
  }, [selectedProductLineId, configuration, convertToSelections])

  // Update configuration and refresh options
  const updateConfiguration = useCallback(async (key: string, value: any) => {
    console.log('🎯 Enhanced: Updating configuration:', { key, value })
    
    const newConfiguration = {
      ...configuration,
      [key]: value
    }
    
    setConfiguration(newConfiguration)
    
    // Refresh options after a short delay to allow for batching
    setTimeout(() => {
      refreshOptions()
    }, 100)
  }, [configuration, refreshOptions])

  // Select product line and reset configuration
  const selectProductLine = useCallback(async (productLineId: number) => {
    console.log('🏢 Enhanced: Selecting product line:', productLineId)
    
    setSelectedProductLineId(productLineId)
    
    // Reset configuration when product line changes
    const resetConfig = {
      frameColor: '',
      size: '',
      lightOutput: '',
      colorTemperature: '',
      accessory: '',
      driver: '',
      mounting: '',
      hangingTechnique: '',
      mirrorStyle: '',
      product: productLineId.toString(),
      customWidth: '',
      customHeight: '',
      useCustomSize: false
    }
    
    setConfiguration(resetConfig)
    setError(null)
  }, [])

  // Refresh options when product line or configuration changes
  useEffect(() => {
    refreshOptions()
  }, [refreshOptions])

  // State object
  const state: EnhancedConfigurationState = {
    configuration,
    availableOptions,
    configurationUI,
    rules,
    defaultOptions,
    loading,
    error,
    remainingSkuCount,
    selectedProductLineId
  }

  // Actions object
  const actions: EnhancedConfigurationActions = {
    updateConfiguration,
    selectProductLine,
    refreshOptions
  }

  return [state, actions]
}
