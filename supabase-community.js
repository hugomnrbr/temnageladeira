/* Comunidade do Tem na Geladeira: dados compartilhados pelo Supabase. */
(function () {
  'use strict';
  const style = document.createElement('style');
  style.textContent = `
    @media(max-width:500px){.topbar{gap:5px;min-width:0}.topbar .brand{min-width:0;flex:0 1 auto}.topbar .brand .logo{width:48px!important;height:48px!important}.top-actions{min-width:0;flex:0 0 auto;gap:3px!important}.account-btn{padding:8px 9px!important;font-size:11px!important;letter-spacing:-.2px;flex:0 0 auto}.top-actions .icon-btn{padding:5px!important;font-size:19px!important}#adminPanelShortcut{margin-left:0!important}}
  ` + `
    .community-wrap{max-width:1000px;margin:auto}.community-hero{background:linear-gradient(130deg,#e5f7e8,#fff2d8);border:1px solid #dcebdd;border-radius:22px;padding:24px;margin:10px 0 22px}
    .community-toolbar{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:14px 0}.community-toolbar input,.community-form input,.community-form textarea,.community-form select{width:100%;border:1px solid #dfe7de;border-radius:12px;padding:12px;background:#fff;color:#17382b;font:inherit}
    .community-toolbar input{flex:1;min-width:180px}.community-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px}.community-user{background:#fff;border:1px solid #e8e9e1;border-radius:18px;padding:17px;text-align:center}.community-avatar{width:76px;height:76px;border-radius:50%;object-fit:cover;background:#e5f5e8;display:grid;place-items:center;font-size:35px;margin:0 auto 10px}.community-stats{display:flex;justify-content:center;gap:18px;color:#65786e;font-size:12px;margin:10px 0}.community-stats b{display:block;color:#064b30;font-size:17px}.community-profile-head{display:grid;grid-template-columns:100px 1fr;gap:18px;align-items:center;background:#fff;border:1px solid #e8e9e1;border-radius:20px;padding:20px;margin:14px 0}.community-profile-head .community-avatar{width:90px;height:90px;margin:0}.community-form{display:grid;gap:12px;background:#fff;border:1px solid #e8e9e1;border-radius:18px;padding:18px;margin:18px 0}.community-post{background:#fff;border:1px solid #e8e9e1;border-radius:18px;overflow:hidden}.community-post-image{height:150px;display:grid;place-items:center;background:#e5f5e8;font-size:55px;overflow:hidden}.community-post-image img{width:100%;height:100%;object-fit:cover}.community-post-body{padding:15px}.community-post-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.community-empty{background:#f3f7f1;padding:22px;border-radius:16px;color:#65786e;text-align:center;grid-column:1/-1}.community-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0}.community-tabs button{border-radius:22px;padding:9px 13px;background:#edf6ee;color:#064b30;font-weight:700}.community-tabs button.active{background:#07833f;color:#fff}.community-nav-dot{color:#ff941f}.community-note{font-size:12px;color:#65786e}.community-profile-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
    @media(max-width:600px){.community-hero{padding:18px}.community-profile-head{grid-template-columns:1fr;text-align:center;justify-items:center}.community-profile-head .community-avatar{margin:auto}.community-profile-actions{justify-content:center}}
  ` + `
    .tn-rating-popover{position:absolute;z-index:9999;top:calc(100% + 6px);left:50%;transform:translateX(-50%);background:#fff;border:1px solid #dfe7de;box-shadow:0 5px 18px #173b2422;border-radius:14px;padding:10px 14px;white-space:nowrap;text-align:center}.tn-rating-popover>div{display:flex;gap:4px}.tn-rating-popover button{background:#f0f6ed;color:#e5a000;border:0;border-radius:8px;padding:5px 8px;font-size:23px}.recipe-card .social-actions{position:relative}.rating-stars button{background:#f0f6ed;border:0;border-radius:8px;color:#e5a000;font-size:24px;padding:3px 7px}.rating-stars button.selected{color:#e5a000}.comment-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:6px}.comment-actions button{border:0;border-radius:9px;padding:6px 10px;font-size:12px;font-weight:700}.comment-delete{background:#ffebeb;color:#a32424}.comment-report{background:#fff4df;color:#8a5a00}.comment-row{padding:12px 0;border-bottom:1px solid #edf1e9}.comment-row p{margin:6px 0}
    .tn-profile-favorite-scroll{max-height:430px;overflow-y:auto;overscroll-behavior:contain;padding:4px 6px 8px;scrollbar-width:thin;scrollbar-color:#9bbca2 #edf3ed}.tn-profile-favorite-scroll.expanded{max-height:70vh}.tn-profile-favorite-more{margin-top:10px;width:100%}
    .community-stat-link{border:0;background:transparent;color:inherit;padding:0 4px;display:flex;flex-direction:column;align-items:center;cursor:pointer;font:inherit}.community-stat-link span{text-decoration:underline;text-underline-offset:3px}
    .tn-follow-overlay{display:none;position:fixed;inset:0;z-index:99999;background:#0008;align-items:center;justify-content:center;padding:16px}.tn-follow-overlay.open{display:flex}.tn-follow-dialog{width:min(100%,430px);max-height:80vh;background:#fff;border-radius:20px;padding:18px;display:flex;flex-direction:column}.tn-follow-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}.tn-follow-header h2{margin:0;font-size:20px}.tn-follow-header button{border:0;border-radius:50%;width:34px;height:34px;font-size:23px;background:#f1f5ef}.tn-follow-search{width:100%;padding:12px;border:1px solid #dfe7de;border-radius:12px;margin-bottom:12px;font:inherit}.tn-follow-list{overflow:auto;min-height:80px}.tn-follow-person{display:flex;align-items:center;gap:11px;padding:10px 2px;border-bottom:1px solid #edf1e9}.tn-follow-person[hidden]{display:none}.tn-follow-person .community-avatar{width:46px;height:46px;flex:0 0 46px;margin:0}.tn-follow-person-info{min-width:0;flex:1;display:flex;flex-direction:column;gap:3px}.tn-follow-person-info b{overflow-wrap:anywhere}.tn-follow-person-info small{color:#718078;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.tn-follow-action{border:0;border-radius:20px;background:#07833f;color:#fff;padding:8px 13px;font-weight:700;white-space:nowrap}
  `;
  document.head.appendChild(style);

  function inlineArg(v) { return "'" + String(v ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'"; }
  function escHtml(v) { return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function safeImg(url) { const v=String(url||'').trim(); return (/^https?:\/\//i.test(v)||/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(v))?v:''; }
  window.tnCommunityReadImage=function(input,targetId){const file=input&&input.files&&input.files[0];if(!file)return;if(!/^image\//i.test(file.type)){alert('Escolha um arquivo de imagem.');input.value='';return;}if(file.size>450*1024){alert('A imagem deve ter até 450 KB.');input.value='';return;}const reader=new FileReader();reader.onload=()=>{const target=document.getElementById(targetId);if(target)target.value=String(reader.result||'')};reader.onerror=()=>alert('Não foi possível ler a imagem.');reader.readAsDataURL(file)};
  function client() { return window.tnSupabase || null; }
  function me() { return window.currentUser || (typeof currentUser !== 'undefined' ? currentUser : null); }
  async function waitForAuth() { try { if (window.tnAuthReady) await window.tnAuthReady; } catch (e) { console.warn('[TN community auth]', e); } return me(); }
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
      const user=await waitForAuth(); const term=document.getElementById('communitySearch')?.value.trim()||'';
      const people=(await listProfiles(term)).filter(p=>p.id!==(user?.id));
      const c=client(); let followed=new Set();
      if(user?.id){const {data,error}=await c.from('user_follows').select('following_id').eq('follower_id',user.id);if(error)throw error;followed=new Set((data||[]).map(x=>x.following_id));}
      const cards=await Promise.all(people.map(async p=>{
        let n={followers:0,following:0};try{n=await counts(p.id)}catch(_){}
        return '<article class="community-user">'+avatar(p)+'<h3>'+escHtml(p.display_name||'Usuário')+'</h3><p class="muted small">'+escHtml((p.bio||'Ainda não adicionou uma descrição.').slice(0,110))+'</p><div class="community-stats"><span><b>'+n.followers+'</b>seguidores</span><span><b>'+n.following+'</b>seguindo</span></div><div class="community-profile-actions"><button class="btn btn-light" onclick="tnCommunityOpenProfile('+inlineArg(p.id)+')">Ver perfil</button>'+(user?'<button class="btn btn-primary" onclick="tnCommunityFollow('+inlineArg(p.id)+')">'+(followed.has(p.id)?'Seguindo':'＋ Seguir')+'</button>':'')+'</div></article>';
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
        return '<article class="community-post"><div class="community-post-image">'+(img?'<img src="'+escHtml(img)+'" alt="">':'🍽️')+'</div><div class="community-post-body"><h3>'+escHtml(r.title)+'</h3><button class="profile-link" onclick="tnCommunityOpenProfile('+inlineArg(r.author_id)+')">Por '+escHtml(authors[r.author_id]||'Usuário')+'</button><p class="muted small">'+escHtml(r.description||r.category||'Receita da comunidade')+'</p><div class="community-post-actions">'+(me()?'<button class="btn btn-light" onclick="tnCommunityLike('+inlineArg(r.id)+')">'+(liked?'♥ Curtida':'♡ Curtir')+'</button><button class="btn btn-outline" onclick="tnCommunitySave('+inlineArg(r.id)+')">'+(saved?'✓ Salva':'＋ Salvar')+'</button>':'<button class="btn btn-light" onclick="openAccount()">Entre para interagir</button>')+'<button class="btn btn-primary" onclick="tnCommunityRecipe('+inlineArg(r.id)+')">Ver receita</button></div></div></article>';
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
    const user=await waitForAuth(),c=client();if(!user?.id){if(typeof openAccount==='function')openAccount();return}
    if(!c){alert('Não foi possível conectar à comunidade. Confira a configuração do Supabase.');return}
    if(String(user.id)===String(id)){alert('Você já está no seu próprio perfil.');return}
    try{
      const {data,error}=await c.from('user_follows').select('following_id').eq('follower_id',user.id).eq('following_id',id).maybeSingle();if(error)throw error;
      const res=data?await c.from('user_follows').delete().eq('follower_id',user.id).eq('following_id',id):await c.from('user_follows').insert({follower_id:user.id,following_id:id});
      if(res.error)throw res.error;
      if(document.getElementById('page-community-profile')?.classList.contains('active'))await window.tnCommunityOpenProfile(id);else await renderPeople();
    }catch(e){console.error('[TN follow]',e);alert('Não foi possível atualizar o seguimento. '+(e.message||'Verifique se o SQL atualizado da comunidade foi executado no Supabase.'))}
  };

  window.tnCommunityShowFollowList = async function(uid, mode) {
    const c=client(); if(!c){alert('Supabase não está conectado.');return;}
    const kind=mode==='followers'?'followers':'following';
    let modal=document.getElementById('tnFollowListModal');
    if(!modal){modal=document.createElement('div');modal.id='tnFollowListModal';modal.className='tn-follow-overlay';modal.innerHTML='<div class="tn-follow-dialog"><div class="tn-follow-header"><h2 id="tnFollowTitle"></h2><button type="button" onclick="tnCommunityCloseFollowList()">×</button></div><input id="tnFollowSearch" class="tn-follow-search" placeholder="Buscar pessoas..." oninput="tnCommunityFilterFollowList()"><div id="tnFollowListBody" class="tn-follow-list"></div></div>';document.body.appendChild(modal);modal.addEventListener('click',e=>{if(e.target===modal)tnCommunityCloseFollowList();});}
    modal.dataset.userId=String(uid);modal.dataset.mode=kind;
    document.getElementById('tnFollowTitle').textContent=kind==='followers'?'Seguidores':'Seguindo';
    document.getElementById('tnFollowSearch').value='';
    document.getElementById('tnFollowListBody').innerHTML='<div class="community-empty">Carregando pessoas…</div>';
    modal.classList.add('open');
    try {
      const col=kind==='followers'?'follower_id':'following_id', filter=kind==='followers'?'following_id':'follower_id';
      const links=await c.from('user_follows').select(col).eq(filter,uid);
      if(links.error)throw links.error;
      const ids=[...new Set((links.data||[]).map(x=>x[col]).filter(Boolean))];
      if(!ids.length){document.getElementById('tnFollowListBody').innerHTML='<div class="community-empty">'+(kind==='followers'?'Ainda não há seguidores.':'Esta pessoa ainda não segue ninguém.')+'</div>';return;}
      const result=await c.from('profiles').select('id,display_name,bio,avatar_url').in('id',ids);
      if(result.error)throw result.error;
      const byId=new Map((result.data||[]).map(p=>[p.id,p]));
      const people=ids.map(id=>byId.get(id)).filter(Boolean);
      const meUser=me(); let followed=new Set();
      if(meUser?.id){const f=await c.from('user_follows').select('following_id').eq('follower_id',meUser.id);if(f.error)throw f.error;followed=new Set((f.data||[]).map(x=>x.following_id));}
      document.getElementById('tnFollowListBody').innerHTML=people.map(p=>'<div class="tn-follow-person">'+avatar(p)+'<div class="tn-follow-person-info"><b>'+escHtml(p.display_name||'Usuário')+'</b><small>'+escHtml(p.bio||'')+'</small></div>'+(meUser?.id&&meUser.id!==p.id?'<button class="tn-follow-action" onclick="tnCommunityFollowFromList('+inlineArg(p.id)+')">'+(followed.has(p.id)?'Seguindo':'Seguir')+'</button>':'')+'</div>').join('')||'<div class="community-empty">Nenhum perfil encontrado.</div>';
    } catch(e){document.getElementById('tnFollowListBody').innerHTML='<div class="community-empty">Não foi possível carregar a lista. '+escHtml(e.message)+'</div>';}
  };
  window.tnCommunityFilterFollowList=function(){const q=(document.getElementById('tnFollowSearch')?.value||'').toLocaleLowerCase('pt-BR');document.querySelectorAll('#tnFollowListBody .tn-follow-person').forEach(el=>{el.hidden=!el.textContent.toLocaleLowerCase('pt-BR').includes(q);});};
  window.tnCommunityCloseFollowList=function(){document.getElementById('tnFollowListModal')?.classList.remove('open');};
  window.tnCommunityFollowFromList=async function(id){const modal=document.getElementById('tnFollowListModal');await window.tnCommunityFollow(id);if(modal?.classList.contains('open'))await window.tnCommunityShowFollowList(modal.dataset.userId,modal.dataset.mode);};
  window.tnCommunityOpenMyProfile = async function() {
    try {
      const user=await waitForAuth();
      if(!user?.id){if(typeof window.openAccount==='function')window.openAccount();else alert('Entre na sua conta para abrir seu perfil.');return;}
      await window.tnCommunityOpenProfile(user.id);
    } catch(e) { console.error('[TN community] profile shortcut:',e); alert('Não foi possível abrir seu perfil agora.'); }
  };
  window.tnCommunityOpenProfile = async function(id) {
    await waitForAuth();ensurePages(); const box=document.getElementById('communityProfileContent');box.innerHTML='<div class="community-empty">Carregando perfil…</div>';goPage('community-profile');
    try{
      const c=client();if(!c)throw new Error('Supabase não está conectado.');const {data:p,error}=await c.from('profiles').select('id,display_name,bio,avatar_url,role').eq('id',id).maybeSingle();if(error)throw error;if(!p)throw new Error('Este perfil ainda não foi criado. Peça à pessoa para entrar novamente no aplicativo.');
      const n=await counts(id),user=me(),own=user?.id===id;let following=false;
      if(user&&!own){const f=await c.from('user_follows').select('following_id').eq('follower_id',user.id).eq('following_id',id).maybeSingle();if(f.error)throw f.error;following=!!f.data;}
      const postsQuery=c.from('community_recipes').select('id,title,category,description,image_url,created_at').eq('author_id',id);if(!own)postsQuery.eq('status','approved');const [posts,saves]=await Promise.all([postsQuery.order('created_at',{ascending:false}),own?c.from('user_recipe_collections').select('recipe_key,recipe_title,recipe_category,recipe_snapshot,is_favorite,is_saved').eq('user_id',id):Promise.resolve({data:[],error:null})]);
      if(posts.error)throw posts.error;if(saves.error)throw saves.error;
      const favs=(saves.data||[]).filter(x=>x.is_favorite),saved=(saves.data||[]).filter(x=>x.is_saved);
      box.innerHTML='<div class="community-profile-head">'+avatar(p)+'<div><h2>'+escHtml(p.display_name||'Usuário')+'</h2><p>'+escHtml(p.bio||'Ainda não adicionou uma descrição.')+'</p><div class="community-stats"><button type="button" class="community-stat-link" onclick="tnCommunityShowFollowList('+inlineArg(id)+',\'followers\')"><b>'+n.followers+'</b><span>seguidores</span></button><button type="button" class="community-stat-link" onclick="tnCommunityShowFollowList('+inlineArg(id)+',\'following\')"><b>'+n.following+'</b><span>seguindo</span></button><span><b>'+posts.data.length+'</b>receitas</span></div><div class="community-profile-actions">'+(!own&&user?'<button class="btn btn-primary" onclick="tnCommunityFollow('+inlineArg(id)+')">'+(following?'✓ Seguindo':'＋ Seguir')+'</button>':'')+(own?'<button class="btn btn-outline" onclick="tnCommunityEditProfile()">Editar meu perfil</button>':'')+'</div></div></div><div id="communityEditArea"></div><div class="section"><h2>🍲 Receitas publicadas</h2><div class="community-grid">'+(posts.data.length?posts.data.map(r=>'<article class="community-post"><div class="community-post-image">'+(safeImg(r.image_url)?'<img src="'+escHtml(r.image_url)+'" alt="">':'🍽️')+'</div><div class="community-post-body"><h3>'+escHtml(r.title)+'</h3><p class="muted small">'+escHtml(r.category)+'</p><button class="btn btn-light" onclick="tnCommunityRecipe('+inlineArg(r.id)+')">Ver receita</button></div></article>').join(''):'<div class="community-empty">Ainda não publicou receitas.</div>')+'</div></div>'+(own?'<div class="section"><h2>♡ Favoritas e salvas</h2><div id="tnProfileFavoriteScroll" class="community-grid tn-profile-favorite-scroll">'+(favs.length||saved.length?(saves.data||[]).filter(x=>x.is_favorite||x.is_saved).map(x=>'<article class="community-post"><div class="community-post-body"><h3>'+escHtml(x.recipe_title)+'</h3><p class="muted small">'+escHtml(x.recipe_category)+'</p><span class="pill">'+(x.is_favorite?'♥ Favorita':'')+(x.is_favorite&&x.is_saved?' · ':'')+(x.is_saved?'▣ Salva':'')+'</span><div class="community-profile-actions"><button class="btn btn-primary" onclick="tnCommunityOpenSavedRecipe('+inlineArg(String(x.recipe_key))+')">Ver receita</button>'+(x.is_favorite?'<button class="btn btn-outline" onclick="tnCommunityRemoveFavorite('+inlineArg(String(x.recipe_key))+')">♡ Remover dos favoritos</button>':'')+'</div></div></article>').join(''):'<div class="community-empty">Suas receitas salvas e favoritas aparecerão aqui.</div>')+'</div><button id="tnProfileFavoriteMore" class="btn btn-light tn-profile-favorite-more" onclick="tnCommunityToggleFavoriteList()">Ver mais receitas</button></div>':'');
    }catch(e){box.innerHTML='<div class="community-empty">Não foi possível abrir este perfil. '+escHtml(e.message)+'</div>'}
  };
  window.tnCommunityRefreshFavoriteButton = async function(id){
    const u=me(),c=client();if(!u?.id||!c)return;
    try{if(window.__tnFavoriteSyncs?.[String(id)])await window.__tnFavoriteSyncs[String(id)];const q=await c.from('user_recipe_collections').select('is_favorite').eq('user_id',u.id).eq('recipe_key',String(id)).maybeSingle();if(q.error)throw q.error;
      const btn=document.querySelector('#detailContent .detail-info > button.btn.full');if(!btn)return;const fav=!!q.data?.is_favorite;try{if(typeof favorites!=='undefined'){if(fav)favorites.add(Number(id));else favorites.delete(Number(id));localStorage.setItem('tn_favs',JSON.stringify([...favorites]));}}catch(_){}
      btn.classList.toggle('btn-orange',fav);btn.classList.toggle('btn-light',!fav);btn.textContent=fav?'♥ Salvo nas favoritas':'♡ Adicionar aos favoritos';
    }catch(e){console.warn('[TN favorite state]',e.message);}
  };
  window.tnCommunityRemoveFavorite = async function(key){
    const u=me(),c=client();if(!u?.id||!c){alert('Entre na sua conta para alterar suas favoritas.');return;}
    try{const q=await c.from('user_recipe_collections').update({is_favorite:false,is_saved:false,updated_at:new Date().toISOString()}).eq('user_id',u.id).eq('recipe_key',String(key));if(q.error)throw q.error;try{if(typeof favorites!=='undefined'){favorites.delete(Number(key));localStorage.setItem('tn_favs',JSON.stringify([...favorites]));}}catch(_){}await window.tnCommunityOpenProfile(u.id);}
    catch(e){alert('Não foi possível remover dos favoritos: '+e.message);}
  };
  window.tnCommunityToggleFavoriteList = function(){const box=document.getElementById('tnProfileFavoriteScroll'),btn=document.getElementById('tnProfileFavoriteMore');if(!box||!btn)return;const expanded=box.classList.toggle('expanded');btn.textContent=expanded?'Mostrar menos':'Ver mais receitas';};
  window.tnCommunityOpenSavedRecipe = function(key){
    const id=Number(key);
    if(Number.isFinite(id)&&typeof window.openRecipe==='function'&&Array.isArray(typeof recipes!=='undefined'?recipes:[])){
      const list=typeof recipes!=='undefined'?recipes:[];
      if(list.some(r=>String(r.id)===String(key))){window.openRecipe(id);return;}
    }
    alert('Essa receita salva não está disponível nesta lista. Abra a seção Comunidade para encontrar receitas publicadas.');
  };
  window.tnCommunityEditProfile = async function(){
    const u=me();if(!u)return;const c=client();const {data:p,error}=await c.from('profiles').select('display_name,bio,avatar_url').eq('id',u.id).single();if(error){alert(error.message);return}
    document.getElementById('communityEditArea').innerHTML='<form class="community-form" onsubmit="tnCommunitySaveProfile(event)"><h3>Editar perfil</h3><label>Nome<input id="communityDisplayName" required maxlength="80" value="'+escHtml(p.display_name||'')+'"></label><label>Sobre mim<textarea id="communityBio" maxlength="400" rows="3">'+escHtml(p.bio||'')+'</textarea></label><label>Link da foto (opcional)<input id="communityAvatarUrl" type="url" placeholder="https://... ou selecione abaixo" value="'+escHtml(p.avatar_url||'')+'"></label><label>Escolher foto do celular/computador<input type="file" accept="image/*" onchange="tnCommunityReadImage(this,\'communityAvatarData\')"></label><input id="communityAvatarData" type="hidden"><button class="btn btn-primary" type="submit">Salvar alterações</button></form>';
  };
  window.tnCommunitySaveProfile = async function(e){e.preventDefault();const u=me(),c=client();if(!u)return;const avatar=document.getElementById('communityAvatarData')?.value||document.getElementById('communityAvatarUrl').value.trim();if(avatar&&!safeImg(avatar)){alert('Use um link de imagem válido ou selecione uma foto.');return}
    const {error}=await c.from('profiles').update({display_name:document.getElementById('communityDisplayName').value.trim(),bio:document.getElementById('communityBio').value.trim(),avatar_url:avatar||null,updated_at:new Date().toISOString()}).eq('id',u.id);
    if(error){alert('Não foi possível salvar o perfil: '+error.message);return}alert('Perfil atualizado!');await window.tnCommunityOpenProfile(u.id);
  };
  window.tnCommunityShowPublish = async function(){
    const user=await waitForAuth();if(!user){if(typeof openAccount==='function')openAccount();return}
    document.getElementById('communityPublishArea').innerHTML='<form class="community-form" onsubmit="tnCommunityPublish(event)"><h3>Publicar receita</h3><p class="community-note">A receita ficará pendente até a aprovação da administração.</p><label>Nome da receita<input id="cpTitle" required maxlength="120"></label><label>Descrição<textarea id="cpDescription" rows="2" maxlength="500"></textarea></label><label>Categoria<select id="cpCategory"><option>Almoço e jantar</option><option>Café da manhã</option><option>Lanches</option><option>Bolos e tortas</option><option>Sobremesas</option><option>Salgados e petiscos</option><option>Outras</option></select></label><label>Tempo de preparo<input id="cpTime" placeholder="30 minutos"></label><label>Ingredientes (um por linha)<textarea id="cpIngredients" required rows="4"></textarea></label><label>Modo de preparo (um passo por linha)<textarea id="cpSteps" required rows="4"></textarea></label><label>Foto por link (opcional)<input id="cpImage" type="url" placeholder="https://..."></label><label>Ou escolher foto do celular/computador<input type="file" accept="image/*" onchange="tnCommunityReadImage(this,\'cpImageData\')"></label><input id="cpImageData" type="hidden"><button class="btn btn-primary" type="submit">Enviar para aprovação</button></form>';
    document.getElementById('communityPublishArea').scrollIntoView({behavior:'smooth',block:'start'});
  };
  window.tnCommunityPublish = async function(e){e.preventDefault();const u=await waitForAuth(),c=client();if(!u){if(typeof openAccount==='function')openAccount();return}
    const ingredients=document.getElementById('cpIngredients').value.split('\n').map(x=>x.trim()).filter(Boolean),steps=document.getElementById('cpSteps').value.split('\n').map(x=>x.trim()).filter(Boolean),img=document.getElementById('cpImageData')?.value||document.getElementById('cpImage').value.trim();
    if(img&&!safeImg(img)){alert('Use um link de imagem válido ou selecione uma foto.');return}
    const {error}=await c.from('community_recipes').insert({author_id:u.id,title:document.getElementById('cpTitle').value.trim(),description:document.getElementById('cpDescription').value.trim(),category:document.getElementById('cpCategory').value,prep_time:document.getElementById('cpTime').value.trim(),ingredients,steps,image_url:img||null,status:'pending'});
    if(error){alert('Não foi possível enviar a receita: '+error.message);return}document.getElementById('communityPublishArea').innerHTML='';alert('Receita enviada! Ela aparecerá na comunidade após a aprovação da administração.');window.tnCommunityTab('recipes');
  };
  window.tnCommunityRecipe = async function(id){const c=client(),box=document.getElementById('communityContent');if(!box)return;
    try{const {data:r,error}=await c.from('community_recipes').select('*').eq('id',id).single();if(error)throw error;const author=await c.from('profiles').select('display_name').eq('id',r.author_id).maybeSingle();if(author.error)throw author.error;
      box.innerHTML='<div class="community-form"><button class="btn btn-outline" onclick="tnCommunityTab(\'recipes\')">‹ Voltar às receitas</button><h1>'+escHtml(r.title)+'</h1><p class="muted">Por '+escHtml(author.data?.display_name||'Usuário')+' · '+escHtml(r.prep_time||'Tempo não informado')+'</p>'+(safeImg(r.image_url)?'<img src="'+escHtml(r.image_url)+'" alt="" style="width:100%;max-height:320px;object-fit:cover;border-radius:14px">':'')+'<p>'+escHtml(r.description||'')+'</p><h2>Ingredientes</h2><ul>'+((r.ingredients||[]).map(x=>'<li>'+escHtml(x)+'</li>').join(''))+'</ul><h2>Modo de preparo</h2><ol>'+((r.steps||[]).map(x=>'<li>'+escHtml(x)+'</li>').join(''))+'</ol></div>';
    }catch(e){alert('Não foi possível abrir a receita: '+e.message)}
  };
  window.tnCommunityLike = async function(id){const u=await waitForAuth(),c=client();if(!u){if(typeof openAccount==='function')openAccount();return}if(!c){alert('Supabase não está conectado.');return}const {data,error}=await c.from('recipe_likes').select('recipe_id').eq('user_id',u.id).eq('recipe_id',id).maybeSingle();if(error){alert(error.message);return}const res=data?await c.from('recipe_likes').delete().eq('user_id',u.id).eq('recipe_id',id):await c.from('recipe_likes').insert({user_id:u.id,recipe_id:id});if(res.error){alert(res.error.message);return}renderRecipes()};
  window.tnCommunitySave = async function(id){const u=await waitForAuth(),c=client();if(!u){if(typeof openAccount==='function')openAccount();return}if(!c){alert('Supabase não está conectado.');return}const {data,error}=await c.from('recipe_saves').select('recipe_id').eq('user_id',u.id).eq('recipe_id',id).maybeSingle();if(error){alert(error.message);return}const res=data?await c.from('recipe_saves').delete().eq('user_id',u.id).eq('recipe_id',id):await c.from('recipe_saves').insert({user_id:u.id,recipe_id:id});if(res.error){alert(res.error.message);return}renderRecipes()};
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
    let adminBtn=document.getElementById('adminPanelShortcut');
    if(u && (u.role==='admin'||u.role==='master')){
      if(!adminBtn){adminBtn=document.createElement('button');adminBtn.id='adminPanelShortcut';adminBtn.className='account-btn';adminBtn.style.marginLeft='8px';b.insertAdjacentElement('afterend',adminBtn);}
      adminBtn.hidden=false;
      adminBtn.textContent=u.role==='master'?'👑 Painel':'⚙ Painel';
      adminBtn.onclick=()=>{window.location.href='admin.html'};
      b.textContent='👤 Perfil';
      b.onclick=()=>window.tnCommunityOpenProfile(u.id);
    } else {
      if(adminBtn)adminBtn.hidden=true;
      if(u){b.textContent='👤 Perfil';b.onclick=()=>window.tnCommunityOpenProfile(u.id);}
      else {b.textContent='Entrar';b.onclick=()=>{if(typeof openAccount==='function')openAccount();};}
    }
  };

  // Social da receita principal, sincronizado por conta no Supabase.
  function tnSocialEsc(v){return String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
  async function tnIsAdmin(){
    const u=await waitForAuth(),c=client();if(!u?.id||!c)return false;
    if(['admin','master'].includes(u.role))return true;
    const {data}=await c.from('profiles').select('role').eq('id',u.id).maybeSingle();
    return ['admin','master'].includes(data?.role);
  }
  async function tnRefreshRecipeSocial(keyValue){
    const c=client(),u=me();if(!c)return;const key=String(keyValue);
    const [vr,cr,rr]=await Promise.all([
      c.from('recipe_feedback').select('user_id,vote').eq('recipe_key',key),
      c.from('recipe_comments').select('id,user_id,display_name,body,created_at').eq('recipe_key',key).order('created_at',{ascending:true}),
      c.from('recipe_ratings').select('user_id,rating').eq('recipe_key',key)
    ]);
    if(vr.error)throw vr.error;if(cr.error)throw cr.error;if(rr.error)throw rr.error;
    const votes=vr.data||[],mine=u?.id?votes.find(x=>x.user_id===u.id):null;
    const up=votes.filter(x=>x.vote==='up').length,down=votes.filter(x=>x.vote==='down').length;
    const actions=document.querySelector('#detailContent .rating-box .social-actions');
    if(actions){
      const upBtn=actions.querySelector('[data-vote="up"]'),downBtn=actions.querySelector('[data-vote="down"]');
      if(upBtn){upBtn.classList.toggle('active',mine?.vote==='up');upBtn.textContent='♥ Gostei ('+up+')';}
      if(downBtn){downBtn.classList.toggle('active',mine?.vote==='down');downBtn.textContent='💔 Não gostei ('+down+')';}
    }
    const ratings=rr.data||[],myRating=u?.id?ratings.find(x=>x.user_id===u.id)?.rating||0:0;
    const avg=ratings.length?ratings.reduce((sum,x)=>sum+Number(x.rating),0)/ratings.length:0;
    const summary=document.querySelector('#detailContent .rating-box .rating-summary');
    if(summary)summary.textContent='⭐ '+(ratings.length?avg.toFixed(1):'Ainda sem avaliações')+(ratings.length?' ('+ratings.length+' avaliações)':'');
    const stars=document.querySelector('#detailContent .rating-box .rating-stars');
    if(stars)stars.innerHTML=[1,2,3,4,5].map(n=>'<button type="button" aria-label="Avaliar com '+n+' estrelas" class="'+(n<=myRating?'selected':'')+'" onclick="tnRateRecipe('+inlineArg(key)+','+n+')">'+(n<=myRating?'★':'☆')+'</button>').join('');
    const panel=document.querySelector('#detailContent .comments-panel');
    if(panel){
      const rows=cr.data||[],admin=await tnIsAdmin();
      panel.innerHTML='<h2>💬 Comentários ('+rows.length+')</h2>'+
        (rows.length?rows.map(x=>'<div class="comment-row" data-comment-id="'+tnSocialEsc(x.id)+'"><b>'+tnSocialEsc(x.display_name||'Usuário')+'</b> <span class="small muted">'+new Date(x.created_at).toLocaleString('pt-BR')+'</span><p>'+tnSocialEsc(x.body)+'</p><div class="comment-actions">'+(admin?'<button class="comment-delete" onclick="tnDeleteRecipeComment('+inlineArg(x.id)+','+inlineArg(key)+')">🗑 Excluir comentário</button>':(u?.id&&x.user_id!==u.id?'<button class="comment-report" onclick="tnReportRecipeComment('+inlineArg(x.id)+','+inlineArg(key)+')">⚑ Denunciar</button>':''))+'</div></div>').join(''):'<p class="muted">Ainda não há comentários. Seja a primeira pessoa a comentar!</p>')+
        '<div class="comment-form"><input id="commentInput" maxlength="500" placeholder="Escreva um comentário..."><button class="btn btn-primary" onclick="addRecipeComment('+inlineArg(key)+')">Comentar</button></div>';
    }
    const card=document.querySelectorAll('[data-recipe-card="'+CSS.escape(key)+'"]');
    card.forEach(el=>{
      const upBtn=el.querySelector('[data-card-vote="up"]'),downBtn=el.querySelector('[data-card-vote="down"]');
      if(upBtn){upBtn.classList.toggle('active',mine?.vote==='up');upBtn.querySelector('.vote-count').textContent=up;}
      if(downBtn){downBtn.classList.toggle('active',mine?.vote==='down');downBtn.querySelector('.vote-count').textContent=down;}
      const rb=el.querySelector('[data-card-rating]');if(rb)rb.textContent='⭐ '+(ratings.length?avg.toFixed(1):'Avaliar');
    });
  }
  window.voteRecipe=async function(id,vote){
    const u=await waitForAuth(),c=client();if(!u?.id){if(typeof openAccount==='function')openAccount();return;}if(!c){alert('Serviço de avaliações indisponível.');return;}
    try{const key=String(id),q=await c.from('recipe_feedback').select('vote').eq('recipe_key',key).eq('user_id',u.id).maybeSingle();if(q.error)throw q.error;
      const res=q.data?.vote===vote?await c.from('recipe_feedback').delete().eq('recipe_key',key).eq('user_id',u.id):await c.from('recipe_feedback').upsert({recipe_key:key,user_id:u.id,vote},{onConflict:'recipe_key,user_id'});
      if(res.error)throw res.error;await tnRefreshRecipeSocial(key);
    }catch(e){alert('Não foi possível registrar sua reação: '+e.message);}
  };
  window.tnRateRecipe=async function(id,value){
    const u=await waitForAuth(),c=client();if(!u?.id){if(typeof openAccount==='function')openAccount();return;}
    if(!Number.isInteger(Number(value))||Number(value)<1||Number(value)>5)return;
    try{const res=await c.from('recipe_ratings').upsert({recipe_key:String(id),user_id:u.id,rating:Number(value),updated_at:new Date().toISOString()},{onConflict:'recipe_key,user_id'});if(res.error)throw res.error;
      document.querySelectorAll('.tn-rating-popover').forEach(x=>x.remove());await tnRefreshRecipeSocial(id);tnRefreshVisibleRecipeCards(id);
    }catch(e){alert('Não foi possível salvar sua avaliação: '+e.message+' Verifique se executou supabase-social-moderation.sql.');}
  };
  window.tnOpenRatingPicker=function(id,button){
    document.querySelectorAll('.tn-rating-popover').forEach(x=>x.remove());
    const pop=document.createElement('div');pop.className='tn-rating-popover';pop.innerHTML='<b>Sua avaliação</b><div>'+[1,2,3,4,5].map(n=>'<button type="button" aria-label="'+n+' estrelas" onclick="tnRateRecipe('+inlineArg(id)+','+n+')">★</button>').join('')+'</div>';
    (button?.parentElement||document.body).appendChild(pop);
  };
  window.tnDeleteRecipeComment=async function(commentId,recipeKey){
    if(!(await tnIsAdmin())){alert('Somente administradores podem excluir comentários.');return;}
    if(!confirm('Excluir este comentário?'))return;
    const c=client(),q=await c.from('recipe_comments').delete().eq('id',commentId);if(q.error){alert('Não foi possível excluir: '+q.error.message);return;}await tnRefreshRecipeSocial(recipeKey);
  };
  window.tnReportRecipeComment=async function(commentId,recipeKey){
    const u=await waitForAuth(),c=client();if(!u?.id){if(typeof openAccount==='function')openAccount();return;}
    const reason=prompt('Por que deseja denunciar este comentário?','Conteúdo inadequado');if(reason===null)return;
    if(reason.trim().length<3){alert('Descreva o motivo da denúncia.');return;}
    const q=await c.from('comment_reports').insert({comment_id:commentId,recipe_key:String(recipeKey),reporter_id:u.id,reason:reason.trim()});
    if(q.error){alert(q.error.code==='23505'?'Você já denunciou este comentário.':'Não foi possível enviar a denúncia: '+q.error.message);return;}
    alert('Denúncia enviada para análise da administração.');
  };
  window.addRecipeComment=async function(id){
    const u=await waitForAuth(),c=client(),input=document.getElementById('commentInput'),body=input?.value.trim()||'';
    if(!u?.id){if(typeof openAccount==='function')openAccount();return;}if(!body){alert('Escreva um comentário antes de enviar.');input?.focus();return;}if(!c){alert('Serviço de comentários indisponível.');return;}
    const btn=input?.parentElement?.querySelector('button');if(btn){btn.disabled=true;btn.textContent='Enviando…';}
    try{const res=await c.from('recipe_comments').insert({recipe_key:String(id),user_id:u.id,display_name:u.name||u.email||'Usuário',body});if(res.error)throw res.error;await tnRefreshRecipeSocial(id);}
    catch(e){alert('Não foi possível publicar o comentário: '+e.message);if(btn){btn.disabled=false;btn.textContent='Comentar';}}
  };
  window.tnRefreshVisibleRecipeCards=async function(onlyId){
    const c=client();if(!c)return;const cards=[...document.querySelectorAll('[data-recipe-card]')].filter(el=>!onlyId||el.dataset.recipeCard===String(onlyId));
    const keys=[...new Set(cards.map(el=>el.dataset.recipeCard))];if(!keys.length)return;
    const u=me();
    const [v,r]=await Promise.all([c.from('recipe_feedback').select('recipe_key,user_id,vote').in('recipe_key',keys),c.from('recipe_ratings').select('recipe_key,user_id,rating').in('recipe_key',keys)]);
    if(v.error||r.error)return;
    keys.forEach(key=>{
      const vs=(v.data||[]).filter(x=>x.recipe_key===key),mine=u?.id?vs.find(x=>x.user_id===u.id):null;
      const rs=(r.data||[]).filter(x=>x.recipe_key===key),avg=rs.length?rs.reduce((sum,x)=>sum+Number(x.rating),0)/rs.length:0;
      document.querySelectorAll('[data-recipe-card="'+CSS.escape(key)+'"]').forEach(el=>{
        const up=el.querySelector('[data-card-vote="up"]'),down=el.querySelector('[data-card-vote="down"]');
        if(up){up.classList.toggle('active',mine?.vote==='up');up.querySelector('.vote-count').textContent=vs.filter(x=>x.vote==='up').length;}
        if(down){down.classList.toggle('active',mine?.vote==='down');down.querySelector('.vote-count').textContent=vs.filter(x=>x.vote==='down').length;}
        const rate=el.querySelector('[data-card-rating]');if(rate)rate.textContent='⭐ '+(rs.length?avg.toFixed(1):'Avaliar');
      });
    });
  };
  window.addEventListener('load',()=>{
    const originalOpen=window.openRecipe;
    if(typeof originalOpen==='function'&&!window.__tnSocialOpenWrapped){window.openRecipe=function(id){const result=originalOpen.apply(this,arguments);if(client()){tnRefreshRecipeSocial(id).catch(e=>console.warn('[TN social]',e.message));if(window.tnCommunityRefreshFavoriteButton)window.tnCommunityRefreshFavoriteButton(id);}return result;};window.__tnSocialOpenWrapped=true;}
    ['renderHome','renderSearch','renderFavorites','renderResults'].forEach(name=>{
      const original=window[name];if(typeof original==='function'&&!window['__tnWrap_'+name]){window[name]=function(){const result=original.apply(this,arguments);setTimeout(()=>window.tnRefreshVisibleRecipeCards(),80);return result;};window['__tnWrap_'+name]=true;}
    });
    const oldToggle=window.toggleFavorite;
    if(typeof oldToggle==='function'&&!window.__tnFavoriteWrapped){window.toggleFavorite=function(id){
      const result=oldToggle.apply(this,arguments);const u=me(),c=client(),fav=(()=>{try{return favorites.has(id)}catch(_){return false}})();
      if(u?.id&&c){const key=String(id),r=getRecipes().find(x=>String(x.id)===key);window.__tnFavoriteSyncs=window.__tnFavoriteSyncs||{};window.__tnFavoriteSyncs[key]=c.from('user_recipe_collections').select('is_saved').eq('user_id',u.id).eq('recipe_key',key).maybeSingle().then(q=>{
        if(q.error)throw q.error;return c.from('user_recipe_collections').upsert({user_id:u.id,recipe_key:key,recipe_title:r?.name||r?.title||'Receita',recipe_category:r?.category||'',recipe_snapshot:r||{},is_favorite:fav,is_saved:!!q.data?.is_saved,updated_at:new Date().toISOString()},{onConflict:'user_id,recipe_key'});
      }).then(res=>{if(res?.error)throw res.error;}).catch(e=>console.warn('[TN favorite sync]',e.message));}
      return result;
    };window.__tnFavoriteWrapped=true;}
    setTimeout(()=>window.tnRefreshVisibleRecipeCards(),350);
  });
  window.addEventListener('load',()=>{ensurePages();setTimeout(()=>{if(typeof window.tnAuthReady!=='undefined')window.tnAuthReady.then(()=>{const u=me();if(u&&client())syncFavorites(u).catch(()=>{});});},300)});
  async function syncFavorites(u){
    const c=client();if(!c||!u?.id)return;
    let local=[];try{local=typeof favorites!=='undefined'?[...favorites].map(String):[]}catch(_){}
    const q=await c.from('user_recipe_collections').select('recipe_key,is_favorite,is_saved').eq('user_id',u.id);
    if(q.error)throw q.error;
    const rows=q.data||[];
    if(rows.length){
      const ids=rows.filter(x=>x.is_favorite).map(x=>String(x.recipe_key));
      try{favorites.clear();ids.forEach(id=>{const n=Number(id);favorites.add(Number.isNaN(n)?id:n)});localStorage.setItem('tn_favs',JSON.stringify([...favorites]));if(typeof renderFavorites==='function')renderFavorites();if(typeof renderHome==='function')renderHome();}catch(_){}
      return;
    }
    for(const id of local){
      const r=getRecipes().find(x=>String(x.id)===id);if(!r)continue;
      const payload={user_id:u.id,recipe_key:id,recipe_title:r.name||r.title||'Receita',recipe_category:r.category||'',recipe_snapshot:r,is_favorite:true,is_saved:true,updated_at:new Date().toISOString()};
      const {error}=await c.from('user_recipe_collections').upsert(payload,{onConflict:'user_id,recipe_key'});if(error)throw error;
    }
  }
  ensurePages();
  const oldGo=window.go;
  if(typeof oldGo==='function')window.go=function(id){oldGo(id);if(id==='community')window.tnCommunityLoad();};
})();
