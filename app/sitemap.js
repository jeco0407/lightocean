import { supabaseServer } from '../lib/supabaseServer';

const BASE_URL = 'https://lumeet.vercel.app';

export default async function sitemap() {
  const supabase = supabaseServer();

  const [{ data: products }, { data: listings }] = await Promise.all([
    supabase.from('products').select('id, created_at'),
    supabase.from('listings').select('created_by').not('created_by', 'is', null),
  ]);

  const staticRoutes = [
    { url: `${BASE_URL}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/items`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/about`, changeFrequency: 'monthly', priority: 0.6 },
  ];

  const productRoutes = (products || []).map(p => ({
    url: `${BASE_URL}/item/${p.id}`,
    lastModified: p.created_at,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  const lenderIds = [...new Set((listings || []).map(l => l.created_by))];
  const lenderRoutes = lenderIds.map(id => ({
    url: `${BASE_URL}/lender/${id}`,
    changeFrequency: 'weekly',
    priority: 0.5,
  }));

  return [...staticRoutes, ...productRoutes, ...lenderRoutes];
}
