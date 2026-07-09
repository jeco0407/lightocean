let currentUser = null;

const sessionReady = (async () => {
  const { data: { session } } = await supabaseClient.auth.getSession();
  currentUser = session ? session.user : null;
  renderAuthArea();
})();

supabaseClient.auth.onAuthStateChange((_event, session) => {
  currentUser = session ? session.user : null;
  renderAuthArea();
});

function renderAuthArea(){
  const area = document.getElementById('authArea');
  if(!area) return;
  const next = encodeURIComponent(location.pathname + location.search);
  if(currentUser){
    area.innerHTML = `<span class="user-badge">${currentUser.email}</span><button id="logoutBtn" class="logout-btn" type="button">登出</button>`;
    document.getElementById('logoutBtn').addEventListener('click', async () => {
      await supabaseClient.auth.signOut();
      location.reload();
    });
  }else{
    area.innerHTML = `<a class="btn line" href="auth.html?next=${next}" style="padding:8px 18px;font-size:.78rem">登入 / 註冊</a>`;
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
