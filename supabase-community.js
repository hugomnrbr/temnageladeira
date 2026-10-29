/* Comunidade do Tem na Geladeira: dados compartilhados pelo Supabase. */
(function () {
  'use strict';
  const style = document.createElement('style');
  style.textContent = `
    .community-wrap{max-width:1000px;margin:auto}.community-hero{background:linear-gradient(130deg,#e5f7e8,#fff2d8);border:1px solid #dcebdd;border-radius:22px;padding:24px;margin:10px 0 22px}
    .community-toolbar{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:14px 0}.community-toolbar input,.community-form input,.community-form textarea,.community-form select{width:100%;border:1px solid #dfe7de;border-radius:12px;padding:12px;background:#fff;color:#17382b;font:inherit}
    .community-toolbar input{flex:1;min-width:180px}.community-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}.community-user{background:#fff;border:1px solid #e8e9e1;border-radius:18px;padding:17px;text-align:center}.community-avatar{width:76px;height:76px;border-radius:50%;object-fit:cover;background:#e5f5e8;display:grid;place-items:center;font-size:35px;margin:0 auto 10px}.community-stats{display:flex;justify-content:center;gap:18px;color:#65786e;font-size:12px;margin:10px 0}.community-stats b{display:block;color:#064b30;font-size:17px}.community-profile-head{display:grid;grid-template-columns:100px 1fr;gap:18px;align-items:center;background:#fff;border:1px solid #e8e9e1;border-radius:20px;padding:20px;margin:14px 0}.community-profile-head .community-avatar{width:90px;height:90px;margin:0}.community-form{display:grid;gap:12px;background:#fff;border:1px solid #e8e9e1;border-radius:18px;padding:18px;margin:18px 0}.community-post{background:#fff;border:1px solid #e8e9e1;border-radius:18px;overflow:hidden}.community-post-image{height:150px;display:grid;place-items:center;background:#e5f5e8;font-size:55px;overflow:hidden}.community-post-image img{width:100%;height:100%;object-fit:cover}.community-post-body{padding:15px}.community-post-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.community-empty{background:#f3f7f1;padding:22px;border-radius:16px;color:#65786e;text-align:center;grid-column:1/-1}.community-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0}.community-tabs button{border-radius:22px;padding:9px 13px;background:#edf6ee;color:#064b30;font-weight:700}.community-tabs button.active{background:#07833f;color:#fff}.community-nav-dot{color:#ff941f}.community-note{font-size:12px;color:#65786e}.community-profile-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
    @media(max-width:600px){.community-hero{padding:18px}.community-profile-head{grid-template-columns:1fr;text-align:center;justify-items:center}.community-profile-head .community-avatar{margin:auto}.community-profile-actions{justify-content:center}}
  `;
  document.head.appendChild(style);

  function escHtml(v) { return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function safeImg(url) { return /^https?:\/\//i.test(String(url || '')) ? String(url) : ''; }
  function client() { return window.tnSupabase || null; }
  function me() { return window.currentUser || (typeof currentUser !== 'undefined' ? currentUser : null); }
  function goPage(id) { if (typeof go === 'function') go(id); }
  function getRecipes() { try { return typeof recipes !== 'undefined' && Array.isArray(recipes) ? recipes : []; } catch (_) { return []; } }

  function ensurePages() {
    const main = document.querySelector('main');
    if (!main || document.getElementById('page-community')) return;
    main.insertAdjacentHTML('beforeend', `
      <section class="page" id="page-community"><div class="community-wrap">
        <div class="page-title"><button class="back" onclick="go('home')">‹</button><h1>Comunidade</h1></div>
        <div class="community-hero"><h2>🍲 Cozinhe, compartilhe e descubra</h2><p>Encontre pessoas, siga cozinheiros e compartilhe suas receitas com a comunidade.</p><div class="community-toolbar"><input id="communitySearch" placeholder="Buscar pessoas ou receitas..." oninput="tnCommunitySearch()"><button class="btn btn-primary" onclick="tnCommunityShowPublish()">＋ Publicar receita</button></div></div>
        <div class="community-tabs"><button class="active" id="communityTabPeople" onclick="tnCommunityTab('people')">Pessoas</button><button id="communityTabRecipes" onclick="tnCommunityTab('recipes')">Receitas publicadas</button><button id="communityTabNotices" onclick="tnCommunityTab('notices')">🔔 Notificações</button></div>
        <div id="communityPublishArea"></div><div id="communityContent"><div class="community-empty">Carregando comunidade…</div></div>
      </div></section>
      <section class="page" id="page-community-profile"><div class="community-wrap"><div class="page-title"><button class="back" onclick="go('community')">‹</button><h1>Perfil</h1></div><div id="communityProfileContent" class="community-empty">Carregando perfil…</div></div></section>`);
    const nav = document.querySelector('.bottom-nav');
    if (nav && !document.getElementById('communityNav')) {
      const b = document.createElement('button');
      b.id = 'communityNav'; b.className = 'nav-item'; b.dataset.page = 'community';
      b.innerHTML = '<span class="navicon">♧</span>Comunidade';
      b.onclick = () => { goPage('community'); window.tnCommunityLoad(); };
      nav.appendChild(b);
    }
  }

  function avatar(p) {
    const url = safeImg(p.avatar_url);
    return url ? '<img class="community-avatar" src="' + escHtml(url) + '" alt="Foto de perfil">' : '<div class="community-avatar">👤</div>';
  }
  async function counts(uid) {
    const c = client();
    const [followers, following] = await Promise.all([
      c.from('user_follows').select('follower_id', {count:'exact',head:true}).eq('following_id', uid),
      c.from('user_follows').select('following_id', {count:'exact',head:true}).eq('follower_id', uid)
    ]);
    if (followers.error) throw followers.error;
    if (following.error) throw following.error;
    return {followers:followers.count || 0, following:following.count || 0};
  }
  async function listProfiles(term) {
    const c=client();
    let q=c.from('profiles').select('id,display_name,bio,avatar_url,role').order('display_name').limit(100);
    if (term) q=q.ilike('display_name','%' + term.replace(/[%_]/g,'') + '%');
    const {data,error}=await q;
    if(error) throw error;
    return data||[];
  }
  async function renderPeople() {
    const box=document.getElementById('communityContent'); if(!box)return;
    box.innerHTML='<div class="community-empty">Buscando pessoas…</div>';
    try {
      const user=me(); const term=document.getElementById('communitySearch')?.value.trim()||'';
      const people=(await listProfiles(term)).filter(p=>p.id!==(user?.id));
      const c=client(); let followed=new Set();
      if(user?.id){const {data,error}=await c.from('user_follows').select('following_id').eq('follower_id',user.id);if(error)throw error;followed=new Set((data||[]).map(x=>x.following_id));}
      const cards=await Promise.all(people.map(async p=>{
        let n={followers:0,following:0};try{n=await counts(p.id)}catch(_){}
        return '<article class="community-user">'+avatar(p)+'<h3>'+escHtml(p.display_name||'Usuário')+'</h3><p class="muted small">'+escHtml((p.bio||'Ainda não adicionou uma descrição.').slice(0,110))+'</p><div class="community-stats"><span><b>'+n.followers+'</b>seguidores</span><span><b>'+n.following+'</b>seguindo</span></div><div class="community-profile-actions"><button class="btn btn-light" onclick="tnCommunityOpenProfile('+JSON.stringify(p.id)+')">Ver perfil</button>'+(user?'<button class="btn btn-primary" onclick="tnCommunityFollow('+JSON.stringify(p.id)+')">'+(followed.has(p.id)?'Seguindo':'＋ Seguir')+'</button>':'')+'</div></article>';
      }));
      box.innerHTML=cards.join('')||'<div class="community-empty">Nenhuma pessoa encontrada ainda.</div>';
    } catch(e) { box.innerHTML='<div class="community-empty">Não foi possível carregar a comunidade. Confira se o SQL da comunidade já foi executado no Supabase.<br><small>'+escHtml(e.message)+'</small></div>'; }
  }
  async function renderRecipes() {
    const box=document.getElementById('communityContent'); if(!box)return;
    box.innerHTML='<div class="community-empty">Carregando receitas…</div>';
    try{
      const c=client(),term=document.getElementById('communitySearch')?.value.trim()||'';
      let q=c.from('community_recipes').select('id,author_id,title,description,category,prep_time,ingredients,steps,image_url,created_at').eq('status','approved').order('created_at',{ascending:false}).limit(60);
      if(term)q=q.ilike('title','%'+term.replace(/[%_]/g,'')+'%');
      const {data,error}=await q;if(error)throw error;
      const rows=data||[]; const ids=[...new Set(rows.map(x=>x.author_id))];
      let authors={};if(ids.length){const a=await c.from('profiles').select('id,display_name').in('id',ids);if(a.error)throw a.error;(a.data||[]).forEach(p=>authors[p.id]=p.display_name||'Usuário');}
      const cards=await Promise.all(rows.map(async r=>{
        let liked=false,saved=false;
        if(me()?.id){const [l,s]=await Promise.all([c.from('recipe_likes').select('recipe_id').eq('user_id',me().id).eq('recipe_id',r.id).maybeSingle(),c.from('recipe_saves').select('recipe_id').eq('user_id',me().id).eq('recipe_id',r.id).maybeSingle()]);liked=!!l.data;saved=!!s.data;}
        const img=safeImg(r.image_url);
        return '<article class="community-post"><div class="community-post-image">'+(img?'<img src="'+escHtml(img)+'" alt="">':'🍽️')+'</div><div class="community-post-body"><h3>'+escHtml(r.title)+'</h3><button class="profile-link" onclick="tnCommunityOpenProfile('+JSON.stringify(r.author_id)+')">Por '+escHtml(authors[r.author_id]||'Usuário')+'</button><p class="muted small">'+escHtml(r.description||r.category||'Receita da comunidade')+'</p><div class="community-post-actions">'+(me()?'<button class="btn btn-light" onclick="tnCommunityLike('+JSON.stringify(r.id)+')">'+(liked?'♥ Curtida':'♡ Curtir')+'</button><button class="btn btn-outline" onclick="tnCommunitySave('+JSON.stringify(r.id)+')">'+(saved?'✓ Salva':'＋ Salvar')+'</button>':'<button class="btn btn-light" onclick="openAccount()">Entre para interagir</button>')+'<button class="btn btn-primary" onclick="tnCommunityRecipe('+JSON.stringify(r.id)+')">Ver receita</button></div></div></article>';
      }));
      box.innerHTML=cards.join('')||'<div class="community-empty">Ainda não há receitas aprovadas. Seja a primeira pessoa a compartilhar!</div>';
    }catch(e){box.innerHTML='<div class="community-empty">Não foi possível carregar as receitas. '+escHtml(e.message)+'</div>'}
  }
  window.tnCommunityTab = function(tab) {
    ['people','recipes','notices'].forEach(x=>{const b=document.getElementById('communityTab'+x[0].toUpperCase()+x.slice(1));if(b)b.classList.toggle('active',x===tab)});
    if(tab==='people')renderPeople(); else if(tab==='recipes')renderRecipes(); else renderNotifications();
  };
  window.tnCommunityLoad = function(){ensurePages();window.tnCommunityTab('people');};
  window.tnCommunitySearch = function(){const active=document.querySelector('.community-tabs button.active')?.id||'';window.tnCommunityTab(active.includes('Recipes')?'recipes':'people');};
  window.tnCommunityFollow = async function(id) {
    const user=me(),c=client(); if(!user){if(typeof openAccount==='function')openAccount();return}
    try{const {data,error}=await c.from('user_follows').select('following_id').eq('follower_id',user.id).eq('following_id',id).maybeSingle();if(error)throw error;
      const res=data?await c.from('user_follows').delete().eq('follower_id',user.id).eq('following_id',id):await c.from('user_follows').insert({follower_id:user.id,following_id:id});
      if(res.error)throw res.error; if(document.getElementById('page-community-profile')?.classList.contains('active'))await window.tnCommunityOpenProfile(id);else await renderPeople();
    }catch(e){alert('Não foi possível atualizar o seguimento: '+e.message)}
  };
  window.tnCommunityOpenProfile = async function(id) {
    ensurePages(); const box=document.getElementById('communityProfileContent');box.innerHTML='<div class="community-empty">Carregando perfil…</div>';goPage('community-profile');
    try{
      const c=client(),{data:p,error}=await c.from('profiles').select('id,display_name,bio,avatar_url,role').eq('id',id).single();if(error)throw error;
      const n=await counts(id),user=me(),own=user?.id===id;let following=false;
      if(user&&!own){const f=await c.from('user_follows').select('following_id').eq('follower_id',user.id).eq('following_id',id).maybeSingle();if(f.error)throw f.error;following=!!f.data;}
      const [posts,saves]=await Promise.all([c.from('community_recipes').select('id,title,category,description,image_url,created_at').eq('author_id',id).eq('status','approved').order('created_at',{ascending:false}),own?c.from('user_recipe_collections').select('recipe_key,recipe_title,recipe_category,recipe_snapshot,is_favorite,is_saved').eq('user_id',id):Promise.resolve({data:[],error:null})]);
      if(posts.error)throw posts.error;if(saves.error)throw saves.error;
      const favs=(saves.data||[]).filter(x=>x.is_favorite),saved=(saves.data||[]).filter(x=>x.is_saved);
      box.innerHTML='<div class="community-profile-head">'+avatar(p)+'<div><h2>'+escHtml(p.display_name||'Usuário')+'</h2><p>'+escHtml(p.bio||'Ainda não adicionou uma descrição.')+'</p><div class="community-stats"><span><b>'+n.followers+'</b>seguidores</span><span><b>'+n.following+'</b>seguindo</span><span><b>'+posts.data.length+'</b>receitas</span></div><div class="community-profile-actions">'+(!own&&user?'<button class="btn btn-primary" onclick="tnCommunityFollow('+JSON.stringify(id)+')">'+(following?'✓ Seguindo':'＋ Seguir')+'</button>':'')+(own?'<button class="btn btn-outline" onclick="tnCommunityEditProfile()">Editar meu perfil</button>':'')+'</div></div></div><div id="communityEditArea"></div><div class="section"><h2>🍲 Receitas publicadas</h2><div class="community-grid">'+(posts.data.length?posts.data.map(r=>'<article class="community-post"><div class="community-post-image">'+(safeImg(r.image_url)?'<img src="'+escHtml(r.image_url)+'" alt="">':'🍽️')+'</div><div class="community-post-body"><h3>'+escHtml(r.title)+'</h3><p class="muted small">'+escHtml(r.category)+'</p><button class="btn btn-light" onclick="tnCommunityRecipe('+JSON.stringify(r.id)+')">Ver receita</button></div></article>').join(''):'<div class="community-empty">Ainda não publicou receitas.</div>')+'</div></div>'+(own?'<div class="section"><h2>♡ Favoritas e salvas</h2><div class="community-grid">'+(favs.length||saved.length?(saves.data||[]).filter(x=>x.is_favorite||x.is_saved).map(x=>'<article class="community-user"><h3>'+escHtml(x.recipe_title)+'</h3><p class="muted small">'+escHtml(x.recipe_category)+'</p><span class="pill">'+(x.is_favorite?'♥ Favorita':'')+(x.is_favorite&&x.is_saved?' · ':'')+(x.is_saved?'▣ Salva':'')+'</span></article>').join(''):'<div class="community-empty">Suas receitas salvas e favoritas aparecerão aqui.</div>')+'</div></div>':'');
    }catch(e){box.innerHTML='<div class="community-empty">Não foi possível abrir este perfil. '+escHtml(e.message)+'</div>'}
  };
  window.tnCommunityEditProfile = async function(){
    const u=me();if(!u)return;const c=client();const {data:p,error}=await c.from('profiles').select('display_name,bio,avatar_url').eq('id',u.id).single();if(error){alert(error.message);return}
    document.getElementById('communityEditArea').innerHTML='<form class="community-form" onsubmit="tnCommunitySaveProfile(event)"><h3>Editar perfil</h3><label>Nome<input id="communityDisplayName" required maxlength="80" value="'+escHtml(p.display_name||'')+'"></label><label>Sobre mim<textarea id="communityBio" maxlength="400" rows="3">'+escHtml(p.bio||'')+'</textarea></label><label>Link da foto (URL)<input id="communityAvatarUrl" type="url" placeholder="https://..." value="'+escHtml(p.avatar_url||'')+'"></label><button class="btn btn-primary" type="submit">Salvar alterações</button></form>';
  };
  window.tnCommunitySaveProfile = async function(e){e.preventDefault();const u=me(),c=client();if(!u)return;const avatar=document.getElementById('communityAvatarUrl').value.trim();if(avatar&&!safeImg(avatar)){alert('Use um link de imagem iniciado por https:// ou http://');return}
    const {error}=await c.from('profiles').update({display_name:document.getElementById('communityDisplayName').value.trim(),bio:document.getElementById('communityBio').value.trim(),avatar_url:avatar||null,updated_at:new Date().toISOString()}).eq('id',u.id);
    if(error){alert('Não foi possível salvar o perfil: '+error.message);return}alert('Perfil atualizado!');await window.tnCommunityOpenProfile(u.id);
  };
  window.tnCommunityShowPublish = function(){
    if(!me()){if(typeof openAccount==='function')openAccount();return}
    document.getElementById('communityPublishArea').innerHTML='<form class="community-form" onsubmit="tnCommunityPublish(event)"><h3>Publicar receita</h3><p class="community-note">A receita ficará pendente até a aprovação da administração.</p><label>Nome da receita<input id="cpTitle" required maxlength="120"></label><label>Descrição<textarea id="cpDescription" rows="2" maxlength="500"></textarea></label><label>Categoria<select id="cpCategory"><option>Almoço e jantar</option><option>Café da manhã</option><option>Lanches</option><option>Bolos e tortas</option><option>Sobremesas</option><option>Salgados e petiscos</option><option>Outras</option></select></label><label>Tempo de preparo<input id="cpTime" placeholder="30 minutos"></label><label>Ingredientes (um por linha)<textarea id="cpIngredients" required rows="4"></textarea></label><label>Modo de preparo (um passo por linha)<textarea id="cpSteps" required rows="4"></textarea></label><label>Foto (URL opcional)<input id="cpImage" type="url" placeholder="https://..."></label><button class="btn btn-primary" type="submit">Enviar para aprovação</button></form>';
    document.getElementById('communityPublishArea').scrollIntoView({behavior:'smooth',block:'start'});
  };
  window.tnCommunityPublish = async function(e){e.preventDefault();const u=me(),c=client();if(!u){if(typeof openAccount==='function')openAccount();return}
    const ingredients=document.getElementById('cpIngredients').value.split('\n').map(x=>x.trim()).filter(Boolean),steps=document.getElementById('cpSteps').value.split('\n').map(x=>x.trim()).filter(Boolean),img=document.getElementById('cpImage').value.trim();
    if(img&&!safeImg(img)){alert('O link da foto precisa começar com http:// ou https://');return}
    const {error}=await c.from('community_recipes').insert({author_id:u.id,title:document.getElementById('cpTitle').value.trim(),description:document.getElementById('cpDescription').value.trim(),category:document.getElementById('cpCategory').value,prep_time:document.getElementById('cpTime').value.trim(),ingredients,steps,image_url:img||null,status:'pending'});
    if(error){alert('Não foi possível enviar a receita: '+error.message);return}document.getElementById('communityPublishArea').innerHTML='';alert('Receita enviada! Ela aparecerá na comunidade após a aprovação da administração.');window.tnCommunityTab('recipes');
  };
  window.tnCommunityRecipe = async function(id){const c=client(),box=document.getElementById('communityContent');if(!box)return;
    try{const {data:r,error}=await c.from('community_recipes').select('*').eq('id',id).single();if(error)throw error;const author=await c.from('profiles').select('display_name').eq('id',r.author_id).maybeSingle();if(author.error)throw author.error;
      box.innerHTML='<div class="community-form"><button class="btn btn-outline" onclick="tnCommunityTab(\'recipes\')">‹ Voltar às receitas</button><h1>'+escHtml(r.title)+'</h1><p class="muted">Por '+escHtml(author.data?.display_name||'Usuário')+' · '+escHtml(r.prep_time||'Tempo não informado')+'</p>'+(safeImg(r.image_url)?'<img src="'+escHtml(r.image_url)+'" alt="" style="width:100%;max-height:320px;object-fit:cover;border-radius:14px">':'')+'<p>'+escHtml(r.description||'')+'</p><h2>Ingredientes</h2><ul>'+((r.ingredients||[]).map(x=>'<li>'+escHtml(x)+'</li>').join(''))+'</ul><h2>Modo de preparo</h2><ol>'+((r.steps||[]).map(x=>'<li>'+escHtml(x)+'</li>').join(''))+'</ol></div>';
    }catch(e){alert('Não foi possível abrir a receita: '+e.message)}
  };
  window.tnCommunityLike = async function(id){const u=me(),c=client();if(!u)return;if(!confirm('Alterar sua curtida nesta receita?'))return;const {data,error}=await c.from('recipe_likes').select('recipe_id').eq('user_id',u.id).eq('recipe_id',id).maybeSingle();if(error){alert(error.message);return}const res=data?await c.from('recipe_likes').delete().eq('user_id',u.id).eq('recipe_id',id):await c.from('recipe_likes').insert({user_id:u.id,recipe_id:id});if(res.error){alert(res.error.message);return}renderRecipes()};
  window.tnCommunitySave = async function(id){const u=me(),c=client();if(!u)return;const {data,error}=await c.from('recipe_saves').select('recipe_id').eq('user_id',u.id).eq('recipe_id',id).maybeSingle();if(error){alert(error.message);return}const res=data?await c.from('recipe_saves').delete().eq('user_id',u.id).eq('recipe_id',id):await c.from('recipe_saves').insert({user_id:u.id,recipe_id:id});if(res.error){alert(res.error.message);return}renderRecipes()};
  async function renderNotifications(){const box=document.getElementById('communityContent'),u=me();if(!u){box.innerHTML='<div class="community-empty">Entre na sua conta para ver notificações.</div>';return}const c=client(),{data,error}=await c.from('community_notifications').select('id,message,is_read,created_at').eq('recipient_id',u.id).order('created_at',{ascending:false}).limit(50);if(error){box.innerHTML='<div class="community-empty">'+escHtml(error.message)+'</div>';return}box.innerHTML=(data||[]).length?(data||[]).map(n=>'<article class="community-user" style="text-align:left;margin-bottom:10px"><b>'+(n.is_read?'':'🔔 ')+escHtml(n.message)+'</b><p class="small muted">'+new Date(n.created_at).toLocaleString('pt-BR')+'</p></article>').join(''):'<div class="community-empty">Você ainda não tem notificações.</div>';await c.from('community_notifications').update({is_read:true}).eq('recipient_id',u.id).eq('is_read',false)}
  const originalFavorite = window.toggleFavorite;
  window.toggleFavorite = function(id) {
    if (typeof originalFavorite === 'function') originalFavorite(id);
    const u=me(),c=client(); if(!u||!c)return;
    try {
      const r=getRecipes().find(x=>String(x.id)===String(id));if(!r)return;
      const fav=typeof favorites!=='undefined'&&favorites.has(id);
      c.from('user_recipe_collections').select('recipe_key').eq('user_id',u.id).eq('recipe_key',String(id)).maybeSingle().then(({data,error})=>{
        if(error){console.warn('[TN community favorites]',error.message);return}
        const payload={user_id:u.id,recipe_key:String(id),recipe_title:r.name||r.title||'Receita',recipe_category:r.category||'',recipe_snapshot:r,is_favorite:!!fav,is_saved:true,updated_at:new Date().toISOString()};
        if(data){if(!fav)c.from('user_recipe_collections').update(payload).eq('user_id',u.id).eq('recipe_key',String(id)).then(()=>{});else c.from('user_recipe_collections').update(payload).eq('user_id',u.id).eq('recipe_key',String(id)).then(()=>{});}
        else c.from('user_recipe_collections').insert(payload).then(({error:e})=>{if(e)console.warn('[TN community favorites]',e.message)});
      });
    } catch(e){console.warn(e)}
  };
  const originalUpdateAccountButton = window.updateAccountButton;
  window.updateAccountButton = function(){
    if(typeof originalUpdateAccountButton==='function')originalUpdateAccountButton();
    const b=document.getElementById('accountBtn'),u=me();if(!b)return;
    if(u && u.role!=='admin' && u.role!=='master'){b.textContent='👤 '+(u.name||'Perfil').split(' ')[0];b.onclick=()=>window.tnCommunityOpenProfile(u.id)}
  };
  window.addEventListener('load',()=>{ensurePages();setTimeout(()=>{if(typeof window.tnAuthReady!=='undefined')window.tnAuthReady.then(()=>{const u=me();if(u&&client())syncFavorites(u).catch(()=>{});});},300)});
  async function syncFavorites(u){
    const c=client();let ids=[];try{ids=typeof favorites!=='undefined'?[...favorites]:[]}catch(_){}
    for(const id of ids){const r=getRecipes().find(x=>String(x.id)===String(id));if(!r)continue;
      const {data}=await c.from('user_recipe_collections').select('recipe_key').eq('user_id',u.id).eq('recipe_key',String(id)).maybeSingle();
      const payload={user_id:u.id,recipe_key:String(id),recipe_title:r.name||r.title||'Receita',recipe_category:r.category||'',recipe_snapshot:r,is_favorite:true,is_saved:true,updated_at:new Date().toISOString()};
      if(data)await c.from('user_recipe_collections').update(payload).eq('user_id',u.id).eq('recipe_key',String(id));else await c.from('user_recipe_collections').insert(payload);
    }
  }
  ensurePages();
  const oldGo=window.go;
  if(typeof oldGo==='function')window.go=function(id){oldGo(id);if(id==='community')window.tnCommunityLoad();};
})();
