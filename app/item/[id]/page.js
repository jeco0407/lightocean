import { supabaseServer } from '../../../lib/supabaseServer';
import ItemDetail from './ItemDetail';

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
    return { title: '商品詳情｜手燈租借所 LIGHT OCEAN' };
  }
  const title = `${product.title}｜手燈租借所 LIGHT OCEAN`;
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
    return (
      <div className="wrap" style={{ padding: '70px 0', textAlign: 'center' }}>
        <p className="sec-sub" style={{ paddingLeft: 0 }}>找不到這個商品,它可能已經下架。</p>
        <a className="btn" href="/items">回到找租借頁面</a>
      </div>
    );
  }

  return (
    <>
      <div className="wrap breadcrumb"><a href="/">首頁</a> / <a href="/items">找租借</a> / <span>{product.title}</span></div>
      <ItemDetail product={product} initialListings={listings} />
    </>
  );
}
