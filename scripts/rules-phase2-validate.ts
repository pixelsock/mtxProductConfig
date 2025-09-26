#!/usr/bin/env tsx

/**
 * Phase 2 Rules Validation (Supabase)
 *
 * Replaces the legacy Directus cURL script with a Supabase-native workflow:
 * 1. Loads environment variables from .env.local / .env when available
 * 2. Connects to Supabase using the service role key
 * 3. Creates a temporary validation rule
 * 4. Executes rule constraint evaluation using the shared rules engine
 * 5. Cleans up the temporary rule
 */

import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { existsSync, readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadEnvFiles() {
  const candidates = ['.env.local', '.env'];
  for (const candidate of candidates) {
    const fullPath = join(__dirname, '..', candidate);
    if (!existsSync(fullPath)) continue;
    const contents = readFileSync(fullPath, 'utf8');
    for (const line of contents.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [key, ...rest] = trimmed.split('=');
      if (!key || rest.length === 0) continue;
      if (process.env[key] === undefined) {
        process.env[key] = rest.join('=').trim();
      }
    }
  }
}

loadEnvFiles();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  console.error('❌ Missing VITE_SUPABASE_URL – ensure your environment variables are configured.');
  process.exit(1);
}

if (!SERVICE_ROLE_KEY) {
  console.error('❌ Missing service role key. Set SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_SERVICE_ROLE_KEY for script access.');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
  global: { headers: { 'X-Client-Info': 'rules-phase2-validate' } }
});

const supabaseAnon = ANON_KEY
  ? createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } })
  : null;

function serialize(value: unknown) {
  return JSON.stringify(value, (key, v) => (v instanceof Set ? Array.from(v) : v), 2);
}

async function main() {
  console.log('== Phase 2 Rules Validation (Supabase) ==');
  console.log(`Supabase project: ${SUPABASE_URL}`);

  let createdRuleId: string | null = null;

  try {
    const { count, error: countError } = await supabaseAdmin
      .from('rules')
      .select('id', { head: true, count: 'exact' });

    if (countError) {
      throw new Error(`Failed to count rules: ${countError.message}`);
    }

    console.log(`== Current rules ==`);
    console.log(`Rules count: ${count ?? 0}`);

    const timestamp = Date.now();
    const ruleId = randomUUID();
    const ruleName = `TEST: L52 only indirect (${timestamp})`;

    const createPayload = {
      id: ruleId,
      name: ruleName,
      priority: 9999,
      if_this: { _and: [{ product_line: { _eq: 18 } }, { mirror_style: { _in: [21] } }] },
      then_that: { light_direction: { _in: [2] } }
    };

    console.log('== Creating test rule ==');

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('rules')
      .insert([createPayload])
      .select();

    if (insertError) {
      throw new Error(`Failed to create test rule: ${insertError.message}`);
    }

    const createdRule = inserted?.[0];
    if (!createdRule) {
      throw new Error('Insert succeeded but no rule returned (Prefer: return=representation missing?)');
    }

    createdRuleId = createdRule.id;
    console.log('Created rule:', createdRule);

    console.log('== Confirming test rule exists ==');
    const { data: fetchedRule, error: fetchError } = await supabaseAdmin
      .from('rules')
      .select('*')
      .eq('id', createdRuleId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch created rule: ${fetchError.message}`);
    }

    console.log(serialize(fetchedRule));

    const { data: rules, error: rulesError } = await supabaseAdmin
      .from('rules')
      .select('*')
      .order('priority', { ascending: true });

    if (rulesError || !rules) {
      throw new Error(`Failed to load rules for validation: ${rulesError?.message ?? 'unknown error'}`);
    }

    const { buildRuleConstraints } = await import('../src/services/rules-engine.ts');

    console.log('== Validating constraints for product_line=18, mirror_style=21 ==');
    const constraints = buildRuleConstraints(rules as any, { product_line: 18, mirror_style: 21 });
    console.log(serialize(constraints));

    if (supabaseAnon) {
      console.log('== Spot check via anon key (read-only) ==');
      const { data: anonRules, error: anonError } = await supabaseAnon
        .from('rules')
        .select('id, name')
        .order('priority', { ascending: true })
        .limit(3);
      if (anonError) {
        console.warn('Anon client check failed (expected if RLS blocks access):', anonError.message);
      } else {
        console.log('First rules (anon):', anonRules);
      }
    }

    console.log('Validation complete.');
  } finally {
    if (createdRuleId) {
      console.log('== Cleanup: deleting test rule ==');
      const { error: deleteError } = await supabaseAdmin
        .from('rules')
        .delete()
        .eq('id', createdRuleId);
      if (deleteError) {
        console.error(`Failed to delete test rule (manual cleanup required): ${deleteError.message}`);
      } else {
        console.log('Cleanup complete.');
      }
    }
  }
}

main().catch((error) => {
  console.error('❌ Validation failed:', error);
  process.exitCode = 1;
});
