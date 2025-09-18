import React, { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from './utils/supabase/info';

export function SchemaValidator() {
  const [schema, setSchema] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchema = async () => {
      try {
        setLoading(true);
        console.log('Fetching sku_index schema...');
        
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-8bb96920/schema/sku_index`,
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
        console.log('Schema validation response:', data);
        setSchema(data);
      } catch (err) {
        console.error('Failed to fetch schema:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSchema();
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-xl font-medium mb-4">Validating sku_index Schema...</h2>
        <div className="animate-pulse bg-gray-100 h-20 rounded"></div>
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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-xl font-medium mb-4">sku_index Table Schema Validation</h2>
      
      {schema && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded p-4">
            <p className="text-green-700">✅ {schema.message}</p>
            <p className="text-sm text-green-600 mt-1">Source: {schema.source}</p>
          </div>

          {schema.schema && schema.schema.length > 0 && (
            <div className="bg-white border rounded-lg overflow-hidden">
              <h3 className="text-lg font-medium p-4 border-b bg-gray-50">Column Details</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left">Position</th>
                      <th className="px-4 py-3 text-left">Column Name</th>
                      <th className="px-4 py-3 text-left">Data Type</th>
                      <th className="px-4 py-3 text-left">Nullable</th>
                      <th className="px-4 py-3 text-left">Default</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {schema.schema.map((column, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{column.ordinal_position}</td>
                        <td className="px-4 py-3 font-mono text-blue-600">{column.column_name}</td>
                        <td className="px-4 py-3 font-mono text-purple-600">{column.data_type}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            column.is_nullable === 'YES' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {column.is_nullable}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-gray-600">
                          {column.column_default || <span className="text-gray-400">null</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {schema.sampleData && (
            <div className="bg-white border rounded-lg overflow-hidden">
              <h3 className="text-lg font-medium p-4 border-b bg-gray-50">Sample Data</h3>
              <div className="p-4">
                <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
                  {JSON.stringify(schema.sampleData, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {schema.note && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <p className="text-yellow-700">⚠️ {schema.note}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}