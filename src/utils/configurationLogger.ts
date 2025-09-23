/**
 * Configuration UI Logging System
 * Centralized logging for configuration_ui warnings and errors
 * NO FALLBACK LOGIC - all logging is explicit and database-driven
 */

import type { ConfigurationUI, ProductOptions } from '../store/types';
import { validateComponentMappings } from './componentMapping';

// Log levels for configuration warnings
export enum ConfigurationLogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

// Configuration warning types
export interface ConfigurationWarning {
  level: ConfigurationLogLevel;
  message: string;
  collection?: string;
  ui_type?: string;
  timestamp: number;
  code: string;
}

// Warning codes for categorization
export enum ConfigurationWarningCode {
  // Mapping issues
  MISSING_OPTIONS_MAPPING = 'MISSING_OPTIONS_MAPPING',
  MISSING_CONFIG_MAPPING = 'MISSING_CONFIG_MAPPING',
  MISSING_TITLE_MAPPING = 'MISSING_TITLE_MAPPING',
  UNSUPPORTED_UI_TYPE = 'UNSUPPORTED_UI_TYPE',

  // Data issues
  NO_OPTIONS_AVAILABLE = 'NO_OPTIONS_AVAILABLE',
  INVALID_CONFIGURATION_UI_DATA = 'INVALID_CONFIGURATION_UI_DATA',
  DUPLICATE_SORT_VALUES = 'DUPLICATE_SORT_VALUES',

  // Performance issues
  LARGE_OPTIONS_COUNT = 'LARGE_OPTIONS_COUNT',
  SLOW_FILTERING_PERFORMANCE = 'SLOW_FILTERING_PERFORMANCE',
}

/**
 * Configuration Logger Class
 * Handles all configuration_ui related logging
 */
class ConfigurationLogger {
  private warnings: ConfigurationWarning[] = [];
  private maxWarnings = 100; // Prevent memory leaks

  /**
   * Log a configuration warning
   */
  warn(
    code: ConfigurationWarningCode,
    message: string,
    collection?: string,
    ui_type?: string
  ): void {
    this.addWarning({
      level: ConfigurationLogLevel.WARN,
      message,
      collection,
      ui_type,
      timestamp: Date.now(),
      code,
    });

    // Console warning in development
    if (import.meta.env.DEV) {
      console.warn(`[ConfigurationUI] ${code}: ${message}`, {
        collection,
        ui_type,
      });
    }
  }

  /**
   * Log a configuration error
   */
  error(
    code: ConfigurationWarningCode,
    message: string,
    collection?: string,
    ui_type?: string
  ): void {
    this.addWarning({
      level: ConfigurationLogLevel.ERROR,
      message,
      collection,
      ui_type,
      timestamp: Date.now(),
      code,
    });

    // Console error in development
    if (import.meta.env.DEV) {
      console.error(`[ConfigurationUI] ${code}: ${message}`, {
        collection,
        ui_type,
      });
    }
  }

  /**
   * Log configuration info
   */
  info(
    code: ConfigurationWarningCode,
    message: string,
    collection?: string,
    ui_type?: string
  ): void {
    this.addWarning({
      level: ConfigurationLogLevel.INFO,
      message,
      collection,
      ui_type,
      timestamp: Date.now(),
      code,
    });

    // Console info in development
    if (import.meta.env.DEV) {
      console.info(`[ConfigurationUI] ${code}: ${message}`, {
        collection,
        ui_type,
      });
    }
  }

  /**
   * Add warning to internal storage
   */
  private addWarning(warning: ConfigurationWarning): void {
    this.warnings.push(warning);

    // Trim warnings if we exceed max
    if (this.warnings.length > this.maxWarnings) {
      this.warnings = this.warnings.slice(-this.maxWarnings);
    }
  }

  /**
   * Get all warnings
   */
  getWarnings(): ConfigurationWarning[] {
    return [...this.warnings];
  }

  /**
   * Get warnings by level
   */
  getWarningsByLevel(level: ConfigurationLogLevel): ConfigurationWarning[] {
    return this.warnings.filter(warning => warning.level === level);
  }

  /**
   * Get warnings by code
   */
  getWarningsByCode(code: ConfigurationWarningCode): ConfigurationWarning[] {
    return this.warnings.filter(warning => warning.code === code);
  }

  /**
   * Get warnings for specific collection
   */
  getWarningsForCollection(collection: string): ConfigurationWarning[] {
    return this.warnings.filter(warning => warning.collection === collection);
  }

  /**
   * Clear all warnings
   */
  clearWarnings(): void {
    this.warnings = [];
  }

  /**
   * Get warning summary
   */
  getWarningSummary(): {
    total: number;
    errors: number;
    warnings: number;
    info: number;
  } {
    return {
      total: this.warnings.length,
      errors: this.getWarningsByLevel(ConfigurationLogLevel.ERROR).length,
      warnings: this.getWarningsByLevel(ConfigurationLogLevel.WARN).length,
      info: this.getWarningsByLevel(ConfigurationLogLevel.INFO).length,
    };
  }
}

// Singleton logger instance
export const configurationLogger = new ConfigurationLogger();

/**
 * Validate and log configuration_ui data issues
 */
export function validateAndLogConfigurationUI(
  configUI: ConfigurationUI[],
  productOptions: ProductOptions
): void {
  // Validate component mappings
  const mappingValidation = validateComponentMappings(configUI);
  if (!mappingValidation.isValid) {
    mappingValidation.errors.forEach(error => {
      const collection = error.match(/collection: (\w+)/)?.[1];
      const ui_type = error.match(/UI type: (\w+)/)?.[1];

      if (error.includes('Unsupported UI type')) {
        configurationLogger.error(
          ConfigurationWarningCode.UNSUPPORTED_UI_TYPE,
          error,
          collection,
          ui_type
        );
      } else if (error.includes('options key mapping')) {
        configurationLogger.error(
          ConfigurationWarningCode.MISSING_OPTIONS_MAPPING,
          error,
          collection
        );
      } else if (error.includes('config key mapping')) {
        configurationLogger.error(
          ConfigurationWarningCode.MISSING_CONFIG_MAPPING,
          error,
          collection
        );
      } else if (error.includes('title mapping')) {
        configurationLogger.error(
          ConfigurationWarningCode.MISSING_TITLE_MAPPING,
          error,
          collection
        );
      }
    });
  }

  // Check for collections with no available options
  configUI.forEach(config => {
    const { collection } = config;

    // Collection mapping (from componentMapping.ts)
    const collectionMapping: Record<string, keyof ProductOptions> = {
      'hanging_techniques': 'lightingOptions',
      'mirror_styles': 'mirrorStyles',
      'frame_thicknesses': 'frameThickness',
      'frame_colors': 'frameColors',
      'drivers': 'drivers',
      'mounting_options': 'mountingOptions',
      'color_temperatures': 'colorTemperatures',
      'light_directions': 'lightingOptions',
      'light_outputs': 'lightOutputs',
      'sizes': 'sizes',
      'accessories': 'accessoryOptions',
    };

    const optionsKey = collectionMapping[collection];
    if (optionsKey) {
      const options = productOptions[optionsKey];
      if (!options || !Array.isArray(options) || options.length === 0) {
        configurationLogger.warn(
          ConfigurationWarningCode.NO_OPTIONS_AVAILABLE,
          `Collection "${collection}" has no available options`,
          collection,
          config.ui_type
        );
      } else if (options.length > 50) {
        // Warn about potentially large option sets
        configurationLogger.warn(
          ConfigurationWarningCode.LARGE_OPTIONS_COUNT,
          `Collection "${collection}" has ${options.length} options, which may impact performance`,
          collection,
          config.ui_type
        );
      }
    }
  });

  // Check for duplicate sort values
  const sortCounts = new Map<number, string[]>();
  configUI.forEach(config => {
    const collections = sortCounts.get(config.sort) || [];
    collections.push(config.collection);
    sortCounts.set(config.sort, collections);
  });

  sortCounts.forEach((collections, sort) => {
    if (collections.length > 1) {
      configurationLogger.warn(
        ConfigurationWarningCode.DUPLICATE_SORT_VALUES,
        `Duplicate sort value ${sort} found for collections: ${collections.join(', ')}. This may cause inconsistent ordering.`,
        collections[0] // Log against first collection
      );
    }
  });

  // Validate configuration_ui data structure
  configUI.forEach((config, index) => {
    if (!config.id || typeof config.id !== 'string') {
      configurationLogger.error(
        ConfigurationWarningCode.INVALID_CONFIGURATION_UI_DATA,
        `Configuration UI record at index ${index} has invalid or missing id field`,
        config.collection
      );
    }

    if (!config.collection || typeof config.collection !== 'string') {
      configurationLogger.error(
        ConfigurationWarningCode.INVALID_CONFIGURATION_UI_DATA,
        `Configuration UI record at index ${index} has invalid or missing collection field`
      );
    }

    if (!config.ui_type || typeof config.ui_type !== 'string') {
      configurationLogger.error(
        ConfigurationWarningCode.INVALID_CONFIGURATION_UI_DATA,
        `Configuration UI record at index ${index} has invalid or missing ui_type field`,
        config.collection
      );
    }

    if (typeof config.sort !== 'number') {
      configurationLogger.error(
        ConfigurationWarningCode.INVALID_CONFIGURATION_UI_DATA,
        `Configuration UI record at index ${index} has invalid or missing sort field`,
        config.collection
      );
    }
  });
}

/**
 * Log performance metrics for configuration operations
 */
export function logPerformanceMetric(
  operation: string,
  duration: number,
  details?: Record<string, any>
): void {
  if (duration > 100) { // Log operations taking more than 100ms
    configurationLogger.warn(
      ConfigurationWarningCode.SLOW_FILTERING_PERFORMANCE,
      `Slow ${operation} operation took ${duration}ms`,
      undefined,
      undefined
    );

    if (import.meta.env.DEV) {
      console.warn(`[Performance] ${operation} took ${duration}ms`, details);
    }
  }
}

/**
 * Helper to wrap operations with performance logging
 */
export function withPerformanceLogging<T>(
  operationName: string,
  operation: () => T,
  details?: Record<string, any>
): T {
  const start = performance.now();
  try {
    const result = operation();
    const duration = performance.now() - start;
    logPerformanceMetric(operationName, duration, details);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    configurationLogger.error(
      ConfigurationWarningCode.INVALID_CONFIGURATION_UI_DATA,
      `${operationName} failed after ${duration}ms: ${error}`,
      undefined,
      undefined
    );
    throw error;
  }
}