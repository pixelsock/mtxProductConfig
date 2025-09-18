import React, { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from './utils/supabase/info';

export function SchemaFixGenerator() {
  const [schemas, setSchemas] = useState({});
  const [loading, setLoading] = useState(true);
  const [fixes, setFixes] = useState('');

  const relatedTables = [
    'sku_index', 'product_lines', 'products', 'sizes', 'frame_colors', 
    'light_outputs', 'color_temperatures', 'accessories', 'drivers',
    'mounting_options', 'hanging_techniques', 'mirror_styles'
  ];

  useEffect(() => {
    const fetchSchemasAndGenerateFixes = async () => {
      try {
        setLoading(true);
        const allSchemas = {};
        
        for (const tableName of relatedTables) {
          try {
            const response = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-8bb96920/schema/${tableName}`,
              {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${publicAnonKey}`,
                  'Content-Type': 'application/json'
                }
              }
            );

            if (response.ok) {
              const data = await response.json();
              if (data.schema) {
                allSchemas[tableName] = data.schema.map(col => col.column_name);
              }
            }
          } catch (error) {
            console.error(`Failed to fetch ${tableName}:`, error);
          }
        }
        
        setSchemas(allSchemas);
        generateFixes(allSchemas);
      } catch (err) {
        console.error('Failed to fetch schemas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchemasAndGenerateFixes();
  }, []);

  const generateFixes = (allSchemas) => {
    let fixCode = '// CORRECTED SERVER QUERIES BASED ON ACTUAL SCHEMA\n\n';

    // Generate safe SELECT clauses for each table
    const generateSafeSelect = (tableName, foreignKeyName) => {
      const columns = allSchemas[tableName];
      if (!columns) return `${tableName}!${foreignKeyName} (id)`;
      
      const safeColumns = ['id']; // Always include id
      
      // Add commonly expected columns if they exist
      const commonColumns = ['name', 'description', 'width', 'height', 'hex_code', 'lumens', 'watts', 'kelvin'];
      commonColumns.forEach(col => {
        if (columns.includes(col)) {
          safeColumns.push(col);
        }
      });

      return `${tableName}!${foreignKeyName} (\n          ${safeColumns.join(',\n          ')}\n        )`;
    };

    fixCode += `// For /configurations/options endpoint:\n`;
    fixCode += `let query = supabase\n`;
    fixCode += `  .from('sku_index')\n`;
    fixCode += `  .select(\`\n`;
    fixCode += `    id,\n`;
    fixCode += `    sku_code,\n`;
    fixCode += `    base_price,\n`;
    fixCode += `    product_line_id,\n`;
    fixCode += `    product_id,\n`;
    fixCode += `    size_id,\n`;
    fixCode += `    frame_color_id,\n`;
    fixCode += `    light_output_id,\n`;
    fixCode += `    color_temperature_id,\n`;
    fixCode += `    accessory_id,\n`;
    fixCode += `    driver_id,\n`;
    fixCode += `    mounting_option_id,\n`;
    fixCode += `    hanging_technique_id,\n`;
    fixCode += `    mirror_style_id,\n`;

    // Generate safe selects for each related table
    Object.keys(allSchemas).forEach(tableName => {
      if (tableName === 'sku_index') return;
      
      let foreignKeyName;
      switch(tableName) {
        case 'product_lines': foreignKeyName = 'product_line_id'; break;
        case 'products': foreignKeyName = 'product_id'; break;
        case 'sizes': foreignKeyName = 'size_id'; break;
        case 'frame_colors': foreignKeyName = 'frame_color_id'; break;
        case 'light_outputs': foreignKeyName = 'light_output_id'; break;
        case 'color_temperatures': foreignKeyName = 'color_temperature_id'; break;
        case 'accessories': foreignKeyName = 'accessory_id'; break;
        case 'drivers': foreignKeyName = 'driver_id'; break;
        case 'mounting_options': foreignKeyName = 'mounting_option_id'; break;
        case 'hanging_techniques': foreignKeyName = 'hanging_technique_id'; break;
        case 'mirror_styles': foreignKeyName = 'mirror_style_id'; break;
        default: foreignKeyName = `${tableName.slice(0, -1)}_id`;
      }
      
      fixCode += `    ${generateSafeSelect(tableName, foreignKeyName)},\n`;
    });

    fixCode += `  \`)\n`;
    fixCode += `  .limit(10000);\n\n`;

    // Generate schema summary
    fixCode += `// SCHEMA SUMMARY:\n`;
    Object.entries(allSchemas).forEach(([tableName, columns]) => {
      fixCode += `// ${tableName}: ${columns.join(', ')}\n`;
    });

    setFixes(fixCode);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-xl font-medium mb-4">Generating Schema Fixes...</h2>
        <div className="animate-pulse bg-gray-100 h-20 rounded"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-xl font-medium mb-4">Schema-Based Query Fixes</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Validated Tables</h3>
        <div className="grid md:grid-cols-4 gap-2">
          {Object.keys(schemas).map(table => (
            <div key={table} className="bg-green-100 border border-green-200 rounded p-2">
              <div className="font-mono text-sm text-green-800">{table}</div>
              <div className="text-xs text-green-600">{schemas[table].length} cols</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
          <h3 className="text-lg font-medium">Generated Fix Code</h3>
          <button 
            onClick={() => navigator.clipboard.writeText(fixes)}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            Copy Code
          </button>
        </div>
        <div className="p-4">
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto whitespace-pre-wrap">
            {fixes}
          </pre>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <h3 className="font-medium">Column Analysis:</h3>
        {Object.entries(schemas).map(([table, columns]) => (
          <details key={table} className="bg-gray-50 border rounded p-2">
            <summary className="cursor-pointer font-mono text-sm">{table} ({columns.length} columns)</summary>
            <div className="mt-2 ml-4 flex flex-wrap gap-1">
              {columns.map(col => (
                <span key={col} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {col}
                </span>
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}