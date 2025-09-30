import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../supabase';

// Initialize Supabase client
const resolvedSupabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL)
  || process.env.VITE_SUPABASE_URL;
const resolvedSupabaseKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY)
  || process.env.VITE_SUPABASE_ANON_KEY;

if (!resolvedSupabaseUrl || !resolvedSupabaseKey) {
  throw new Error('Missing Supabase environment variables: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient<Database>(resolvedSupabaseUrl, resolvedSupabaseKey);

// Get the UI configuration
export async function getConfigurationUi() {
  const { data, error } = await supabase.from('configuration_ui').select('*');
  if (error) {
    console.error('Error fetching configuration UI:', error);
    throw error;
  }
  return data;
}

const PRODUCT_FIELDS = `
  *,
  vertical_image_file:directus_files!products_vertical_image_foreign(
    id,
    filename_disk,
    storage
  ),
  horizontal_image_file:directus_files!products_horizontal_image_foreign(
    id,
    filename_disk,
    storage
  ),
  additional_images:products_files_1(
    id,
    directus_files_id(
      id,
      filename_disk,
      storage
    )
  )
`;

// Get all active products with asset metadata
export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_FIELDS)
    .eq('active', true);

  if (error) {
    console.error('Error fetching products from Supabase:', error);
    throw error;
  }

  return data;
}

export async function getProductById(id: number) {
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_FIELDS)
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching product ${id} from Supabase:`, error);
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

// Get configuration UI settings
export async function getConfigurationUI() {
  const { data, error } = await supabase
    .from('configuration_ui')
    .select('*')
    .order('sort', { ascending: true });
    
  if (error) {
    console.error('Error fetching configuration UI:', error);
    throw error;
  }
  return data;
}

export type Rule = Database['public']['Tables']['rules']['Row'];
export type ConfigurationUI = Database['public']['Tables']['configuration_ui']['Row'];
