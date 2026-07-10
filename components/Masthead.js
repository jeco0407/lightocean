'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseBrowser';

export default function Masthead() {
  const [navOpen, setNavOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [nextParam, setNextParam] = useState('');

  useEffect(() => {
    setNextParam(encodeURIComponent(window.location.pathname + window.location.search));

    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setUser(session ? session.user : null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session ? session.user : null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }
    let cancelled = false;
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle().then(({ data }) => {
      if (!cancelled) setProfile(data);
    });
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [menuOpen]);

  async function handleLogout(e) {
    e.preventDefault();
    await supabase.auth.signOut();
    window.location.reload();
  }

  const label = profile?.display_name || user?.email || '';

  return (
    <div className="masthead">
      <div className="wrap">
        <a className="title" href="/">LIGHT <b>OCEAN</b></a>
        <div className="masthead-right">
          <button
            className="hamburger"
            type="button"
            aria-label="開啟選單"
            aria-expanded={navOpen}
            onClick={() => setNavOpen(v => !v)}
          >
            <span></span><span></span><span></span>
          </button>
          <nav style={navOpen ? { display: 'flex' } : undefined}>
            <a href="/items">找租借</a>
            <a href="/#flow">怎麼租</a>
            <a href="/#trust">安心保障</a>
            <a href="/items?action=list">我要出租</a>
          </nav>
          <div className="user-area">
            {user ? (
              <div className="member">
                <button
                  className="member-btn"
                  type="button"
                  aria-expanded={menuOpen}
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(v => !v); }}
                >
                  {profile?.avatar
                    ? <img src={profile.avatar} alt="" className="avatar" />
                    : <span className="avatar-fallback">🧑</span>}
                  <span>{label}</span>
                  <span className="caret">▾</span>
                </button>
                <div className={`member-menu${menuOpen ? ' open' : ''}`}>
                  <a href="/mine.html">我的刊登</a>
                  <a href="/profile.html">會員資料</a>
                  <a href="#" className="logout" onClick={handleLogout}>登出</a>
                </div>
              </div>
            ) : (
              <>
                <a className="auth-login-link" href={`/auth.html?next=${nextParam}`}>登入</a>
                <a className="auth-signup-btn" href={`/auth.html?mode=signup&next=${nextParam}`}>註冊</a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
