/**
 * Supabase Admin Client - Service Role
 *
 * This client uses the service_role key and bypasses Row Level Security.
 * Use ONLY for trusted server-side operations like:
 * - Public form submissions that need to bypass RLS
 * - Admin operations
 * - Scheduled tasks
 *
 * WARNING: Never expose this client to the browser or client-side code.
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export function createServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    )
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
