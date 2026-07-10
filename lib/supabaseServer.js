import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseKeys';

// One-off client per request for Server Components. Only ever used for
// public reads (RLS already restricts these tables to safe public policies),
// never for authenticated mutations — those stay client-side in the browser.
//
// The custom fetch forces cache: 'no-store' on every request. Without this,
// Next.js's Data Cache silently cached these fetch() calls even with
// `export const dynamic = 'force-dynamic'` on the route, which only disables
// the route's own render cache — not the underlying fetch cache — so pages
// kept showing stale product data after admin edits.
export function supabaseServer() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: {
      fetch: (url, options = {}) => fetch(url, { ...options, cache: 'no-store' }),
    },
  });
}
