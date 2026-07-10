import { supabaseServer } from '../../lib/supabaseServer';
import ItemsBrowser from './ItemsBrowser';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: '找租借｜LUMEET 光遇',
  description: '瀏覽可租借的手燈、拍攝手機商品,點進商品可比較所有出租人的價格與地區。',
  openGraph: {
    title: '找租借｜LUMEET 光遇',
    description: '瀏覽可租借的手燈、拍攝手機商品,點進商品可比較所有出租人的價格與地區。',
    images: ['/hero.png'],
    url: '/items',
  },
  twitter: { card: 'summary_large_image' },
};

async function getData() {
  const supabase = supabaseServer();
  const [{ data: products }, { data: listings }] = await Promise.all([
    supabase.from('products').select('*').order('created_at', { ascending: true }),
    supabase.from('listings').select('*'),
  ]);
  return { products: products || [], listings: listings || [] };
}

export default async function ItemsPage() {
  const { products, listings } = await getData();

  return (
    <>
      <div className="wrap breadcrumb"><a href="/">首頁</a> / 找租借</div>

      <section>
        <div className="wrap">
          <div className="sec-head"><span className="no">NO.01</span><h2>想租借的裝備</h2></div>
          <p className="sec-sub">先挑選你想租的商品,點進去就能比較所有出租人的價格與地區。</p>
          <ItemsBrowser initialProducts={products} initialListings={listings} />
        </div>
      </section>
    </>
  );
}
