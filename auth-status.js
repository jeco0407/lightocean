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
    const avatar = profile && profile.avatar ? `${profile.avatar} ` : '';
    area.innerHTML = `<span class="user-badge">${avatar}${label}</span><a href="profile.html" class="logout-btn" style="text-decoration:none">會員資料</a><button id="logoutBtn" class="logout-btn" type="button">登出</button>`;
    document.getElementById('logoutBtn').addEventListener('click', async () => {
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
