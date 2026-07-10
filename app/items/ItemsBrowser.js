'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabaseBrowser';
import { CAT_NAME, REGIONS, summarize } from '../../lib/constants';
import { fetchProfile, insertProduct, insertListing, uploadPhoto, requireLogin } from '../../lib/dataClient';

function tokenize(q) {
  return q.trim().split(/\s+/).filter(Boolean);
}

function matchProduct(p, tokens, pool) {
  if (!tokens.length) return { match: true, listings: pool };
  const textFields = [p.title, p.description, p.label, CAT_NAME[p.cat]].filter(Boolean).join(' ').toLowerCase();
  let listings = pool;
  for (const raw of tokens) {
    const t = raw.toLowerCase();
    if (textFields.includes(t)) continue;
    const isRegionToken = REGIONS.some(r => r.includes(raw));
    if (isRegionToken) {
      listings = listings.filter(l => l.region.includes(raw));
      if (!listings.length) return { match: false, listings: [] };
      continue;
    }
    return { match: false, listings: [] };
  }
  return { match: true, listings };
}

export default function ItemsBrowser({ initialProducts, initialListings }) {
  const searchParams = useSearchParams();

  const [products, setProducts] = useState(initialProducts);
  const [listings, setListings] = useState(initialListings);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('all');
  const [region, setRegion] = useState('all');

  const [listOpen, setListOpen] = useState(false);
  const [listSuccess, setListSuccess] = useState(false);
  const [listMsg, setListMsg] = useState('送出後將直接顯示在商品的出租人列表中。');
  const [submitting, setSubmitting] = useState(false);

  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [loginNext, setLoginNext] = useState('/auth.html');

  const [lsProductId, setLsProductId] = useState('');
  const [lsNewTitle, setLsNewTitle] = useState('');
  const [lsNewCat, setLsNewCat] = useState('lightstick');
  const [lsNewPhoto, setLsNewPhoto] = useState(null);
  const [lsRegion, setLsRegion] = useState(REGIONS[0]);
  const [lsPrice, setLsPrice] = useState('');
  const [lsDeposit, setLsDeposit] = useState('');
  const [lsPhoto, setLsPhoto] = useState(null);
  const [lsMeta, setLsMeta] = useState('');
  const [lsContact, setLsContact] = useState('');

  const openedFromQuery = useRef(false);

  async function reloadData() {
    const [{ data: p }, { data: l }] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: true }),
      supabase.from('listings').select('*'),
    ]);
    setProducts(p || []);
    setListings(l || []);
  }

  async function openListModal() {
    const loggedIn = await requireLogin();
    if (!loggedIn) {
      setLoginNext(`/auth.html?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      setLoginPromptOpen(true);
      return;
    }
    setLsProductId('');
    setLsNewTitle('');
    setLsNewCat('lightstick');
    setLsNewPhoto(null);
    setLsPrice('');
    setLsDeposit('');
    setLsPhoto(null);
    setLsMeta('');
    setLsContact('');
    const { data: { user } } = await supabase.auth.getUser();
    const profile = await fetchProfile(user.id);
    setLsRegion(profile?.home_region || REGIONS[0]);
    setListSuccess(false);
    setListMsg('送出後將直接顯示在商品的出租人列表中。');
    setListOpen(true);
  }

  useEffect(() => {
    if (openedFromQuery.current) return;
    if (searchParams.get('action') === 'list') {
      openedFromQuery.current = true;
      openListModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const results = useMemo(() => {
    const tokens = tokenize(search);
    const out = [];
    products.forEach(p => {
      if (p.cat === 'binocular') return;
      if (cat !== 'all' && p.cat !== cat) return;
      let pool = listings.filter(l => l.product_id === p.id);
      if (region !== 'all') {
        pool = pool.filter(l => l.region === region);
        if (!pool.length) return;
      }
      const { match, listings: matched } = matchProduct(p, tokens, pool);
      if (!match) return;
      out.push({ product: p, listings: matched });
    });
    return out;
  }, [products, listings, search, cat, region]);

  function handleCatClick(value) {
    setCat(prev => (prev === value ? 'all' : value));
  }

  async function handleListSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setListMsg('送出中...');
    try {
      let productId = lsProductId;
      if (productId === '__new__') {
        const productImageUrl = lsNewPhoto ? await uploadPhoto(lsNewPhoto, 'products') : null;
        const product = await insertProduct({ cat: lsNewCat, title: lsNewTitle.trim(), description: '', imageUrl: productImageUrl });
        productId = product.id;
      }
      const listingImageUrl = lsPhoto ? await uploadPhoto(lsPhoto, 'listings') : null;
      await insertListing({
        productId,
        region: lsRegion,
        price: Number(lsPrice),
        deposit: Number(lsDeposit),
        meta: lsMeta.trim(),
        contact: lsContact.trim(),
        imageUrl: listingImageUrl,
      });
      await reloadData();
      setListMsg('送出後將直接顯示在商品的出租人列表中。');
      setListSuccess(true);
    } catch (err) {
      setListMsg(`送出失敗:${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="search-bar">
        <input
          type="search"
          placeholder="輸入關鍵字搜尋,例如:blackpink 高雄"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="filters">
        <button type="button" className={`chip${cat === 'lightstick' ? ' active' : ''}`} onClick={() => handleCatClick('lightstick')}>手燈</button>
        <button type="button" className={`chip${cat === 'phone' ? ' active' : ''}`} onClick={() => handleCatClick('phone')}>拍攝手機</button>
        <button type="button" className={`chip${cat === 'other' ? ' active' : ''}`} onClick={() => handleCatClick('other')}>其他</button>
        <select className="chip" aria-label="選擇縣市" value={region} onChange={e => setRegion(e.target.value)}>
          <option value="all">所有縣市</option>
          {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div className="catalog">
        {results.map(({ product: p, listings: pl }) => {
          const s = summarize(pl);
          const priceLabel = s.minPrice != null ? `NT$${s.minPrice} 起` : '尚無出租';
          const countLabel = s.count ? `${s.count} 位出租人・${s.regions.join('/')}` : '目前無人出租,當第一位吧';
          const cover = pl.find(l => l.image_url)?.image_url || p.image_url;
          return (
            <a className="entry" href={`/item/${p.id}`} key={p.id}>
              <div className="icon">{cover ? <img src={cover} alt="" /> : p.icon}</div>
              <div>
                <span className="cat-label">{p.label}</span>
                <h3>{p.title}</h3>
                <div className="meta">{countLabel}</div>
              </div>
              <div className="pricing"><b>{priceLabel}</b><small>per day / 日</small></div>
              <span className="btn" aria-hidden="true">比較出租資訊 →</span>
            </a>
          );
        })}
      </div>
      <p className="empty" style={{ display: results.length ? 'none' : 'block' }}>這個條件目前沒有商品——換個篩選,或直接刊登你的裝備。</p>

      <div style={{ textAlign: 'center', paddingTop: 36 }}>
        <button className="btn" type="button" onClick={openListModal}>填寫出租刊登表單</button>
      </div>

      <div className={`modal-overlay${listOpen ? ' open' : ''}`} onClick={e => { if (e.target === e.currentTarget) setListOpen(false); }}>
        <div className="modal">
          <button className="modal-close" type="button" aria-label="關閉" onClick={() => setListOpen(false)}>✕</button>
          <div className="modal-body" style={{ display: listSuccess ? 'none' : '' }}>
            <span className="no">LISTING</span>
            <h2>刊登我的裝備</h2>
            <form onSubmit={handleListSubmit}>
              <div className="field">
                <label htmlFor="lsProduct">選擇商品</label>
                <select id="lsProduct" required value={lsProductId} onChange={e => setLsProductId(e.target.value)}>
                  <option value="" disabled>請選擇</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>［{CAT_NAME[p.cat]}］{p.title}</option>
                  ))}
                  <option value="__new__">＋ 新增品項(不在列表中)</option>
                </select>
              </div>
              {lsProductId === '__new__' && (
                <div>
                  <div className="field">
                    <label htmlFor="lsNewTitle">新品項名稱</label>
                    <input id="lsNewTitle" placeholder="例:ARMY BOMB Ver.5 官方手燈" value={lsNewTitle} onChange={e => setLsNewTitle(e.target.value)} />
                  </div>
                  <div className="field">
                    <label htmlFor="lsNewCat">品類</label>
                    <select id="lsNewCat" value={lsNewCat} onChange={e => setLsNewCat(e.target.value)}>
                      <option value="lightstick">手燈</option>
                      <option value="phone">拍攝手機</option>
                      <option value="other">其他</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="lsNewPhoto">商品參考圖(選填)</label>
                    <input type="file" id="lsNewPhoto" accept="image/*" onChange={e => setLsNewPhoto(e.target.files[0] || null)} />
                  </div>
                </div>
              )}
              <div className="field-row">
                <div className="field">
                  <label htmlFor="lsRegion">地區</label>
                  <select id="lsRegion" required value={lsRegion} onChange={e => setLsRegion(e.target.value)}>
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="lsPrice">日租金(NT$)</label>
                  <input id="lsPrice" type="number" min="0" required value={lsPrice} onChange={e => setLsPrice(e.target.value)} />
                </div>
              </div>
              <div className="field">
                <label htmlFor="lsDeposit">押金(NT$)</label>
                <input id="lsDeposit" type="number" min="0" required value={lsDeposit} onChange={e => setLsDeposit(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="lsPhoto">你的實際物品照片</label>
                <input type="file" id="lsPhoto" accept="image/*" onChange={e => setLsPhoto(e.target.files[0] || null)} />
              </div>
              <div className="field">
                <label htmlFor="lsMeta">交易備註</label>
                <input id="lsMeta" placeholder="面交地點、寄送方式、注意事項" value={lsMeta} onChange={e => setLsMeta(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="lsContact">你的聯絡方式</label>
                <input id="lsContact" placeholder="Email / 電話 / 社群帳號" required value={lsContact} onChange={e => setLsContact(e.target.value)} />
              </div>
              <button className="btn" type="submit" disabled={submitting}>送出刊登</button>
              <p className="form-note">{listMsg}</p>
            </form>
          </div>
          <div className={`modal-success${listSuccess ? ' show' : ''}`}>
            <div className="mark">✓</div>
            <h2>已成功上架</h2>
            <p>你的物品已加入商品目錄,其他粉絲可以直接詢問你囉。</p>
            <button className="btn line" type="button" onClick={() => setListOpen(false)}>關閉</button>
          </div>
        </div>
      </div>

      <div className={`modal-overlay${loginPromptOpen ? ' open' : ''}`} onClick={e => { if (e.target === e.currentTarget) setLoginPromptOpen(false); }}>
        <div className="modal" style={{ textAlign: 'center' }}>
          <button className="modal-close" type="button" aria-label="關閉" onClick={() => setLoginPromptOpen(false)}>✕</button>
          <span className="no">MEMBERS ONLY</span>
          <h2>請先登入會員</h2>
          <p style={{ color: 'var(--ink-soft)', fontSize: '.9rem', marginBottom: 24 }}>登入後才能刊登你的裝備,註冊只要幾秒鐘。</p>
          <a className="btn" href={loginNext}>前往登入 / 註冊</a>
        </div>
      </div>
    </>
  );
}
