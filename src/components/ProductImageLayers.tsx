import React, { useEffect, useState } from "react";

// Types for configuration_images and rules
export interface ConfigImageRule {
  [key: string]: any;
}

export interface ConfigurationImage {
  id: string;
  name: string;
  image: string; // Directus file ID
  z_index: number | string; // API returns as string, convert to number during processing
  image_rules: ConfigImageRule;
}

interface ProductImageLayersProps {
  config: Record<string, any>; // Current product config, e.g. { frameThickness: ..., mounting: ... }
  configurationImages: ConfigurationImage[];
  fetchSvg: (fileId: string) => Promise<string>; // Helper to fetch SVG markup by file ID
}

// --- Rules Evaluator ---
function evaluateRule(rule: ConfigImageRule, config: Record<string, any>): boolean {
  try {
    // If no rule or empty rule object, always show the layer
    if (!rule || Object.keys(rule).length === 0) {
      return true;
    }
    
    if (typeof rule !== "object") {
      console.error('Rule is not an object, returning false');
      return false;
    }
    
    // Create a normalized config object with standardized field names
    const normalizedConfig: Record<string, any> = {
      // Handle product_line mapping - use productLineId if available
      product_lines: config.productLineId || config.productLine?.id || config.product_lines || null,
      // Convert string values to their appropriate types - ensure they're numbers
      frame_thicknesses: parseInt(config.frameThickness) || config.frame_thicknesses || null,
      mounting_options: parseInt(config.mounting) || config.mounting_options || null,
      light_directions: parseInt(config.lighting) || config.light_directions || null, // Map lighting to light_directions
      mirror_styles: parseInt(config.mirrorStyle) || config.mirror_styles || null,
      mirror_controls: parseInt(config.mirrorControls) || parseInt(config.mirrorControl) || config.mirror_controls || null,
      // Add missing field mappings
      frame_colors: parseInt(config.frameColor) || config.frame_colors || null,
      color_temperatures: parseInt(config.colorTemperature) || config.color_temperatures || null,
      light_outputs: parseInt(config.lightOutput) || config.light_outputs || null,
      drivers: parseInt(config.driver) || config.drivers || null,
      sizes: parseInt(config.size) || config.sizes || null,
      accessories: config.accessories || []
    };

    // Handle NaN values (parseInt returns NaN for invalid strings)
    Object.keys(normalizedConfig).forEach(key => {
      if (typeof normalizedConfig[key] === 'number' && isNaN(normalizedConfig[key])) {
        normalizedConfig[key] = null;
      }
    });
    
    // Use normalized config with numeric IDs for rule evaluation
    // Don't override with name mappings as rules expect numeric comparisons
    const enhancedConfig = { ...config, ...normalizedConfig };
    
    // Debug logging for rule evaluation
    console.log('Original config:', config);
    console.log('Normalized config for rule evaluation (using numeric IDs):', normalizedConfig);
    console.log('Enhanced config for rule evaluation:', enhancedConfig);
    
    if (rule._and) {
      const results = rule._and.map((r: any) => evaluateRule(r, enhancedConfig));
      return results.every(Boolean);
    }
    
    if (rule._or) {
      const results = rule._or.map((r: any) => evaluateRule(r, enhancedConfig));
      return results.some(Boolean);
    }
    
    // Field comparison (e.g., { frame_thicknesses: { name: { _contains: "Thin" } } })
    for (const field in rule) {
      if (field.startsWith("_")) continue;
      
      // Try different case formats for field names
      const camelCaseField = toCamelCase(field);
      const snakeCaseField = toSnakeCase(field);
      
      // Use the normalized config which has numeric IDs for proper rule evaluation
      let value = normalizedConfig[field];
      
      // If not found in normalized config, check enhanced config
      if (value === undefined) {
        value = enhancedConfig[field];
      }
      
      // If still not found, try case variations
      if (value === undefined) {
        value = enhancedConfig[camelCaseField] || enhancedConfig[snakeCaseField];
      }
      
      // Handle expanded relation fields from Directus (only extract ID, not name)
      if (typeof value === 'object' && value !== null) {
        // Always use the id property for rule evaluation, not name
        if ('id' in value) {
          value = value.id;
        }
      }
      
      const condition = rule[field];
      
      console.log(`Evaluating field "${field}": value=${value} (type: ${typeof value}), condition=`, condition);
      const fieldResult = evaluateFieldCondition(value, condition);
      console.log(`Field "${field}" result: ${fieldResult}`);
      
      if (!fieldResult) {
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error evaluating rule:', error);
    return false;
  }
}

// Helper functions for case conversion
function toCamelCase(s: string): string {
  return s.replace(/(_[a-z])/g, (g) => g[1].toUpperCase());
}

function toSnakeCase(s: string): string {
  return s.replace(/[A-Z]/g, (g) => "_" + g.toLowerCase());
}

function evaluateFieldCondition(value: any, condition: any): boolean {
  try {
    // Special case for undefined/null values
    if (value === undefined || value === null) {
      return false;
    }
    
    // Equal comparison with type coercion for numeric strings
    if (condition._eq !== undefined) {
      // Handle object values (get the id property if available)
      let actualValue = value;
      if (typeof value === 'object' && value !== null && 'id' in value) {
        actualValue = value.id;
      }
      
      // Use loose equality to handle string/number comparisons
      return actualValue == condition._eq;
    }
    
    if (condition._in !== undefined && Array.isArray(condition._in)) {
      // Handle both direct value and object.id for array inclusion
      let actualValue = value;
      if (typeof value === 'object' && value !== null && 'id' in value) {
        actualValue = value.id;
      }
      
      // Convert all values to strings for comparison to handle number/string mismatches
      const stringValues = condition._in.map((v: any) => String(v));
      return stringValues.includes(String(actualValue));
    }
    
    if (condition._contains !== undefined && value) {
      // Handle array of objects for contains check
      if (Array.isArray(value)) {
        return value.some(item => {
          const itemValue = typeof item === 'object' && item !== null && 'name' in item ? item.name : item;
          const valueStr = String(itemValue).toLowerCase();
          const conditionStr = String(condition._contains).toLowerCase();
          return valueStr.includes(conditionStr);
        });
      }
      
      // Handle object with name property for contains check
      if (typeof value === 'object' && value !== null && 'name' in value) {
        const valueStr = String(value.name).toLowerCase();
        const conditionStr = String(condition._contains).toLowerCase();
        return valueStr.includes(conditionStr);
      }
      
      // Default string contains check
      const valueStr = String(value).toLowerCase();
      const conditionStr = String(condition._contains).toLowerCase();
      return valueStr.includes(conditionStr);
    }
    
    // Nested (e.g., name: { _contains: ... })
    for (const key in condition) {
      if (typeof condition[key] === "object") {
        if (!evaluateFieldCondition(value?.[key], condition[key])) {
          return false;
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in field condition evaluation:', error);
    return false;
  }
}

// Enhanced debug function to investigate specific configuration images
function debugConfigurationImages(config: any, configurationImages: ConfigurationImage[] | undefined) {
  if (!configurationImages || !Array.isArray(configurationImages)) {
    console.error('Invalid configuration images for debugging:', configurationImages);
    return;
  }

  console.group('🔍 CONFIGURATION IMAGES DEBUG');
  console.log(`Found ${configurationImages.length} configuration images`);

  // Check for the specific problematic image
  const problematicId = 'ee524fce-2e5d-4fe9-b01d-dec8cdb2faf6';
  const problematicImage = configurationImages.find(img => img.id === problematicId);

  if (problematicImage) {
    console.group(`🎯 FOUND PROBLEMATIC IMAGE: ${problematicId}`);
    console.log('Name:', problematicImage.name);
    console.log('Z-Index:', problematicImage.z_index);
    console.log('Image ID:', problematicImage.image);
    console.log('Rules:', JSON.stringify(problematicImage.image_rules || {}, null, 2));

    // Parse rules if they're a string
    let parsedRules = problematicImage.image_rules;
    if (typeof problematicImage.image_rules === 'string') {
      try {
        parsedRules = JSON.parse(problematicImage.image_rules);
      } catch (error) {
        console.error('Failed to parse rules:', error);
        parsedRules = {};
      }
    }

    console.log('Rule Evaluation Result:', evaluateRule(parsedRules || {}, config));
    console.log('Rule Type:', typeof problematicImage.image_rules);
    console.log('Has Image ID:', !!problematicImage.image);
    console.groupEnd();
  } else {
    console.warn(`❌ Problematic image ${problematicId} NOT FOUND in configuration images`);
  }

  // Check for missing backlight layers
  const backlightLayers = configurationImages.filter(img =>
    img.name && img.name.toLowerCase().includes('backlight')
  );

  if (backlightLayers.length > 0) {
    console.group(`💡 BACKLIGHT LAYERS ANALYSIS (${backlightLayers.length} found)`);
    backlightLayers.forEach(layer => {
      // Parse rules if they're a string
      let parsedRules = layer.image_rules;
      if (typeof layer.image_rules === 'string') {
        try {
          parsedRules = JSON.parse(layer.image_rules);
        } catch (error) {
          console.error(`Failed to parse rules for ${layer.name}:`, error);
          parsedRules = {};
        }
      }

      const isVisible = evaluateRule(parsedRules || {}, config);
      console.log(`${isVisible ? '✅' : '❌'} ${layer.name} (${layer.id})`);
      if (!isVisible) {
        console.log(`   Rules:`, JSON.stringify(parsedRules || {}, null, 2));
        console.log(`   Config:`, config);
      }
    });
    console.groupEnd();
  } else {
    console.warn(`💡 No backlight layers found in configuration images`);
  }

  // Check for any layers with directional names that might be missing
  const directionalLayers = configurationImages.filter(img =>
    img.name && (
      img.name.toLowerCase().includes('left') ||
      img.name.toLowerCase().includes('right') ||
      img.name.toLowerCase().includes('bottom') ||
      img.name.toLowerCase().includes('top')
    )
  );

  if (directionalLayers.length > 0) {
    console.group(`🧭 DIRECTIONAL LAYERS ANALYSIS (${directionalLayers.length} found)`);
    directionalLayers.forEach(layer => {
      // Parse rules if they're a string
      let parsedRules = layer.image_rules;
      if (typeof layer.image_rules === 'string') {
        try {
          parsedRules = JSON.parse(layer.image_rules);
        } catch (error) {
          console.error(`Failed to parse rules for ${layer.name}:`, error);
          parsedRules = {};
        }
      }

      const isVisible = evaluateRule(parsedRules || {}, config);
      const layerType = layer.name.toLowerCase().includes('frost') ? '🧊 FROST' :
                       layer.name.toLowerCase().includes('backlight') ? '💡 BACKLIGHT' :
                       '🎯 OTHER';
      console.log(`${isVisible ? '✅' : '❌'} ${layerType} ${layer.name} (z:${layer.z_index})`);
      if (!isVisible && !layer.name.toLowerCase().includes('frost')) {
        console.group(`   ❌ Why is "${layer.name}" hidden?`);
        console.log(`   Rules:`, JSON.stringify(parsedRules || {}, null, 2));
        console.log(`   Current Config:`, config);
        console.groupEnd();
      }
    });
    console.groupEnd();
  }

  // Enhanced debugging for all images
  console.group('📊 ALL CONFIGURATION IMAGES ANALYSIS');
  configurationImages.forEach((img, index) => {
    if (!img) {
      console.error(`Image at index ${index} is undefined`);
      return;
    }

    // Parse rules if they're a string (critical fix for debugging accuracy)
    let parsedRules = img.image_rules;
    if (typeof img.image_rules === 'string') {
      try {
        parsedRules = JSON.parse(img.image_rules);
      } catch (error) {
        console.error(`Failed to parse rules for ${img.name}:`, error);
        parsedRules = {};
      }
    }

    const isVisible = evaluateRule(parsedRules || {}, config);
    const hasImage = !!img.image;
    const hasRules = !!parsedRules && Object.keys(parsedRules).length > 0;

    console.log(`${index + 1}. ${img.name || 'unnamed'} (ID: ${img.id || 'unknown'})`);
    console.log(`   ✅ Visible: ${isVisible} | 🖼️ Has Image: ${hasImage} | 📋 Has Rules: ${hasRules} | 📊 Z-Index: ${img.z_index}`);

    if (!hasImage) {
      console.warn(`   ⚠️ Missing image file ID for: ${img.name}`);
    }

    if (!hasRules) {
      console.warn(`   ⚠️ Missing or empty rules for: ${img.name}`);
    }

    if (isVisible && !hasImage) {
      console.error(`   ❌ CRITICAL: Visible layer "${img.name}" has no image file!`);
    }
  });
  console.groupEnd();
  console.groupEnd();
}

// Comprehensive system robustness checker
function validateConfigurationImageSystem(configurationImages: ConfigurationImage[], config: Record<string, any>) {
  console.group('🔧 CONFIGURATION IMAGE SYSTEM VALIDATION');

  const issues: string[] = [];
  const warnings: string[] = [];
  const stats = {
    totalImages: configurationImages.length,
    imagesWithRules: 0,
    imagesWithoutRules: 0,
    imagesWithoutImageId: 0,
    visibleImages: 0,
    hiddenImages: 0,
    ruleParsingErrors: 0,
    uniqueZIndexes: new Set<number>(),
    filterConflicts: 0
  };

  configurationImages.forEach((image, index) => {
    // Basic structure validation
    if (!image || typeof image !== 'object') {
      issues.push(`Image at index ${index} is not a valid object`);
      return;
    }

    if (!image.id) {
      issues.push(`Image at index ${index} has no ID`);
    }

    if (!image.name) {
      warnings.push(`Image ${image.id || index} has no name`);
    }

    if (!image.image) {
      stats.imagesWithoutImageId++;
      issues.push(`Image "${image.name}" (${image.id}) has no image file ID`);
    }

    // Rule validation
    if (!image.image_rules || Object.keys(image.image_rules).length === 0) {
      stats.imagesWithoutRules++;
      warnings.push(`Image "${image.name}" (${image.id}) has no rules - will always be visible`);
    } else {
      stats.imagesWithRules++;

      // Try to parse rules if they're a string
      let parsedRules = image.image_rules;
      if (typeof image.image_rules === 'string') {
        try {
          parsedRules = JSON.parse(image.image_rules);
        } catch (error) {
          stats.ruleParsingErrors++;
          issues.push(`Image "${image.name}" (${image.id}) has unparseable rules: ${error}`);
          return;
        }
      }

      // Validate rule structure
      try {
        const isVisible = evaluateRule(parsedRules, config);
        if (isVisible) {
          stats.visibleImages++;
        } else {
          stats.hiddenImages++;
        }
      } catch (error) {
        issues.push(`Image "${image.name}" (${image.id}) rule evaluation failed: ${error}`);
      }
    }

    // Z-index validation
    const zIndex = typeof image.z_index === 'string' ? parseInt(image.z_index) : (image.z_index || 0);
    stats.uniqueZIndexes.add(zIndex);

    if (isNaN(zIndex)) {
      issues.push(`Image "${image.name}" (${image.id}) has invalid z_index: ${image.z_index}`);
    }
  });

  // System-wide validation
  console.log('📊 SYSTEM STATISTICS:');
  console.log(`Total Images: ${stats.totalImages}`);
  console.log(`Images with Rules: ${stats.imagesWithRules}`);
  console.log(`Images without Rules: ${stats.imagesWithoutRules}`);
  console.log(`Images without Image ID: ${stats.imagesWithoutImageId}`);
  console.log(`Currently Visible: ${stats.visibleImages}`);
  console.log(`Currently Hidden: ${stats.hiddenImages}`);
  console.log(`Rule Parsing Errors: ${stats.ruleParsingErrors}`);
  console.log(`Unique Z-Indexes: ${stats.uniqueZIndexes.size} (${Array.from(stats.uniqueZIndexes).sort((a, b) => a - b).join(', ')})`);

  // Report issues
  if (issues.length > 0) {
    console.group('❌ CRITICAL ISSUES:');
    issues.forEach(issue => console.error(issue));
    console.groupEnd();
  }

  if (warnings.length > 0) {
    console.group('⚠️ WARNINGS:');
    warnings.forEach(warning => console.warn(warning));
    console.groupEnd();
  }

  // Extensibility recommendations
  console.group('🚀 EXTENSIBILITY RECOMMENDATIONS:');
  if (stats.imagesWithoutImageId > 0) {
    console.log('- Implement validation to prevent images without file IDs from being saved');
  }
  if (stats.ruleParsingErrors > 0) {
    console.log('- Add rule validation in the admin interface');
  }
  if (stats.uniqueZIndexes.size < stats.totalImages * 0.8) {
    console.log('- Consider using more granular z-index values to avoid stacking conflicts');
  }
  console.log('- All rule operators (_eq, _in, _contains, _and, _or) are supported');
  console.log('- System supports any field name with automatic camelCase/snake_case conversion');
  console.log('- Filter ID conflicts are automatically resolved for frost layers');
  console.groupEnd();

  console.groupEnd();

  return {
    isHealthy: issues.length === 0,
    issues,
    warnings,
    stats
  };
}

// Test function for rule evaluation
export function testRuleEvaluation(config: any) {
  console.log('=== RULE EVALUATION TEST ===');
  console.log('Original config:', config);
  
  // Test with a simple rule
  const testRule = {
    "frame_thicknesses": {
      "_eq": 2 // Thin Frame
    }
  };
  
  console.log('Test rule result:', evaluateRule(testRule, config));
}

// Main Component
export const ProductImageLayers: React.FC<ProductImageLayersProps> = ({
  config,
  configurationImages,
  fetchSvg,
}) => {
  const [svgLayers, setSvgLayers] = useState<{ id: string; name: string; z: number; svg: string }[]>([]);
  
  // Run test on mount with current config - add JSON.stringify to force re-evaluation
  useEffect(() => {
    if (config && configurationImages && configurationImages.length > 0) {
      console.log('🔍 Configuration changed, running debug...', new Date().toLocaleTimeString());
      console.log('📊 Current config:', config);
      testRuleEvaluation(config);
      debugConfigurationImages(config, configurationImages);

      // Run comprehensive system validation
      const validationResult = validateConfigurationImageSystem(configurationImages, config);
      if (!validationResult.isHealthy) {
        console.warn('⚠️ Configuration image system has issues that may affect extensibility');
      }
    }
  }, [JSON.stringify(config), configurationImages]); // Use JSON.stringify to detect deep changes

  useEffect(() => {
    let isMounted = true;

    async function loadLayers() {
      try {
        console.log('🔄 loadLayers triggered with config:', config);

        // Debug configuration values and their types
        console.log('🔧 Configuration Debug:');
        console.log(`  productLineId: ${config?.productLineId} (${typeof config?.productLineId})`);
        console.log(`  frameThickness: ${config?.frameThickness} (${typeof config?.frameThickness})`);
        console.log(`  mounting: ${config?.mounting} (${typeof config?.mounting})`);
        console.log(`  lighting: ${config?.lighting} (${typeof config?.lighting})`);
        console.log(`  mirrorStyle: ${config?.mirrorStyle} (${typeof config?.mirrorStyle})`);
        console.log(`  mirrorControls: ${config?.mirrorControls} (${typeof config?.mirrorControls})`);

        if (!configurationImages) {
          console.error('Configuration images is undefined');
          return;
        }

        if (!Array.isArray(configurationImages)) {
          console.error('Configuration images is not an array:', typeof configurationImages, configurationImages);
          return;
        }

        if (configurationImages.length === 0) {
          console.log('No configuration images available (empty array)');
          return;
        }

        console.log(`🖼️ Processing ${configurationImages.length} configuration images with config:`, config);
        
        // Filter layers based on rules
        const visibleLayers = configurationImages.filter(layer => {
          try {
            if (!layer || typeof layer !== 'object') {
              console.error('Invalid layer object:', layer);
              return false;
            }
            
            if (!layer.image_rules) {
              console.warn(`Layer ${layer.id || 'unknown'} has no image_rules, defaulting to visible`);
              return true;
            }
            
            // Parse image_rules if it's a string (GraphQL might return JSON as string)
            let parsedRules = layer.image_rules;
            if (typeof layer.image_rules === 'string') {
              try {
                parsedRules = JSON.parse(layer.image_rules);
                console.log(`Parsed string rules for layer ${layer.id}:`, parsedRules);
              } catch (parseError) {
                console.error(`Failed to parse image_rules for layer ${layer.id}:`, parseError);
                return false;
              }
            }
            
            console.log(`Evaluating rules for layer ${layer.id} (${layer.name}):`, parsedRules, 'with config:', config);
            const isVisible = evaluateRule(parsedRules, config);
            console.log(`Layer "${layer.name || 'unnamed'}" (${layer.id || 'unknown'}) visibility: ${isVisible}`);
            return isVisible;
          } catch (error) {
            console.error(`Error evaluating rules for layer:`, layer, error);
            return false;
          }
        });
        
        // Sort by z-index, with secondary sort for frost layers to ensure consistent stacking
        const sortedLayers = [...visibleLayers].sort((a, b) => {
          const zIndexA = typeof a.z_index === 'string' ? parseInt(a.z_index) : (a.z_index || 0);
          const zIndexB = typeof b.z_index === 'string' ? parseInt(b.z_index) : (b.z_index || 0);

          // Primary sort by z-index
          if (zIndexA !== zIndexB) {
            return zIndexA - zIndexB;
          }

          // Secondary sort for layers with same z-index: frost layers in specific order
          const isFrostA = a.name && a.name.toLowerCase().includes('frost');
          const isFrostB = b.name && b.name.toLowerCase().includes('frost');

          if (isFrostA && isFrostB) {
            // Ensure frost layers render in a consistent order: Bottom, Left, Top, Right
            const frostOrder = ['bottom', 'left', 'top', 'right'];
            const orderA = frostOrder.findIndex(dir => a.name.toLowerCase().includes(dir));
            const orderB = frostOrder.findIndex(dir => b.name.toLowerCase().includes(dir));
            return orderA - orderB;
          }

          return 0;
        });
        
        console.log(`${sortedLayers.length} layers sorted by z-index`);
        
        // Fetch SVG content for each visible layer
        console.log(`🔄 Fetching SVG content for ${sortedLayers.length} visible layers...`);
        const svgs = await Promise.all(
          sortedLayers.map(async (layer) => {
            try {
              if (!layer.image) {
                console.error(`❌ Layer ${layer.id || 'unknown'} has no image defined`);
                return null;
              }

              console.log(`🖼️ Fetching SVG for layer "${layer.name}" (${layer.id}) with image ID: ${layer.image}`);
              const svg = await fetchSvg(layer.image);

              if (!svg || svg.length === 0) {
                console.error(`❌ Empty SVG returned for layer ${layer.id || 'unknown'}`);
                return null;
              }

              console.log(`✅ Fetched SVG for layer "${layer.name}" (${layer.id}), length: ${svg.length} chars`);

              // Smart SVG processing: Different handling for background vs overlay layers
              let processedSvg = svg;

              // Detect if this is a background layer (contains large image data or patterns)
              // Note: "backlight" layers are NOT background layers - they're overlay lighting effects
              const isBackgroundLayer = (layer.name.toLowerCase().includes('bg') ||
                                        layer.name.toLowerCase().includes('background') ||
                                        layer.name.toLowerCase().includes('direct')) &&
                                        !layer.name.toLowerCase().includes('backlight') || // Exclude backlight layers
                                        svg.includes('data:image/') ||
                                        svg.length > 100000; // Large SVGs are likely backgrounds

              if (isBackgroundLayer) {
                // Background layers: Preserve original dimensions but make responsive
                console.log(`🖼️ Processing background layer: ${layer.name}`);

                // Only make the SVG container responsive, preserve internal structure
                processedSvg = processedSvg
                  .replace(/<svg([^>]*?) width="[^"]*"([^>]*?)/, '<svg$1$2')
                  .replace(/<svg([^>]*?) height="[^"]*"([^>]*?)/, '<svg$1$2')
                  .replace(/<svg/, '<svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet"');

                // Fix rects without dimensions (common issue)
                processedSvg = processedSvg.replace(
                  /<rect(?![^>]*width)(?![^>]*height)([^>]*?)\/>/g,
                  '<rect width="100%" height="100%"$1/>'
                );

                processedSvg = processedSvg.replace(
                  /<rect(?![^>]*width)(?![^>]*height)([^>]*?)>/g,
                  '<rect width="100%" height="100%"$1>'
                );

              } else {
                // Overlay layers: Normalize to consistent 800x800 coordinate system
                console.log(`🎯 Processing overlay layer: ${layer.name}`);

                const isFrostLayer = layer.name && layer.name.toLowerCase().includes('frost');

                // Store original viewBox to preserve aspect ratio if needed
                const originalViewBoxMatch = processedSvg.match(/viewBox="([^"]*)"/);
                const originalViewBox = originalViewBoxMatch ? originalViewBoxMatch[1] : '0 0 800 800';

                if (isFrostLayer) {
                  // For frost layers, use more conservative processing to preserve original structure
                  console.log(`🧊 Using conservative processing for frost layer: ${layer.name}`);

                  // Fix filter ID conflicts by making them unique per layer
                  const uniqueFilterId = `filter_${layer.id.replace(/[^a-zA-Z0-9]/g, '_')}`;

                  // Enhanced filter ID detection - support multiple patterns for extensibility
                  const filterIdPatterns = [
                    /id="(filter0_g_\d+_\d+)"/g,  // Original pattern
                    /id="(filter\d+_g_\d+_\d+)"/g, // Extended pattern
                    /id="(filter[^"]+)"/g          // Generic filter pattern
                  ];

                  let filterMatches: RegExpMatchArray[] = [];
                  for (const pattern of filterIdPatterns) {
                    const matches = [...processedSvg.matchAll(pattern)];
                    if (matches.length > 0) {
                      filterMatches = matches;
                      console.log(`🧊 Found ${matches.length} filter(s) using pattern: ${pattern.source}`);
                      break;
                    }
                  }

                  if (filterMatches.length > 0) {
                    filterMatches.forEach((match, index) => {
                      const originalFilterId = match[1];
                      const indexedUniqueFilterId = `${uniqueFilterId}_${index}`;

                      console.log(`🧊 Replacing filter ID for ${layer.name}: ${originalFilterId} -> ${indexedUniqueFilterId}`);

                      // Replace filter definition ID
                      processedSvg = processedSvg.replace(
                        new RegExp(`id="${originalFilterId}"`, 'g'),
                        `id="${indexedUniqueFilterId}"`
                      );

                      // Replace filter reference URL
                      processedSvg = processedSvg.replace(
                        new RegExp(`url\\(#${originalFilterId}\\)`, 'g'),
                        `url(#${indexedUniqueFilterId})`
                      );
                    });

                    console.log(`🧊 Successfully replaced ${filterMatches.length} filter ID(s) for ${layer.name}`);
                  } else {
                    console.log(`🧊 No filter IDs found in ${layer.name} - this is normal for non-filtered frost layers`);
                  }

                  // Apply responsive scaling while preserving filter effects and transforms
                  console.log(`🧊 Applying responsive scaling to frost layer: ${layer.name}`);

                  // Remove existing width/height/viewBox attributes
                  processedSvg = processedSvg
                    .replace(/<svg[^>]*width="[^"]*"[^>]*/, (match) => match.replace(/width="[^"]*"/, ''))
                    .replace(/<svg[^>]*height="[^"]*"[^>]*/, (match) => match.replace(/height="[^"]*"/, ''))
                    .replace(/<svg[^>]*viewBox="[^"]*"[^>]*/, (match) => match.replace(/viewBox="[^"]*"/, ''));

                  // Apply responsive dimensions with preserved viewBox
                  const finalViewBox = originalViewBox && originalViewBox !== 'none' ? originalViewBox : '0 0 800 800';
                  processedSvg = processedSvg.replace(
                    /<svg([^>]*?)>/,
                    `<svg$1 width="100%" height="100%" viewBox="${finalViewBox}" preserveAspectRatio="xMidYMid meet">`
                  );

                  console.log(`🧊 Applied viewBox "${finalViewBox}" to frost layer: ${layer.name}`);
                } else {
                  // Standard processing for non-frost overlay layers
                  // Remove any existing width/height/viewBox from SVG element
                  processedSvg = processedSvg
                    .replace(/<svg[^>]*width="[^"]*"[^>]*/, (match) => match.replace(/width="[^"]*"/, ''))
                    .replace(/<svg[^>]*height="[^"]*"[^>]*/, (match) => match.replace(/height="[^"]*"/, ''))
                    .replace(/<svg[^>]*viewBox="[^"]*"[^>]*/, (match) => match.replace(/viewBox="[^"]*"/, ''));

                  // Set consistent SVG container attributes - use original viewBox if it exists and is reasonable
                  const useOriginalViewBox = originalViewBox !== '0 0 800 800' &&
                                           originalViewBox.split(' ').length === 4 &&
                                           !originalViewBox.includes('none');

                  const finalViewBox = useOriginalViewBox ? originalViewBox : '0 0 800 800';

                  processedSvg = processedSvg.replace(
                    /<svg([^>]*?)>/,
                    `<svg$1 width="100%" height="100%" viewBox="${finalViewBox}" preserveAspectRatio="xMidYMid meet">`
                  );

                  // Fix rect elements for proper rendering - be more flexible with dimensions
                  // BUT preserve transforms and exact positioning for frost layers
                  if (!isFrostLayer) {
                    processedSvg = processedSvg.replace(
                      /<rect(?![^>]*width)(?![^>]*height)([^>]*?)\/>/g,
                      '<rect width="100%" height="100%"$1/>'
                    );

                    processedSvg = processedSvg.replace(
                      /<rect(?![^>]*width)(?![^>]*height)([^>]*?)>/g,
                      '<rect width="100%" height="100%"$1>'
                    );

                    // Also handle other elements that might need dimensions
                    processedSvg = processedSvg.replace(
                      /<image(?![^>]*width)(?![^>]*height)([^>]*?)\/>/g,
                      '<image width="100%" height="100%"$1/>'
                    );

                    processedSvg = processedSvg.replace(
                      /<image(?![^>]*width)(?![^>]*height)([^>]*?)>/g,
                      '<image width="100%" height="100%"$1>'
                    );
                  } else {
                    console.log(`🧊 Preserving original rect dimensions, transforms, and positioning for frost layer: ${layer.name}`);
                    // Frost layers keep their exact pixel coordinates and transforms
                    // The responsive scaling happens at the SVG container level via viewBox
                  }
                }
              }

              // Ensure SVG has proper XML namespace
              if (!processedSvg.includes('xmlns=')) {
                processedSvg = processedSvg.replace(
                  /<svg([^>]*?)>/,
                  '<svg$1 xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">'
                );
              }

              let responsiveSvg = processedSvg;

              // Debug SVG processing with detailed structure analysis
              const originalViewBox = svg.match(/viewBox="([^"]*)"/)?.[1] || 'none';
              const processedViewBox = responsiveSvg.match(/viewBox="([^"]*)"/)?.[1] || 'none';
              const hasVisibleContent = responsiveSvg.includes('<rect') || responsiveSvg.includes('<path') || responsiveSvg.includes('<circle') || responsiveSvg.includes('<polygon') || responsiveSvg.includes('<image');

              // Enhanced debugging for frost layers specifically
              const isFrostLayer = layer.name && layer.name.toLowerCase().includes('frost');

              if (isFrostLayer) {
                console.group(`🧊 FROST LAYER DEBUG: "${layer.name}"`);
                console.log('Original SVG:', svg);
                console.log('Processed SVG:', responsiveSvg);
                console.log('Has visible content:', hasVisibleContent);
                console.log('Original viewBox:', originalViewBox);
                console.log('Processed viewBox:', processedViewBox);
                console.log('SVG length change:', svg.length, '->', responsiveSvg.length);

                // Check for filter IDs in final SVG
                const finalFilterIds = [...responsiveSvg.matchAll(/id="(filter[^"]+)"/g)];
                const finalFilterRefs = [...responsiveSvg.matchAll(/url\(#(filter[^)]+)\)/g)];
                console.log('Final filter IDs:', finalFilterIds.map(m => m[1]));
                console.log('Final filter references:', finalFilterRefs.map(m => m[1]));

                // Verify filter ID consistency
                const uniqueFilterIds = new Set(finalFilterIds.map(m => m[1]));
                const uniqueFilterRefs = new Set(finalFilterRefs.map(m => m[1]));
                const idsMatch = uniqueFilterIds.size === uniqueFilterRefs.size &&
                               [...uniqueFilterIds].every(id => uniqueFilterRefs.has(id));
                console.log('Filter ID consistency check:', idsMatch ? '✅ PASS' : '❌ FAIL');

                console.groupEnd();
              }

              console.log(`🎨 Processed SVG for "${layer.name}":`, {
                layerType: isBackgroundLayer ? 'BACKGROUND' : 'OVERLAY',
                originalLength: svg.length,
                processedLength: responsiveSvg.length,
                originalViewBox: originalViewBox,
                processedViewBox: processedViewBox,
                preservedOriginalStructure: isBackgroundLayer,
                normalizedTo800x800: !isBackgroundLayer && processedViewBox === '0 0 800 800',
                startsWithSvg: responsiveSvg.startsWith('<svg'),
                hasClosingTag: responsiveSvg.includes('</svg>'),
                hasVisibleContent: hasVisibleContent,
                rectCount: (responsiveSvg.match(/<rect/g) || []).length,
                pathCount: (responsiveSvg.match(/<path/g) || []).length,
                preview: responsiveSvg.substring(0, 500) + '...'
              });

              // Additional debugging for layers that might not be rendering
              if (!hasVisibleContent) {
                console.warn(`⚠️ Layer "${layer.name}" may not have visible content:`, {
                  originalPreview: svg.substring(0, 500),
                  processedPreview: responsiveSvg.substring(0, 500)
                });

                // Try to render the original SVG as fallback if processed version has no content
                if (svg.includes('<rect') || svg.includes('<path') || svg.includes('<circle') || svg.includes('<polygon') || svg.includes('<image')) {
                  console.log(`🔄 Using original SVG as fallback for "${layer.name}"`);
                  responsiveSvg = svg.replace(
                    /<svg([^>]*?)>/,
                    '<svg$1 width="100%" height="100%" preserveAspectRatio="xMidYMid meet">'
                  );
                }
              }

              // Special handling for frost layers that might have rendering issues
              if (isFrostLayer && (!hasVisibleContent || responsiveSvg.length < 100)) {
                console.warn(`🧊 Frost layer "${layer.name}" appears to have issues, using minimal processing fallback`);
                responsiveSvg = svg.replace(
                  /<svg([^>]*?)>/,
                  '<svg$1 width="100%" height="100%" style="position: absolute; top: 0; left: 0;">'
                );
              }

              // Check if SVG has proper structure
              if (!responsiveSvg.startsWith('<svg')) {
                console.error(`❌ SVG for "${layer.name}" doesn't start with <svg tag:`, responsiveSvg.substring(0, 100));
              }

              if (!responsiveSvg.includes('</svg>')) {
                console.error(`❌ SVG for "${layer.name}" doesn't have closing </svg> tag`);
              }

              return {
                id: layer.id || `unknown-${Date.now()}`,
                name: layer.name || 'Unnamed Layer',
                z: typeof layer.z_index === 'string' ? parseInt(layer.z_index) : (layer.z_index || 0),
                svg: responsiveSvg
              };
            } catch (error) {
              console.error(`❌ Error fetching SVG for layer "${layer.name}" (${layer.id}):`, error);
              return null;
            }
          })
        );
        
        
        // Filter out null values (failed fetches)
        const validLayers = svgs.filter(layer => layer !== null) as Array<{ id: string, name: string, z: number, svg: string }>;
        console.log(`Rendering ${validLayers.length} SVG layers`);

        // Debug frost layers in final render list
        const frostLayers = validLayers.filter(layer => layer.name.toLowerCase().includes('frost'));
        if (frostLayers.length > 0) {
          console.group('🧊 FROST LAYERS IN FINAL RENDER:');
          frostLayers.forEach(layer => {
            console.log(`- ${layer.name} (z:${layer.z})`);
            console.log(`  SVG length: ${layer.svg.length}`);
            console.log(`  SVG preview: ${layer.svg.substring(0, 200)}...`);
          });
          console.groupEnd();
        }

        // Debug backlight layers in final render list
        const backlightLayers = validLayers.filter(layer => layer.name.toLowerCase().includes('backlight'));
        if (backlightLayers.length > 0) {
          console.group('💡 BACKLIGHT LAYERS IN FINAL RENDER:');
          backlightLayers.forEach(layer => {
            const hasVisibleContent = layer.svg.includes('<rect') || layer.svg.includes('<path') ||
                                     layer.svg.includes('<circle') || layer.svg.includes('<polygon') ||
                                     layer.svg.includes('<image');
            console.log(`- ${layer.name} (z:${layer.z}) ${hasVisibleContent ? '✅' : '❌'}`);
            console.log(`  SVG length: ${layer.svg.length}`);
            console.log(`  Has visible content: ${hasVisibleContent}`);
            console.log(`  SVG preview: ${layer.svg.substring(0, 300)}...`);

            // Check for common issues
            if (!hasVisibleContent) {
              console.warn(`  ⚠️ No visible SVG elements found`);
            }
            if (layer.svg.length < 100) {
              console.warn(`  ⚠️ SVG content seems too short`);
            }
            if (!layer.svg.includes('viewBox')) {
              console.warn(`  ⚠️ Missing viewBox attribute`);
            }
          });
          console.groupEnd();
        }

        if (isMounted) {
          setSvgLayers(validLayers);
        }
      } catch (error) {
        console.error('Error in loadLayers:', error);
      }
    }
    
    loadLayers();
    
    return () => {
      isMounted = false;
    };
  }, [JSON.stringify(config), configurationImages, fetchSvg]); // Use JSON.stringify to detect deep changes

  // Helper function to determine if debug console should be shown
  const shouldShowDebugConsole = () => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isDebugEnabled = import.meta.env.VITE_DEBUG_CONSOLE === 'true';
    return isDevelopment && isDebugEnabled;
  };

  return (
    <div className="product-image-layers" style={{
      position: "relative",
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      aspectRatio: "1/1" // Force square aspect ratio
    }}>
      {/* Debug info display - only show in development AND when debug console is enabled */}
      {shouldShowDebugConsole() && (
        <div style={{
          position: "absolute",
          top: 0,
          right: 0,
          background: "rgba(0,0,0,0.9)",
          color: "white",
          padding: "8px",
          fontSize: "10px",
          maxWidth: "350px",
          maxHeight: "250px",
          overflow: "auto",
          zIndex: 1000,
          fontFamily: "monospace",
          borderRadius: "4px"
        }}>
          <strong>🔍 Config Debug ({new Date().toLocaleTimeString()}):</strong><br/>
          <small>ENV: {process.env.NODE_ENV} | DEBUG: {import.meta.env.VITE_DEBUG_CONSOLE}</small><br/>
          <br/>
          productLineId: {config?.productLineId}<br/>
          frameThickness: {config?.frameThickness}<br/>
          frameColor: {config?.frameColor}<br/>
          mounting: {config?.mounting}<br/>
          lighting: {config?.lighting}<br/>
          mirrorStyle: {config?.mirrorStyle}<br/>
          mirrorControls: {config?.mirrorControls}<br/>
          <br/>
          <strong>📊 Available Images: {configurationImages?.length || 0}</strong><br/>
          <strong>✅ Visible Layers: {svgLayers.length}</strong><br/>
          <strong>🔄 Last Update: {new Date().toLocaleTimeString()}</strong><br/>
          {svgLayers.length > 0 ? (
            svgLayers.map(layer => {
              const isFrost = layer.name.toLowerCase().includes('frost');
              const isBacklight = layer.name.toLowerCase().includes('backlight');
              const hasContent = layer.svg.includes('<rect') || layer.svg.includes('<path') || layer.svg.includes('<circle') || layer.svg.includes('<polygon');

              let color = 'white';
              let icon = '';
              if (isFrost) {
                color = hasContent ? 'cyan' : 'red';
                icon = hasContent ? '🧊✅' : '🧊❌';
              } else if (isBacklight) {
                color = hasContent ? 'yellow' : 'orange';
                icon = hasContent ? '💡✅' : '💡❌';
              }

              return (
                <div key={layer.id} style={{color}}>
                  • {layer.name} (z:{layer.z}) {icon}
                  {(isFrost || isBacklight) && <div style={{fontSize: '8px', color: 'gray'}}>SVG: {layer.svg.length} chars</div>}
                </div>
              );
            })
          ) : (
            <div style={{color: "orange"}}>⚠️ No layers visible</div>
          )}
        </div>
      )}



      {svgLayers.map((layer) => {
        const isFrostLayer = layer.name.toLowerCase().includes('frost');
        const isBacklightLayer = layer.name.toLowerCase().includes('backlight');

        // Debug layer rendering
        if (isFrostLayer) {
          console.log(`🧊 RENDERING FROST LAYER: ${layer.name} (z:${layer.z})`);
        }
        if (isBacklightLayer) {
          console.log(`💡 RENDERING BACKLIGHT LAYER: ${layer.name} (z:${layer.z})`);
        }

        return (
          <div
            key={layer.id}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: layer.z,
              width: "100%",
              height: "100%",
              // Add debugging borders for different layer types
              ...(isFrostLayer && process.env.NODE_ENV === 'development' && import.meta.env.VITE_DEBUG_CONSOLE === 'true' ? {
                border: '2px solid cyan',
                backgroundColor: 'rgba(0, 255, 255, 0.1)',
                boxShadow: 'inset 0 0 10px rgba(0, 255, 255, 0.3)'
              } : {}),
              ...(isBacklightLayer && process.env.NODE_ENV === 'development' && import.meta.env.VITE_DEBUG_CONSOLE === 'true' ? {
                border: '2px solid yellow',
                backgroundColor: 'rgba(255, 255, 0, 0.1)',
                boxShadow: 'inset 0 0 10px rgba(255, 255, 0, 0.3)'
              } : {})
            }}
            className={`svg-layer-container ${isFrostLayer ? 'frost-layer' : ''} ${isBacklightLayer ? 'backlight-layer' : ''}`}
          >
            {/* Render normalized SVG with consistent dimensions */}
            <div
              style={{
                width: '100%',
                height: '100%',
                // Ensure no additional transforms or positioning
                position: 'relative',
                overflow: 'hidden'
              }}
              dangerouslySetInnerHTML={{ __html: layer.svg }}
            />
          </div>
        );
      })}
    </div>
  );
};
