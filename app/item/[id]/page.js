import { notFound } from 'next/navigation';
import { supabaseServer } from '../../../lib/supabaseServer';
import { summarize } from '../../../lib/constants';
import ItemDetail from './ItemDetail';

const SITE_URL = 'https://lumeet.vercel.app';

export const dynamic = 'force-dynamic';

async function getData(id) {
  const supabase = supabaseServer();
  const [{ data: product }, { data: listings }] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).maybeSingle(),
    supabase.from('listings').select('*').eq('product_id', id),
  ]);
  return { product, listings: listings || [] };
}

export async function generateMetadata({ params }) {
  const { product } = await getData(params.id);
  if (!product) {
    return { title: '商品詳情｜光遇 LUMEET' };
  }
  const title = `${product.title}｜光遇 LUMEET`;
  const description = product.description || '比較同一件商品的所有出租人資訊,挑選價格最划算或地區最近的出租人。';
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [product.image_url || '/hero.png'],
      url: `/item/${params.id}`,
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function ItemPage({ params }) {
  const { product, listings } = await getData(params.id);

  if (!product) {
    notFound();
  }

  const s = summarize(listings);
  const image = product.image_url || listings.find(l => l.image_url)?.image_url || `${SITE_URL}/hero.png`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || `比較「${product.title}」所有出租人的價格與地區。`,
    image,
    url: `${SITE_URL}/item/${params.id}`,
    ...(s.count > 0
      ? {
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'TWD',
            lowPrice: s.minPrice,
            offerCount: s.count,
            availability: 'https://schema.org/InStock',
          },
        }
      : {}),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="wrap breadcrumb"><a href="/">首頁</a> / <a href="/items">找租借</a> / <span>{product.title}</span></div>
      <ItemDetail product={product} initialListings={listings} />
    </>
  );
}
