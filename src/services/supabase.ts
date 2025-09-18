import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../supabase';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Get the UI configuration
export async function getConfigurationUi() {
  const { data, error } = await supabase.from('configuration_ui').select('*');
  if (error) {
    console.error('Error fetching configuration UI:', error);
    throw error;
  }
  return data;
}

// Get all products
export async function getProducts() {
  const { data, error } = await supabase.from('products').select('*');
  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
  return data;
}

// Get all product lines
export async function getProductLines() {
  const { data, error } = await supabase.from('product_lines').select('*');
  if (error) {
    console.error('Error fetching product lines:', error);
    throw error;
  }
  return data;
}

// Get all product line default options
export async function getProductLineDefaultOptions() {
  const { data, error } = await supabase.from('product_lines_default_options').select('*');
  if (error) {
    console.error('Error fetching product line default options:', error);
    throw error;
  }
  return data;
}

// Get the SKU code order
export async function getSkuCodeOrder() {
  const { data, error } = await supabase.from('sku_code_order').select('*');
  if (error) {
    console.error('Error fetching SKU code order:', error);
    throw error;
  }
  return data;
}

// Get all rules
export async function getRules() {
  const { data, error } = await supabase.from('rules').select('*');
  if (error) {
    console.error('Error fetching rules:', error);
    throw error;
  }
  return data;
}

export type Rule = Database['public']['Tables']['rules']['Row'];
