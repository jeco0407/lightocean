import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseKeys';

// One-off client per request for Server Components. Only ever used for
// public reads (RLS already restricts these tables to safe public policies),
// never for authenticated mutations — those stay client-side in the browser.
export function supabaseServer() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
