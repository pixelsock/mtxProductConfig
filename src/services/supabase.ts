import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../supabase';

// Lazy initialization - client is created when first accessed at runtime
let supabaseInstance: SupabaseClient<Database> | null = null;

function getSupabaseClient(): SupabaseClient<Database> {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const resolvedSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const resolvedSupabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!resolvedSupabaseUrl || !resolvedSupabaseKey) {
    throw new Error('Missing Supabase environment variables: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  supabaseInstance = createClient<Database>(resolvedSupabaseUrl, resolvedSupabaseKey);
  return supabaseInstance;
}

export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(target, prop) {
    return (getSupabaseClient() as any)[prop];
  }
});

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
    storage,
    type
  ),
  horizontal_image_file:directus_files!products_horizontal_image_foreign(
    id,
    filename_disk,
    storage,
    type
  ),
  spec_sheet_file:directus_files!products_spec_sheet_foreign(
    id,
    filename_disk,
    storage,
    type
  ),
  revit_file_file:directus_files!products_revit_file_foreign(
    id,
    filename_disk,
    storage,
    type
  ),
  additional_images:products_files_1(
    id,
    directus_files_id:directus_files!products_files_1_directus_files_id_foreign(
      id,
      filename_disk,
      storage,
      type
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
