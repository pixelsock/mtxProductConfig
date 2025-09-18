import React, { useState, useEffect } from 'react';
import { supabaseClient } from '../utils/supabase/client';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface ProductLineDebugInfo {
  id: string;
  name: string;
  description: string;
  skuCount: number;
  hasSkus: boolean;
}

export function ProductLineDebugger() {
  const [productLines, setProductLines] = useState<ProductLineDebugInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedForTesting, setSelectedForTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any>(null);

  const loadProductLineDebugInfo = async () => {
    setLoading(true);
    try {
      // Get product lines
      const response = await supabaseClient.getProductLines();
      
      if (response.error) {
        console.error('Error loading product lines:', response.error);
        return;
      }

      const debugInfo: ProductLineDebugInfo[] = response.productLines.map(line => ({
        id: line.id || line.value,
        name: line.label || line.name,
        description: line.description || 'No description',
        skuCount: line.count || 0,
        hasSkus: (line.count || 0) > 0
      }));

      setProductLines(debugInfo);
      console.log('Product line debug info:', debugInfo);
    } catch (error) {
      console.error('Failed to load product line debug info:', error);
    } finally {
      setLoading(false);
    }
  };

  const testProductLine = async (productLineId: string) => {
    setSelectedForTesting(productLineId);
    setTestResult(null);
    
    try {
      console.log(`Testing product line: ${productLineId}`);
      
      // Test loading configuration options for this product line
      const response = await supabaseClient.getConfigurationOptionsForProductLine(productLineId);
      
      setTestResult({
        productLineId,
        success: !response.error,
        error: response.error,
        totalSkus: response.totalSkus || 0,
        optionCounts: response.options ? {
          frameColors: response.options.frameColors?.length || 0,
          sizes: response.options.sizes?.length || 0,
          lightOutputs: response.options.lightOutputs?.length || 0,
          colorTemperatures: response.options.colorTemperatures?.length || 0,
          accessories: response.options.accessories?.length || 0,
          drivers: response.options.drivers?.length || 0,
          mountingOptions: response.options.mountingOptions?.length || 0,
          hangingTechniques: response.options.hangingTechniques?.length || 0,
          mirrorStyles: response.options.mirrorStyles?.length || 0,
          products: response.options.products?.length || 0
        } : null
      });
    } catch (error) {
      setTestResult({
        productLineId,
        success: false,
        error: error.message,
        totalSkus: 0,
        optionCounts: null
      });
    }
  };

  useEffect(() => {
    loadProductLineDebugInfo();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Product Line Analysis
            <Button onClick={loadProductLineDebugInfo} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {productLines.map((line) => (
              <div key={line.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium">{line.name}</h3>
                    <Badge variant={line.hasSkus ? "default" : "destructive"}>
                      {line.skuCount} SKUs
                    </Badge>
                    <Badge variant="outline">ID: {line.id}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{line.description}</p>
                </div>
                <Button 
                  onClick={() => testProductLine(line.id)}
                  disabled={selectedForTesting === line.id}
                  size="sm"
                  variant="outline"
                >
                  {selectedForTesting === line.id ? 'Testing...' : 'Test'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle>Test Result for Product Line {testResult.productLineId}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant={testResult.success ? "default" : "destructive"}>
                  {testResult.success ? 'Success' : 'Failed'}
                </Badge>
                <span>Total SKUs: {testResult.totalSkus}</span>
              </div>
              
              {testResult.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-700 font-medium">Error:</p>
                  <p className="text-red-600">{testResult.error}</p>
                </div>
              )}

              {testResult.optionCounts && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Configuration Options Available:</h4>
                    <div className="space-y-1 text-sm">
                      <div>Frame Colors: {testResult.optionCounts.frameColors}</div>
                      <div>Sizes: {testResult.optionCounts.sizes}</div>
                      <div>Light Outputs: {testResult.optionCounts.lightOutputs}</div>
                      <div>Color Temperatures: {testResult.optionCounts.colorTemperatures}</div>
                      <div>Accessories: {testResult.optionCounts.accessories}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Additional Options:</h4>
                    <div className="space-y-1 text-sm">
                      <div>Drivers: {testResult.optionCounts.drivers}</div>
                      <div>Mounting: {testResult.optionCounts.mountingOptions}</div>
                      <div>Hanging: {testResult.optionCounts.hangingTechniques}</div>
                      <div>Mirror Styles: {testResult.optionCounts.mirrorStyles}</div>
                      <div>Products: {testResult.optionCounts.products}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}