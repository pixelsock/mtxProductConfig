// Directus SDK Client Configuration
import { createDirectus, rest, graphql, authentication, staticToken } from '@directus/sdk';

// Define the schema for type safety
interface DirectusSchema {
  product_lines: ProductLine[];
  frame_colors: FrameColor[];
  mirror_controls: MirrorControl[];
  mirror_styles: MirrorStyle[];
  mounting_options: MountingOption[];
  light_directions: LightDirection[];
  color_temperatures: ColorTemperature[];
  light_outputs: LightOutput[];
  drivers: Driver[];
  frame_thicknesses: FrameThickness[];
  sizes: Size[];
  accessories: Accessory[];
  configuration_images: ConfigurationImage[];
  products: DecoProduct[];
  rules: Rule[];
}

// Type definitions (matching existing interfaces)
export interface ProductLineImage {
  id: string;
  filename_disk: string;
  title: string;
}

export interface DefaultOption {
  id: number;
  product_lines_id: number;
  item: string;
  collection: string;
}

export interface ProductLine {
  id: number;
  name: string;
  sku_code: string;
  description: string | null;
  image: ProductLineImage | null;
  default_options?: DefaultOption[] | number[];
}

export interface FrameColor {
  id: number;
  name: string;
  hex_code: string;
  active: boolean;
  sort: number;
  sku_code: string;
  webflow_id: string;
}

export interface Accessory {
  id: number;
  name: string;
  sku_code: string;
  description?: string;
  active: boolean;
  sort: number | null;
}

export interface MirrorControl {
  id: number;
  name: string;
  sku_code: string;
  description: string;
  active: boolean;
  sort: number;
}

export interface MirrorStyle {
  id: number;
  name: string;
  sku_code: string;
  description: string;
  active: boolean;
  sort: number;
}

export interface MountingOption {
  id: number;
  name: string;
  sku_code: string;
  description: string;
  active: boolean;
  sort: number;
}

export interface LightDirection {
  id: number;
  name: string;
  sku_code: string;
  description: string;
  active: boolean;
  sort: number;
}

export interface ColorTemperature {
  id: number;
  name: string;
  sku_code: string;
  active: boolean;
  sort: number;
}

export interface LightOutput {
  id: number;
  name: string;
  sku_code: string;
  active: boolean;
  sort: number;
}

export interface Driver {
  id: number;
  name: string;
  sku_code: string;
  description: string;
  active: boolean;
  sort: number;
}

export interface FrameThickness {
  id: number;
  name: string;
  sku_code: string;
  active: boolean;
  sort: number;
}

export interface Size {
  id: number;
  name: string;
  sku_code: string;
  width: string;
  height: string;
  active: boolean;
  sort: number;
  webflow_id?: string;
}

export interface DecoProduct {
  id: string | number;
  name: string;
  sku_code?: string;
  description?: string;
  applicationImage?: string;
  vertical_image?: string;
  horizontal_image?: string;
  // New: additional images (Directus files relation)
  // Shape as returned by Directus 'files' interface on a M2M field
  additional_images?: Array<{
    directus_files_id?: {
      id: string;
      title?: string | null;
      filename_disk?: string | null;
      type?: string | null;
    } | string;
  }>;
  active?: boolean;
  product_line?: number;
  mirror_style?: number;
  light_direction?: number;
  frame_thickness?: number;
}

export interface ConfigImageRule {
  [key: string]: any;
  _and?: ConfigImageRule[];
  _or?: ConfigImageRule[];
  _eq?: any;
  _in?: any[];
  _contains?: string;
}

export interface ConfigurationImage {
  id: string;
  name: string;
  image: string;
  z_index: number | string;
  image_rules: ConfigImageRule;
  active?: boolean;
  sort?: number;
}

export interface Rule {
  id: string;
  name: string;
  priority: number | null;
  if_this: any; // Directus filter object
  // Preferred field name in schema
  then_that?: any; // Actions/overrides object
  // Legacy fallback supported by validators for backward compatibility
  than_that?: any;
}

// Get the Directus URL and API key from environment
const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'https://pim.dude.digital';
const API_KEY = import.meta.env.VITE_DIRECTUS_API_KEY;

// Create the Directus client with proper configuration
// Try API key first, then fall back to authentication
export const directusClient = API_KEY 
  ? createDirectus<DirectusSchema>(DIRECTUS_URL)
      .with(rest())
      .with(graphql())
      .with(staticToken(API_KEY))
  : createDirectus<DirectusSchema>(DIRECTUS_URL)
      .with(rest())
      .with(graphql())
      .with(authentication('json', {
        autoRefresh: true,
        msRefreshBeforeExpires: 30000
      }));

// Helper function to handle authentication
export async function authenticateIfNeeded() {
  try {
    // If using static token, authentication is already handled
    if (API_KEY) {
      console.log('✓ Using API key authentication');
      return true;
    }

    // Check if we already have a valid token
    const token = await directusClient.getToken();
    if (token) {
      console.log('✓ Using existing authentication token');
      return true;
    }

    // Try to authenticate with credentials if available
    const email = import.meta.env.VITE_DIRECTUS_EMAIL;
    const password = import.meta.env.VITE_DIRECTUS_PASSWORD;

    if (email && password) {
      console.log('🔐 Attempting authentication with provided credentials...');
      
      // For non-static token clients, use authentication
      if (!API_KEY) {
        await (directusClient as any).login(email, password);
        console.log('✓ Successfully authenticated with Directus');
        return true;
      }
    }

    // If no credentials, assume public access
    console.log('ℹ️ No credentials provided, using public access');
    return false;
  } catch (error: any) {
    console.error('❌ Authentication failed:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      errors: error.errors
    });
    console.warn('⚠️ Proceeding with public access - some collections may be restricted');
    return false;
  }
}

// GraphQL queries for bulk data fetching
export const BULK_COLLECTIONS_QUERY = `
  query BulkCollections {
    product_lines(sort: ["sort"]) {
      id
      name
      sku_code
      description
      image {
        id
        filename_disk
        title
      }
    }
    frame_colors(filter: { active: { _eq: true } }, sort: ["sort"]) {
      id
      name
      hex_code
      active
      sort
      sku_code
      webflow_id
    }
    mirror_controls(filter: { active: { _eq: true } }, sort: ["sort"]) {
      id
      name
      sku_code
      description
      active
      sort
    }
    mirror_styles(filter: { active: { _eq: true } }, sort: ["sort"]) {
      id
      name
      sku_code
      description
      active
      sort
    }
    mounting_options(filter: { active: { _eq: true } }, sort: ["sort"]) {
      id
      name
      sku_code
      description
      active
      sort
    }
    light_directions(filter: { active: { _eq: true } }, sort: ["sort"]) {
      id
      name
      sku_code
      description
      active
      sort
    }
    color_temperatures(filter: { active: { _eq: true } }, sort: ["sort"]) {
      id
      name
      sku_code
      active
      sort
    }
    light_outputs(filter: { active: { _eq: true } }, sort: ["sort"]) {
      id
      name
      sku_code
      active
      sort
    }
    drivers(filter: { active: { _eq: true } }, sort: ["sort"]) {
      id
      name
      sku_code
      description
      active
      sort
    }
    frame_thicknesses(filter: { active: { _eq: true } }, sort: ["sort"]) {
      id
      name
      sku_code
      active
      sort
    }
    sizes(filter: { active: { _eq: true } }, sort: ["sort"]) {
      id
      name
      sku_code
      width
      height
      active
      sort
      webflow_id
    }
    accessories(filter: { active: { _eq: true } }, sort: ["sort"]) {
      id
      name
      sku_code
      description
      active
      sort
    }
  }
`;

export const CONFIGURATION_IMAGES_QUERY = `
  query ConfigurationImages($filter: configuration_images_filter) {
    configuration_images(filter: $filter, sort: ["z_index", "name"], limit: -1) {
      id
      name
      image
      z_index
      image_rules
      active
      sort
    }
  }
`;

export const DECO_PRODUCTS_QUERY = `
  query DecoProducts {
    products(filter: { product_line: { sku_code: { _eq: "D" } } }) {
      id
      name
      description
    }
  }
`;

// Export types for use in other files
export type { DirectusSchema };
