/* Integração inicial do Tem na Geladeira com Supabase Auth + perfis. */
(function () {
  'use strict';
  const config = window.TN_SUPABASE_CONFIG;
  if (!config || !config.url || !config.anonKey || !window.supabase) {
    console.warn('[Tem na Geladeira] Supabase não configurado. Confira supabase-config.js.');
    return;
  }
  const client = window.supabase.createClient(config.url, config.anonKey);
  window.tnSupabase = client;

  async function profileFor(user) {
    const { data, error } = await client.from('profiles').select('display_name,role,creator_status').eq('id', user.id).maybeSingle();
    if (error) throw error;
    const name = data?.display_name || user.user_metadata?.display_name || user.email?.split('@')[0] || 'Usuário';
    return { id: user.id, name, email: user.email, role: data?.role || 'user', creator_status: data?.creator_status || 'none' };
  }
  async function setSession(user) {
    if (!user) {
      currentUser = null;
      localStorage.removeItem('tn_session');
    } else {
      currentUser = await profileFor(user);
      // Apenas dados de sessão não sensíveis; nunca salvar senha.
      localStorage.setItem('tn_session', JSON.stringify(currentUser));
    }
    if (typeof updateAccountButton === 'function') updateAccountButton();
    if (typeof updateNotificationBadge === 'function') updateNotificationBadge();
  }
  window.tnAuthReady = client.auth.getSession().then(async ({ data, error }) => {
    if (error) throw error;
    await setSession(data.session?.user || null);
  }).catch(err => console.error('[Supabase auth]', err));

  client.auth.onAuthStateChange((_event, session) => {
    // Evita chamadas de rede dentro do callback síncrono do SDK.
    Promise.resolve().then(() => setSession(session?.user || null)).catch(err => console.error('[Supabase profile]', err));
  });

  // Substitui a autenticação local por Supabase Auth.
  window.submitAccount = async function (event) {
    event.preventDefault();
    const email = document.getElementById('accountEmail').value.trim().toLowerCase();
    const password = document.getElementById('accountPassword').value;
    const name = document.getElementById('accountName').value.trim();
    const errEl = document.getElementById('accountError');
    const submit = document.getElementById('accountSubmit');
    errEl.textContent = '';
    submit.disabled = true;
    try {
      if (accountMode === 'register') {
        if (!name) throw new Error('Informe seu nome.');
        const { data, error } = await client.auth.signUp({
          email, password, options: { data: { display_name: name }, emailRedirectTo: location.origin + location.pathname }
        });
        if (error) throw error;
        if (data.session && data.user) {
          await setSession(data.user);
          closeAccount();
          if (typeof renderHome === 'function') renderHome();
        } else {
          errEl.textContent = 'Cadastro iniciado! Confira seu e-mail para confirmar a conta e depois entre.';
        }
      } else {
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await setSession(data.user);
        closeAccount();
        if (currentUser?.role === 'admin') location.href = 'admin.html';
        else if (typeof renderHome === 'function') renderHome();
      }
    } catch (error) {
      errEl.textContent = error?.message || 'Não foi possível autenticar. Confira os dados e tente novamente.';
    } finally {
      submit.disabled = false;
    }
  };
  window.logoutAccount = async function () {
    const { error } = await client.auth.signOut();
    if (error) { alert('Não foi possível sair: ' + error.message); return; }
    await setSession(null);
    alert('Você saiu da sua conta.');
  };

  // Espera a sessão ser lida antes de atualizar a interface inicial.
  window.addEventListener('load', () => {
    window.tnAuthReady.then(() => {
      if (typeof updateAccountButton === 'function') updateAccountButton();
    });
  });
})();
