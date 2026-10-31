/* Rankings automáticos do Tem na Geladeira — dados compartilhados pelo Supabase. */
(function(){
'use strict';
const db=()=>window.tnSupabase;
const normText=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const dayKey=()=>{const d=new Date();if(d.getHours()<9)d.setDate(d.getDate()-1);return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();};
const seed=s=>[...String(s)].reduce((a,x)=>(a*31+x.charCodeAt(0))>>>0,7);
let cache=null,cacheDay='';
window.tnRecordRecipeView=async function(id){
 const client=db();if(!client)return;
 const key=String(id),storageKey='tn_viewed_'+key,last=Number(localStorage.getItem(storageKey)||0),now=Date.now();
 if(now-last<30*60*1000)return;
 localStorage.setItem(storageKey,String(now));
 const {error}=await client.from('recipe_views').insert({recipe_key:key});
 if(error)console.warn('[Destaques] Não foi possível registrar visualização:',error.message);
 cache=null;
};
window.tnLoadAutomaticHighlights=async function(force){
 const today=dayKey();if(!force&&cache&&cacheDay===today)return cache;
 const client=db(),since=new Date(Date.now()-24*60*60*1000).toISOString();
 let views=[],ratings=[];
 if(client){
  const [v,r]=await Promise.all([
   client.from('recipe_views').select('recipe_key,viewed_at').gte('viewed_at',since),
   client.from('recipe_ratings').select('recipe_key,rating')
  ]);
  if(!v.error)views=v.data||[];else console.warn('[Destaques] Erro ao consultar acessos:',v.error.message);
  if(!r.error)ratings=r.data||[];else console.warn('[Destaques] Erro ao consultar avaliações:',r.error.message);
 }
 const viewCount={};views.forEach(x=>{const k=String(x.recipe_key);viewCount[k]=(viewCount[k]||0)+1;});
 const ratingStats={};ratings.forEach(x=>{const k=String(x.recipe_key);if(!ratingStats[k])ratingStats[k]={count:0,sum:0};ratingStats[k].count++;ratingStats[k].sum+=Number(x.rating)||0;});
 const all=Array.isArray(recipes)?recipes:[];
 const tie=id=>seed(today+String(id));
 const popular=[...all].sort((a,b)=>(viewCount[String(b.id)]||0)-(viewCount[String(a.id)]||0)||tie(a.id)-tie(b.id)).slice(0,10);
 const rated=[...all].filter(r=>(ratingStats[String(r.id)]?.count||0)>0).sort((a,b)=>(ratingStats[String(b.id)]?.count||0)-(ratingStats[String(a.id)]?.count||0)||((ratingStats[String(b.id)]?.sum||0)/(ratingStats[String(b.id)]?.count||1))-((ratingStats[String(a.id)]?.sum||0)/(ratingStats[String(a.id)]?.count||1))||tie(a.id)-tie(b.id)).slice(0,10);
 const daily=popular[0]||(all.length?all[tie('daily')%all.length]:null);
 const breakfastPool=all.filter(r=>normText(r.category).includes('cafe da manha'));
 const breakfast=[...breakfastPool].sort((a,b)=>(viewCount[String(b.id)]||0)-(viewCount[String(a.id)]||0)||tie(a.id)-tie(b.id))[0]||null;
 cache={popular,rated,daily,breakfast,viewCount,ratingStats,updatedAt:new Date().toISOString()};cacheDay=today;
 const title=document.getElementById('dailyTitle');if(title)title.textContent=daily?.name||'Em breve';
 return cache;
};
const originalHome=window.renderHome;
if(typeof originalHome==='function')window.renderHome=function(){originalHome.apply(this,arguments);window.tnLoadAutomaticHighlights().then(data=>renderShelves(data)).catch(e=>console.warn('[Destaques]',e));};
function renderShelves(data){
 const host=document.getElementById('homeRecipes');if(!host)return;
 const sections=[['🔥 10 mais acessadas','Acessos nas últimas 24 horas',data.popular],['⭐ 10 mais avaliadas','Ordenadas pela quantidade de avaliações recebidas',data.rated],['☀ Receita do dia','Escolhida automaticamente; atualização às 09h',data.daily?[data.daily]:[]],['☕ Café da manhã do dia','Receita da categoria mais acessada nas últimas 24 horas',data.breakfast?[data.breakfast]:[]]];
 host.innerHTML=sections.map(([title,sub,list])=>'<div class="section"><div class="section-head"><div><h2>'+title+'</h2><p class="small muted">'+sub+'</p></div></div><div class="cards">'+(list||[]).map(card).join('')+'</div></div>').join('');
}
const originalOpen=window.openRecipe;
if(typeof originalOpen==='function')window.openRecipe=function(id){const result=originalOpen.apply(this,arguments);window.tnRecordRecipeView(id);return result;};
const originalHighlight=window.openHighlight;
if(typeof originalHighlight==='function')window.openHighlight=function(kind){
 if(!['daily','breakfast','rated','popular'].includes(kind))return originalHighlight.apply(this,arguments);
 go('results');
 const intro=document.getElementById('highlightIntro'),normal=document.getElementById('resultIntro'),summary=document.querySelector('.results-summary'),types=document.querySelector('.result-types');
 if(intro)intro.style.display='block';if(normal)normal.style.display='none';if(summary)summary.style.display='none';if(types)types.style.display='none';
 const titles={daily:'🍳 Receita do dia',breakfast:'☕ Café da manhã do dia',rated:'⭐ 10 receitas mais avaliadas',popular:'🔥 10 receitas mais acessadas'};
 document.getElementById('resultsTitle').textContent=titles[kind];intro.textContent='Ranking automático calculado com dados reais do site e atualizado diariamente às 09h.';
 document.getElementById('resultCards').innerHTML='<div class="empty">Carregando dados...</div>';
 window.tnLoadAutomaticHighlights(true).then(data=>{
  const list=kind==='popular'?data.popular:kind==='rated'?data.rated:kind==='breakfast'?(data.breakfast?[data.breakfast]:[]):(data.daily?[data.daily]:[]);
  const host=document.getElementById('resultCards');if(!host)return;
  host.innerHTML=list.length?list.map(card).join(''):'<div class="empty">Ainda não há dados suficientes para este destaque.</div>';
 });
};
function schedule(){
 const now=new Date(),next=new Date(now);next.setHours(9,0,0,0);if(next<=now)next.setDate(next.getDate()+1);
 setTimeout(()=>{cache=null;cacheDay='';window.tnLoadAutomaticHighlights(true).then(renderShelves);schedule();},next-now);
}
window.addEventListener('load',()=>{window.tnLoadAutomaticHighlights(true).then(renderShelves);schedule();});
})();
