#!/usr/bin/env node

// Watches Directus schema changes via Realtime and writes a fresh snapshot to disk.
// Falls back to periodic polling if Realtime subscription fails.
//
// Usage:
//   node scripts/watch-schema.ts --out schema.json [--interval 30000]
//   env: DIRECTUS_URL, DIRECTUS_API_KEY (or VITE_DIRECTUS_URL, VITE_DIRECTUS_API_KEY)

import { writeFileSync, mkdirSync, readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import process from 'process';
import { createDirectus, rest, staticToken } from '@directus/sdk';

// Try to load .env file (simple parser)
function loadEnv() {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const envPath = resolve(__dirname, '..', '.env');
    const content = readFileSync(envPath, 'utf8');
    content.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const k = trimmed.slice(0, idx);
        const v = trimmed.slice(idx + 1);
        if (!process.env[k]) process.env[k] = v;
      }
    });
  } catch {}
}

// Parse CLI args
function parseArgs() {
  const args = process.argv.slice(2);
  const outIndex = args.indexOf('--out');
  const intervalIndex = args.indexOf('--interval');
  const out = outIndex >= 0 ? args[outIndex + 1] : 'schema.json';
  const interval = intervalIndex >= 0 ? parseInt(args[intervalIndex + 1], 10) : 30000;
  return { out, interval };
}

async function fetchSchemaSnapshot(baseUrl: string, token?: string) {
  const url = baseUrl.replace(/\/$/, '') + '/schema/snapshot';
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Snapshot HTTP ${res.status}`);
  return await res.json();
}

async function writeSnapshot(filePath: string, data: any) {
  const abs = resolve(process.cwd(), filePath);
  mkdirSync(dirname(abs), { recursive: true });
  // Write JSON for simplicity; users can convert to YAML if preferred
  writeFileSync(abs, JSON.stringify(data, null, 2));
  console.log(`📦 Schema snapshot written → ${abs}`);
}

async function main() {
  loadEnv();
  const { out, interval } = parseArgs();

  const DIRECTUS_URL = process.env.DIRECTUS_URL || process.env.VITE_DIRECTUS_URL;
  const API_KEY = process.env.DIRECTUS_API_KEY || process.env.VITE_DIRECTUS_API_KEY;

  if (!DIRECTUS_URL) {
    console.error('❌ DIRECTUS_URL (or VITE_DIRECTUS_URL) is required');
    process.exit(1);
  }

  const baseUrl = DIRECTUS_URL.replace(/\/$/, '');
  const token = API_KEY || undefined;

  // Initial snapshot at startup
  try {
    const snap = await fetchSchemaSnapshot(baseUrl, token);
    await writeSnapshot(out, snap);
  } catch (e: any) {
    console.error('❌ Failed to fetch initial schema snapshot:', e?.message || e);
  }

  // Try realtime subscription via SDK websocket plugin dynamically (optional)
  let unsubscribeFns: Array<() => Promise<void> | void> = [];
  let realtimeReady = false;
  try {
    const { realtime } = await import('@directus/sdk');
    const client = createDirectus(baseUrl).with(rest()).with(staticToken(token || '')) as any;
    if (realtime) client.with(realtime({}));

    if (client.realtime) {
      console.log('⚡ Subscribing to Directus realtime schema-related collections...');
      await client.realtime.connect();
      const onChange = async (msg: any) => {
        try {
          console.log(`🔔 Schema-related change detected: ${msg?.event || 'event'}`);
          const snap = await fetchSchemaSnapshot(baseUrl, token);
          await writeSnapshot(out, snap);
        } catch (e: any) {
          console.error('❌ Failed to refresh snapshot after change:', e?.message || e);
        }
      };
      const subs = [] as any[];
      // System schema metadata collections
      for (const collection of ['directus_collections', 'directus_fields', 'directus_relations']) {
        const un = await client.realtime.subscribe(collection, { event: '*' }, onChange);
        subs.push(un);
      }
      unsubscribeFns = subs;
      realtimeReady = true;
      console.log('✅ Realtime subscriptions active');
    }
  } catch (e: any) {
    console.warn('⚠️ Realtime subscription unavailable, will use polling. Reason:', e?.message || e);
  }

  if (!realtimeReady) {
    // Poll fallback: fetch diff and write snapshot on differences
    console.log(`⏱️ Polling /schema/snapshot every ${interval}ms...`);
    let prevHash = '';
    setInterval(async () => {
      try {
        const snap = await fetchSchemaSnapshot(baseUrl, token);
        const hash = JSON.stringify(snap); // simple hash for diff
        if (hash !== prevHash) {
          prevHash = hash;
          await writeSnapshot(out, snap);
        }
      } catch (e: any) {
        console.warn('⚠️ Polling failed:', e?.message || e);
      }
    }, interval).unref();
  }

  // Keep process alive
  process.stdin.resume();
}

main().catch((e) => {
  console.error('Unexpected error:', e);
  process.exit(1);
});
