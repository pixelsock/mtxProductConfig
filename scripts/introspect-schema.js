#!/usr/bin/env node

// CLI script to run GraphQL schema introspection
// Usage: node scripts/introspect-schema.js

import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
function loadEnvFile() {
  try {
    const envPath = join(__dirname, '..', '.env');
    const envContent = readFileSync(envPath, 'utf8');

    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=');
          process.env[key] = value;
        }
      }
    });
  } catch (error) {
    console.warn('Warning: Could not load .env file:', error.message);
  }
}

loadEnvFile();

// Environment setup
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL');
  console.error('   VITE_SUPABASE_ANON_KEY');
  console.error('\nPlease check your .env file.');
  process.exit(1);
}

const GRAPHQL_ENDPOINT = `${SUPABASE_URL}/graphql/v1`;

// GraphQL introspection query
const INTROSPECTION_QUERY = `
  query IntrospectionQuery {
    __schema {
      queryType { name }
      mutationType { name }
      subscriptionType { name }
      types {
        ...FullType
      }
      directives {
        name
        description
        locations
        args {
          ...InputValue
        }
      }
    }
  }

  fragment FullType on __Type {
    kind
    name
    description
    fields(includeDeprecated: true) {
      name
      description
      args {
        ...InputValue
      }
      type {
        ...TypeRef
      }
      isDeprecated
      deprecationReason
    }
    inputFields {
      ...InputValue
    }
    interfaces {
      ...TypeRef
    }
    enumValues(includeDeprecated: true) {
      name
      description
      isDeprecated
      deprecationReason
    }
    possibleTypes {
      ...TypeRef
    }
  }

  fragment InputValue on __InputValue {
    name
    description
    type { ...TypeRef }
    defaultValue
  }

  fragment TypeRef on __Type {
    kind
    name
    ofType {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                }
              }
            }
          }
        }
      }
    }
  }
`;

async function runIntrospection() {
  console.log('🔍 Starting Supabase GraphQL schema introspection...');
  console.log(`📡 Endpoint: ${GRAPHQL_ENDPOINT}`);
  
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ query: INTROSPECTION_QUERY }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors, null, 2)}`);
    }

    console.log('✅ Schema introspection successful!');
    
    // Create output directory
    const outputDir = join(__dirname, '..', 'schema-output');
    mkdirSync(outputDir, { recursive: true });
    
    // Save raw schema
    const schemaPath = join(outputDir, 'schema.json');
    writeFileSync(schemaPath, JSON.stringify(result, null, 2));
    console.log(`💾 Raw schema saved to: ${schemaPath}`);
    
    // Analyze and generate report
    const analysis = analyzeSchema(result);
    
    // Save analysis report
    const reportPath = join(outputDir, 'schema-report.md');
    writeFileSync(reportPath, analysis.report);
    console.log(`📄 Schema report saved to: ${reportPath}`);

    // Debug: Log analysis data
    console.log('Debug - Analysis data:', {
      collectionCount: analysis.collectionCount,
      productCollectionCount: analysis.productCollections.length,
      reportLength: analysis.report.length
    });
    
    // Save collection types
    const collectionsPath = join(outputDir, 'collections.json');
    writeFileSync(collectionsPath, JSON.stringify(analysis.collections, null, 2));
    console.log(`📋 Collections data saved to: ${collectionsPath}`);
    
    // Print summary
    console.log('\n📊 Schema Summary:');
    console.log(`   Total Types: ${result.data.__schema.types.length}`);
    console.log(`   Collections: ${analysis.collectionCount}`);
    console.log(`   Product Collections: ${analysis.productCollections.length}`);
    
    console.log('\n🎯 Product Collections Found:');
    analysis.productCollections.forEach(name => {
      console.log(`   - ${name}`);
    });
    
  } catch (error) {
    console.error('❌ Schema introspection failed:', error.message);
    process.exit(1);
  }
}

function analyzeSchema(schemaResult) {
  const types = schemaResult.data.__schema.types;
  const collections = {};
  const productCollections = [];

  // Find the Query type to get collection fields
  const queryType = types.find(type => type.name === 'Query');

  if (queryType && queryType.fields) {
    queryType.fields.forEach(field => {
      if (field.name && field.name.endsWith('Collection')) {
        const collectionName = field.name.replace('Collection', '');
        collections[collectionName] = field;

        // Check if it's a product-related collection
        const productKeywords = ['product', 'frame', 'mirror', 'light', 'color', 'size', 'mount', 'driver', 'accessory', 'configuration'];
        if (productKeywords.some(keyword => collectionName.toLowerCase().includes(keyword))) {
          productCollections.push(collectionName);
        }
      }
    });
  }
  
  // Generate markdown report
  let report = '# Supabase GraphQL Schema Analysis\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += `## Overview\n\n`;
  report += `- **Total Types**: ${types.length}\n`;
  report += `- **Collection Types**: ${Object.keys(collections).length}\n`;
  report += `- **Product Collections**: ${productCollections.length}\n\n`;
  
  report += `## Product Collections\n\n`;
  productCollections.forEach(name => {
    const field = collections[name];
    report += `### ${name}\n\n`;

    if (field.args && field.args.length > 0) {
      report += `**Query Arguments:**\n`;
      field.args.forEach(arg => {
        const typeStr = formatTypeRef(arg.type);
        report += `- \`${arg.name}\`: ${typeStr}`;
        if (arg.description) {
          report += ` - ${arg.description}`;
        }
        report += '\n';
      });
      report += '\n';
    }

    // Try to find the corresponding node type
    const nodeTypeName = name.replace(/_/g, '');
    const nodeType = types.find(t => t.name === nodeTypeName && t.kind === 'OBJECT');

    if (nodeType && nodeType.fields) {
      report += `**Node Fields:**\n`;
      nodeType.fields.forEach(nodeField => {
        const typeStr = formatTypeRef(nodeField.type);
        report += `- \`${nodeField.name}\`: ${typeStr}`;
        if (nodeField.description) {
          report += ` - ${nodeField.description}`;
        }
        report += '\n';
      });
      report += '\n';
    }
  });
  
  return {
    collections,
    collectionCount: Object.keys(collections).length,
    productCollections,
    report
  };
}

function formatTypeRef(typeRef) {
  if (typeRef.kind === 'NON_NULL') {
    return `${formatTypeRef(typeRef.ofType)}!`;
  }
  if (typeRef.kind === 'LIST') {
    return `[${formatTypeRef(typeRef.ofType)}]`;
  }
  return typeRef.name || 'Unknown';
}

// Run the introspection
runIntrospection();
