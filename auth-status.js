let currentUser = null;

const sessionReady = (async () => {
  const { data: { session } } = await supabaseClient.auth.getSession();
  currentUser = session ? session.user : null;
  await renderAuthArea();
})();

supabaseClient.auth.onAuthStateChange((_event, session) => {
  currentUser = session ? session.user : null;
  renderAuthArea();
});

async function renderAuthArea(){
  const area = document.getElementById('authArea');
  if(!area) return;
  const next = encodeURIComponent(location.pathname + location.search);
  if(currentUser){
    const profile = await fetchProfile(currentUser.id);
    const label = profile && profile.display_name ? profile.display_name : currentUser.email;
    const avatarImg = profile && profile.avatar
      ? `<img src="${profile.avatar}" alt="" class="avatar">`
      : `<span class="avatar-fallback">🧑</span>`;
    area.innerHTML = `
      <div class="member">
        <button class="member-btn" id="memberBtn" type="button" aria-expanded="false">
          ${avatarImg}
          <span>${label}</span>
          <span class="caret">▾</span>
        </button>
        <div class="member-menu" id="memberMenu">
          <a href="mine.html">我的刊登</a>
          <a href="profile.html">會員資料</a>
          <a href="#" class="logout" id="logoutBtn">登出</a>
        </div>
      </div>`;

    const btn = document.getElementById('memberBtn');
    const menu = document.getElementById('memberMenu');
    btn.addEventListener('click', e => {
      e.stopPropagation();
      menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', menu.classList.contains('open'));
    });
    document.addEventListener('click', () => menu.classList.remove('open'));
    document.getElementById('logoutBtn').addEventListener('click', async e => {
      e.preventDefault();
      await supabaseClient.auth.signOut();
      location.reload();
    });
  }else{
    area.innerHTML = `<a class="auth-login-link" href="auth.html?next=${next}">登入</a><a class="auth-signup-btn" href="auth.html?mode=signup&next=${next}">註冊</a>`;
  }
}

/* Call before any action that requires a logged-in member (詢問／刊登).
   Returns true and lets the caller proceed if already logged in;
   otherwise opens the login-prompt modal and returns false. */
async function requireLogin(){
  await sessionReady;
  if(currentUser) return true;
  const overlay = document.getElementById('loginPromptOverlay');
  if(overlay){
    const next = encodeURIComponent(location.pathname + location.search);
    const link = document.getElementById('loginPromptLink');
    if(link) link.href = `auth.html?next=${next}`;
    overlay.classList.add('open');
  }
  return false;
}
