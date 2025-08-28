/**
 * Environment Configuration Utilities
 * Handles environment detection and configuration management
 */

export interface EnvironmentConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  environment: 'local' | 'development' | 'staging' | 'production';
  isLocal: boolean;
  isValid: boolean;
  errors: string[];
  graphqlEndpoint: string;
  storageUrl: string;
  assetBaseUrl: string;
  cacheDuration: number;
  enableDebugLogging: boolean;
  showEnvIndicator: boolean;
  apiTimeout: number;
  apiRetryCount: number;
}

/**
 * Get the current Supabase URL from environment variables
 */
export function getSupabaseUrl(): string {
  const url = import.meta.env.VITE_SUPABASE_URL || '';
  // Remove trailing slash if present
  return url.replace(/\/$/, '');
}

/**
 * Get the Supabase anonymous key from environment variables
 */
export function getSupabaseAnonKey(): string {
  return import.meta.env.VITE_SUPABASE_ANON_KEY || '';
}

/**
 * Check if the current environment is local development
 */
export function isLocalEnvironment(): boolean {
  const url = getSupabaseUrl().toLowerCase();
  return (
    url.includes('localhost') ||
    url.includes('127.0.0.1') ||
    url.includes('0.0.0.0') ||
    url.includes('::1')
  );
}

/**
 * Validate if a string is a valid URL
 */
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the complete environment configuration
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();
  const errors: string[] = [];
  // Supabase is optional in this app; don't treat missing values as errors.
  if (supabaseUrl && !isValidUrl(supabaseUrl)) {
    errors.push('VITE_SUPABASE_URL is not a valid URL');
  }

  // Determine environment
  const isLocal = isLocalEnvironment();
  const environment = (import.meta.env.VITE_ENVIRONMENT as EnvironmentConfig['environment']) || 
    (isLocal ? 'local' : 'production');

  // Construct derived URLs
  const graphqlEndpoint = import.meta.env.VITE_GRAPHQL_ENDPOINT || 
    (supabaseUrl ? `${supabaseUrl}/graphql/v1` : '');
  
  const storageUrl = import.meta.env.VITE_STORAGE_URL || 
    (supabaseUrl ? `${supabaseUrl}/storage/v1` : '');
  
  const assetBaseUrl = import.meta.env.VITE_ASSET_BASE_URL || 
    (supabaseUrl ? `${supabaseUrl}/storage/v1/object/public` : '');

  // Get configuration values with defaults
  const cacheDuration = parseInt(import.meta.env.VITE_CACHE_DURATION || '300000', 10);
  const apiTimeout = parseInt(import.meta.env.VITE_API_TIMEOUT || '5000', 10);
  const apiRetryCount = parseInt(import.meta.env.VITE_API_RETRY_COUNT || '3', 10);
  
  const enableDebugLogging = import.meta.env.VITE_ENABLE_DEBUG_LOGGING === 'true';
  const showEnvIndicator = import.meta.env.VITE_SHOW_ENV_INDICATOR === 'true';

  return {
    supabaseUrl,
    supabaseAnonKey,
    environment,
    isLocal,
    isValid: errors.length === 0,
    errors,
    graphqlEndpoint,
    storageUrl,
    assetBaseUrl,
    cacheDuration,
    enableDebugLogging,
    showEnvIndicator,
    apiTimeout,
    apiRetryCount,
  };
}

/**
 * Log environment configuration (only in development)
 */
export function logEnvironmentConfig(): void {
  const config = getEnvironmentConfig();
  
  if (config.enableDebugLogging || config.isLocal) {
    console.group('🔧 Environment Configuration');
    console.log('Environment:', config.environment);
    console.log('Supabase URL:', config.supabaseUrl);
    console.log('GraphQL Endpoint:', config.graphqlEndpoint);
    console.log('Storage URL:', config.storageUrl);
    console.log('Cache Duration:', `${config.cacheDuration / 1000}s`);
    console.log('Is Local:', config.isLocal);
    console.log('Is Valid:', config.isValid);
    
    if (!config.isValid) {
      console.error('Configuration Errors:', config.errors);
    }
    
    console.groupEnd();
  }
}

/**
 * Get a human-readable environment name
 */
export function getEnvironmentName(): string {
  return import.meta.env.VITE_ENV_NAME || 
    (isLocalEnvironment() ? 'Local Development' : 'Production');
}

/**
 * Get the appropriate base URL for API calls
 * This handles the transition from pim.dude.digital to Supabase
 */
export function getApiBaseUrl(): string {
  const supabaseUrl = getSupabaseUrl();
  
  // If we have a configured Supabase URL, use it
  if (supabaseUrl) {
    return supabaseUrl;
  }
  
  // Fallback to the old pim.dude.digital if nothing is configured
  // This ensures backward compatibility during transition
  console.warn('No VITE_SUPABASE_URL configured, falling back to pim.dude.digital');
  return 'https://pim.dude.digital';
}

/**
 * Check if the environment configuration is valid
 */
export function validateEnvironment(): boolean {
  const config = getEnvironmentConfig();
  
  if (!config.isValid) {
    console.error('❌ Invalid environment configuration:', config.errors);
    return false;
  }
  
  return true;
}

/**
 * Get environment-specific feature flags
 */
export function getFeatureFlags() {
  return {
    debugLogging: import.meta.env.VITE_ENABLE_DEBUG_LOGGING === 'true',
    showEnvIndicator: import.meta.env.VITE_SHOW_ENV_INDICATOR === 'true',
    enableDevtools: import.meta.env.VITE_ENABLE_DEVTOOLS === 'true',
    logApiCalls: import.meta.env.VITE_LOG_API_CALLS === 'true',
  };
}

/**
 * Initialize environment on application start
 */
export function initializeEnvironment(): void {
  // Validate environment
  if (!validateEnvironment()) {
    console.error('⚠️ Application may not function correctly with invalid environment configuration');
  }
  
  // Log configuration in development
  logEnvironmentConfig();
  
  // Set up any global environment-specific behavior
  if (getFeatureFlags().debugLogging) {
    console.log('🐛 Debug logging enabled');
  }
}
