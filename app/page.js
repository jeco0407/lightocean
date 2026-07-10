import Image from 'next/image';
import { supabaseServer } from '../lib/supabaseServer';
import { summarize } from '../lib/constants';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: '光遇 LUMEET｜應援手燈・拍攝手機 粉絲租借誌',
  description: '演唱會應援手燈、拍攝手機租借媒合平台。粉絲之間互相出租,讓每一支燈都不缺席燈海。',
  openGraph: {
    title: '光遇 LUMEET｜應援手燈・拍攝手機 粉絲租借誌',
    description: '演唱會應援手燈、拍攝手機租借媒合平台。粉絲之間互相出租,讓每一支燈都不缺席燈海。',
    images: ['/hero.png'],
    url: '/',
  },
  twitter: { card: 'summary_large_image' },
};

async function getTeaserData() {
  const supabase = supabaseServer();
  const [{ data: products }, { data: listings }] = await Promise.all([
    supabase.from('products').select('*').order('created_at', { ascending: true }),
    supabase.from('listings').select('*'),
  ]);
  return { products: products || [], listings: listings || [] };
}

export default async function HomePage() {
  const { products, listings } = await getTeaserData();

  const listingCountByProduct = {};
  listings.forEach(l => {
    listingCountByProduct[l.product_id] = (listingCountByProduct[l.product_id] || 0) + 1;
  });
  const teaserProducts = products
    .filter(p => p.cat !== 'binocular')
    .slice()
    .sort((a, b) => (listingCountByProduct[b.id] || 0) - (listingCountByProduct[a.id] || 0))
    .slice(0, 4);

  return (
    <>
      <header className="hero hero-photo">
        <div className="hero-inner">
          <div className="hero-text">
            <div className="kicker">光遇 LUMEET</div>
            <p className="slogan">因光而遇,因熱愛相聚。</p>
            <h1>讓每一場應援,<br />都更完整。</h1>
            <p className="hero-tag">手燈・拍攝手機・其他應援,粉絲之間互相租借。</p>
            <div className="hero-actions">
              <a className="btn" href="/items">瀏覽可租物品</a>
              <a className="btn line" href="/items?action=list">刊登我的裝備</a>
            </div>
            <a href="/about" className="story-link">了解 Lumeet 的品牌故事 →</a>
          </div>
          <div className="hero-photo-box">
            <Image src="/hero.png" alt="演唱會現場,粉絲揮舞應援手燈" fill sizes="(max-width: 760px) 100vw, 55vw" style={{ objectFit: 'cover', objectPosition: 'center 30%' }} priority />
          </div>
        </div>
      </header>

      <section id="items">
        <div className="wrap">
          <div className="sec-head"><span className="no">NO.01</span><h2>本期精選商品</h2></div>
          <p className="sec-sub">點進商品可比較所有出租人的價格與地區,挑選最划算的一個。</p>

          <div className="catalog" id="teaserGrid">
            {teaserProducts.map(p => {
              const productListings = listings.filter(l => l.product_id === p.id);
              const s = summarize(productListings);
              const priceLabel = s.minPrice != null ? `NT$${s.minPrice} 起` : '尚無出租';
              const countLabel = s.count ? `${s.count} 位出租人・${s.regions.join('/')}` : '目前無人出租,當第一位吧';
              const cover = productListings.find(l => l.image_url)?.image_url || p.image_url;
              return (
                <a className="entry" href={`/item/${p.id}`} key={p.id}>
                  <div className="icon">{cover ? <Image src={cover} alt={p.title} fill sizes="(max-width: 760px) 50vw, 25vw" style={{ objectFit: 'cover' }} /> : p.icon}</div>
                  <div>
                    <span className="cat-label">{p.label}</span>
                    <h3>{p.title}</h3>
                    <div className="meta">{countLabel}</div>
                  </div>
                  <div className="pricing"><b>{priceLabel}</b><small>per day / 日</small></div>
                  <span className="btn" aria-hidden="true">查看 →</span>
                </a>
              );
            })}
          </div>

          <div style={{ textAlign: 'center', paddingTop: 36 }}>
            <a className="btn line" href="/items">查看全部可租商品 →</a>
          </div>
        </div>
      </section>

      <section id="flow">
        <div className="wrap">
          <div className="sec-head"><span className="no">NO.02</span><h2>租借流程</h2></div>
          <p className="sec-sub">四步驟完成,演唱會前一天到貨、散場後歸還。</p>
          <div className="flow">
            <div className="flow-row">
              <div className="no">01</div>
              <div><h3>挑選與詢問</h3><p>找到你要的手燈版本或手機型號,確認場次日期可租,透過平台聯繫出租人。</p></div>
            </div>
            <div className="flow-row">
              <div className="no">02</div>
              <div><h3>付租金與押金</h3><p>租金與押金先交由平台保管,雙方確認交易後才撥款,避免私下轉帳糾紛。</p></div>
            </div>
            <div className="flow-row">
              <div className="no">03</div>
              <div><h3>面交或寄送</h3><p>同城面交最安心;跨縣市可用超商店到店,收貨時錄影開箱留存證明。</p></div>
            </div>
            <div className="flow-row">
              <div className="no">04</div>
              <div><h3>歸還與退押金</h3><p>散場後依約歸還,出租人確認狀態無誤,押金原路退回,雙方互相評價。</p></div>
            </div>
          </div>
        </div>
      </section>

      <section id="trust">
        <div className="wrap">
          <div className="sec-head"><span className="no">NO.03</span><h2>安心保障</h2></div>
          <p className="sec-sub">C2C 租借最怕糾紛,所以規則先講清楚。</p>
          <div className="trust">
            <div><h3>押金第三方保管</h3><p>押金不直接給出租人,由平台保管至歸還確認,損壞爭議依刊登時的狀態照片判定。</p></div>
            <div><h3>開箱錄影制度</h3><p>交付與歸還雙方都需錄影記錄外觀與功能,是爭議時唯一認定依據。</p></div>
            <div><h3>手燈連動須知</h3><p>刊登時需註明是否可解除 App 綁定、支援中控版本,入場前可完成連動測試。</p></div>
            <div><h3>手機租借規範</h3><p>出租前重置並登出所有帳號;歸還前刪除個人資料並重置,雙方當面確認。</p></div>
          </div>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="cta" id="list">
          <h2>讓閒置的手燈,替另一位粉絲亮起來</h2>
          <p>不是每個人都能收齊每一代手燈,也不是每支燈都有機會常常進場。把暫時休息的裝備分享出來,讓它出現在下一場燈海裡——直接在站內填寫刊登表單,附上物品資訊與可租日期,即刻上架到目錄。</p>
          <a className="btn" href="/items?action=list">填寫出租刊登表單</a>
        </div>
      </section>
    </>
  );
}
