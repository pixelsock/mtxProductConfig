import React, { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from './utils/supabase/info';

export function SchemaValidator() {
  const [schemas, setSchemas] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTable, setCurrentTable] = useState(0);

  const relatedTables = [
    'sku_index', 'product_lines', 'products', 'sizes', 'frame_colors', 
    'light_outputs', 'color_temperatures', 'accessories', 'drivers',
    'mounting_options', 'hanging_techniques', 'mirror_styles'
  ];

  useEffect(() => {
    const fetchAllSchemas = async () => {
      try {
        setLoading(true);
        const allSchemas = {};
        
        for (let i = 0; i < relatedTables.length; i++) {
          const tableName = relatedTables[i];
          setCurrentTable(i + 1);
          console.log(`Fetching schema for ${tableName} (${i + 1}/${relatedTables.length})...`);
          
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

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            allSchemas[tableName] = data;
            console.log(`✅ ${tableName}: ${data.schema?.length || 0} columns`);
          } catch (tableError) {
            console.error(`❌ Failed to fetch ${tableName} schema:`, tableError);
            allSchemas[tableName] = { error: tableError.message, tableName };
          }
          
          // Small delay to avoid overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        setSchemas(allSchemas);
      } catch (err) {
        console.error('Failed to fetch schemas:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllSchemas();
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-xl font-medium mb-4">Validating Database Schema...</h2>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Checking {relatedTables.length} related tables... ({currentTable}/{relatedTables.length})
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-amber-500 h-2 rounded-full transition-all" 
              style={{ width: `${(currentTable / relatedTables.length) * 100}%` }}
            ></div>
          </div>
          <div className="animate-pulse space-y-2">
            {relatedTables.slice(0, currentTable).map((table, i) => (
              <div key={i} className="bg-gray-100 h-8 rounded flex items-center px-3">
                <span className="text-sm text-gray-600">✅ {table}</span>
              </div>
            ))}
            {currentTable < relatedTables.length && (
              <div className="bg-amber-100 h-8 rounded flex items-center px-3 animate-pulse">
                <span className="text-sm text-amber-600">⏳ {relatedTables[currentTable]}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-xl font-medium mb-4 text-red-600">Schema Validation Failed</h2>
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  const validTables = Object.keys(schemas).filter(table => schemas[table].schema);
  const errorTables = Object.keys(schemas).filter(table => schemas[table].error);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-xl font-medium mb-4">Database Schema Validation Results</h2>
      
      <div className="mb-6 grid md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded p-4">
          <h3 className="font-medium text-green-800">✅ Valid Tables</h3>
          <p className="text-2xl font-bold text-green-600">{validTables.length}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded p-4">
          <h3 className="font-medium text-red-800">❌ Error Tables</h3>
          <p className="text-2xl font-bold text-red-600">{errorTables.length}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded p-4">
          <h3 className="font-medium text-blue-800">📊 Total Tables</h3>
          <p className="text-2xl font-bold text-blue-600">{relatedTables.length}</p>
        </div>
      </div>

      {errorTables.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded p-4">
          <h3 className="font-medium text-red-800 mb-2">⚠️ Tables with Errors</h3>
          <ul className="text-sm text-red-700 space-y-1">
            {errorTables.map(table => (
              <li key={table}>• {table}: {schemas[table].error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-6">
        {validTables.map(tableName => {
          const tableSchema = schemas[tableName];
          return (
            <div key={tableName} className="bg-white border rounded-lg overflow-hidden">
              <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">{tableName}</h3>
                  <p className="text-sm text-gray-600">
                    {tableSchema.schema?.length || 0} columns • Source: {tableSchema.source}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {tableSchema.schema?.map(col => (
                    <span key={col.column_name} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {col.column_name}
                    </span>
                  ))}
                </div>
              </div>
              
              {tableSchema.schema && tableSchema.schema.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left">Column</th>
                        <th className="px-4 py-3 text-left">Type</th>
                        <th className="px-4 py-3 text-left">Nullable</th>
                        <th className="px-4 py-3 text-left">Default</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {tableSchema.schema.map((column, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-mono text-blue-600">{column.column_name}</td>
                          <td className="px-4 py-3 font-mono text-purple-600">{column.data_type}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              column.is_nullable === 'YES' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {column.is_nullable}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-gray-600 text-xs">
                            {column.column_default || <span className="text-gray-400">null</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {validTables.length > 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded p-4">
          <h3 className="font-medium text-blue-800 mb-2">🔧 Next Steps</h3>
          <p className="text-sm text-blue-700">
            Use this schema information to fix the server queries. Only select columns that exist in each table.
          </p>
        </div>
      )}
    </div>
  );
}