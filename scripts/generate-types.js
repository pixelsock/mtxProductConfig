#!/usr/bin/env node

// TypeScript type generation script for Supabase GraphQL schema
// Usage: node scripts/generate-types.js

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

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL');
  console.error('   VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const GRAPHQL_ENDPOINT = `${SUPABASE_URL}/graphql/v1`;

// Product-related collections we want to generate types for
const PRODUCT_COLLECTIONS = [
  'accessories',
  'color_temperatures', 
  'configuration_images',
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
];

async function fetchNodeTypeFields(typeName) {
  const query = `
    query GetTypeFields {
      __type(name: "${typeName}") {
        name
        fields {
          name
          type {
            name
            kind
            ofType {
              name
              kind
              ofType {
                name
                kind
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch type fields: ${response.status}`);
  }

  const result = await response.json();
  if (result.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
  }

  return result.data.__type;
}

function mapGraphQLTypeToTypeScript(graphqlType) {
  if (!graphqlType) return 'unknown';
  
  // Handle non-null types
  if (graphqlType.kind === 'NON_NULL') {
    return mapGraphQLTypeToTypeScript(graphqlType.ofType);
  }
  
  // Handle list types
  if (graphqlType.kind === 'LIST') {
    const innerType = mapGraphQLTypeToTypeScript(graphqlType.ofType);
    return `${innerType}[]`;
  }
  
  // Handle scalar types
  switch (graphqlType.name) {
    case 'String': return 'string';
    case 'Int': return 'number';
    case 'Float': return 'number';
    case 'Boolean': return 'boolean';
    case 'ID': return 'string';
    case 'BigInt': return 'string'; // BigInt as string in GraphQL
    case 'BigFloat': return 'string'; // BigFloat as string in GraphQL
    case 'DateTime': return 'string'; // ISO string
    case 'Date': return 'string'; // ISO date string
    case 'Time': return 'string'; // ISO time string
    case 'JSON': return 'Record<string, any>';
    case 'UUID': return 'string';
    default:
      // For custom types, use the name as-is
      return graphqlType.name || 'unknown';
  }
}

function generateInterfaceFromFields(typeName, fields) {
  let interfaceCode = `export interface ${toPascalCase(typeName)} {\n`;
  
  fields.forEach(field => {
    const tsType = mapGraphQLTypeToTypeScript(field.type);
    const isOptional = field.type.kind !== 'NON_NULL';
    const fieldName = field.name;
    
    interfaceCode += `  ${fieldName}${isOptional ? '?' : ''}: ${tsType};\n`;
  });
  
  interfaceCode += '}\n\n';
  return interfaceCode;
}

function toPascalCase(str) {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function generateCollectionTypes() {
  let types = `// Generated TypeScript types for Supabase GraphQL schema
// Generated on: ${new Date().toISOString()}
// DO NOT EDIT MANUALLY - This file is auto-generated

`;

  // Generate common GraphQL response types
  types += `// Common GraphQL response types
export interface GraphQLEdge<T> {
  node: T;
  cursor: string;
}

export interface GraphQLConnection<T> {
  edges: GraphQLEdge<T>[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string;
    endCursor?: string;
  };
}

export interface GraphQLCollectionResponse<T> {
  edges: GraphQLEdge<T>[];
}

// Filter and ordering types
export interface GraphQLFilter {
  eq?: any;
  neq?: any;
  gt?: any;
  gte?: any;
  lt?: any;
  lte?: any;
  in?: any[];
  is?: 'NULL' | 'NOT_NULL';
}

export interface GraphQLOrderBy {
  [field: string]: 'ASC' | 'DESC';
}

export interface GraphQLQueryArgs {
  first?: number;
  last?: number;
  before?: string;
  after?: string;
  offset?: number;
  filter?: Record<string, GraphQLFilter>;
  orderBy?: GraphQLOrderBy[];
}

`;

  return types;
}

async function generateTypes() {
  console.log('🔧 Starting TypeScript type generation...');
  
  try {
    let allTypes = generateCollectionTypes();
    
    // Generate types for each product collection
    for (const collection of PRODUCT_COLLECTIONS) {
      console.log(`📝 Generating types for ${collection}...`);
      
      try {
        const nodeType = await fetchNodeTypeFields(collection);
        
        if (nodeType && nodeType.fields) {
          allTypes += `// ${collection} collection types\n`;
          allTypes += generateInterfaceFromFields(collection, nodeType.fields);
          
          // Generate collection-specific response types
          const pascalName = toPascalCase(collection);
          allTypes += `export type ${pascalName}Collection = GraphQLCollectionResponse<${pascalName}>;\n`;
          allTypes += `export type ${pascalName}Connection = GraphQLConnection<${pascalName}>;\n\n`;
        } else {
          console.warn(`⚠️  No fields found for ${collection}`);
        }
      } catch (error) {
        console.warn(`⚠️  Failed to generate types for ${collection}:`, error.message);
      }
    }
    
    // Create output directory
    const outputDir = join(__dirname, '..', 'src', 'types');
    mkdirSync(outputDir, { recursive: true });
    
    // Save generated types
    const typesPath = join(outputDir, 'supabase-schema.ts');
    writeFileSync(typesPath, allTypes);
    
    console.log(`✅ TypeScript types generated successfully!`);
    console.log(`📄 Types saved to: ${typesPath}`);
    console.log(`📊 Generated types for ${PRODUCT_COLLECTIONS.length} collections`);
    
  } catch (error) {
    console.error('❌ Type generation failed:', error.message);
    process.exit(1);
  }
}

// Run the type generation
generateTypes();
