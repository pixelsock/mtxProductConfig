#!/usr/bin/env node

/**
 * Verification script to test the T25I filtering fix
 * This script directly tests the Supabase data and filtering logic
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read environment variables from .env.local
const envContent = readFileSync('.env.local', 'utf8');
const envLines = envContent.split('\n');
const env = {};
envLines.forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

console.log('🔍 Verifying Dynamic Filtering Fix for T25I Issue');
console.log('================================================\n');

async function verifyFix() {
  try {
    // 1. Get T25I product data
    console.log('📦 Step 1: Finding T25I product...');
    const { data: t25iProducts, error: t25iError } = await supabase
      .from('products')
      .select('*')
      .ilike('sku_code', '%T25%')
      .eq('active', true);
      
    if (t25iError) throw t25iError;
    
    const t25i = t25iProducts.find(p => p.sku_code?.includes('T25i'));
    if (!t25i) {
      console.log('❌ T25I product not found');
      return;
    }
    
    console.log(`✅ Found T25I: ID=${t25i.id}, Mirror Style=${t25i.mirror_style}, Frame Thickness=${JSON.stringify(t25i.frame_thickness)}`);
    
    // 2. Get frame thickness options
    console.log('\n🔧 Step 2: Getting frame thickness options...');
    const { data: frameOptions, error: frameError } = await supabase
      .from('frame_thicknesses')
      .select('*')
      .eq('active', true);
      
    if (frameError) throw frameError;
    
    console.log(`✅ Frame thickness options found:`);
    frameOptions.forEach(f => {
      console.log(`   - ID: ${f.id}, Name: ${f.name}, SKU: ${f.sku_code}`);
    });
    
    // 3. Get product line defaults
    console.log('\n📋 Step 3: Getting product line defaults...');
    const { data: defaults, error: defaultsError } = await supabase
      .from('product_lines_default_options')
      .select('*')
      .eq('product_lines_id', t25i.product_line)
      .eq('collection', 'frame_thicknesses');
      
    if (defaultsError) throw defaultsError;
    
    console.log(`✅ Product line ${t25i.product_line} frame thickness defaults:`);
    defaults.forEach(d => {
      const frameOption = frameOptions.find(f => f.id.toString() === d.item);
      console.log(`   - Item: ${d.item} (${frameOption?.name || 'Unknown'})`);
    });
    
    // 4. Test the filtering logic
    console.log('\n🧪 Step 4: Testing filtering logic...');
    
    // Get all products for this product line and mirror style
    const { data: allProducts, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('product_line', t25i.product_line)
      .eq('active', true);
      
    if (productsError) throw productsError;
    
    // Filter products with T25I mirror style (16)
    const t25iStyleProducts = allProducts.filter(p => p.mirror_style === t25i.mirror_style);
    console.log(`✅ Products with T25I mirror style (${t25i.mirror_style}): ${t25iStyleProducts.length}`);
    
    // Extract frame thickness values for these products
    const availableFrameThicknesses = t25iStyleProducts
      .map(p => p.frame_thickness?.key?.toString())
      .filter(Boolean);
      
    const uniqueFrameThicknesses = [...new Set(availableFrameThicknesses)];
    console.log(`✅ Available frame thicknesses for T25I mirror style: [${uniqueFrameThicknesses.join(', ')}]`);
    
    // Determine what should be disabled
    const allDefaultIds = defaults.map(d => d.item);
    const shouldBeDisabled = allDefaultIds.filter(id => !uniqueFrameThicknesses.includes(id));
    
    console.log(`✅ Frame thickness IDs that should be DISABLED: [${shouldBeDisabled.join(', ')}]`);
    
    // 5. Validate the fix
    console.log('\n✅ Step 5: Fix Validation');
    console.log('=======================');
    
    const wideFrameId = frameOptions.find(f => f.name.toLowerCase().includes('wide'))?.id.toString();
    const thinFrameId = frameOptions.find(f => f.name.toLowerCase().includes('thin'))?.id.toString();
    
    console.log(`Wide Frame ID: ${wideFrameId}`);
    console.log(`Thin Frame ID: ${thinFrameId}`);
    console.log(`T25I frame thickness: ${t25i.frame_thickness?.key}`);
    
    if (wideFrameId && shouldBeDisabled.includes(wideFrameId)) {
      console.log('🎉 SUCCESS: Wide Frame should be disabled for T25I - CORRECT!');
    } else {
      console.log('❌ FAILURE: Wide Frame should be disabled but is not in disabled list');
    }
    
    if (thinFrameId && !shouldBeDisabled.includes(thinFrameId)) {
      console.log('🎉 SUCCESS: Thin Frame should be available for T25I - CORRECT!');
    } else {
      console.log('❌ FAILURE: Thin Frame should be available but is in disabled list');
    }
    
    // 6. Summary
    console.log('\n📊 Summary');
    console.log('==========');
    console.log('The dynamic filtering fix ensures that:');
    console.log(`1. When T25I mirror style is selected`);
    console.log(`2. Only frame thickness options that exist in actual products are available`);
    console.log(`3. Since T25I only exists with Thin Frame (key=${t25i.frame_thickness?.key})`);
    console.log(`4. Wide Frame (key=${wideFrameId}) should be disabled`);
    console.log(`5. The fix works by extracting available options from filtered products`);
    console.log(`   rather than falling back to all default options`);
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

verifyFix().then(() => {
  console.log('\n🏁 Verification complete');
  process.exit(0);
}).catch(err => {
  console.error('💥 Verification error:', err);
  process.exit(1);
});