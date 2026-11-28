/* ================= friend book ================= */
// The Friends button opens a little friend book: everyone you garden with as a tile (online first),
// tap one for their page (avatar, when they were last around, their garden, their own answers) and visit from there.
// Your own page is the first tile: five short answers that your friends can read.
const FB_Q=[['food','Favourite food'],['hobby','Hobbies'],['like','I really like'],['dream','My dream'],['motto','My motto']];
let fbPage=null;
function agoTxt(t){if(!t)return '';const d=(Date.now()-t)/864e5;if(d<1/24)return 'just now';if(d<1)return 'today';if(d<2)return 'yesterday';if(d<30)return Math.floor(d)+' days ago';
  return new Date(t).toLocaleDateString(undefined,{day:'numeric',month:'short'});}
function avatarCv(look,cls){const c=document.createElement('canvas');c.width=20;c.height=30;c.className=cls||'fbav';const keep=X;
  try{X=c.getContext('2d');drawAvatar(X,10,28,look,{shadow:false,t:0});}catch(e){}finally{X=keep;}return c;}
function fbVisible(){const fr=(home&&home.friends)||[];
  return gardensList.filter(gd=>gd.id!==myId&&(gd.data.owner||gd.data.listed||fr.includes(gd.id)||(visiting&&visiting.id===gd.id)));}
function fbStatus(gd){if(onlineIds().has(gd.id))return {on:true,t:'here now'};return {on:false,t:gd.data.saved?'last around '+agoTxt(gd.data.saved):''};}
function el(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e;}
function renderGardens(keep){
  if(!keep)renderNeighbours();
  const panel=document.querySelector('#gardens .panel'),box=document.getElementById('glist');box.innerHTML='';
  panel.classList.toggle('fbopen',!!fbPage);
  document.getElementById('fbLead').hidden=!!fbPage;
  if(fbPage){document.getElementById('gSearch').hidden=true;renderFbPage(box);return;}
  if(!db){box.appendChild(el('div','empty','Gardens sync once you are signed in.'));return;}
  const q=(document.getElementById('gSearch').value||'').trim().toLowerCase(),fr=(home&&home.friends)||[],on=onlineIds();
  const all=fbVisible();document.getElementById('gSearch').hidden=all.length<6&&!q;
  const list=all.filter(gd=>!q||gd.data.name.toLowerCase().includes(q))
    .sort((a,b)=>(on.has(b.id)-on.has(a.id))||(fr.includes(b.id)-fr.includes(a.id))||((b.data.saved||0)-(a.data.saved||0)));
  const grid=el('div','fbgrid');box.appendChild(grid);
  if(home&&!q){const me=el('button','fbt me');me.type='button';me.appendChild(avatarCv(home.look));me.appendChild(el('b','',home.name||'You'));
    const filled=FB_Q.some(([k])=>home.fb&&home.fb[k]);me.appendChild(el('span','fs',filled?'your page':'fill in your page'));
    me.onclick=()=>{fbPage='me';renderGardens(true);};grid.appendChild(me);}
  list.forEach(gd=>{const t=el('button','fbt');t.type='button';t.appendChild(avatarCv(gd.data.look));
    t.appendChild(el('b','',gd.data.name));
    const st=fbStatus(gd),s=el('span','fs'+(st.on?' on':''),st.t);if(fr.includes(gd.id))s.appendChild(el('span','hrt','♥'));t.appendChild(s);
    t.onclick=()=>{fbPage=gd.id;renderGardens(true);};grid.appendChild(t);});
  if(!list.length)box.appendChild(el('div','empty',q?'Nobody with that name. Paste their invite link below.':'No friends here yet. Paste a friend’s invite link below, or send them yours.'));
}
function renderFbPage(box){
  const back=el('button','fbback','← Friend book');back.type='button';back.onclick=()=>{fbPage=null;renderGardens(true);};box.appendChild(back);
  const pg=el('div','fbpg');box.appendChild(pg);
  if(fbPage==='me'){
    if(!home){fbPage=null;return;}
    const hd=el('div','fbhd');hd.appendChild(avatarCv(home.look,'fbbig'));const ht=el('div','fbht');ht.appendChild(el('h3','',home.name||'You'));
    ht.appendChild(el('div','fs','Your page. Friends see these answers in their friend book.'));hd.appendChild(ht);pg.appendChild(hd);
    const f=el('form','fbform');f.autocomplete='off';
    FB_Q.forEach(([k,lab])=>{const l=el('label','fbq');l.appendChild(el('span','',lab));const i=el('input','inp');i.name=k;i.maxLength=40;i.value=(home.fb&&home.fb[k])||'';l.appendChild(i);f.appendChild(l);});
    const sv=el('button','btn dark','Save my page');sv.type='submit';f.appendChild(sv);
    f.onsubmit=e=>{e.preventDefault();const fb={};FB_Q.forEach(([k])=>{const v=nodot(f.elements[k].value.trim()).slice(0,40);if(v)fb[k]=v;});home.fb=fb;persist();toast('Saved. Your friends can read it now.',2200);fbPage=null;renderGardens(true);};
    pg.appendChild(f);return;}
  const gd=gardensList.find(x=>x.id===fbPage);if(!gd){fbPage=null;renderGardens(true);return;}
  const d=gd.data,fr=(home&&home.friends)||[],st=fbStatus(gd);
  const hd=el('div','fbhd');hd.appendChild(avatarCv(d.look,'fbbig'));const ht=el('div','fbht');
  const h=el('h3','',d.name);if(fr.includes(gd.id))h.appendChild(el('span','hrt','♥'));ht.appendChild(h);
  if(st.t)ht.appendChild(el('div','fs'+(st.on?' on':''),st.t));
  if(d.since)ht.appendChild(el('div','fs','gardening since '+new Date(d.since).toLocaleDateString(undefined,{month:'long',year:'numeric'})));
  hd.appendChild(ht);pg.appendChild(hd);
  const ps=d.projects||[],sk=d.skills||[],chips=el('div','fbchips');
  [ps.length+(ps.length===1?' project':' projects'),sk.length+(sk.length===1?' skill':' skills'),'watered '+Math.round(gardenAvg(d))+'%'].forEach(t=>chips.appendChild(el('span','fbchip',t)));pg.appendChild(chips);
  const qa=FB_Q.filter(([k])=>d.fb&&d.fb[k]);
  if(qa.length){const dl=el('dl','fbqa');qa.forEach(([k,lab])=>{dl.appendChild(el('dt','',lab));dl.appendChild(el('dd','',d.fb[k]));});pg.appendChild(dl);}
  else pg.appendChild(el('div','fbnone',d.name+' has not filled in their page yet.'));
  const acts=el('div','fbacts');
  const here=visiting&&visiting.id===gd.id,v=el('button','btn dark',here?'You are here':'Visit '+d.name+'’s garden');v.type='button';v.disabled=here;
  v.onclick=()=>{gardensM.classList.remove('show');fbPage=null;visit(gd);};acts.appendChild(v);
  if(home&&!fr.includes(gd.id)){const a=el('button','btn','Add to my friends ♥');a.type='button';a.onclick=()=>{addFriend(gd.id);renderGardens(true);};acts.appendChild(a);}
  pg.appendChild(acts);
}
