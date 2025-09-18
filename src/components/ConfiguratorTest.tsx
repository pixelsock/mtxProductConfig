import React, { useState, useEffect } from 'react';
import { simplifiedDirectSupabaseClient } from '../utils/supabase/directClientSimplified';
import { createClient } from '@supabase/supabase-js';
import { browserCache } from '../utils/cache/browserCache';
import { toast } from 'sonner';

// Create direct supabase client for testing
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;
const testSupabase = createClient(supabaseUrl, supabaseAnonKey);

interface TestResults {
  productLines?: any;
  configurationUI?: any;
  rules?: any;
  dynamicConfig?: any;
  error?: string;
}

export const ConfiguratorTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResults>({});
  const [loading, setLoading] = useState(false);
  const [selectedProductLine, setSelectedProductLine] = useState<string>('');

  const runTests = async () => {
    setLoading(true);
    setTestResults({});
    
    try {
      // Clear cache to force fresh queries
      console.log('🧹 Clearing cache to force fresh queries...');
      browserCache.clear(false); // Clear session cache
      browserCache.clear(true);  // Clear persistent cache
      console.log('✅ Cache cleared successfully');
      // Test 0: Check if junction tables have any data at all
      console.log('🔍 Test 0: Checking junction table data');
      
      // Check product lines default options
      const { data: junctionData, error: junctionError } = await testSupabase
        .from('product_lines_default_options')
        .select('*')
        .limit(10);
      
      if (junctionError) {
        console.warn('❌ Product lines junction table query failed:', junctionError.message);
      } else {
        console.log('📊 Product lines junction table sample data:', junctionData);
        console.log(`📈 Product lines junction table has ${junctionData?.length || 0} sample records`);
      }
      
      // Check rules junction tables
      const { data: rulesIfSelectedData, error: rulesIfSelectedError } = await testSupabase
        .from('rules_if_selected')
        .select('*')
        .limit(5);
      
      if (rulesIfSelectedError) {
        console.warn('❌ Rules if_selected junction table query failed:', rulesIfSelectedError.message);
      } else {
        console.log('📊 Rules if_selected junction table sample data:', rulesIfSelectedData);
        console.log(`📈 Rules if_selected junction table has ${rulesIfSelectedData?.length || 0} sample records`);
      }
      
      const { data: rulesRequiredData, error: rulesRequiredError } = await testSupabase
        .from('rules_required')
        .select('*')
        .limit(5);
      
      if (rulesRequiredError) {
        console.warn('❌ Rules required junction table query failed:', rulesRequiredError.message);
      } else {
        console.log('📊 Rules required junction table sample data:', rulesRequiredData);
        console.log(`📈 Rules required junction table has ${rulesRequiredData?.length || 0} sample records`);
      }
      
      const { data: rulesDisabledData, error: rulesDisabledError } = await testSupabase
        .from('rules_disabled')
        .select('*')
        .limit(5);
      
      if (rulesDisabledError) {
        console.warn('❌ Rules disabled junction table query failed:', rulesDisabledError.message);
      } else {
        console.log('📊 Rules disabled junction table sample data:', rulesDisabledData);
        console.log(`📈 Rules disabled junction table has ${rulesDisabledData?.length || 0} sample records`);
      }
      
      // Test 1: Product Lines
      console.log('🏢 Test 1: Product Lines');
      const productLinesResult = await simplifiedDirectSupabaseClient.getProductLines();
      console.log('✅ Product Lines Result:', productLinesResult);
      
      // Test 2: Configuration UI
      console.log('🎨 Test 2: Configuration UI');
      const configUIResult = await simplifiedDirectSupabaseClient.getConfigurationUI();
      console.log('✅ Configuration UI Result:', configUIResult);
      
      // Test 3: Rules - Direct endpoint testing
      console.log('📏 Test 3: Rules - Testing different query approaches');
      
      // Test 3a: Basic rules query
      console.log('📏 Test 3a: Basic rules query');
      const { data: basicRules, error: basicRulesError } = await testSupabase
        .from('rules')
        .select('*')
        .order('priority', { ascending: true, nullsFirst: false });
      
      if (basicRulesError) {
        console.warn('❌ Basic rules query failed:', basicRulesError.message);
      } else {
        console.log('✅ Basic rules query succeeded:', basicRules?.length || 0, 'rules found');
        if (basicRules && basicRules.length > 0) {
          console.log('📊 Sample basic rule:', JSON.stringify(basicRules[0], null, 2));
        }
      }
      
      // Test 3b: Simple junction rules query
      console.log('📏 Test 3b: Simple junction rules query');
      const { data: simpleJunctionRules, error: simpleJunctionError } = await testSupabase
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
        .order('priority', { ascending: true, nullsFirst: false });
      
      if (simpleJunctionError) {
        console.warn('❌ Simple junction rules query failed:', simpleJunctionError.message);
      } else {
        console.log('✅ Simple junction rules query succeeded:', simpleJunctionRules?.length || 0, 'rules found');
        if (simpleJunctionRules && simpleJunctionRules.length > 0) {
          console.log('📊 Sample simple junction rule:', JSON.stringify(simpleJunctionRules[0], null, 2));
        }
      }
      
      // Test 3c: Explicit foreign key rules query
      console.log('📏 Test 3c: Explicit foreign key rules query');
      const { data: explicitRules, error: explicitRulesError } = await testSupabase
        .from('rules')
        .select(`
          *,
          rules_if_selected!rules_if_selected_rules_id_foreign (
            collection,
            item
          ),
          rules_required!rules_required_rules_id_foreign (
            collection,
            item
          ),
          rules_disabled!rules_disabled_rules_id_foreign (
            collection,
            item
          )
        `)
        .order('priority', { ascending: true, nullsFirst: false });
      
      if (explicitRulesError) {
        console.warn('❌ Explicit foreign key rules query failed:', explicitRulesError.message);
      } else {
        console.log('✅ Explicit foreign key rules query succeeded:', explicitRules?.length || 0, 'rules found');
        if (explicitRules && explicitRules.length > 0) {
          console.log('📊 Sample explicit foreign key rule:', JSON.stringify(explicitRules[0], null, 2));
        }
      }
      
      // Test 3d: DirectClient getRules method
      console.log('📏 Test 3d: DirectClient getRules method');
      const rulesResult = await simplifiedDirectSupabaseClient.getRules();
      console.log('✅ DirectClient Rules Result:', rulesResult);
      
      // Test 4: Dynamic Configuration (if we have product lines)
      let dynamicConfigResult: any = null;
      if (productLinesResult.productLines && productLinesResult.productLines.length > 0) {
        const firstProductLine = productLinesResult.productLines[0];
        console.log('⚙️ Test 4: Dynamic Configuration for product line:', firstProductLine.id);
        dynamicConfigResult = await simplifiedDirectSupabaseClient.getDynamicConfigurationOptions(
          firstProductLine.numericId
        );
        console.log('✅ Dynamic Configuration Result:', dynamicConfigResult);
        setSelectedProductLine(firstProductLine.id);
      }
      
      setTestResults({
        productLines: productLinesResult,
        configurationUI: configUIResult,
        rules: rulesResult,
        dynamicConfig: dynamicConfigResult
      });
      
      toast.success('All API tests completed successfully! Check console for details.');
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      setTestResults({ error: error instanceof Error ? error.message : 'Unknown error' });
      toast.error(`API test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testProgressiveFiltering = async () => {
    if (!selectedProductLine) {
      toast.error('Please run the main tests first to select a product line');
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 Testing Progressive Filtering...');
      
      // Get initial options
      const initialConfig = await simplifiedDirectSupabaseClient.getDynamicConfigurationOptions(
        parseInt(selectedProductLine)
      );
      console.log('📊 Initial configuration:', initialConfig);
      
      // Test with some selections (if we have options available)
      const options = initialConfig.options as Record<string, any[]>;
      if (options.sizes && options.sizes.length > 0) {
        const firstSize = options.sizes[0];
        console.log('🎯 Testing with size selection:', firstSize);
        
        const filteredConfig = await simplifiedDirectSupabaseClient.getDynamicConfigurationOptions(
          parseInt(selectedProductLine),
          { size_id: firstSize.id }
        );
        console.log('🔍 Filtered configuration:', filteredConfig);
        
        toast.success(`Progressive filtering test completed! Remaining SKUs: ${filteredConfig.remainingSkuCount || 0}`);
      } else {
        toast.warning('No sizes available for progressive filtering test');
      }
      
    } catch (error) {
      console.error('❌ Progressive filtering test failed:', error);
      toast.error(`Progressive filtering test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          🧪 Dynamic Configurator API Test Suite
        </h2>
        
        <div className="space-y-4 mb-6">
          <button
            onClick={runTests}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            {loading ? '🔄 Running Tests...' : '🚀 Run API Tests'}
          </button>
          
          {selectedProductLine && (
            <button
              onClick={testProgressiveFiltering}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors ml-4"
            >
              {loading ? '🔄 Testing...' : '🔍 Test Progressive Filtering'}
            </button>
          )}
        </div>

        {/* Test Results Display */}
        {Object.keys(testResults).length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Test Results:</h3>
            
            {testResults.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800">❌ Error</h4>
                <p className="text-red-600 mt-1">{testResults.error}</p>
              </div>
            )}
            
            {testResults.productLines && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800">✅ Product Lines</h4>
                <p className="text-green-600 mt-1">
                  Found {testResults.productLines.productLines?.length || 0} product lines
                </p>
                {testResults.productLines.productLines?.map((line: any, index: number) => (
                  <div key={index} className="mt-2 p-2 bg-green-100 rounded">
                    <div className="font-medium">{line.label} (ID: {line.id})</div>
                    <div className="text-sm">SKUs: {line.count}</div>
                    {line.defaultOptions && Object.keys(line.defaultOptions).length > 0 && (
                      <div className="text-sm">
                        Default Options: {Object.keys(line.defaultOptions).map(collection => 
                          `${collection} (${line.defaultOptions[collection].length})`
                        ).join(', ')}
                      </div>
                    )}
                    {(!line.defaultOptions || Object.keys(line.defaultOptions).length === 0) && (
                      <div className="text-sm text-orange-600">⚠️ No default options found</div>
                    )}
                  </div>
                ))}
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-green-700">View Raw Data</summary>
                  <pre className="text-xs bg-green-100 p-2 rounded mt-2 overflow-auto max-h-40">
                    {JSON.stringify(testResults.productLines, null, 2)}
                  </pre>
                </details>
              </div>
            )}
            
            {testResults.configurationUI && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800">✅ Configuration UI</h4>
                <p className="text-blue-600 mt-1">
                  Found {testResults.configurationUI.length} UI configuration items
                </p>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-blue-700">View Details</summary>
                  <pre className="text-xs bg-blue-100 p-2 rounded mt-2 overflow-auto max-h-40">
                    {JSON.stringify(testResults.configurationUI, null, 2)}
                  </pre>
                </details>
              </div>
            )}
            
            {testResults.rules && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-800">✅ Rules</h4>
                <p className="text-purple-600 mt-1">
                  Found {testResults.rules.length} rules
                </p>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-purple-700">View Details</summary>
                  <pre className="text-xs bg-purple-100 p-2 rounded mt-2 overflow-auto max-h-40">
                    {JSON.stringify(testResults.rules, null, 2)}
                  </pre>
                </details>
              </div>
            )}
            
            {testResults.dynamicConfig && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800">✅ Dynamic Configuration</h4>
                <p className="text-yellow-600 mt-1">
                  Total SKUs: {testResults.dynamicConfig.totalSkus}, 
                  Available Collections: {Object.keys(testResults.dynamicConfig.options).length},
                  UI Items: {testResults.dynamicConfig.configurationUI?.length || 0},
                  Rules: {testResults.dynamicConfig.rules?.length || 0}
                </p>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-yellow-700">View Details</summary>
                  <pre className="text-xs bg-yellow-100 p-2 rounded mt-2 overflow-auto max-h-40">
                    {JSON.stringify(testResults.dynamicConfig, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">💡 What This Tests:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Product lines with default options via junction tables</li>
            <li>• Configuration UI collection for dynamic rendering</li>
            <li>• Rules collection with full lookups</li>
            <li>• Dynamic configuration combining all data sources</li>
            <li>• Progressive filtering based on selections</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ConfiguratorTest;
