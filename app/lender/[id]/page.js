import Image from 'next/image';
import { notFound } from 'next/navigation';
import { supabaseServer } from '../../../lib/supabaseServer';

export const dynamic = 'force-dynamic';

async function getData(lenderId) {
  const supabase = supabaseServer();
  const [{ data: profile }, { data: listings }, { data: completedRow }] = await Promise.all([
    supabase.from('public_profiles').select('*').eq('id', lenderId).maybeSingle(),
    supabase.from('listings')
      .select('*, products(title,label,icon,image_url)')
      .eq('created_by', lenderId)
      .order('created_at', { ascending: false }),
    supabase.from('lender_completed_counts').select('completed_count').eq('lender_id', lenderId).maybeSingle(),
  ]);
  return {
    profile,
    listings: listings || [],
    completedCount: completedRow?.completed_count || 0,
  };
}

export async function generateMetadata({ params }) {
  const { profile, listings, completedCount } = await getData(params.id);
  if (!profile && !listings.length) {
    return { title: '出租人資料｜手燈租借所 LIGHT OCEAN' };
  }
  const name = profile?.display_name || '這位出租人';
  const title = `${name}｜手燈租借所 LIGHT OCEAN`;
  const description = profile?.bio || `查看 ${name} 的刊登紀錄與租借口碑。`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [profile?.avatar || '/hero.png'],
      url: `/lender/${params.id}`,
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function LenderPage({ params }) {
  const { profile, listings, completedCount } = await getData(params.id);

  if (!profile && !listings.length) {
    notFound();
  }

  const name = profile?.display_name || '這位出租人';

  return (
    <>
      <div className="wrap breadcrumb"><a href="/">首頁</a> / <a href="/items">找租借</a> / <span>{name}</span></div>

      <section>
        <div className="wrap">
          <div className="lender-head">
            <div className="avatar-box">
              {profile?.avatar ? <Image src={profile.avatar} alt={name} fill sizes="80px" style={{ objectFit: 'cover' }} /> : <span className="avatar-fallback-lg">🧑</span>}
            </div>
            <div>
              <h1>{name}</h1>
              <p className="meta">{profile?.home_region ? `常出沒於 ${profile.home_region}` : ''}</p>
              <p className="meta">{completedCount > 0 ? `✓ 已完成 ${completedCount} 次租借交易` : '尚無完成租借紀錄'}</p>
              {profile?.bio && <p className="desc">{profile.bio}</p>}
            </div>
          </div>

          <div className="sec-head" style={{ marginTop: 40 }}><span className="no">LISTINGS</span><h2>刊登中的裝備</h2></div>
          <div className="catalog">
            {listings.map(l => {
              const cover = l.image_url || l.products?.image_url;
              return (
                <a className="entry" href={`/item/${l.product_id}`} key={l.id}>
                  <div className="icon">{cover ? <Image src={cover} alt={l.products?.title || ''} fill sizes="(max-width: 760px) 50vw, 25vw" style={{ objectFit: 'cover' }} /> : (l.products?.icon || '📦')}</div>
                  <div>
                    <span className="cat-label">{l.products?.label || ''}</span>
                    <h3>{l.products?.title || '(商品已下架)'}</h3>
                    <div className="meta">{l.region}{l.meta ? '・' + l.meta : ''}</div>
                  </div>
                  <div className="pricing"><b>NT${l.price}</b><small>per day / 日</small></div>
                  <span className="btn" aria-hidden="true">查看 →</span>
                </a>
              );
            })}
          </div>
          <p className="empty" style={{ display: listings.length ? 'none' : 'block' }}>這位出租人目前沒有刊登中的裝備。</p>
        </div>
      </section>
    </>
  );
}
