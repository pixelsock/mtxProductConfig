/**
 * Real data snapshots from Supabase for testing
 * Generated from actual database queries to ensure tests match reality
 */

// Real product lines from your Supabase
export const realProductLines = [
  {
    id: 1,
    name: "Backlit Mirrors",
    sku_code: "B",
    active: true,
    default_options: [
      { collection: "mirror_styles", item: 1 },
      { collection: "light_directions", item: 2 },
      { collection: "frame_colors", item: 1 }
    ]
  }
  // Add more real data here...
];

// Real configuration UI from your Supabase
export const realConfigurationUI = [
  {
    id: 1,
    collection: "mirror_styles",
    ui_type: "grid-2",
    sort: 1
  },
  {
    id: 2,
    collection: "light_directions",
    ui_type: "full-width",
    sort: 2
  }
  // Add more real UI config...
];

// Real rules from your Supabase
export const realRules = [
  {
    id: 1,
    name: "Driver forces light output",
    priority: 1,
    if_this: { "driver": { "_in": [4, 5] } },
    then_that: { "light_output": { "_eq": 2 } }
  }
  // Add more real rules...
];

// Real products with actual SKU patterns
export const realProducts = [
  {
    id: 1,
    sku_code: "B05b",
    product_line: 1,
    mirror_style: 5,
    light_direction: 2,
    active: true
  }
  // Add more real products...
];
