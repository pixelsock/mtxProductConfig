// GraphQL Query Validation System for Supabase
// Validates queries against the introspected schema before execution

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

interface SchemaField {
  name: string;
  type: string;
  isRequired: boolean;
  description?: string;
}

interface SchemaCollection {
  name: string;
  fields: SchemaField[];
  description?: string;
}

export class GraphQLQueryValidator {
  private schema: Map<string, SchemaCollection> = new Map();
  private productCollections = new Set([
    'accessories',
    'color_temperatures',
    'drivers',
    'frame_colors',
    'frame_thicknesses',
    'light_directions',
    'light_outputs',
    'mirror_controls',
    'mirror_styles',
    'mounting_options',
    'product_lines',
    'product_lines_default_options',
    'products',
    'products_options_overrides',
    'sizes'
  ]);

  constructor() {
    this.loadSchemaFromIntrospection();
  }

  /**
   * Load schema data from the introspection results
   */
  private async loadSchemaFromIntrospection(): Promise<void> {
    try {
      // In a real implementation, this would load from the schema-output files
      // For now, we'll use a simplified version based on our known collections
      this.initializeKnownCollections();
    } catch (error) {
      console.warn('Failed to load schema from introspection:', error);
      this.initializeKnownCollections();
    }
  }

  /**
   * Initialize with known product collections and their common fields
   */
  private initializeKnownCollections(): void {
    // Common fields that appear in most collections
    const commonFields: SchemaField[] = [
      { name: 'id', type: 'Int', isRequired: true },
      { name: 'name', type: 'String', isRequired: true },
      { name: 'active', type: 'Boolean', isRequired: true },
      { name: 'sort', type: 'Int', isRequired: false },
      { name: 'sku_code', type: 'String', isRequired: false },
      { name: 'webflow_id', type: 'String', isRequired: false }
    ];

    // Collection-specific fields
    const collectionSpecificFields: Record<string, SchemaField[]> = {
      frame_colors: [
        { name: 'hex_code', type: 'String', isRequired: false }
      ],
      sizes: [
        { name: 'width', type: 'Int', isRequired: false },
        { name: 'height', type: 'Int', isRequired: false }
      ],
      // configuration_images removed; product images are on products
      product_lines_default_options: [
        { name: 'product_lines_id', type: 'Int', isRequired: false },
        { name: 'collection', type: 'String', isRequired: false },
        { name: 'item', type: 'String', isRequired: false }
      ]
    };

    // Initialize schema for each product collection
    this.productCollections.forEach(collectionName => {
      const fields = [
        ...commonFields,
        ...(collectionSpecificFields[collectionName] || [])
      ];

      this.schema.set(collectionName, {
        name: collectionName,
        fields,
        description: `Product collection: ${collectionName}`
      });
    });
  }

  /**
   * Validate a GraphQL query string
   */
  validateQuery(query: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    try {
      // Parse the query to extract collections and fields
      const queryAnalysis = this.parseQuery(query);
      
      // Validate each collection used in the query
      queryAnalysis.collections.forEach(collection => {
        this.validateCollection(collection, result);
      });

      // Validate field selections
      queryAnalysis.fieldSelections.forEach(selection => {
        this.validateFieldSelection(selection, result);
      });

      // Check for common issues
      this.checkCommonIssues(query, result);

      // Set overall validity
      result.isValid = result.errors.length === 0;

    } catch (error) {
      result.errors.push(`Query parsing failed: ${error.message}`);
      result.isValid = false;
    }

    return result;
  }

  /**
   * Parse a GraphQL query to extract collections and field selections
   */
  private parseQuery(query: string): {
    collections: string[];
    fieldSelections: Array<{ collection: string; fields: string[] }>;
  } {
    const collections: string[] = [];
    const fieldSelections: Array<{ collection: string; fields: string[] }> = [];

    // Simple regex-based parsing (in production, use a proper GraphQL parser)
    const collectionMatches = query.match(/(\w+)Collection/g) || [];
    
    collectionMatches.forEach(match => {
      const collectionName = match.replace('Collection', '');
      collections.push(collectionName);

      // Extract field selections for this collection
      const fields = this.extractFieldsForCollection(query, collectionName);
      if (fields.length > 0) {
        fieldSelections.push({ collection: collectionName, fields });
      }
    });

    return { collections, fieldSelections };
  }

  /**
   * Extract field selections for a specific collection from the query
   */
  private extractFieldsForCollection(query: string, collection: string): string[] {
    const fields: string[] = [];
    
    // Look for the pattern: collectionCollection { edges { node { field1 field2 ... } } }
    const pattern = new RegExp(`${collection}Collection\\s*\\{[^}]*edges\\s*\\{[^}]*node\\s*\\{([^}]*)\\}`, 'i');
    const match = query.match(pattern);
    
    if (match && match[1]) {
      const fieldBlock = match[1];
      // Extract individual field names (simple approach)
      const fieldMatches = fieldBlock.match(/\b\w+\b/g) || [];
      fields.push(...fieldMatches);
    }

    return fields;
  }

  /**
   * Validate that a collection exists in the schema
   */
  private validateCollection(collectionName: string, result: ValidationResult): void {
    if (!this.schema.has(collectionName)) {
      if (this.productCollections.has(collectionName)) {
        result.warnings.push(`Collection '${collectionName}' is known but not fully loaded in schema`);
      } else {
        result.errors.push(`Unknown collection: '${collectionName}'`);
        result.suggestions.push(`Available collections: ${Array.from(this.productCollections).join(', ')}`);
      }
    }
  }

  /**
   * Validate field selections for a collection
   */
  private validateFieldSelection(selection: { collection: string; fields: string[] }, result: ValidationResult): void {
    const collection = this.schema.get(selection.collection);
    
    if (!collection) {
      return; // Collection validation will handle this
    }

    const validFields = new Set(collection.fields.map(f => f.name));
    const requiredFields = collection.fields.filter(f => f.isRequired).map(f => f.name);

    // Check for invalid fields
    selection.fields.forEach(field => {
      if (!validFields.has(field)) {
        result.errors.push(`Invalid field '${field}' in collection '${selection.collection}'`);
        result.suggestions.push(`Valid fields for ${selection.collection}: ${Array.from(validFields).join(', ')}`);
      }
    });

    // Check for missing required fields
    const missingRequired = requiredFields.filter(field => !selection.fields.includes(field));
    if (missingRequired.length > 0) {
      result.warnings.push(`Missing recommended fields in '${selection.collection}': ${missingRequired.join(', ')}`);
    }
  }

  /**
   * Check for common GraphQL query issues
   */
  private checkCommonIssues(query: string, result: ValidationResult): void {
    // Check for missing filter on active field
    if (query.includes('Collection') && !query.includes('active')) {
      result.warnings.push('Consider filtering by active: { eq: true } to get only active records');
    }

    // Check for missing pagination
    if (query.includes('Collection') && !query.includes('first') && !query.includes('last')) {
      result.warnings.push('Consider adding pagination (first: N) to limit results');
    }

    // Check for overly broad selections
    if (query.includes('*') || query.includes('...')) {
      result.warnings.push('Avoid selecting all fields; specify only needed fields for better performance');
    }

    // Check for proper error handling structure
    if (!query.includes('edges') || !query.includes('node')) {
      result.errors.push('Supabase GraphQL requires edges { node { ... } } structure for collections');
    }
  }

  /**
   * Get available fields for a collection
   */
  getCollectionFields(collectionName: string): SchemaField[] {
    const collection = this.schema.get(collectionName);
    return collection ? collection.fields : [];
  }

  /**
   * Get all available collections
   */
  getAvailableCollections(): string[] {
    return Array.from(this.productCollections);
  }

  /**
   * Generate a valid query template for a collection
   */
  generateQueryTemplate(collectionName: string, fields?: string[]): string {
    const collection = this.schema.get(collectionName);
    if (!collection) {
      throw new Error(`Unknown collection: ${collectionName}`);
    }

    const selectedFields = fields || collection.fields.slice(0, 5).map(f => f.name);
    
    return `query Get${collectionName.charAt(0).toUpperCase() + collectionName.slice(1)} {
  ${collectionName}Collection(filter: { active: { eq: true } }) {
    edges {
      node {
        ${selectedFields.join('\n        ')}
      }
    }
  }
}`;
  }
}

// Export a singleton instance
export const queryValidator = new GraphQLQueryValidator();

/**
 * Utility function to validate queries from the existing codebase
 */
export function validateExistingQueries(): void {
  console.log('🔍 Validating existing GraphQL queries...\n');

  // Known queries from the codebase
  const existingQueries = [
    {
      name: 'getProductLines',
      query: `
        query GetProductLines {
          product_linesCollection {
            edges {
              node {
                id
                name
                sku_code
              }
            }
          }
        }
      `
    },
    {
      name: 'getActiveFrameColors',
      query: `
        query GetActiveFrameColors {
          frame_colorsCollection(filter: { active: { eq: true } }) {
            edges {
              node {
                id
                name
                hex_code
                sku_code
              }
            }
          }
        }
      `
    },
    // configuration_images query removed
    {
      name: 'getAllOptionsOptimized',
      query: `
        query GetAllOptions {
          frame_colorsCollection(filter: { active: { eq: true } }) {
            edges {
              node {
                id
                name
                hex_code
                sku_code
              }
            }
          }
          sizesCollection(filter: { active: { eq: true } }) {
            edges {
              node {
                id
                name
                width
                height
                sku_code
              }
            }
          }
        }
      `
    }
  ];

  existingQueries.forEach(({ name, query }) => {
    console.log(`📋 Validating query: ${name}`);
    const result = queryValidator.validateQuery(query);

    if (result.isValid) {
      console.log('✅ Valid');
    } else {
      console.log('❌ Invalid');
      result.errors.forEach(error => console.log(`   Error: ${error}`));
    }

    if (result.warnings.length > 0) {
      result.warnings.forEach(warning => console.log(`   ⚠️  Warning: ${warning}`));
    }

    if (result.suggestions.length > 0) {
      result.suggestions.forEach(suggestion => console.log(`   💡 Suggestion: ${suggestion}`));
    }

    console.log('');
  });
}
