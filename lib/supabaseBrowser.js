'use client';

import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseKeys';

// Singleton browser client so the auth session (kept in localStorage by
// default) persists across component remounts, same as the old vanilla-JS pages.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
