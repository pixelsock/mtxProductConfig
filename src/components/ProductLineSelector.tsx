import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Loader2 } from 'lucide-react'
import { simplifiedDirectSupabaseClient } from '../utils/supabase/directClientSimplified'
import type { ConfiguratorActions } from '../hooks/useConfiguratorState'

interface ProductLine {
  id: number
  name: string
  description?: string
  sku_code: string
  totalProducts: number
  totalSkus: number
  defaultOptions?: Record<string, any>
}

interface ProductLineSelectorProps {
  selectedProductLineId: number | null
  onSelectProductLine: ConfiguratorActions['selectProductLine']
  disabled?: boolean
}

export const ProductLineSelector: React.FC<ProductLineSelectorProps> = ({
  selectedProductLineId,
  onSelectProductLine,
  disabled = false
}) => {
  const [productLines, setProductLines] = useState<ProductLine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProductLines()
  }, [])

  const loadProductLines = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🏢 Loading product lines...')
      const response = await simplifiedDirectSupabaseClient.getProductLines()
      
      console.log('✅ Product lines loaded:', response.productLines.length)
      setProductLines(response.productLines)
      
    } catch (err) {
      console.error('❌ Error loading product lines:', err)
      setError(err instanceof Error ? err.message : 'Failed to load product lines')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading product lines...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="text-red-800">
            <h3 className="font-semibold mb-2">Error Loading Product Lines</h3>
            <p>{error}</p>
            <button 
              onClick={loadProductLines}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Select Product Line</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {productLines.map((productLine) => (
            <div
              key={productLine.id}
              className={`
                p-4 border rounded-lg cursor-pointer transition-all
                ${selectedProductLineId === productLine.id 
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={disabled ? undefined : () => onSelectProductLine(productLine.id)}
            >
              <div className="space-y-3">
                {/* Product Line Header */}
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{productLine.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {productLine.sku_code}
                  </Badge>
                </div>

                {/* Description */}
                {productLine.description && (
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {productLine.description}
                  </p>
                )}

                {/* Statistics */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="text-gray-500">
                      <span className="font-medium text-gray-900">{productLine.totalProducts}</span> products
                    </div>
                    <div className="text-gray-500">
                      <span className="font-medium text-gray-900">{productLine.totalSkus?.toLocaleString() || 0}</span> configurations
                    </div>
                  </div>
                </div>

                {/* Default Options Preview */}
                {productLine.defaultOptions && Object.keys(productLine.defaultOptions).length > 0 && (
                  <div className="pt-2 border-t border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">Default Options:</div>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(productLine.defaultOptions).slice(0, 3).map(([collection, options]) => (
                        <Badge key={collection} variant="secondary" className="text-xs">
                          {collection}: {Array.isArray(options) ? options.length : 1}
                        </Badge>
                      ))}
                      {Object.keys(productLine.defaultOptions).length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{Object.keys(productLine.defaultOptions).length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Selection Indicator */}
                {selectedProductLineId === productLine.id && (
                  <div className="flex items-center justify-center pt-2">
                    <Badge variant="default" className="bg-blue-600">
                      ✓ Selected
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {productLines.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No product lines available
          </div>
        )}
      </CardContent>
    </Card>
  )
}
