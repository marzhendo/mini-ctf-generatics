import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Admin client with Service Role privileges.
 * Used strictly on the server (Server Actions & Route Handlers)
 * to evaluate flag answers and enforce 1-shot attempt rules securely.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase credentials are missing from environment variables.');
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
