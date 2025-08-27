// GraphQL Schema Introspection Tool for Supabase
// Fetches and analyzes the complete GraphQL schema from Supabase

interface GraphQLType {
  kind: string;
  name: string;
  description?: string;
  fields?: GraphQLField[];
  inputFields?: GraphQLInputField[];
  interfaces?: GraphQLType[];
  enumValues?: GraphQLEnumValue[];
  possibleTypes?: GraphQLType[];
}

interface GraphQLField {
  name: string;
  description?: string;
  type: GraphQLTypeRef;
  args: GraphQLInputField[];
  isDeprecated: boolean;
  deprecationReason?: string;
}

interface GraphQLInputField {
  name: string;
  description?: string;
  type: GraphQLTypeRef;
  defaultValue?: any;
}

interface GraphQLEnumValue {
  name: string;
  description?: string;
  isDeprecated: boolean;
  deprecationReason?: string;
}

interface GraphQLTypeRef {
  kind: string;
  name?: string;
  ofType?: GraphQLTypeRef;
}

interface IntrospectionResult {
  data: {
    __schema: {
      types: GraphQLType[];
      queryType: GraphQLType;
      mutationType?: GraphQLType;
      subscriptionType?: GraphQLType;
      directives: any[];
    };
  };
}

export class SupabaseSchemaIntrospector {
  private endpoint: string;
  private headers: Record<string, string>;

  constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and anonymous key are required for schema introspection');
    }

    this.endpoint = `${supabaseUrl}/graphql/v1`;
    this.headers = {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
    };
  }

  /**
   * Performs GraphQL introspection query to fetch complete schema
   */
  async introspectSchema(): Promise<IntrospectionResult> {
    const introspectionQuery = `
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

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ query: introspectionQuery }),
    });

    if (!response.ok) {
      throw new Error(`Schema introspection failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      throw new Error(`GraphQL introspection errors: ${JSON.stringify(result.errors)}`);
    }

    return result;
  }

  /**
   * Extracts collection types from the introspected schema
   */
  extractCollectionTypes(schema: IntrospectionResult): Map<string, GraphQLType> {
    const collections = new Map<string, GraphQLType>();
    
    schema.data.__schema.types.forEach(type => {
      // Look for collection types (ending with 'Collection')
      if (type.name && type.name.endsWith('Collection') && type.kind === 'OBJECT') {
        const collectionName = type.name.replace('Collection', '');
        collections.set(collectionName, type);
      }
    });

    return collections;
  }

  /**
   * Extracts node types (the actual data structures)
   */
  extractNodeTypes(schema: IntrospectionResult): Map<string, GraphQLType> {
    const nodes = new Map<string, GraphQLType>();
    
    schema.data.__schema.types.forEach(type => {
      // Look for node types that correspond to our collections
      if (type.name && type.kind === 'OBJECT' && type.fields) {
        // Check if this looks like a data node (has id, name, etc.)
        const hasIdField = type.fields.some(field => field.name === 'id');
        const hasNameField = type.fields.some(field => field.name === 'name');
        
        if (hasIdField && (hasNameField || type.name.includes('_'))) {
          nodes.set(type.name, type);
        }
      }
    });

    return nodes;
  }

  /**
   * Generates a summary report of the schema
   */
  generateSchemaReport(schema: IntrospectionResult): string {
    const collections = this.extractCollectionTypes(schema);
    const nodes = this.extractNodeTypes(schema);
    
    let report = '# Supabase GraphQL Schema Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;
    
    report += `## Schema Overview\n`;
    report += `- Total Types: ${schema.data.__schema.types.length}\n`;
    report += `- Collection Types: ${collections.size}\n`;
    report += `- Node Types: ${nodes.size}\n\n`;
    
    report += `## Collections\n\n`;
    collections.forEach((type, name) => {
      report += `### ${name}\n`;
      if (type.description) {
        report += `${type.description}\n\n`;
      }
      
      if (type.fields) {
        report += `**Fields:**\n`;
        type.fields.forEach(field => {
          const typeStr = this.formatTypeRef(field.type);
          report += `- \`${field.name}\`: ${typeStr}`;
          if (field.description) {
            report += ` - ${field.description}`;
          }
          report += '\n';
        });
      }
      report += '\n';
    });

    return report;
  }

  /**
   * Formats a GraphQL type reference for display
   */
  private formatTypeRef(typeRef: GraphQLTypeRef): string {
    if (typeRef.kind === 'NON_NULL') {
      return `${this.formatTypeRef(typeRef.ofType!)}!`;
    }
    if (typeRef.kind === 'LIST') {
      return `[${this.formatTypeRef(typeRef.ofType!)}]`;
    }
    return typeRef.name || 'Unknown';
  }

  /**
   * Validates a GraphQL query against the schema
   */
  validateQuery(query: string, schema: IntrospectionResult): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation - check for collection existence
    const collections = this.extractCollectionTypes(schema);
    const collectionNames = Array.from(collections.keys());

    // Extract collection names from query (simple regex approach)
    const collectionMatches = query.match(/(\w+)Collection/g);

    if (collectionMatches) {
      collectionMatches.forEach(match => {
        const collectionName = match.replace('Collection', '');
        if (!collectionNames.includes(collectionName)) {
          errors.push(`Collection '${collectionName}' not found in schema`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Saves schema data to files for analysis
   */
  async saveSchemaData(schema: IntrospectionResult, outputDir: string = 'schema-output'): Promise<void> {
    // This would be implemented to save files in a Node.js environment
    // For browser environment, we'll return the data for manual saving
    console.log('Schema introspection complete. Use saveSchemaToFile() to save the results.');
  }
}

// Utility function to run introspection and generate report
export async function introspectSupabaseSchema(): Promise<{
  schema: IntrospectionResult;
  report: string;
  collections: Map<string, GraphQLType>;
  nodes: Map<string, GraphQLType>;
}> {
  const introspector = new SupabaseSchemaIntrospector();
  
  console.log('Starting Supabase GraphQL schema introspection...');
  const schema = await introspector.introspectSchema();
  
  console.log('Analyzing schema structure...');
  const collections = introspector.extractCollectionTypes(schema);
  const nodes = introspector.extractNodeTypes(schema);
  
  console.log('Generating schema report...');
  const report = introspector.generateSchemaReport(schema);
  
  console.log(`Introspection complete! Found ${collections.size} collections and ${nodes.size} node types.`);
  
  return { schema, report, collections, nodes };
}
