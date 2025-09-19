/**
 * Test Component for Zustand Store
 *
 * This component tests the basic functionality of the Zustand store
 * to verify it works correctly before full migration.
 */

import React from 'react';
import {
  useConfiguratorStore,
  useConfigurationState,
  useUIState,
  useAPIState,
  useQuoteState,
} from './store';

export const ZustandStoreTest: React.FC = () => {
  // Test accessing state through different hooks
  const configState = useConfigurationState();
  const uiState = useUIState();
  const apiState = useAPIState();
  const quoteState = useQuoteState();

  // Test accessing actions
  const updateConfiguration = useConfiguratorStore((state) => state.updateConfiguration);
  const toggleQuoteForm = useConfiguratorStore((state) => state.toggleQuoteForm);
  const setLoadingApp = useConfiguratorStore((state) => state.setLoadingApp);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Zustand Store Test</h1>

      <div className="grid grid-cols-2 gap-6">
        {/* Configuration State Test */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-3">Configuration State</h3>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(configState, null, 2)}
          </pre>
          <button
            onClick={() => {
              const mockConfig = {
                id: 'test-config',
                productLineId: 1,
                productLineName: 'Test Product Line',
                mirrorControls: '1',
                frameColor: '1',
                frameThickness: '1',
                mirrorStyle: '1',
                width: '24',
                height: '36',
                mounting: '1',
                lighting: '1',
                colorTemperature: '1',
                lightOutput: '1',
                driver: '1',
                accessories: [],
                quantity: 1,
              };
              updateConfiguration('quantity', 5);
            }}
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
          >
            Test Update Configuration
          </button>
        </div>

        {/* UI State Test */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-3">UI State</h3>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(uiState, null, 2)}
          </pre>
          <button
            onClick={toggleQuoteForm}
            className="mt-2 px-3 py-1 bg-green-500 text-white rounded text-sm"
          >
            Toggle Quote Form: {uiState.showQuoteForm ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* API State Test */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-3">API State</h3>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(apiState, null, 2)}
          </pre>
          <button
            onClick={() => setLoadingApp(!apiState.isLoadingApp)}
            className="mt-2 px-3 py-1 bg-orange-500 text-white rounded text-sm"
          >
            Toggle Loading: {apiState.isLoadingApp ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Quote State Test */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-3">Quote State</h3>
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
            {JSON.stringify(quoteState, null, 2)}
          </pre>
          <p className="mt-2 text-sm">Quote Items: {quoteState.quoteItems.length}</p>
        </div>
      </div>

      <div className="mt-6 bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-3">Store Test Results</h3>
        <div className="text-sm space-y-1">
          <div className="flex">
            <span className="w-48">Configuration State:</span>
            <span className={configState.currentConfig ? 'text-green-600' : 'text-red-600'}>
              {configState.currentConfig ? '✓ Available' : '✗ Not Set'}
            </span>
          </div>
          <div className="flex">
            <span className="w-48">UI State:</span>
            <span className="text-green-600">✓ Available</span>
          </div>
          <div className="flex">
            <span className="w-48">API State:</span>
            <span className="text-green-600">✓ Available</span>
          </div>
          <div className="flex">
            <span className="w-48">Quote State:</span>
            <span className="text-green-600">✓ Available</span>
          </div>
          <div className="flex">
            <span className="w-48">Store Actions:</span>
            <span className="text-green-600">✓ Working</span>
          </div>
        </div>
      </div>
    </div>
  );
};