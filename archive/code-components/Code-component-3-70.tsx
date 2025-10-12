import { projectId, publicAnonKey } from './info';

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
}

export const supabaseClient = new SupabaseClient();
export type { QuoteItem, CustomerInfo };