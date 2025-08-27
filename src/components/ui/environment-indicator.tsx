/**
 * Environment Indicator Component
 * Shows a badge indicating the current environment (local/production)
 */

// React import not needed with modern JSX transform
import { Badge } from './badge';
import { getEnvironmentConfig, getEnvironmentName } from '../../utils/environment';

export function EnvironmentIndicator() {
  const config = getEnvironmentConfig();

  // Only show in development or when explicitly enabled
  if (!config.showEnvIndicator && !config.isLocal) {
    return null;
  }

  // Determine badge variant based on environment
  const getVariant = () => {
    switch (config.environment) {
      case 'local':
        return 'default';
      case 'development':
        return 'secondary';
      case 'staging':
        return 'outline';
      case 'production':
        return 'destructive';
      default:
        return 'default';
    }
  };

  // Determine badge color/styling
  const getBadgeClassName = () => {
    switch (config.environment) {
      case 'local':
        return 'bg-green-500 text-white hover:bg-green-600';
      case 'development':
        return 'bg-blue-500 text-white hover:bg-blue-600';
      case 'staging':
        return 'bg-yellow-500 text-white hover:bg-yellow-600';
      case 'production':
        return 'bg-red-500 text-white hover:bg-red-600';
      default:
        return '';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Badge 
        variant={getVariant()} 
        className={getBadgeClassName()}
        title={`Connected to: ${config.supabaseUrl}`}
      >
        🔧 {getEnvironmentName()}
      </Badge>
      {!config.isValid && (
        <Badge variant="destructive" className="ml-2">
          ⚠️ Invalid Config
        </Badge>
      )}
    </div>
  );
}

/**
 * Console Environment Display
 * Logs environment information to console for debugging
 */
export function logEnvironmentInfo() {
  const config = getEnvironmentConfig();
  
  const styles = {
    local: 'background: #10b981; color: white; padding: 4px 8px; border-radius: 4px;',
    development: 'background: #3b82f6; color: white; padding: 4px 8px; border-radius: 4px;',
    staging: 'background: #eab308; color: white; padding: 4px 8px; border-radius: 4px;',
    production: 'background: #ef4444; color: white; padding: 4px 8px; border-radius: 4px;',
  };

  const style = styles[config.environment] || styles.local;

  console.log(
    `%c🔧 Environment: ${getEnvironmentName()}`,
    style
  );
  
  if (config.isLocal) {
    console.log('📍 Local Supabase:', config.supabaseUrl);
  }
}
