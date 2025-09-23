/**
 * Generate test fixtures from live Supabase data
 * Run this occasionally to keep test data in sync with reality
 */

import {
  initializeDynamicService,
  getDynamicProductLines,
  getDynamicProducts,
  getDynamicRules,
} from "../src/services/dynamic-supabase";
import fs from "fs/promises";
import path from "path";

async function generateFixtures() {
  console.log("🔄 Fetching real data from Supabase...");

  try {
    await initializeDynamicService();

    // Fetch real data
    const productLines = await getDynamicProductLines();
    const products = await getDynamicProducts();
    const rules = await getDynamicRules();

    // Create fixtures object
    const fixtures = {
      productLines: productLines.slice(0, 3), // Limit for test performance
      products: products.slice(0, 10),
      rules: rules.slice(0, 5),
      generatedAt: new Date().toISOString(),
      note: "Generated from live Supabase data - contains real structure and relationships",
    };

    // Write to fixture file
    const fixtureContent = `/**
 * Auto-generated test fixtures from live Supabase data
 * Generated: ${fixtures.generatedAt}
 *
 * These fixtures represent real data structure and relationships.
 * Re-run 'npm run generate-fixtures' to update.
 */

export const testFixtures = ${JSON.stringify(fixtures, null, 2)};

export const { productLines, products, rules } = testFixtures;
`;

    const fixturePath = path.join(
      __dirname,
      "../src/test/fixtures/generated-fixtures.ts",
    );
    await fs.writeFile(fixturePath, fixtureContent);

    console.log("✅ Test fixtures generated successfully!");
    console.log(`📊 Data summary:
    - Product Lines: ${fixtures.productLines.length}
    - Products: ${fixtures.products.length}
    - Rules: ${fixtures.rules.length}`);
  } catch (error) {
    console.error("❌ Failed to generate fixtures:", error);
    process.exit(1);
  }
}

generateFixtures();
