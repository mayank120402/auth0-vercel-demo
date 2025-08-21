console.log('SDK type:', typeof createAuth0Client);

async function configureClient() {
  if (typeof createAuth0Client !== 'function') {
    alert('SDK not loaded—that means script order is wrong.');
    throw new Error('SDK not loaded');
  }
  const cfg = await (await fetch('auth_config.json')).json();
  window.auth0 = await createAuth0Client({
    domain: cfg.domain,
    client_id: cfg.clientId,
    authorizationParams: {
      redirect_uri: window.location.origin,
      audience: cfg.audience
    }
  });
  console.log('Auth0 client ready');
}

async function updateUI() {
  const isAuth = await auth0.isAuthenticated();
  document.getElementById('login').style.display = isAuth ? 'none' : 'inline-block';
  document.getElementById('logout').style.display = isAuth ? 'inline-block' : 'none';
  const profile = document.getElementById('profile');
  if (isAuth) {
    const user = await auth0.getUser();
    const claims = await auth0.getIdTokenClaims();
    const roles = claims['https://example.com/roles'] || [];
    profile.textContent = JSON.stringify({ user, roles }, null, 2);
    document.getElementById('admin').style.display = roles.includes('admin') ? 'block' : 'none';
  } else {
    profile.textContent = 'Not logged in';
    document.getElementById('admin').style.display = 'none';
  }
}

window.addEventListener('load', async () => {
  await configureClient();
  const q = window.location.search;
  if (q.includes('code=') && q.includes('state=')) {
    await auth0.handleRedirectCallback();
    window.history.replaceState({}, document.title, window.location.pathname);
  }
  await updateUI();
  //document.getElementById('login').onclick = () => auth0.loginWithRedirect();
  document.getElementById('login').addEventListener('click', () => {
  console.log('Login button clicked');
  auth0.loginWithRedirect();
});

  document.getElementById('logout').onclick = () => auth0.logout({ returnTo: window.location.origin });
});
