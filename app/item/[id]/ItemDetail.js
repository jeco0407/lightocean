'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { supabase } from '../../../lib/supabaseBrowser';
import {
  fetchProfile,
  insertInquiry,
  requireLogin,
  updateProductImage,
  updateProductInfo,
  uploadPhoto,
} from '../../../lib/dataClient';

export default function ItemDetail({ product: initialProduct, initialListings }) {
  const [product, setProduct] = useState(initialProduct);
  const [listings] = useState(initialListings);
  const [sortBy, setSortBy] = useState('price');
  const [isAdmin, setIsAdmin] = useState(false);

  const [infoFormOpen, setInfoFormOpen] = useState(false);
  const [titleInput, setTitleInput] = useState(product.title);
  const [descInput, setDescInput] = useState(product.description || '');

  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [inquiryMsg, setInquiryMsg] = useState('送出後平台會將訊息轉交給出租人,不會公開你的聯絡方式。');
  const [activeListing, setActiveListing] = useState(null);
  const [iqName, setIqName] = useState('');
  const [iqContact, setIqContact] = useState('');
  const [iqDate, setIqDate] = useState('');
  const [iqMsg, setIqMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [loginNext, setLoginNext] = useState('/auth.html');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || cancelled) return;
      const profile = await fetchProfile(session.user.id);
      if (!cancelled && profile?.is_admin) setIsAdmin(true);
    })();
    return () => { cancelled = true; };
  }, []);

  const sortedListings = useMemo(() => {
    const copy = listings.slice();
    if (sortBy === 'price') copy.sort((a, b) => a.price - b.price);
    else copy.sort((a, b) => a.region.localeCompare(b.region, 'zh-Hant'));
    return copy;
  }, [listings, sortBy]);

  async function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!(await requireLogin())) {
      e.target.value = '';
      setLoginNext(`/auth.html?next=${encodeURIComponent(window.location.pathname)}`);
      setLoginPromptOpen(true);
      return;
    }
    try {
      const url = await uploadPhoto(file, 'products');
      await updateProductImage(product.id, url);
      setProduct(p => ({ ...p, image_url: url }));
    } catch (err) {
      alert(`上傳失敗:${err.message}`);
    } finally {
      e.target.value = '';
    }
  }

  function toggleInfoForm() {
    setTitleInput(product.title);
    setDescInput(product.description || '');
    setInfoFormOpen(v => !v);
  }

  async function saveInfo() {
    const title = titleInput.trim();
    const description = descInput.trim();
    if (!title) return;
    try {
      await updateProductInfo(product.id, { title, description });
      setProduct(p => ({ ...p, title, description }));
      setInfoFormOpen(false);
    } catch (err) {
      alert(`更新失敗:${err.message}`);
    }
  }

  async function openInquiry(listing) {
    const loggedIn = await requireLogin();
    if (!loggedIn) {
      setLoginNext(`/auth.html?next=${encodeURIComponent(window.location.pathname)}`);
      setLoginPromptOpen(true);
      return;
    }
    setActiveListing(listing);
    const { data: { session } } = await supabase.auth.getSession();
    const profile = await fetchProfile(session.user.id);
    setIqName(profile?.display_name || '');
    setIqContact('');
    setIqDate('');
    setIqMsg('');
    setInquiryMsg('送出後平台會將訊息轉交給出租人,不會公開你的聯絡方式。');
    setInquirySuccess(false);
    setInquiryOpen(true);
  }

  async function handleInquirySubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setInquiryMsg('送出中...');
    try {
      await insertInquiry({
        listingId: activeListing.id,
        name: iqName.trim(),
        contact: iqContact.trim(),
        wantedDate: iqDate,
        message: iqMsg.trim(),
      });
      setInquirySuccess(true);
    } catch (err) {
      setInquiryMsg(`送出失敗:${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>
      <div className="wrap">
        <div className="product-head">
          <div>
            <div className="icon">{product.image_url ? <Image src={product.image_url} alt={product.title} fill sizes="(max-width: 760px) 30vw, 15vw" style={{ objectFit: 'cover' }} priority /> : product.icon}</div>
            {isAdmin && (
              <p className="product-photo-edit">
                <label htmlFor="pPhotoFile">上傳／更換商品參考圖</label>
                <input type="file" id="pPhotoFile" accept="image/*" onChange={handlePhotoChange} />
              </p>
            )}
          </div>
          <div>
            <span className="cat-label">{product.label}</span>
            <h1>{product.title}</h1>
            <p className="desc">{product.description || ''}</p>
            {isAdmin && (
              <p className="product-photo-edit">
                <label onClick={toggleInfoForm} style={{ cursor: 'pointer' }}>編輯商品名稱／說明</label>
              </p>
            )}
            {isAdmin && infoFormOpen && (
              <div style={{ marginTop: 14, maxWidth: 420 }}>
                <div className="field">
                  <label htmlFor="pTitleInput">商品名稱</label>
                  <input id="pTitleInput" value={titleInput} onChange={e => setTitleInput(e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="pDescInput">商品說明</label>
                  <textarea id="pDescInput" value={descInput} onChange={e => setDescInput(e.target.value)} />
                </div>
                <button className="btn" type="button" style={{ width: 'auto', padding: '9px 20px' }} onClick={saveInfo}>儲存</button>
              </div>
            )}
          </div>
        </div>

        <div className="sortbar">
          <span className="count">共 {sortedListings.length} 位出租人</span>
          <select className="chip" aria-label="排序方式" style={{ border: '1px solid var(--rule)' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="price">依價格由低到高</option>
            <option value="region">依地區</option>
          </select>
        </div>

        <div className="catalog">
          {sortedListings.map(l => {
            const cover = l.image_url || product.image_url;
            return (
              <article className="entry" key={l.id}>
                <div className="icon">{cover ? <Image src={cover} alt={`${product.title} - ${l.region}`} fill sizes="(max-width: 760px) 50vw, 25vw" style={{ objectFit: 'cover' }} /> : '📍'}</div>
                <div>
                  <span className="cat-label">{l.region}</span>
                  <h3>{l.meta || '未提供交易備註'}</h3>
                  <div className="meta">
                    押金 NT${l.deposit}
                    {l.created_by && (<> ・ <a href={`/lender/${l.created_by}`} className="lender-link">出租人資料</a></>)}
                  </div>
                </div>
                <div className="pricing"><b>NT${l.price}</b><small>per day / 日</small></div>
                <button className="btn" type="button" onClick={() => openInquiry(l)}>詢問</button>
              </article>
            );
          })}
        </div>
        <p className="empty" style={{ display: sortedListings.length ? 'none' : 'block' }}>目前還沒有人出租這件商品——當第一位出租人吧。</p>
      </div>

      <div className={`modal-overlay${inquiryOpen ? ' open' : ''}`} onClick={e => { if (e.target === e.currentTarget) setInquiryOpen(false); }}>
        <div className="modal">
          <button className="modal-close" type="button" aria-label="關閉" onClick={() => setInquiryOpen(false)}>✕</button>
          <div className="modal-body" style={{ display: inquirySuccess ? 'none' : '' }}>
            <span className="no">INQUIRY</span>
            <h2>詢問租借</h2>
            <div className="item-ref">{activeListing ? `${product.title}・${activeListing.region}・NT$${activeListing.price} / 日` : ''}</div>
            <form onSubmit={handleInquirySubmit}>
              <div className="field"><label htmlFor="iqName">你的稱呼</label><input id="iqName" required value={iqName} onChange={e => setIqName(e.target.value)} /></div>
              <div className="field-row">
                <div className="field"><label htmlFor="iqContact">聯絡方式</label><input id="iqContact" placeholder="Email / 電話 / 社群帳號" required value={iqContact} onChange={e => setIqContact(e.target.value)} /></div>
                <div className="field"><label htmlFor="iqDate">想租日期</label><input id="iqDate" type="date" required value={iqDate} onChange={e => setIqDate(e.target.value)} /></div>
              </div>
              <div className="field"><label htmlFor="iqMsg">給出租人的話</label><textarea id="iqMsg" placeholder="想租借的場次、地點面交需求等" value={iqMsg} onChange={e => setIqMsg(e.target.value)} /></div>
              <button className="btn" type="submit" disabled={submitting}>送出詢問</button>
              <p className="form-note">{inquiryMsg}</p>
            </form>
          </div>
          <div className={`modal-success${inquirySuccess ? ' show' : ''}`}>
            <div className="mark">✓</div>
            <h2>詢問已送出</h2>
            <p>出租人會盡快透過你留下的聯絡方式回覆你,請留意通知。</p>
            <button className="btn line" type="button" onClick={() => setInquiryOpen(false)}>關閉</button>
          </div>
        </div>
      </div>

      <div className={`modal-overlay${loginPromptOpen ? ' open' : ''}`} onClick={e => { if (e.target === e.currentTarget) setLoginPromptOpen(false); }}>
        <div className="modal" style={{ textAlign: 'center' }}>
          <button className="modal-close" type="button" aria-label="關閉" onClick={() => setLoginPromptOpen(false)}>✕</button>
          <span className="no">MEMBERS ONLY</span>
          <h2>請先登入會員</h2>
          <p style={{ color: 'var(--ink-soft)', fontSize: '.9rem', marginBottom: 24 }}>登入後才能詢問出租人,註冊只要幾秒鐘。</p>
          <a className="btn" href={loginNext}>前往登入 / 註冊</a>
        </div>
      </div>
    </section>
  );
}
