document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (!session) {
    const next = encodeURIComponent(location.pathname + location.search);
    location.replace(`auth.html?next=${next}`);
    return;
  }

  window.currentUser = session.user;
  document.documentElement.classList.remove('auth-pending');

  const badge = document.getElementById('userBadge');
  if (badge) badge.textContent = session.user.email;

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await supabaseClient.auth.signOut();
      location.href = 'auth.html';
    });
  }

  document.dispatchEvent(new CustomEvent('authready', { detail: { user: session.user } }));
});
