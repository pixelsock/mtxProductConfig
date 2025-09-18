import { projectId, publicAnonKey } from './info';
import { simplifiedDirectSupabaseClient } from './directClientSimplified';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-8bb96920`;

interface QuoteItem {
  id: number;
  product: string;
  configuration: any;
  price: number;
}

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  projectName?: string;
  notes?: string;
}

interface ApiResponse<T> {
  success?: boolean;
  error?: string;
  [key: string]: any;
}

class SupabaseClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Quote management
  async createQuote(quoteItems: QuoteItem[], customerInfo: CustomerInfo) {
    console.log('Creating quote with items:', quoteItems, 'and customer info:', customerInfo);
    
    return this.request<ApiResponse<{ quoteId: string; quote: any }>>('/quotes', {
      method: 'POST',
      body: JSON.stringify({ quoteItems, customerInfo }),
    });
  }

  async getQuote(quoteId: string) {
    return this.request<ApiResponse<{ quote: any }>>(`/quotes/${quoteId}`);
  }

  async getAllQuotes() {
    return this.request<ApiResponse<{ quotes: any[] }>>('/quotes');
  }

  // Configuration management
  async saveConfiguration(productType: string, configuration: any) {
    console.log('Saving configuration for product:', productType, 'with config:', configuration);
    
    return this.request<ApiResponse<{ configId: string; configuration: any }>>('/configurations', {
      method: 'POST',
      body: JSON.stringify({ productType, configuration }),
    });
  }

  async getConfiguration(configId: string) {
    return this.request<ApiResponse<{ configuration: any }>>(`/configurations/${configId}`);
  }

  // Analytics
  async getAnalytics() {
    return this.request<ApiResponse<{ analytics: any }>>('/analytics');
  }

  // Health check
  async healthCheck() {
    return this.request<ApiResponse<{ status: string }>>('/health');
  }

  // Database introspection
  async getDatabaseTables() {
    return this.request<ApiResponse<{ tables: any[] }>>('/database/tables');
  }

  async getTableSchema(tableName: string) {
    return this.request<ApiResponse<{ table: string; columns: any[] }>>(`/database/schema/${tableName}`);
  }

  // SKU and product data
  async getSKUs() {
    return this.request<ApiResponse<{ data: any[]; tableName: string; count: number }>>('/skus');
  }

  async getAllSkus(limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    return this.request<ApiResponse<{ data: any[]; count: number }>>(`/skus/all${params}`);
  }

  async searchSkus(query: string, limit?: number) {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (limit) params.append('limit', limit.toString());
    
    return this.request<ApiResponse<{ data: any[]; count: number }>>(`/skus/search?${params}`);
  }

  async getProductConfigurations(productType: string) {
    return this.request<ApiResponse<{ productType: string; configurations: any; stats: any }>>(`/products/${productType}/configurations`);
  }

  async getConfigurationOptions() {
    console.log('Client: Requesting configuration options from simplified client...');
    // Use dynamic configuration options with no product line (gets all options)
    return await simplifiedDirectSupabaseClient.getDynamicConfigurationOptions(null);
  }

  // SKU matching endpoint - find SKUs that match configuration using POST method
  async findMatchingSKUs(configuration: any) {
    console.log('Client: Finding matching SKUs for configuration (simplified approach):', configuration);
    // Simplified approach - return empty for now
    // TODO: Implement based on products collection
    return { skus: [], count: 0 };
  }

  // Product line management
  async getProductLines() {
    try {
      console.log('Client: Requesting product lines from direct client...');
      return await simplifiedDirectSupabaseClient.getProductLines();
    } catch (error) {
      console.error('Client: Failed to get product lines:', error);
      throw error;
    }
  }
  async getConfigurationOptionsForProductLine(productLine?: string) {
    console.log('Client: Requesting configuration options for product line from simplified client...', productLine);
    return await simplifiedDirectSupabaseClient.getDynamicConfigurationOptions(productLine);
  }

  // Debug endpoint for relational sample data
  async debugRelationalSample() {
    return this.request<ApiResponse<any>>('/debug/relational-sample');
  }

  // Debug endpoint to check table schema
  async debugTableSchema(tableName: string) {
    return this.request<ApiResponse<any>>(`/debug/table-schema/${tableName}`);
  }

}

export const supabaseClient = new SupabaseClient();
export type { QuoteItem, CustomerInfo };
