import React, { useState, useEffect } from "react";
import { OptimizedConfigurator } from "./components/OptimizedConfigurator";
import { useConfiguratorStore } from "./store/configurator-store";
import { Button } from "./components/ui/button";
import { Skeleton } from "./components/ui/skeleton";
import { Alert, AlertDescription } from "./components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "./services/supabase";

const App: React.FC = () => {
  const [availableProductLines, setAvailableProductLines] = useState<any[]>([]);
  const [selectedProductLineId, setSelectedProductLineId] = useState<number | null>(null);
  const [isLoadingProductLines, setIsLoadingProductLines] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load available product lines on mount
  useEffect(() => {
    const loadProductLines = async () => {
      try {
        const { data, error } = await supabase
          .from('product_lines')
          .select('*')
          .eq('active', true)
          .order('sort', { ascending: true });

        if (error) throw error;

        setAvailableProductLines(data || []);
        
        // Auto-select first product line or find "Deco"
        const decoLine = data?.find(pl => pl.name.toLowerCase().includes('deco'));
        const defaultLine = decoLine || data?.[0];
        
        if (defaultLine) {
          setSelectedProductLineId(defaultLine.id);
        }
      } catch (err) {
        console.error('Failed to load product lines:', err);
        setError(err instanceof Error ? err.message : 'Failed to load product lines');
      } finally {
        setIsLoadingProductLines(false);
      }
    };

    loadProductLines();
  }, []);

  if (isLoadingProductLines) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading Product Configurator
          </h2>
          <p className="text-gray-600">
            Initializing dynamic configuration system...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-2xl font-bold tracking-tight">
                Product Configurator
              </div>
              <div className="ml-6">
                <select
                  value={selectedProductLineId || ''}
                  onChange={(e) => setSelectedProductLineId(parseInt(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
                >
                  <option value="">Select Product Line</option>
                  {availableProductLines.map((line) => (
                    <option key={line.id} value={line.id}>
                      {line.name} ({line.sku_code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {selectedProductLineId ? (
          <OptimizedConfigurator productLineId={selectedProductLineId} />
        ) : (
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Select a Product Line
            </h2>
            <p className="text-gray-600">
              Choose a product line to begin configuring your custom mirror.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
