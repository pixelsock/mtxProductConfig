// Generated TypeScript types for Supabase GraphQL schema
// Generated on: 2025-06-23T01:46:31.065Z
// DO NOT EDIT MANUALLY - This file is auto-generated

// Common GraphQL response types
export interface GraphQLEdge<T> {
  node: T;
  cursor: string;
}

export interface GraphQLConnection<T> {
  edges: GraphQLEdge<T>[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string;
    endCursor?: string;
  };
}

export interface GraphQLCollectionResponse<T> {
  edges: GraphQLEdge<T>[];
}

// Filter and ordering types
export interface GraphQLFilter {
  eq?: any;
  neq?: any;
  gt?: any;
  gte?: any;
  lt?: any;
  lte?: any;
  in?: any[];
  is?: 'NULL' | 'NOT_NULL';
}

export interface GraphQLOrderBy {
  [field: string]: 'ASC' | 'DESC';
}

export interface GraphQLQueryArgs {
  first?: number;
  last?: number;
  before?: string;
  after?: string;
  offset?: number;
  filter?: Record<string, GraphQLFilter>;
  orderBy?: GraphQLOrderBy[];
}

// accessories collection types
export interface Accessories {
  nodeId: string;
  id: number;
  name: string;
  description?: string;
  price?: string;
  active: boolean;
  sort?: number;
  sku_code?: string;
  webflow_id?: string;
}

export type AccessoriesCollection = GraphQLCollectionResponse<Accessories>;
export type AccessoriesConnection = GraphQLConnection<Accessories>;

// color_temperatures collection types
export interface ColorTemperatures {
  nodeId: string;
  id: number;
  name: string;
  active: boolean;
  sort?: number;
  sku_code?: string;
  webflow_id?: string;
}

export type ColorTemperaturesCollection = GraphQLCollectionResponse<ColorTemperatures>;
export type ColorTemperaturesConnection = GraphQLConnection<ColorTemperatures>;

// configuration_images collection types
export interface ConfigurationImages {
  nodeId: string;
  id: string;
  image_rules?: Record<string, any>;
  image?: string;
  name?: string;
  z_index?: number;
  directus_files?: directus_files;
}

export type ConfigurationImagesCollection = GraphQLCollectionResponse<ConfigurationImages>;
export type ConfigurationImagesConnection = GraphQLConnection<ConfigurationImages>;

// drivers collection types
export interface Drivers {
  nodeId: string;
  id: number;
  name: string;
  description?: string;
  specs?: Record<string, any>;
  active: boolean;
  sort?: number;
  sku_code?: string;
  webflow_id?: string;
}

export type DriversCollection = GraphQLCollectionResponse<Drivers>;
export type DriversConnection = GraphQLConnection<Drivers>;

// frame_colors collection types
export interface FrameColors {
  nodeId: string;
  id: number;
  name: string;
  hex_code?: string;
  active: boolean;
  sort?: number;
  sku_code?: string;
  webflow_id?: string;
}

export type FrameColorsCollection = GraphQLCollectionResponse<FrameColors>;
export type FrameColorsConnection = GraphQLConnection<FrameColors>;

// frame_thicknesses collection types
export interface FrameThicknesses {
  nodeId: string;
  id: number;
  name: string;
  active: boolean;
  sort?: number;
  sku_code?: string;
  webflow_id?: string;
}

export type FrameThicknessesCollection = GraphQLCollectionResponse<FrameThicknesses>;
export type FrameThicknessesConnection = GraphQLConnection<FrameThicknesses>;

// light_directions collection types
export interface LightDirections {
  nodeId: string;
  id: number;
  name: string;
  description?: string;
  active: boolean;
  sort?: number;
  sku_code?: string;
  webflow_id?: string;
  productsCollection?: productsConnection;
}

export type LightDirectionsCollection = GraphQLCollectionResponse<LightDirections>;
export type LightDirectionsConnection = GraphQLConnection<LightDirections>;

// light_outputs collection types
export interface LightOutputs {
  nodeId: string;
  id: number;
  name: string;
  active: boolean;
  sort?: number;
  sku_code?: string;
  webflow_id?: string;
}

export type LightOutputsCollection = GraphQLCollectionResponse<LightOutputs>;
export type LightOutputsConnection = GraphQLConnection<LightOutputs>;

// mirror_controls collection types
export interface MirrorControls {
  nodeId: string;
  id: number;
  name: string;
  description?: string;
  active: boolean;
  sort?: number;
  sku_code?: string;
  webflow_id?: string;
}

export type MirrorControlsCollection = GraphQLCollectionResponse<MirrorControls>;
export type MirrorControlsConnection = GraphQLConnection<MirrorControls>;

// mirror_styles collection types
export interface MirrorStyles {
  nodeId: string;
  id: number;
  name: string;
  description?: string;
  sku_code?: string;
  active: boolean;
  sort?: number;
  svg_code?: Record<string, any>;
  webflow_id?: string;
  installation_guide?: string;
  directus_files?: directus_files;
  productsCollection?: productsConnection;
}

export type MirrorStylesCollection = GraphQLCollectionResponse<MirrorStyles>;
export type MirrorStylesConnection = GraphQLConnection<MirrorStyles>;

// mounting_options collection types
export interface MountingOptions {
  nodeId: string;
  id: number;
  name: string;
  description?: string;
  active: boolean;
  sort?: number;
  sku_code?: string;
  webflow_id?: string;
}

export type MountingOptionsCollection = GraphQLCollectionResponse<MountingOptions>;
export type MountingOptionsConnection = GraphQLConnection<MountingOptions>;

// product_lines collection types
export interface ProductLines {
  nodeId: string;
  id: number;
  sort?: number;
  date_updated?: Datetime;
  image?: string;
  description?: string;
  name?: string;
  sku_code?: string;
  directus_files?: directus_files;
  product_lines_default_optionsCollection?: product_lines_default_optionsConnection;
  productsCollection?: productsConnection;
}

export type ProductLinesCollection = GraphQLCollectionResponse<ProductLines>;
export type ProductLinesConnection = GraphQLConnection<ProductLines>;

// product_lines_default_options collection types
export interface ProductLinesDefaultOptions {
  nodeId: string;
  id: number;
  product_lines_id?: number;
  item?: string;
  collection?: string;
  product_lines?: product_lines;
}

export type ProductLinesDefaultOptionsCollection = GraphQLCollectionResponse<ProductLinesDefaultOptions>;
export type ProductLinesDefaultOptionsConnection = GraphQLConnection<ProductLinesDefaultOptions>;

// products collection types
export interface Products {
  nodeId: string;
  id: number;
  name: string;
  description?: string;
  active: boolean;
  sort?: number;
  applicationImage?: string;
  light_direction?: number;
  revit_file?: string;
  spec_sheet?: string;
  mirror_style?: number;
  webflow_id?: string;
  virtical_image?: string;
  horizontal_image?: string;
  product_line?: number;
  directus_files?: directus_files;
  directus_files?: directus_files;
  light_directions?: light_directions;
  mirror_styles?: mirror_styles;
  product_lines?: product_lines;
  directus_files?: directus_files;
  directus_files?: directus_files;
  directus_files?: directus_files;
  products_options_overridesCollection?: products_options_overridesConnection;
}

export type ProductsCollection = GraphQLCollectionResponse<Products>;
export type ProductsConnection = GraphQLConnection<Products>;

// products_options_overrides collection types
export interface ProductsOptionsOverrides {
  nodeId: string;
  id: number;
  products_id?: number;
  item?: string;
  collection?: string;
  products?: products;
}

export type ProductsOptionsOverridesCollection = GraphQLCollectionResponse<ProductsOptionsOverrides>;
export type ProductsOptionsOverridesConnection = GraphQLConnection<ProductsOptionsOverrides>;

// sizes collection types
export interface Sizes {
  nodeId: string;
  id: number;
  name: string;
  active: boolean;
  sort?: number;
  sku_code?: string;
  width?: string;
  height?: string;
  webflow_id?: string;
}

export type SizesCollection = GraphQLCollectionResponse<Sizes>;
export type SizesConnection = GraphQLConnection<Sizes>;

