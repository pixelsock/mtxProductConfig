#!/usr/bin/env node

// Query validation script for GraphQL queries
// Usage: node scripts/validate-queries.js

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simple GraphQL query validator (JavaScript version of the TypeScript validator)
class GraphQLQueryValidator {
  constructor() {
    this.productCollections = new Set([
      'accessories',
      'color_temperatures',
      'configuration_images',
      'drivers',
      'frame_colors',
      'frame_thicknesses',
      'light_directions',
      'light_outputs',
      'mirror_styles',
      'mounting_options',
      'product_lines',
      'product_lines_default_options',
      'products',
      'products_options_overrides',
      'sizes'
    ]);

    this.schema = new Map();
    this.initializeKnownCollections();
  }

  initializeKnownCollections() {
    const commonFields = [
      { name: 'id', type: 'Int', isRequired: true },
      { name: 'name', type: 'String', isRequired: true },
      { name: 'active', type: 'Boolean', isRequired: true },
      { name: 'sort', type: 'Int', isRequired: false },
      { name: 'sku_code', type: 'String', isRequired: false },
      { name: 'webflow_id', type: 'String', isRequired: false }
    ];

    const collectionSpecificFields = {
      frame_colors: [
        { name: 'hex_code', type: 'String', isRequired: false }
      ],
      sizes: [
        { name: 'width', type: 'Int', isRequired: false },
        { name: 'height', type: 'Int', isRequired: false }
      ],
      configuration_images: [
        { name: 'image', type: 'String', isRequired: false },
        { name: 'z_index', type: 'Int', isRequired: false },
        { name: 'image_rules', type: 'JSON', isRequired: false }
      ],
      product_lines_default_options: [
        { name: 'product_lines_id', type: 'Int', isRequired: false },
        { name: 'collection', type: 'String', isRequired: false },
        { name: 'item', type: 'String', isRequired: false }
      ]
    };

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

  validateQuery(query) {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    try {
      const queryAnalysis = this.parseQuery(query);
      
      queryAnalysis.collections.forEach(collection => {
        this.validateCollection(collection, result);
      });

      queryAnalysis.fieldSelections.forEach(selection => {
        this.validateFieldSelection(selection, result);
      });

      this.checkCommonIssues(query, result);
      result.isValid = result.errors.length === 0;

    } catch (error) {
      result.errors.push(`Query parsing failed: ${error.message}`);
      result.isValid = false;
    }

    return result;
  }

  parseQuery(query) {
    const collections = [];
    const fieldSelections = [];

    const collectionMatches = query.match(/(\w+)Collection/g) || [];
    
    collectionMatches.forEach(match => {
      const collectionName = match.replace('Collection', '');
      collections.push(collectionName);

      const fields = this.extractFieldsForCollection(query, collectionName);
      if (fields.length > 0) {
        fieldSelections.push({ collection: collectionName, fields });
      }
    });

    return { collections, fieldSelections };
  }

  extractFieldsForCollection(query, collection) {
    const fields = [];
    
    const pattern = new RegExp(`${collection}Collection\\s*\\{[^}]*edges\\s*\\{[^}]*node\\s*\\{([^}]*)\\}`, 'i');
    const match = query.match(pattern);
    
    if (match && match[1]) {
      const fieldBlock = match[1];
      const fieldMatches = fieldBlock.match(/\b\w+\b/g) || [];
      fields.push(...fieldMatches);
    }

    return fields;
  }

  validateCollection(collectionName, result) {
    if (!this.schema.has(collectionName)) {
      if (this.productCollections.has(collectionName)) {
        result.warnings.push(`Collection '${collectionName}' is known but not fully loaded in schema`);
      } else {
        result.errors.push(`Unknown collection: '${collectionName}'`);
        result.suggestions.push(`Available collections: ${Array.from(this.productCollections).join(', ')}`);
      }
    }
  }

  validateFieldSelection(selection, result) {
    const collection = this.schema.get(selection.collection);
    
    if (!collection) {
      return;
    }

    const validFields = new Set(collection.fields.map(f => f.name));
    const requiredFields = collection.fields.filter(f => f.isRequired).map(f => f.name);

    selection.fields.forEach(field => {
      if (!validFields.has(field)) {
        result.errors.push(`Invalid field '${field}' in collection '${selection.collection}'`);
        result.suggestions.push(`Valid fields for ${selection.collection}: ${Array.from(validFields).join(', ')}`);
      }
    });

    const missingRequired = requiredFields.filter(field => !selection.fields.includes(field));
    if (missingRequired.length > 0) {
      result.warnings.push(`Missing recommended fields in '${selection.collection}': ${missingRequired.join(', ')}`);
    }
  }

  checkCommonIssues(query, result) {
    if (query.includes('Collection') && !query.includes('active')) {
      result.warnings.push('Consider filtering by active: { eq: true } to get only active records');
    }

    if (query.includes('Collection') && !query.includes('first') && !query.includes('last')) {
      result.warnings.push('Consider adding pagination (first: N) to limit results');
    }

    if (!query.includes('edges') || !query.includes('node')) {
      result.errors.push('Supabase GraphQL requires edges { node { ... } } structure for collections');
    }
  }
}

function validateExistingQueries() {
  console.log('🔍 Validating existing GraphQL queries...\n');

  const validator = new GraphQLQueryValidator();

  // Load queries from the actual codebase
  try {
    const supabaseGraphQLPath = join(__dirname, '..', 'src', 'services', 'supabase-graphql.ts');
    const fileContent = readFileSync(supabaseGraphQLPath, 'utf8');
    
    // Extract queries from the file
    const queryMatches = fileContent.match(/const query = `([^`]+)`/g) || [];
    
    console.log(`📋 Found ${queryMatches.length} queries in supabase-graphql.ts\n`);
    
    queryMatches.forEach((match, index) => {
      const query = match.replace('const query = `', '').replace('`', '');
      console.log(`📋 Validating query ${index + 1}:`);
      
      const result = validator.validateQuery(query);
      
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

    // Summary
    const validQueries = queryMatches.filter((match) => {
      const query = match.replace('const query = `', '').replace('`', '');
      return validator.validateQuery(query).isValid;
    });

    console.log(`📊 Summary: ${validQueries.length}/${queryMatches.length} queries are valid`);
    
  } catch (error) {
    console.error('❌ Failed to read GraphQL service file:', error.message);
    process.exit(1);
  }
}

// Run validation
validateExistingQueries();
