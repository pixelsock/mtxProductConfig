/**
 * Test file to verify VITE_DEBUG_CONSOLE environment variable functionality
 * 
 * This file can be run in the browser console to test the debug console behavior
 * without needing a full test framework setup.
 */

// Test environment variable access
export const testDebugConsoleEnv = () => {
  console.group('🧪 Debug Console Environment Variable Test');
  
  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';
  console.log('📍 NODE_ENV:', process.env.NODE_ENV);
  console.log('🔧 Is Development:', isDevelopment);
  
  // Check debug console environment variable
  const debugConsoleValue = import.meta.env.VITE_DEBUG_CONSOLE;
  console.log('🎛️ VITE_DEBUG_CONSOLE:', debugConsoleValue);
  console.log('🎛️ Type:', typeof debugConsoleValue);
  
  // Check if debug console should be enabled
  const isDebugEnabled = debugConsoleValue === 'true';
  console.log('✅ Debug Enabled (string comparison):', isDebugEnabled);
  
  // Final determination
  const shouldShowDebug = isDevelopment && isDebugEnabled;
  console.log('🎯 Should Show Debug Console:', shouldShowDebug);
  
  // Test different scenarios
  console.group('📋 Test Scenarios:');
  
  const scenarios = [
    { env: 'development', debug: 'true', expected: true },
    { env: 'development', debug: 'false', expected: false },
    { env: 'production', debug: 'true', expected: false },
    { env: 'production', debug: 'false', expected: false },
  ];
  
  scenarios.forEach(scenario => {
    const result = scenario.env === 'development' && scenario.debug === 'true';
    const status = result === scenario.expected ? '✅' : '❌';
    console.log(`${status} ENV: ${scenario.env}, DEBUG: ${scenario.debug} → ${result} (expected: ${scenario.expected})`);
  });
  
  console.groupEnd();
  
  // Instructions for testing
  console.group('📝 Testing Instructions:');
  console.log('1. To enable debug console: Set VITE_DEBUG_CONSOLE=true in .env');
  console.log('2. To disable debug console: Set VITE_DEBUG_CONSOLE=false in .env');
  console.log('3. Restart dev server after changing .env file');
  console.log('4. Debug console only appears in development mode');
  console.log('5. Check ProductImageLayers component for visual debug overlay');
  console.groupEnd();
  
  console.groupEnd();
  
  return {
    isDevelopment,
    debugConsoleValue,
    isDebugEnabled,
    shouldShowDebug
  };
};

// Auto-run test when file is imported
if (typeof window !== 'undefined') {
  // Only run in browser environment
  console.log('🔍 Debug Console Environment Test Available');
  console.log('Run testDebugConsoleEnv() to test environment variable functionality');
}

// Export for manual testing
export default testDebugConsoleEnv;
