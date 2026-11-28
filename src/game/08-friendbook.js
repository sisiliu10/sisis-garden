/* ================= friend book (Freundebuch) ================= */
// A little scrapbook like the friendship books from primary school: a sage linen cover, ivory paper,
// friends as taped polaroids on the left page, "Let's grow together" (find a friend, invite) on the right page.
// Tapping a friend turns the right page to their "All about me" entry. All friend logic stays as it was.
const FB_Q=[['flower','My favourite flower','tulip'],['season','My favourite season','blossom'],['drink','My favourite drink','cup'],
  ['pet','My little companion','paw'],['hobby','My hobbies','brush'],['food','My favourite food','bowl'],['dream','My dream','star']];
let fbPage=null,fbTurn=false;
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
/* ---------- tiny pixel sprites for the book (drawn once, crisp, no smoothing) ---------- */
const FBP={o:'#5a4636',g:'#7f9a72',G:'#5e7a52',l:'#a9c296',p:'#e3a3b3',P:'#c97b8f',y:'#f2c94c',w:'#fffaf0',c:'#e8d6b0',C:'#c9ae7c',r:'#d6606e',b:'#8fb7d8',v:'#b7a3df',k:'#3a2e2a',t:'#f6efe0'};
const FBS={
  flower:["..p.p..",".pPpPp.","pPpypPp",".pPpPp.","..pgp..","...g...","..lg...","...g..."],
  sprig:["....l.","...lg.","..lgl.",".lg.l.","lg..l.","g.....","g....."],
  heart:[".rr.rr.","rrrrrrr","rrrrrrr",".rrrrr.","..rrr..","...r..."],
  tulip:[".p.p.",".pPp.",".PPP.","..g..",".lg..","..g.."],
  blossom:[".p.p.","ppypp",".p.p.","..p.."],
  cup:[".....","ooooo.","ottto.","otttoo","ottto.",".ooo.."],
  paw:[".o.o.","o.o.o",".ooo.","ooooo",".ooo."],
  brush:["....o","...oy","..oy.",".Co..","CC...","C...."],
  bowl:["..y..",".yCy.","ooooo",".ooo."],
  star:["..y..",".yyy.","yyyyy",".y.y."],
  envelope:["CCCCCCCCCCCCCCCCC","CCcccccccccccccCC","CcCcccccccccccCcC","CccCcccccccccCccC","CcccCccrcrccCcccC","CccccCrrrrrCccccC","CcccccCrrrCcccccC","CcccccccCcccccccC","CcccccccccccccccC","CcccccccccccccccC","CCCCCCCCCCCCCCCCC"],
};
const fbSprCache={};
function fbSprite(k,scale){const key=k+(scale||1);if(fbSprCache[key])return fbSprCache[key];const rows=FBS[k],w=Math.max(...rows.map(r=>r.length)),h=rows.length,s=scale||1;
  const c=document.createElement('canvas');c.width=w*s;c.height=h*s;const x=c.getContext('2d');
  rows.forEach((r,y)=>[...r].forEach((ch,i)=>{if(ch==='.'||!FBP[ch])return;x.fillStyle=FBP[ch];x.fillRect(i*s,y*s,s,s);}));
  return fbSprCache[key]=c.toDataURL();}
function fbImg(k,cls,scale){const i=el('img','fbspr '+(cls||''));i.src=fbSprite(k,scale||1);i.alt='';i.draggable=false;return i;}
// paper grain and linen cover as tiny pixel tiles
(function(){const tile=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');f(x);return 'url('+c.toDataURL()+')';};
  const r=rng(42),s=document.getElementById('gardens').style;
  s.setProperty('--fb-paper',tile(16,16,x=>{x.fillStyle='#fbf4e4';x.fillRect(0,0,16,16);for(let i=0;i<14;i++){x.fillStyle=r()<.5?'#f3e9d3':'#fffaf0';x.fillRect(Math.floor(r()*16),Math.floor(r()*16),1,1);}}));
  s.setProperty('--fb-cover',tile(4,4,x=>{x.fillStyle='#6f8a5c';x.fillRect(0,0,4,4);x.fillStyle='#7c9768';x.fillRect(0,0,1,1);x.fillRect(2,2,1,1);x.fillStyle='#637d52';x.fillRect(2,0,1,1);x.fillRect(0,2,1,1);}));
  // decorations that stay on the pages
  const L=document.getElementById('fbL'),Rp=document.getElementById('fbR');
  L.prepend(fbImg('flower','dk dk1',3),fbImg('sprig','dk dk2',3));L.appendChild(fbImg('heart','dk dk3',2));
  Rp.prepend(fbImg('sprig','dk dk4',3),fbImg('flower','dk dk5',2));
  document.getElementById('fbEnv').src=fbSprite('envelope',4);
  document.getElementById('fbSet').onclick=()=>{const r2=document.getElementById('gListedRow');r2.hidden=!r2.hidden;};
})();
const PASTEL=['#f3d27a','#eea3b2','#9fd09a','#b3a3e6','#f5b682'],TAPE=['tY','tM','tP','tL'];
function polaroid(look,name,sub,small,i,cls){const t=el('button','pol '+(cls||'')+' '+TAPE[i%4]);t.type='button';t.style.setProperty('--rot',[-2.2,1.6,-1,2.4,-.6][i%5]+'deg');
  const ph=el('span','ph');ph.style.background=PASTEL[i%5];if(look)ph.appendChild(avatarCv(look));else ph.appendChild(el('span','plus','+'));t.appendChild(ph);
  t.appendChild(el('b','',name));if(sub)t.appendChild(el('span','fh',sub));if(small)t.appendChild(el('span','fs'+(small.on?' on':''),small.t));return t;}
function renderGardens(keep){
  if(!keep)renderNeighbours();
  const panel=document.querySelector('#gardens .panel'),box=document.getElementById('glist'),side=document.getElementById('fbSide');box.innerHTML='';side.innerHTML='';
  panel.classList.toggle('fbopen',!!fbPage);
  document.getElementById('fbTools').hidden=!!fbPage;
  if(fbPage){renderFbPage(side);if(fbTurn){side.classList.remove('turn');void side.offsetWidth;side.classList.add('turn');fbTurn=false;}}
  if(!db){box.appendChild(el('div','empty','Gardens sync once you are signed in.'));return;}
  if(home&&!home.handle&&!fbPage)side.appendChild(handleBox());
  // friend requests arrive as little letters on the right page
  const inc=incoming();
  if(inc.length&&!fbPage){inc.forEach(gd=>{const r=el('div','fbreq');r.appendChild(fbImg('envelope','env',2));const tx=el('div','fbrt');tx.appendChild(el('b','',gd.data.name+' wants to be friends'));
      if(gd.data.handle)tx.appendChild(el('span','fh','@'+gd.data.handle));r.appendChild(tx);
      const ok=el('button','bsage','Accept ♡');ok.type='button';ok.onclick=()=>{addFriend(gd.id);toast('You and '+gd.data.name+' are friends now ♥',2600);updateReqBadge();renderGardens(true);};
      const no=el('button','blink','not now');no.type='button';no.onclick=()=>{home.fdecl=(home.fdecl||[]).concat([gd.id]).slice(-200);persist();updateReqBadge();renderGardens(true);};
      const bt=el('div','fbrb');bt.appendChild(ok);bt.appendChild(no);r.appendChild(bt);side.appendChild(r);});}
  const q=(document.getElementById('gSearch').value||'').trim().toLowerCase().replace(/^@/,''),on=onlineIds();
  const all=fbVisible().filter(gd=>!inc.includes(gd));document.getElementById('gSearch').hidden=all.length<7&&!q;
  const match=gd=>!q||gd.data.name.toLowerCase().includes(q)||(gd.data.handle||'').includes(q);
  const ord=(a,b)=>(on.has(b.id)-on.has(a.id))||(lastAround(b.data)-lastAround(a.data));
  const friends=all.filter(gd=>isFriend(gd)&&match(gd)).sort(ord),pend=all.filter(gd=>isPending(gd)&&match(gd)).sort(ord),
        others=all.filter(gd=>!isFriend(gd)&&!isPending(gd)&&match(gd)).sort(ord);
  const grid=el('div','fbgrid');box.appendChild(grid);let i=0;
  if(home&&!q){const me=polaroid(home.look,'My page',home.handle?'@'+home.handle:'',null,i++,'me'+(fbPage==='me'?' sel':''));me.onclick=()=>openFb('me');grid.appendChild(me);}
  friends.concat(pend).forEach(gd=>{const p=polaroid(gd.data.look,gd.data.name,gd.data.handle?'@'+gd.data.handle:'',isPending(gd)?{t:'request sent'}:fbStatus(gd),i++,(isPending(gd)?'pend':'')+(fbPage===gd.id?' sel':''));
    p.onclick=()=>openFb(gd.id);grid.appendChild(p);});
  const add=polaroid(null,'Add friend','',null,i++,'add');add.onclick=()=>{if(fbPage){fbPage=null;renderGardens(true);}const inp=document.getElementById('gEnterIn');inp.scrollIntoView({block:'center',behavior:'smooth'});setTimeout(()=>inp.focus(),250);};grid.appendChild(add);
  if(others.length){box.appendChild(el('div','fbsec','other gardens'));const g2=el('div','fbgrid');others.forEach(gd=>{const p=polaroid(gd.data.look,gd.data.name,gd.data.handle?'@'+gd.data.handle:'',fbStatus(gd),i++,fbPage===gd.id?'sel':'');p.onclick=()=>openFb(gd.id);g2.appendChild(p);});box.appendChild(g2);}
}
function openFb(id){fbPage=id;fbTurn=true;renderGardens(true);if(innerWidth<=760)document.getElementById('fbR').scrollIntoView({block:'start'});}
function handleBox(){
  const box=el('form','fbname');box.autocomplete='off';
  box.appendChild(el('div','fbnt','Pick your username ♡'));box.appendChild(el('div','fs','Friends find you with it. You can change it on your page.'));
  const row=el('div','fbadd');row.appendChild(el('span','at','@'));const i=el('input','inp');i.maxLength=15;i.value=suggestHandle();i.setAttribute('autocapitalize','none');i.spellcheck=false;row.appendChild(i);
  const b=el('button','bsage','Save');b.type='submit';row.appendChild(b);box.appendChild(row);const er=el('div','fberr');box.appendChild(er);
  box.onsubmit=e=>{e.preventDefault();const h=i.value.trim().replace(/^@/,'').toLowerCase(),m=handleError(h);if(m){er.textContent=m;return;}home.handle=h;persist();toast('You are @'+h+' now.',2200);renderGardens(true);};
  return box;}
// the "All about me" entry of a friend (or your own page to fill in)
function renderFbPage(box){
  const back=el('button','fbback','← all friends');back.type='button';back.onclick=()=>{fbPage=null;renderGardens(true);};box.appendChild(back);
  const pg=el('div','fbpg');box.appendChild(pg);
  const own=fbPage==='me',gd=own?null:gardensList.find(x=>x.id===fbPage);
  if(own&&!home||!own&&!gd){fbPage=null;renderGardens(true);return;}
  const d=own?home:gd.data,st=own?null:fbStatus(gd),friend=!own&&isFriend(gd),pend=!own&&isPending(gd);
  const hd=el('div','fbhd');const por=el('div','pol big tP');por.style.setProperty('--rot','-2deg');const ph=el('span','ph');ph.style.background='#f3d27a';ph.appendChild(avatarCv(d.look));por.appendChild(ph);hd.appendChild(por);
  const ht=el('div','fbht');ht.appendChild(el('h3','','All about me ♡'));ht.appendChild(el('div','fbsub','my little corner of the garden'));
  const kv=(k,v)=>{const r=el('div','kv');r.appendChild(el('b','',k+': '));r.appendChild(document.createTextNode(v));return r;};
  ht.appendChild(kv('Name',d.name+(d.handle?'  @'+d.handle:'')));
  if(d.since)ht.appendChild(kv('Gardening since',new Date(d.since).toLocaleDateString(undefined,{month:'long',year:'numeric'})));
  if(st&&st.t)ht.appendChild(el('div','fs'+(st.on?' on':''),st.t));
  if(friend)ht.appendChild(el('div','fbfr','♥ friends'));
  hd.appendChild(ht);pg.appendChild(hd);
  if(own){
    const f=el('form','fbform');f.autocomplete='off';
    const field=(name,lab,val,max,icon)=>{const l=el('label','fbq');const sp=el('span','');if(icon)sp.prepend(fbImg(icon,'qi',2));sp.appendChild(document.createTextNode(lab));l.appendChild(sp);
      const i=el('input','inp');i.name=name;i.maxLength=max;i.value=val||'';l.appendChild(i);f.appendChild(l);return i;};
    const hi=field('handle','Username',home.handle||suggestHandle(),15);hi.setAttribute('autocapitalize','none');hi.spellcheck=false;
    FB_Q.forEach(([k,lab,ic])=>field(k,lab,home.fb&&home.fb[k],40,ic));
    field('motto','A little note from me',home.fb&&home.fb.motto,40,'heart');
    const er=el('div','fberr');f.appendChild(er);
    const sv=el('button','bsage','Save my page ♡');sv.type='submit';f.appendChild(sv);
    f.onsubmit=e=>{e.preventDefault();const h=f.elements.handle.value.trim().replace(/^@/,'').toLowerCase();if(h!==home.handle){const m=handleError(h);if(m){er.textContent=m;f.elements.handle.focus();return;}home.handle=h;}
      const fb={};FB_Q.concat([['motto']]).forEach(([k])=>{const v=nodot(f.elements[k].value.trim()).slice(0,40);if(v)fb[k]=v;});home.fb=fb;persist();toast('Saved. Your friends can read it now.',2200);fbPage=null;renderGardens(true);};
    pg.appendChild(f);return;}
  const ps=d.projects||[],sk=d.skills||[],chips=el('div','fbchips');
  [ps.length+(ps.length===1?' project':' projects'),sk.length+(sk.length===1?' skill':' skills'),'watered '+Math.round(gardenAvg(d))+'%'].forEach(t=>chips.appendChild(el('span','fbchip',t)));pg.appendChild(chips);
  const qa=FB_Q.filter(([k])=>d.fb&&d.fb[k]);
  if(qa.length){const g=el('div','fbqa');qa.forEach(([k,lab,ic])=>{const c=el('div','qa');c.appendChild(el('span','ql',lab));const v=el('span','qv');v.appendChild(fbImg(ic,'qi',2));v.appendChild(document.createTextNode(d.fb[k]));c.appendChild(v);g.appendChild(c);});pg.appendChild(g);}
  if(d.fb&&(d.fb.motto||d.fb.like)){const n=el('div','fbnote');n.appendChild(el('span','ql','A little note from me…'));n.appendChild(el('div','nt',(d.fb.motto||d.fb.like)+' ♡'));pg.appendChild(n);}
  if(!qa.length&&!(d.fb&&d.fb.motto))pg.appendChild(el('div','fbnone',d.name+' has not filled in their page yet.'));
  const acts=el('div','fbacts');
  const here=visiting&&visiting.id===gd.id,v=el('button','bsage',here?'You are in this garden':'✿ Visit my garden');v.type='button';v.disabled=here;
  v.onclick=()=>{gardensM.classList.remove('show');fbPage=null;visit(gd);};acts.appendChild(v);
  if(home&&!friend&&!pend){const inc=(d.fr||[]).includes(myId),a=el('button','bpink',inc?'Accept friend request ♡':'Send friend request ♡');a.type='button';
    a.onclick=()=>{addFriend(gd.id);toast(inc?'You and '+d.name+' are friends now ♥':'Friend request sent to '+d.name+'.',2600);updateReqBadge();renderGardens(true);};acts.appendChild(a);}
  else if(pend)acts.appendChild(el('span','fs','request sent, waiting for '+d.name));
  else if(friend){const u=el('button','blink','remove friend');u.type='button';u.onclick=()=>{if(!u.dataset.a){u.dataset.a=1;u.textContent='tap again to remove';return;}
    home.fr=myFr().filter(x=>x!==gd.id);persist();renderGardens(true);};acts.appendChild(u);}
  pg.appendChild(acts);
}
