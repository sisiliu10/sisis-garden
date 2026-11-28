/* ================= friend book (Freundebuch) ================= */
// A treasured childhood friendship album: vanilla paper, strawberry/butter/powder-blue/matcha accents,
// friends as polaroids hanging on a twine with little pegs, memory notes with scalloped edges, an envelope
// pocket to add or invite friends, and on the right page the selected friend's own scrapbook page.
// All friend logic (usernames, requests, invite) is unchanged; only the art direction is new.
const FB_Q=[['bday','Geburtstag']];
let fbPage=null,fbTurn=false,envOpen=false,envTouched=false;
function agoTxt(t){if(!t)return '';const m=(Date.now()-t)/6e4,d=m/1440;if(m<15)return 'just now';if(m<60)return Math.round(m/5)*5+' min ago';if(m<24*60&&new Date(t).toDateString()===new Date().toDateString())return Math.floor(m/60)+(Math.floor(m/60)===1?' hour ago':' hours ago');
  if(d<2&&new Date(t).toDateString()===new Date(Date.now()-864e5).toDateString())return 'yesterday';if(d<30)return Math.max(1,Math.round(d))+' days ago';
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
function lastAround(d){return Math.max(d.seen||0,d.saved||0);}
function fbStatus(gd){if(onlineIds().has(gd.id))return {on:true,t:'here now'};const t=lastAround(gd.data);return {on:false,t:t?'last around '+agoTxt(t):'not around yet'};}
function el(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e;}
function handleTaken(h){return gardensList.some(gd=>gd.id!==myId&&gd.data.handle===h);}
function handleError(h){if(!/^[a-z0-9_]{3,15}$/.test(h))return 'Use 3 to 15 letters, numbers or _';if(handleTaken(h))return '@'+h+' is taken';return '';}
function suggestHandle(){const b=(home&&home.name||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9_]/g,'').slice(0,12)||'gardener';
  let h=b.length<3?b+'_gr':b,i=1;while(handleTaken(h)&&i<99){h=(b+i).slice(0,15);i++;}return h;}

function deAgo(t){if(!t)return '';const m=(Date.now()-t)/6e4,d=m/1440;if(m<15)return 'gerade eben';if(m<60)return 'vor '+Math.round(m/5)*5+' Min';
  if(m<24*60&&new Date(t).toDateString()===new Date().toDateString())return 'heute '+new Date(t).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});
  if(d<2&&new Date(t).toDateString()===new Date(Date.now()-864e5).toDateString())return 'gestern';if(d<30)return 'vor '+Math.max(1,Math.round(d))+' Tagen';
  return new Date(t).toLocaleDateString('de-DE',{day:'numeric',month:'short'});}
function fbStatusDe(gd){if(onlineIds().has(gd.id))return {on:true,t:'gerade im Garten'};const t=lastAround(gd.data);return {on:false,t:t?deAgo(t):''};}

/* ---------- handmade pixel stickers ---------- */
const FA={k:'#5a3a2e',w:'#fffaf0',r:'#ff6f91',R:'#d94a6c',p:'#ffb3c6',y:'#ffd966',Y:'#e8a93a',b:'#9cc9ff',B:'#5b8fd9',g:'#9cc97a',G:'#5e9a4a',o:'#ff9a3c',n:'#a0673e',e:'#2a1e1e',c:'#ffe8d6'};
const STK={
  strawberry:["....G.G....","...GgGgG...","..kkGgGkk..",".krrkgkrrk.","krrwrrrrwrk","krrrrrwrrrk","krwrrrrrrrk",".krrrwrrrk.",".krrrrrwrk.","..krwrrrk..","...krrrk...","....kkk...."],
  bunny:["..kk...kk..",".kwpk.kwpk.",".kwpk.kwpk.",".kwpk.kwpk.",".kwwkkkwwk.","kwwwwwwwwwk","kwewwwwwewk","kwwwwkwwwwk","kpwwwwwwwpk","kwwwwwwwwwk",".kwwwwwwwk.","..kkkkkkk.."],
  mushroom:["...kkkkk...",".kkrrrrrkk.","krrwwrrrrrk","krwwwrrwwrk","krrwrrrwwrk","kkkkkkkkkkk","..kcccccck.","..kcecceck.","..kccppcck.","..kcccccck.","...kkkkkk.."],
  bee:["...bb.bb...","..bwwbwwb..","..bwwbwwb..","..kkkkkk...",".kykykyyk..","kkykykyyek.",".kykykyyk..","..kkkkkk..."],
  sakura:["..pp.pp..",".ppppppp.","pppRyRppp",".ppyyypp.","pppRyRppp",".ppppppp.","..pp.pp.."],
  ladybug:["...kkk...",".rrrkrrr.","rrkrkrkrr","rrrrkrrrr","rkrrkrrkr",".rrrkrrr.","..rrkrr.."],
  star:["....y....","...yyy...","yyyyyyyyy",".yeyyyey.","..yyRyy..","..yyyyy..",".yyy.yyy.","yy.....yy"],
  heart:[".rr.rr.","rrrrrrr","rwrrrrr","rrrrrrr",".rrrrr.","..rrr..","...r..."],
  tulip:[".r.r.r.",".rrrrr.",".rRrRr.","..rrr..","...g...",".g.g...","..gg...","...g..."],
  clover:[".gg.gg.","gGggGgg","ggggggg",".ggGgg.","gGggGgg",".gg.gg.","...G...","....G.."],
  peg:["nn","nn","kk","nn","nn"],
  arrow:["....r..","...r...","rrrrrrr","...r...","....r.."],
  squiggle:[".rr...rr...rr..","r..r.r..r.r..r.","....r....r....r"],
};
const stkCache={};
// a sticker: the pixel picture with a white sticker border and a soft cocoa shadow, at a whole-number scale
function stkUrl(k,s){s=s||2;const key=k+s;if(stkCache[key])return stkCache[key];const rows=STK[k],w=Math.max(...rows.map(r=>r.length)),h=rows.length,P=2;
  const grid=Array.from({length:h+P*2},()=>Array(w+P*2).fill(''));rows.forEach((r,y)=>[...r].forEach((ch,x)=>{if(ch!=='.'&&FA[ch])grid[y+P][x+P]=FA[ch];}));
  const border=k!=='peg'&&k!=='arrow'&&k!=='squiggle';
  const c=document.createElement('canvas');c.width=(w+P*2+1)*s;c.height=(h+P*2+1)*s;const x=c.getContext('2d');
  const at=(gx,gy)=>grid[gy]&&grid[gy][gx];
  if(border){x.fillStyle='rgba(90,58,46,.28)';for(let gy=0;gy<h+P*2;gy++)for(let gx=0;gx<w+P*2;gx++){const near=[[0,0],[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>at(gx+a,gy+b));if(near)x.fillRect((gx+1)*s,(gy+1)*s,s,s);}
    x.fillStyle='#ffffff';for(let gy=0;gy<h+P*2;gy++)for(let gx=0;gx<w+P*2;gx++){const near=[[0,0],[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>at(gx+a,gy+b));if(near)x.fillRect(gx*s,gy*s,s,s);}}
  for(let gy=0;gy<h+P*2;gy++)for(let gx=0;gx<w+P*2;gx++){if(grid[gy][gx]){x.fillStyle=grid[gy][gx];x.fillRect(gx*s,gy*s,s,s);}}
  return stkCache[key]=c.toDataURL();}
function stk(k,s,cls,style){const i=el('img','fstk '+(cls||''));i.src=stkUrl(k,s);i.alt='';i.draggable=false;if(style)i.style.cssText+=style;return i;}
const STK_POOL=['strawberry','mushroom','bee','sakura','ladybug','clover','tulip'];
function hashStr(t){let h=7;for(const ch of String(t))h=(h*31+ch.charCodeAt(0))>>>0;return h;}
// every friend gets their own photo background: colour + pattern from their id
const FBG=[['#e9dccb','n'],['#dfe4d6','n'],['#e2e0e6','n'],['#ece2cf','n'],['#dde3e0','n'],['#e8dad6','n']];
function photoBg(id){const [c,p]=FBG[hashStr(id)%FBG.length];return {c,p};}
/* scalloped paper edge as a crisp pixel mask tile (2px steps) */
(function(){const c=document.createElement('canvas');c.width=16;c.height=8;const x=c.getContext('2d');x.fillStyle='#000';
  [[4,0,8,2],[2,2,12,2],[0,4,16,4]].forEach(([a,b,w,h])=>x.fillRect(a,b,w,h));
  const s=document.getElementById('gardens').style;s.setProperty('--scal',`url(${c.toDataURL()})`);
  // vanilla paper grain
  const p=document.createElement('canvas');p.width=p.height=16;const q=p.getContext('2d'),r=rng(7);q.fillStyle='#fff4d9';q.fillRect(0,0,16,16);
  for(let i=0;i<12;i++){q.fillStyle=r()<.5?'#f9ebc9':'#fffaf0';q.fillRect(Math.floor(r()*16),Math.floor(r()*16),1,1);}s.setProperty('--vanilla',`url(${p.toDataURL()})`);
})();
function drawEnvelope(open){const c=document.getElementById('fbEnvCv'),x=c.getContext('2d');x.clearRect(0,0,44,28);
  const r=(a,b,w,h,col)=>{x.fillStyle=col;x.fillRect(a,b,w,h);};
  r(1,6,42,21,'#5a3a2e');r(2,7,40,19,'#f4e2c4');
  for(let i=0;i<10;i++){r(2+i*2,26-i,2,1,'#d9bf92');r(40-i*2,26-i,2,1,'#d9bf92');}
  if(open){for(let i=0;i<10;i++)r(2+i*2,7-Math.min(i,6),40-i*4>0?40-i*4:0,1,'#fbefd8');r(1,0,42,1,'#5a3a2e');}
  else{for(let i=0;i<10;i++){r(2+i*2,7+i,2,1,'#5a3a2e');r(40-i*2,7+i,2,1,'#5a3a2e');}for(let y=0;y<9;y++)r(4+y*2,8+y,36-y*4,1,'#fbefd8');}
  // heart seal
  [[19,14,6,1],[18,15,8,5],[19,20,6,1]].forEach(([a,b,w,h])=>r(a,b,w,h,'#c9584f'));r(20,16,4,3,'#a8443d');r(19,15,1,1,'#e07a70');
}
document.getElementById('fbEnvBtn').onclick=()=>{envOpen=!envOpen;envTouched=true;envMsg('');renderEnv();if(envOpen)setTimeout(()=>document.getElementById('gEnterIn').focus(),60);};
document.getElementById('fbSet').onclick=()=>{const r2=document.getElementById('gListedRow');r2.hidden=!r2.hidden;};
function envMsg(t,ok){const m=document.getElementById('fbEnvMsg');if(!m)return;m.textContent=t||'';m.classList.toggle('ok',!!ok);}
window.__envMsg=envMsg;
function renderEnv(){drawEnvelope(envOpen);document.getElementById('fbEnvForm').hidden=!envOpen;document.getElementById('fbEnvBtn').setAttribute('aria-expanded',envOpen);
  const L=document.getElementById('fbLetters');L.innerHTML='';const n=incoming().length;
  L.appendChild(el('span','elab',envOpen?'× schließen':'+ Freund hinzufügen'));if(n)L.appendChild(el('span','ebadge',String(n)));}

/* ---------- left page: polaroids on the twine, memory notes, requests ---------- */
function polaroid(gd,i,mine){const d=mine?home:gd.data,id=mine?myId||'me':gd.id,b=photoBg(id);
  const t=el('button','apol');t.type='button';
  if((fbPage||'')===(mine?'me':gd.id))t.classList.add('sel');
  const ph=el('span','ph');ph.style.backgroundColor=b.c;ph.appendChild(avatarCv(d.look));t.appendChild(ph);
  t.appendChild(el('b','',mine?'ich':d.name));
  if(!mine){const st=fbStatusDe(gd);if(isPending(gd))t.appendChild(el('span','pst','Anfrage gesendet'));else if(st.on)t.appendChild(el('span','pst on','im Garten'));}
  t.onclick=()=>openFb(mine?'me':gd.id);return t;}
function garland(items){const w=el('div','garland');const tw=el('div','twine');w.appendChild(tw);const row=el('div','gpols');items.forEach(n=>row.appendChild(n));w.appendChild(row);return w;}
function note(txt,cls,rot){const n=el('div','anote '+(cls||''));n.style.setProperty('--rot',(rot||0)+'deg');n.innerHTML='';txt.forEach(([t,c])=>n.appendChild(el(c||'span','',t)));return n;}
function renderGardens(keep){
  if(!keep)renderNeighbours();
  const box=document.getElementById('glist'),side=document.getElementById('fbSide');box.innerHTML='';side.innerHTML='';
  renderEnv();
  if(!db){box.appendChild(el('div','empty','Freunde gibt es, sobald du angemeldet bist.'));renderFbPage();return;}
  if(home&&!home.handle)side.appendChild(handleBox());
  const inc=incoming();
  inc.forEach(gd=>{const r=el('div','areq');r.appendChild(avatarCv(gd.data.look,'fbav sm'));const tx=el('div','');tx.appendChild(el('b','',gd.data.name+' möchte deine Freund:in sein'));
      if(gd.data.handle)tx.appendChild(el('span','fh','@'+gd.data.handle));r.appendChild(tx);
      const ok=el('button','fbtn red','Annehmen');ok.type='button';ok.onclick=()=>{addFriend(gd.id);toast('Ihr seid jetzt Freunde.',2600);updateReqBadge();renderGardens(true);};
      const no=el('button','blink','später');no.type='button';no.onclick=()=>{home.fdecl=(home.fdecl||[]).concat([gd.id]).slice(-200);persist();updateReqBadge();renderGardens(true);};
      const bt=el('div','fbrb');bt.appendChild(ok);bt.appendChild(no);r.appendChild(bt);side.appendChild(r);});
  const q=(document.getElementById('gSearch').value||'').trim().toLowerCase().replace(/^@/,''),on=onlineIds();
  const all=fbVisible().filter(gd=>!inc.includes(gd));document.getElementById('gSearch').hidden=all.length<7&&!q;
  const match=gd=>!q||gd.data.name.toLowerCase().includes(q)||(gd.data.handle||'').includes(q);
  const ord=(a,b)=>(on.has(b.id)-on.has(a.id))||(lastAround(b.data)-lastAround(a.data));
  const friends=all.filter(gd=>(isFriend(gd)||isPending(gd))&&match(gd)).sort(ord),others=all.filter(gd=>!isFriend(gd)&&!isPending(gd)&&match(gd)).sort(ord);
  const pols=[];let i=0;if(home&&!q)pols.push(polaroid(null,i++,true));friends.forEach(gd=>pols.push(polaroid(gd,i++)));
  if(pols.length){const g=el('div','apols');pols.forEach(n=>g.appendChild(n));box.appendChild(g);}
  const none=!friends.length&&!q;if(none&&!envTouched&&!envOpen){envOpen=true;renderEnv();}
  document.getElementById('fbEnvForm').classList.toggle('first',none);
  if(others.length){box.appendChild(el('div','asec','andere Gärten'));const row=el('div','aothers');others.forEach(gd=>{const b=el('button','aoth');b.type='button';b.appendChild(avatarCv(gd.data.look,'fbav sm'));b.appendChild(el('span','',gd.data.name));b.onclick=()=>openFb(gd.id);row.appendChild(b);});box.appendChild(row);}
  renderFbPage();
}
function openFb(id){fbPage=id;fbTurn=true;renderGardens(true);if(innerWidth<=760)document.getElementById('fbR').scrollIntoView({block:'start',behavior:'smooth'});}
function handleBox(){
  const box=el('form','aname');box.autocomplete='off';
  box.appendChild(el('b','','Wähl deinen Benutzernamen'));box.appendChild(el('span','fsmall','Damit finden dich deine Freunde. Ändern geht auf deiner Seite.'));
  const row=el('div','fbin');row.appendChild(el('span','at','@'));const i=el('input','inp');i.maxLength=15;i.value=suggestHandle();i.setAttribute('autocapitalize','none');i.spellcheck=false;row.appendChild(i);box.appendChild(row);
  const b=el('button','fbtn red','Speichern');b.type='submit';box.appendChild(b);const er=el('div','fberr');box.appendChild(er);
  box.onsubmit=e=>{e.preventDefault();const h=i.value.trim().replace(/^@/,'').toLowerCase(),m=handleError(h);if(m){er.textContent=m;return;}home.handle=h;persist();toast('Du bist jetzt @'+h,2200);renderGardens(true);};
  return box;}

/* ---------- right page: the selected friend's own scrapbook page ---------- */
const fbFish={};
function fishCount(id,cb){if(fbFish[id]!==undefined)return fbFish[id];fbFish[id]=null;if(window.__fish)window.__fish.load(id).then(d=>{let n=0;if(d&&d.c)for(const k in d.c)n+=+d.c[k]||0;fbFish[id]=n;cb&&cb();}).catch(()=>{});return null;}
function prettyBday(v){const m=String(v||'').match(/^(\d{1,2})\.(\d{1,2})\.?$/);if(!m)return v;const mo=['Jan','Feb','März','April','Mai','Juni','Juli','Aug','Sep','Okt','Nov','Dez'][+m[2]-1];return mo?(+m[1])+'. '+mo:v;}
function renderFbPage(){
  const box=document.getElementById('fbPageBox');box.innerHTML='';
  let sel=fbPage;if(!sel){const f=gardensList.find(g=>isFriend(g));sel=f?f.id:'me';}
  const own=sel==='me',gd=own?null:gardensList.find(x=>x.id===sel);
  if(own&&!home||!own&&!gd){if(home)box.appendChild(el('div','empty','Wähl links jemanden aus.'));return;}
  const d=own?home:gd.data,id=own?(myId||'me'):gd.id,bg=photoBg(id),fb=d.fb||{};
  const pg=el('div','apage');box.appendChild(pg);
  const back=el('button','fbback','← zurück');back.type='button';back.onclick=()=>document.getElementById('fbL').scrollIntoView({block:'start',behavior:'smooth'});pg.appendChild(back);
  const hd=el('div','ahead');const h=el('h3','',own?'Meine Seite':d.name);hd.appendChild(h);
  if(d.handle)hd.appendChild(el('span','fh','@'+d.handle));pg.appendChild(hd);
  const ph=el('div','aphoto');const inner=el('div','ph');inner.style.backgroundColor=bg.c;inner.appendChild(avatarCv(d.look,'big'));ph.appendChild(inner);
  pg.appendChild(ph);
  const facts=el('div','afacts');
  const facts3=[['bday','Geburtstag']].filter(([k])=>fb[k]);
  facts3.forEach(([k,lab],j)=>{const f=el('div','afact');const t=el('div','');t.appendChild(el('span','small',lab));t.appendChild(el('b','',k==='bday'?prettyBday(fb[k]):fb[k]));f.appendChild(t);facts.appendChild(f);});
  if(!own&&!facts3.length)facts.appendChild(el('div','fsmall',d.name+' hat die Seite noch nicht ausgefüllt.'));
  if(!own)pg.appendChild(facts);
  if(!own){const more=FB_Q.filter(([k])=>!['flower','bday','food'].includes(k)&&fb[k]);if(more.length){const m=el('div','amore');more.forEach(([k,lab])=>{const r=el('div','');r.appendChild(el('span','small',lab+':'));r.appendChild(el('b','',fb[k]));m.appendChild(r);});pg.appendChild(m);}
    if(fb.motto){const n=el('div','anote msg');n.appendChild(el('b','','„'+fb.motto+'“'));n.appendChild(el('span','sig','– '+d.name));pg.appendChild(n);}
    // shared memories as little tickets
    const tk=el('div','atix');const st=fbStatusDe(gd);
    const tick=(a,b,c)=>{const t=el('div','tix');t.appendChild(el('span','small',a));t.appendChild(el('b','',b));tk.appendChild(t);};
    if(home&&home.frT&&home.frT[gd.id])tick('Freunde seit',new Date(home.frT[gd.id]).toLocaleDateString('de-DE',{day:'numeric',month:'short'}),'pink');
    if(st.t)tick(st.on?'gerade':'zuletzt da',st.on?'im Garten':st.t,'blue');
    const fc=fishCount(gd.id,()=>{if(gardensM.classList.contains('show'))renderFbPage();});if(fc)tick('Fische gefangen',fc+' 🐟','yellow');
    pg.appendChild(tk);
    const acts=el('div','aacts');const friend=isFriend(gd),pend=isPending(gd);
    const here=visiting&&visiting.id===gd.id,v=el('button','fbtn red',here?'du bist in diesem Garten':'✿ Garten besuchen');v.type='button';v.disabled=here;
    v.onclick=()=>{gardensM.classList.remove('show');fbPage=null;visit(gd);};acts.appendChild(v);
    if(home&&!friend&&!pend){const inc=(d.fr||[]).includes(myId),a=el('button','fbtn blue',inc?'Anfrage annehmen':'Freundschaftsanfrage');a.type='button';
      a.onclick=()=>{addFriend(gd.id);toast(inc?'Ihr seid jetzt Freunde.':'Anfrage an '+d.name+' geschickt.',2600);updateReqBadge();renderGardens(true);};acts.appendChild(a);}
    else if(pend)acts.appendChild(el('span','fsmall','Anfrage gesendet, wartet auf '+d.name));
    else if(friend){const u=el('button','blink','Freundschaft beenden');u.type='button';u.onclick=()=>{if(!u.dataset.a){u.dataset.a=1;u.textContent='nochmal tippen zum Beenden';return;}home.fr=myFr().filter(x=>x!==gd.id);persist();renderGardens(true);};acts.appendChild(u);}
    pg.appendChild(acts);
  } else {
    // your own page: fill-in lines like in a real friendship book
    const f=el('form','afill');f.autocomplete='off';
    const field=(name,lab,val,max,ph)=>{const l=el('label','');l.appendChild(el('span','small',lab));const i=el('input','');i.name=name;i.maxLength=max;i.value=val||'';if(ph)i.placeholder=ph;l.appendChild(i);f.appendChild(l);return i;};
    const hi=field('handle','Benutzername',home.handle||suggestHandle(),15);hi.setAttribute('autocapitalize','none');hi.spellcheck=false;
    FB_Q.forEach(([k,lab])=>field(k,lab,fb[k],40,k==='bday'?'TT.MM.':''));
    field('motto','Eine kleine Nachricht',fb.motto,40,'für deine Freunde');
    const er=el('div','fberr');f.appendChild(er);
    const sv=el('button','fbtn red','Speichern');sv.type='submit';sv.disabled=true;const done=el('span','fsaved','');
    const row=el('div','fsrow');row.appendChild(sv);row.appendChild(done);f.appendChild(row);
    f.oninput=()=>{sv.disabled=false;done.textContent='';er.textContent='';};
    f.onsubmit=e=>{e.preventDefault();const hh=f.elements.handle.value.trim().replace(/^@/,'').toLowerCase();if(hh!==home.handle){const m=handleError(hh);if(m){er.textContent=m;f.elements.handle.focus();return;}home.handle=hh;}
      const bd=f.elements.bday.value.trim();if(bd&&!/^\d{1,2}\.\d{1,2}\.?$/.test(bd)){er.textContent='Geburtstag bitte als TT.MM., z.B. 12.03.';return;}
      const nfb={};FB_Q.concat([['motto']]).forEach(([k])=>{const v=nodot(f.elements[k].value.trim()).slice(0,40);if(v)nfb[k]=v;});home.fb=nfb;persist();renderGardens(true);const s2=document.querySelector('#fbPageBox .fsaved');if(s2)s2.textContent='✓ gespeichert';};
    pg.appendChild(f);
  }
  if(fbTurn){pg.classList.add('turn');fbTurn=false;}

}
