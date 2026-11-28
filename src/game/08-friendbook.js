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
// friends: both sides have each other in fr. a request: they have me, I don't have them (and I did not decline)
function myFr(){return (home&&home.fr)||[];}
function isFriend(gd){return myFr().includes(gd.id)&&(gd.data.fr||[]).includes(myId);}
function isPending(gd){return myFr().includes(gd.id)&&!(gd.data.fr||[]).includes(myId);}
function incoming(){if(!home||!myId)return [];const dec=home.fdecl||[];
  return gardensList.filter(gd=>gd.id!==myId&&(gd.data.fr||[]).includes(myId)&&!myFr().includes(gd.id)&&!dec.includes(gd.id));}
// someone who joined through my invite link is my friend straight away
function autoAccept(){if(!home||!myId)return;incoming().filter(gd=>gd.data.inv===myId).forEach(gd=>addFriend(gd.id));}
function updateReqBadge(){autoAccept();const n=incoming().length,b=document.getElementById('bGardens');b.classList.toggle('req',n>0);b.dataset.n=n||'';
  if(gardensM.classList.contains('show')&&!fbPage)renderGardens(true);}
function fbVisible(){const fr=myFr();
  return gardensList.filter(gd=>gd.id!==myId&&(gd.data.owner||gd.data.listed||fr.includes(gd.id)||(gd.data.fr||[]).includes(myId)||(visiting&&visiting.id===gd.id)));}
function fbStatus(gd){if(onlineIds().has(gd.id))return {on:true,t:'here now'};return {on:false,t:gd.data.saved?'last around '+agoTxt(gd.data.saved):''};}
function el(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e;}
function handleTaken(h){return gardensList.some(gd=>gd.id!==myId&&gd.data.handle===h);}
function handleError(h){if(!/^[a-z0-9_]{3,15}$/.test(h))return 'Use 3 to 15 letters, numbers or _';if(handleTaken(h))return '@'+h+' is taken';return '';}
function suggestHandle(){const b=(home&&home.name||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9_]/g,'').slice(0,12)||'gardener';
  let h=b.length<3?b+'_gr':b,i=1;while(handleTaken(h)&&i<99){h=(b+i).slice(0,15);i++;}return h;}
function handleBox(){
  const box=el('form','fbname');box.autocomplete='off';
  box.appendChild(el('div','fbnt','Pick your username'));box.appendChild(el('div','fs','Friends add you with it. You can change it later on your page.'));
  const row=el('div','fbadd');row.appendChild(el('span','at','@'));const i=el('input','inp');i.maxLength=15;i.value=suggestHandle();i.setAttribute('autocapitalize','none');i.spellcheck=false;row.appendChild(i);
  const b=el('button','btn dark','Save');b.type='submit';row.appendChild(b);box.appendChild(row);const er=el('div','fberr');box.appendChild(er);
  box.onsubmit=e=>{e.preventDefault();const h=i.value.trim().replace(/^@/,'').toLowerCase(),m=handleError(h);if(m){er.textContent=m;return;}home.handle=h;persist();toast('You are @'+h+' now.',2200);renderGardens(true);};
  return box;}
function tile(gd,extra){const t=el('button','fbt');t.type='button';t.appendChild(avatarCv(gd.data.look));t.appendChild(el('b','',gd.data.name));
  if(gd.data.handle)t.appendChild(el('span','fh','@'+gd.data.handle));
  const st=fbStatus(gd),s=el('span','fs'+(st.on?' on':''),extra||st.t);t.appendChild(s);
  t.onclick=()=>{fbPage=gd.id;renderGardens(true);};return t;}
function renderGardens(keep){
  if(!keep)renderNeighbours();
  const panel=document.querySelector('#gardens .panel'),box=document.getElementById('glist');box.innerHTML='';
  panel.classList.toggle('fbopen',!!fbPage);
  document.getElementById('fbLead').hidden=!!fbPage;
  if(fbPage){document.getElementById('gSearch').hidden=true;renderFbPage(box);return;}
  if(!db){box.appendChild(el('div','empty','Gardens sync once you are signed in.'));return;}
  if(home&&!home.handle)box.appendChild(handleBox());
  // friend requests first
  const inc=incoming();
  if(inc.length){box.appendChild(el('div','dsec','FRIEND REQUESTS'));
    inc.forEach(gd=>{const r=el('div','fbreq');r.appendChild(avatarCv(gd.data.look,'fbav sm'));const tx=el('div','fbrt');tx.appendChild(el('b','',gd.data.name));
      tx.appendChild(el('span','fs',(gd.data.handle?'@'+gd.data.handle+' ':'')+'wants to be friends'));r.appendChild(tx);
      const ok=el('button','btn dark','Accept');ok.type='button';ok.onclick=()=>{addFriend(gd.id);toast('You and '+gd.data.name+' are friends now ♥',2600);updateReqBadge();renderGardens(true);};
      const no=el('button','btn','Not now');no.type='button';no.onclick=()=>{home.fdecl=(home.fdecl||[]).concat([gd.id]).slice(-200);persist();updateReqBadge();renderGardens(true);};
      r.appendChild(ok);r.appendChild(no);box.appendChild(r);});}
  const q=(document.getElementById('gSearch').value||'').trim().toLowerCase().replace(/^@/,''),on=onlineIds();
  const all=fbVisible().filter(gd=>!inc.includes(gd));document.getElementById('gSearch').hidden=all.length<6&&!q;
  const match=gd=>!q||gd.data.name.toLowerCase().includes(q)||(gd.data.handle||'').includes(q);
  const ord=(a,b)=>(on.has(b.id)-on.has(a.id))||((b.data.saved||0)-(a.data.saved||0));
  const friends=all.filter(gd=>isFriend(gd)&&match(gd)).sort(ord),pend=all.filter(gd=>isPending(gd)&&match(gd)).sort(ord),
        others=all.filter(gd=>!isFriend(gd)&&!isPending(gd)&&match(gd)).sort(ord);
  box.appendChild(el('div','dsec','FRIENDS'));
  const grid=el('div','fbgrid');box.appendChild(grid);
  if(home&&!q){const me=el('button','fbt me');me.type='button';me.appendChild(avatarCv(home.look));me.appendChild(el('b','',home.name||'You'));
    if(home.handle)me.appendChild(el('span','fh','@'+home.handle));
    const filled=FB_Q.some(([k])=>home.fb&&home.fb[k]);me.appendChild(el('span','fs',filled?'your page':'fill in your page'));
    me.onclick=()=>{fbPage='me';renderGardens(true);};grid.appendChild(me);}
  friends.forEach(gd=>grid.appendChild(tile(gd)));
  pend.forEach(gd=>{const t=tile(gd,'request sent');t.classList.add('pend');grid.appendChild(t);});
  if(!friends.length&&!pend.length)box.appendChild(el('div','empty',q?'Nobody with that name.':'No friends yet. Add someone by their username below.'));
  if(others.length){box.appendChild(el('div','dsec','OTHER GARDENS'));const g2=el('div','fbgrid');others.forEach(gd=>g2.appendChild(tile(gd)));box.appendChild(g2);}
}
function renderFbPage(box){
  const back=el('button','fbback','← Friend book');back.type='button';back.onclick=()=>{fbPage=null;renderGardens(true);};box.appendChild(back);
  const pg=el('div','fbpg');box.appendChild(pg);
  if(fbPage==='me'){
    if(!home){fbPage=null;return;}
    const hd=el('div','fbhd');hd.appendChild(avatarCv(home.look,'fbbig'));const ht=el('div','fbht');ht.appendChild(el('h3','',home.name||'You'));
    ht.appendChild(el('div','fs','Your page. Friends see these answers in their friend book.'));hd.appendChild(ht);pg.appendChild(hd);
    const f=el('form','fbform');f.autocomplete='off';
    {const l=el('label','fbq');l.appendChild(el('span','','Username'));const i=el('input','inp');i.name='handle';i.maxLength=15;i.value=home.handle||suggestHandle();i.setAttribute('autocapitalize','none');i.spellcheck=false;l.appendChild(i);f.appendChild(l);}
    const er=el('div','fberr');
    FB_Q.forEach(([k,lab])=>{const l=el('label','fbq');l.appendChild(el('span','',lab));const i=el('input','inp');i.name=k;i.maxLength=40;i.value=(home.fb&&home.fb[k])||'';l.appendChild(i);f.appendChild(l);});
    const sv=el('button','btn dark','Save my page');sv.type='submit';f.appendChild(sv);
    f.onsubmit=e=>{e.preventDefault();const h=f.elements.handle.value.trim().replace(/^@/,'').toLowerCase();if(h!==home.handle){const m=handleError(h);if(m){er.textContent=m;f.elements.handle.focus();return;}home.handle=h;}const fb={};FB_Q.forEach(([k])=>{const v=nodot(f.elements[k].value.trim()).slice(0,40);if(v)fb[k]=v;});home.fb=fb;persist();toast('Saved. Your friends can read it now.',2200);fbPage=null;renderGardens(true);};
    f.insertBefore(er,sv);pg.appendChild(f);return;}
  const gd=gardensList.find(x=>x.id===fbPage);if(!gd){fbPage=null;renderGardens(true);return;}
  const d=gd.data,st=fbStatus(gd),friend=isFriend(gd),pend=isPending(gd);
  const hd=el('div','fbhd');hd.appendChild(avatarCv(d.look,'fbbig'));const ht=el('div','fbht');
  const h=el('h3','',d.name);if(friend)h.appendChild(el('span','hrt','♥'));ht.appendChild(h);if(d.handle)ht.appendChild(el('div','fh','@'+d.handle));
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
  if(home&&!friend&&!pend){const inc=(d.fr||[]).includes(myId),a=el('button','btn',inc?'Accept friend request':'Send friend request');a.type='button';
    a.onclick=()=>{addFriend(gd.id);toast(inc?'You and '+d.name+' are friends now ♥':'Friend request sent to '+d.name+'.',2600);updateReqBadge();renderGardens(true);};acts.appendChild(a);}
  else if(pend)acts.appendChild(el('span','fs','Request sent, waiting for '+d.name));
  else if(friend){const u=el('button','fbback','Remove friend');u.type='button';u.onclick=()=>{if(!u.dataset.a){u.dataset.a=1;u.textContent='Tap again to remove';return;}
    home.fr=myFr().filter(x=>x!==gd.id);persist();renderGardens(true);};acts.appendChild(u);}
  pg.appendChild(acts);
}
