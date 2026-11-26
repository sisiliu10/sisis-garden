/* ================= config ================= */
const CW=240, CH=352;
const DAY=86400000, DECAY_MS=7*DAY, LOG_MAX=60;
const STAGE_NAMES=['Seed','Sprout','Sapling','Budding','In bloom'];
const KINDS=['tree','sunflower','lantern','plum','tea','bamboo','beet'];
const KIND_LABEL={tree:'Tree',sunflower:'Sunflower',lantern:'Lantern plant',plum:'Plum blossom',tea:'Tea bush',bamboo:'Bamboo',beet:'Beet'};
const SLOTS=[[120,174],[36,214],[198,202],[34,258],[206,258],[66,318],[104,330],[166,276]];
const TOPS={sunflower:[5,10,15,23,34],lantern:[5,10,13,19,22],plum:[5,10,14,27,28],tea:[5,10,8,12,17],tree:[5,10,18,27,39],bamboo:[5,10,13,20,27],beet:[5,10,11,16,21]};
const FOUNT={x:120,y:258};
const WORLD_H=570, BED_W=46, BED_H=28;
// the pond at the end of the path, with a little wooden dock to fish from
const POND={x:120,y:530,rx:76,ry:23}, DOCK={x0:112,x1:128,y0:496,y1:527};
const POOL={x0:150,x1:208,y0:298,y1:334}, BOARD={x0:204,x1:230,y:316};
const BED_SLOTS=[[30,390],[84,390],[30,436],[84,436]];
const FLOWERS=['peony','tulip','daisy','lavender','cornflower','marigold'];
const FLOWER_LABEL={peony:'Peony',tulip:'Tulip',daisy:'Daisy',lavender:'Lavender',cornflower:'Cornflower',marigold:'Marigold'};
const FLOWER_COL={peony:['#f2779a','#ffd0dc','#c94a6e'],tulip:['#e8435a','#ff9aa8','#b02a3e'],daisy:['#ffffff','#f2c94c','#d9d9d9'],lavender:['#9b7bd6','#c7b1f0','#6f52a8'],cornflower:['#4f7fe0','#a9c3ff','#2f56a8'],marigold:['#f39a1e','#ffd06a','#c46a0c']};
const BED_STAGES=['Seeded','Sprouting','Growing','Blooming','Full bloom'];
const BED_ORDER=[5,2,9,0,7,10,3,6,11,1,8,4];
const SISI_SKILLS=[{id:'chinese',slot:0,code:'CONFUCIUS',why:'First line of the Analects: to learn and keep practising, is that not a joy?',name:'Learning Chinese',sub:'Skill',kind:'peony',url:'',progress:50,w:100}];
const SISI=[
  {id:'evergreen',slot:0,code:'HIPPOCRATES',why:'Father of medicine: care for patients, here through smarter hospital buying.',name:'SANOVIO',sub:'Day job, Founders Associate',kind:'tree',url:'',progress:70,w:78},
  {id:'helios',slot:1,code:'PLATO',why:'The Republic: every person in the role that fits their nature. That is recruiting.',name:'Recruiting Service',sub:'Talent for high-performance startups',kind:'sunflower',url:'https://claude.ai/artifact/CJPuQdDQXnnWkWCnHuHcux',progress:40,w:52},
  {id:'lumen',slot:2,code:'SOCRATES',why:'Taught by asking questions until people truly understood. That is product education.',name:'Product Education',sub:'Product educator & offline B2B sales',kind:'lantern',url:'https://claude.ai/artifact/YB33W7TjgC9V4cnaaG5YYB',progress:40,w:30},
  {id:'meihua',slot:3,code:'LEFEBVRE',why:'The Production of Space: places become alive through what people do in them.',name:'Event Marketplace',sub:'Freiraum, spaces for brand events',kind:'plum',url:'https://claude.ai/artifact/UW8b7bF8Rk5wKHQ7k9Hveh',progress:55,w:64},
  {id:'jasmine',slot:4,code:'LAOZI',why:'The Dao: harmony with nature, slowness, balance. The spirit of a cup of herbal tea.',name:'Herbal Tea Brand',sub:'No page yet',kind:'tea',url:'',progress:10,w:22},
  {id:'substack',slot:5,code:'MONTAIGNE',why:'Invented the essay: wrote about whatever was on his mind, to find out what he thought. That is your Substack.',name:'Substack',sub:'Essays & thoughts',kind:'bamboo',url:'',progress:20,w:60},
];
const STARTER=[{id:'first',slot:0,code:'NEW SEED',why:'Tip: name it after a philosopher whose idea fits the project.',name:'My first project',sub:'Tap Edit to rename',kind:'sunflower',url:'',progress:5,w:100}];
const OPT={
  skin:['#fde4d0','#f7d3b5','#eab892','#cf9670','#a06c48','#6e4632'],
  hair:['long','bob','bun','pony','short'],
  hairColor:['#1d1a22','#3b2a22','#6b4430','#c99b5c','#eba3bb','#8fa0d6'],
  top:['#ffffff','#f4a7b9','#9fc4ef','#b8e0a8','#2d2d35','#f2d16b','#c9a6e8'],
  bottom:['skirt','pants'],
  bottomColor:['#2d2d35','#ffffff','#7a90c2','#c96f6f','#d9c4a3'],
  acc:['none','shades','headband','clip'],
};
const DEF_LOOK={skin:OPT.skin[1],hair:'long',hairColor:OPT.hairColor[0],top:OPT.top[0],bottom:'skirt',bottomColor:OPT.bottomColor[0],acc:'none'};
const ACC_LABEL={none:'None',glasses:'Glasses',shades:'Sunglasses',headband:'Pearl band',clip:'Hair clip',bow:'Bow',cap:'Cap',straw:'Straw hat',crown:'Crown'};
const HAIR_LABEL={long:'Long',bob:'Bob',bun:'Bun',pony:'Ponytail',short:'Short'};

/* ================= helpers ================= */
function ofToday(){const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const num=(v,d)=>(typeof v==='number'&&isFinite(v))?v:d;
const str=(v,n)=>typeof v==='string'?v.slice(0,n):'';
const pick=a=>a[Math.floor(Math.random()*a.length)];
const nodot=t=>t.replace(/\s*[\u00b7\u2022]\s*/g,', ');
const cap=t=>t.charAt(0).toUpperCase()+t.slice(1);
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function hex(c){c=c.replace('#','');return[parseInt(c.slice(0,2),16),parseInt(c.slice(2,4),16),parseInt(c.slice(4,6),16)];}
function toHex(a){return '#'+a.map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,'0')).join('');}
function mix(a,b,t){const A=hex(a),B=hex(b);return toHex(A.map((v,i)=>v+(B[i]-v)*t));}
function shade(c,amt){return amt<0?mix(c,'#000000',-amt):mix(c,'#ffffff',amt);}

/* ================= data model ================= */
const EXTRA_LOOK={hairColor:['#c27a42'],top:['#2b3550'],acc:['glasses','bow','cap','straw','crown']};
function cleanLook(l){const o={};for(const k in DEF_LOOK){const ok=(OPT[k]||[]).concat(EXTRA_LOOK[k]||[]);o[k]=(l&&ok.includes(l[k]))?l[k]:DEF_LOOK[k];}return o;}
const LINK_TITLES={'https://claude.ai/artifact/CJPuQdDQXnnWkWCnHuHcux':'Recruiting landing page','https://claude.ai/artifact/YB33W7TjgC9V4cnaaG5YYB':'Product Education landing page','https://claude.ai/artifact/UW8b7bF8Rk5wKHQ7k9Hveh':'Freiraum website'};
function cleanLinks(p){
  let L=Array.isArray(p.links)?p.links:(p.url?[{t:LINK_TITLES[p.url]||'Open page',u:p.url}]:[]);
  return L.filter(x=>x&&/^https:\/\//.test(x.u||'')).slice(0,6).map(x=>({t:str(x.t,40)||'Open page',u:str(x.u,300)}));
}
function cleanProject(p,i,bed){
  if(!p||typeof p!=='object') return null;
  const now=Date.now();
  return {id:(str(p.id,40)||('p'+i)).replace(/[^\w-]/g,''),slot:clamp(Math.round(num(p.slot,i)),0,SLOTS.length-1),
    code:str(p.code,24)||'PROJECT',why:nodot(str(p.why,160)),name:nodot(str(p.name,40)),sub:nodot(str(p.sub,60)),
    kind:(bed?FLOWERS:KINDS).includes(p.kind)?p.kind:(bed?'tulip':'sunflower'),bed:!!bed,url:/^https:\/\//.test(p.url||'')?str(p.url,300):'',links:cleanLinks(p),vis:p.vis!==false,lk:!!p.lk,pos:(p.pos&&Number.isFinite(p.pos.x)&&Number.isFinite(p.pos.y))?{x:Math.round(clamp(p.pos.x,-60,300)),y:Math.round(clamp(p.pos.y,140,480))}:null,
    progress:clamp(Math.round(num(p.progress,0)),0,100),w:clamp(num(p.w,60),0,100),t:Math.min(num(p.t,now),now),last:num(p.last,0)};
}
function cleanGarden(g){
  if(!g||typeof g!=='object'||!Array.isArray(g.projects)) return null;
  g.projects.forEach(p=>{if(p&&p.id==='substack'&&p.code==='LEIBNIZ'){p.code='MONTAIGNE';p.why='Invented the essay: wrote about whatever was on his mind, to find out what he thought. That is your Substack.';if(p.sub==='Newsletter')p.sub='Essays & thoughts';}});
  const used=new Set(), projects=[];
  g.projects.slice(0,SLOTS.length).forEach((p,i)=>{const c=cleanProject(p,i);if(!c)return;
    if(used.has(c.slot)){for(let s=0;s<SLOTS.length;s++)if(!used.has(s)){c.slot=s;break;}}
    used.add(c.slot);projects.push(c);});
  const used2=new Set(), skills=[];
  const rawS=Array.isArray(g.skills)?g.skills:(g.projects.some(p=>p&&p.id==='evergreen')?SISI_SKILLS.map(x=>Object.assign({},x,{t:Date.now(),last:0})):[]);
  rawS.slice(0,BED_SLOTS.length).forEach((p,i)=>{const c=cleanProject(p,i,true);if(!c)return;
    if(used2.has(c.slot)){for(let s=0;s<BED_SLOTS.length;s++)if(!used2.has(s)){c.slot=s;break;}}
    used2.add(c.slot);skills.push(c);});
  return {v:2,name:str(g.name,14)||'Someone',look:cleanLook(g.look),projects,skills,saved:num(g.saved,0),owner:!!g.owner,cat:!!g.cat,sb:g.sb!==false,listed:g.listed===undefined?!!g.owner:!!g.listed,friends:Array.isArray(g.friends)?g.friends.filter(x=>typeof x==='string'&&x.length<64).slice(0,100):[],nb:Array.isArray(g.nb)?g.nb.filter(x=>x&&/^https:\/\//.test(x.u||'')).slice(0,10).map(x=>({n:str(x.n,30)||'Friend',u:str(x.u,300)})):[],created:g.created!==false,hs:!!g.hs,ask:(g.ask&&typeof g.ask==='object')?Object.fromEntries(Object.entries(g.ask).slice(0,40).map(([k,v])=>[str(k,24),num(v,0)])):{},askDay:str(g.askDay,12),ai:!!g.ai,aiDay:str(g.aiDay,12),
    aiRep:(g.aiRep&&typeof g.aiRep==='object'&&g.aiRep.lines&&typeof g.aiRep.lines==='object')?{d:str(g.aiRep.d,12),lines:Object.fromEntries(Object.entries(g.aiRep.lines).slice(0,8).map(([k,v])=>[str(k,24),str(v,140)]))}:null,
    od:(g.od&&typeof g.od==='object')?Object.fromEntries(Object.entries(g.od).slice(0,20).map(([k,v])=>[str(k,24),str(v,12)])):{},
    on:Array.isArray(g.on)?g.on.filter(x=>x&&typeof x.text==='string').slice(-8).map(x=>Object.assign({id:str(x.id,24),pid:str(x.pid,24),code:str(x.code,14),d:str(x.d,12),st:['new','done','gone'].includes(x.st)?x.st:'gone',text:str(x.text,60)},x.ai?{ai:true}:{})):[],
    compost:Array.isArray(g.compost)?g.compost.filter(x=>x&&typeof x==='object').slice(0,30).map((x,i)=>{const c=cleanProject(x,0,!!x.bed);if(!c)return null;c.ct=num(x.ct,0);c.note=str(x.note,90);
      c.lg=Array.isArray(x.lg)?x.lg.slice(-LOG_MAX).filter(e=>e&&typeof e.text==='string').map(e=>({t:num(e.t,0),text:str(e.text,140)})):[];return c;}).filter(Boolean):[],
    todos:Array.isArray(g.todos)?g.todos.filter(x=>x&&typeof x.text==='string'&&x.text.trim()).slice(0,10).map((x,i)=>Object.assign({id:str(x.id,24)||('t'+i),text:str(x.text,60),t:num(x.t,0)},x.lk?{lk:true}:{},Number.isInteger(x.k)?{k:x.k%10}:{},Number.isInteger(x.c)?{c:x.c%8}:{})):[],
    notes:(g.notes&&typeof g.notes==='object')?Object.fromEntries(Object.entries(g.notes).slice(0,20).map(([k,v])=>[k,str(v,90)])):{},
    logs:(g.logs&&typeof g.logs==='object')?Object.fromEntries(Object.entries(g.logs).slice(0,20).filter(([k,v])=>Array.isArray(v)).map(([k,v])=>[k,v.slice(-LOG_MAX).filter(e=>e&&typeof e.text==='string').map(e=>({t:num(e.t,0),text:str(e.text,140)}))])):{}};
}
function preset(list,name,sk){
  const now=Date.now();
  return cleanGarden({v:2,name,created:false,look:DEF_LOOK,saved:0,notes:{},projects:list.map(p=>Object.assign({},p,{t:now,last:0})),skills:(sk||[]).map(p=>Object.assign({},p,{t:now,last:0}))});
}
function migrate(s){
  if(!s||typeof s!=='object') return null;
  if(Array.isArray(s.projects)) return cleanGarden(s);
  if(s.plants){ // v1
    const now=Date.now(), notes={};
    const projects=SISI.map(p=>{const o=s.plants[p.id];if(o&&o.note)notes[p.id]=o.note;
      return Object.assign({},p,o?{w:num(o.w,p.w),t:num(o.t,now),last:num(o.last,0)}:{t:now,last:0});});
    return cleanGarden({name:s.name||'Sisi',look:s.look,created:!!s.created,saved:num(s.saved,0),notes,projects});
  }
  return null;
}

/* ================= state ================= */
const LKEY='sisis-garden-v2', LKEY1='sisis-garden-v1', MEKEY='garden-me';
let loadFailed=false;
let home=null, visiting=null, myId=null, isOwner=false, canWrite=true, db=null, gardensList=[], started=false;
let localMe={name:'Me',look:Object.assign({},DEF_LOOK)};
try{ home=migrate(JSON.parse(localStorage.getItem(LKEY))); }catch(e){}
if(!home){ try{ home=migrate(JSON.parse(localStorage.getItem(LKEY1))); }catch(e){} }
try{ const m=JSON.parse(localStorage.getItem(MEKEY)); if(m) localMe={name:str(m.name,14)||'Me',look:cleanLook(m.look)}; }catch(e){}
const me=()=>home||localMe;
const V=()=>visiting?visiting.data:home;
const projects=()=>(V()?V().projects:[]);
const skills=()=>(V()&&V().skills?V().skills:[]);
const items=()=>projects().concat(skills());

const waterOf=p=>clamp(p.w-(Date.now()-p.t)/DECAY_MS*100,0,100);
const neglectDays=p=>(Date.now()-p.t)/DAY;
const stageOf=p=>{const v=p.progress;return v<10?0:v<25?1:v<45?2:v<65?3:4;};
// plants grow a little with every bit of progress, so each watering is visible: within a stage they swell, then switch to the next shape
const STG=[0,10,25,45,65];
const scaleOf=p=>{if(p.bed)return 1;const v=p.progress;if(v>=65)return 1+(v-65)/35;const st=stageOf(p),a=STG[st],b=STG[st+1];return .9+.25*(v-a)/(b-a);};
const weedsOf=p=>{const d=neglectDays(p);return d<5?0:Math.min(9,2+Math.floor((d-5)/1.2));};
const fliesOf=p=>{const d=neglectDays(p);return d<9?0:Math.min(6,2+Math.floor((d-9)/2));};
const plantTop=p=>p.bed?12:TOPS[p.kind][stageOf(p)]*scaleOf(p);
const slotOf=p=>(p.bed?BED_SLOTS:SLOTS)[p.slot]||SLOTS[0];
const posOf=p=>{
  if(!p.pos) return slotOf(p);
  const m=p.bed?BED_W/2+4:30, lo=-OX+m, hi=p.bed?88:CW+OX-m, cx=clamp(p.pos.x,lo,hi);
  if(Math.abs(cx-p.pos.x)<=16) return [cx,p.pos.y];
  // placed on a wider screen, out of view here: fall back to its own spot when that is free
  const sl=slotOf(p), free=!(p.bed?skills():projects()).some(q=>{if(q===p)return false;
    const qp=q.pos&&q.pos.x>=lo&&q.pos.x<=hi?[q.pos.x,q.pos.y]:slotOf(q);
    return p.bed?(Math.abs(qp[0]-sl[0])<BED_W+4&&Math.abs(qp[1]-sl[1])<BED_H+4):Math.hypot(qp[0]-sl[0],(qp[1]-sl[1])*1.4)<26;});
  return free?sl:[cx,p.pos.y];
};

/* ================= persistence ================= */
function localSave(){
  try{ if(home) localStorage.setItem(LKEY,JSON.stringify(home)); else localStorage.setItem(MEKEY,JSON.stringify(localMe)); }catch(e){}
}
function makeWriter(getRef,getData){
  let busy=false,again=false,fails=0;
  const run=async()=>{
    const ref=getRef(); if(!ref) return;
    if(busy){again=true;return;}
    busy=true;
    try{ await ref.set(getData()); fails=0; }
    catch(e){ if(e&&e.code==='invalid_argument'&&ref===pubRef()){ canWrite=false; } else if(++fails<=5) setTimeout(run,8000*fails); }
    busy=false;
    if(again){again=false;run();}
  };
  return run;
}
const privRef=()=>(db&&myId)?db.doc('data/users/'+myId+'/garden'):null;
const booksRef=()=>(db&&myId)?db.doc('data/users/'+myId+'/books'):null;
const pubRef=()=>(db&&myId&&canWrite!==false)?db.doc('gardens/'+myId):null;
const writePriv=makeWriter(privRef,()=>JSON.parse(JSON.stringify(home)));
const open_=a=>(a||[]).filter(x=>!x.lk);
function sharedPart(obj){const out={};home.projects.concat(home.skills||[]).forEach(p=>{if(p.vis!==false&&!p.lk&&obj&&obj[p.id])out[p.id]=obj[p.id];});return out;}
const writePub=makeWriter(pubRef,()=>({v:2,name:home.name,look:home.look,listed:isListed(),owner:isOwner,saved:home.saved,projects:open_(home.projects),skills:open_(home.skills),notes:sharedPart(home.notes),logs:sharedPart(home.logs),todos:(home.todos||[]).slice(0,10).map(td=>({id:td.id,text:'private',t:td.t||0,k:tdKind(td),c:tdCi(td)})),compost:open_(home.compost).map(c=>({id:c.id,code:c.code,name:c.name,sub:c.sub,bed:c.bed,kind:c.kind,ct:c.ct})),sb:home.sb!==false}));
const pubBooksRef=()=>(db&&myId&&canWrite!==false)?db.doc('gardens/'+myId+'/x/books'):null;
const writePubBooks=makeWriter(pubBooksRef,()=>({saved:Date.now(),list:(home&&home.sb!==false&&books)?books.list.slice(0,400):[]}));
let pTimer=null;
function persist(){
  if(!home) { localSave(); return; }
  home.saved=Date.now(); localSave();
  clearTimeout(pTimer); pTimer=setTimeout(flushSave,700);
}
function flushSave(){ clearTimeout(pTimer); pTimer=null; if(!db||!myId||loadFailed||!home) return; writePriv(); if(home.created) writePub(); }
document.addEventListener('visibilitychange',()=>{ if(document.hidden){ if(pTimer) flushSave(); } else refreshFromRemote(); });
addEventListener('pagehide',()=>{ if(pTimer) flushSave(); });
// F2 the same account on phone and laptop: when this tab comes back, take over what the other device saved meanwhile
let refreshing=false;
async function refreshFromRemote(){
  if(refreshing||!db||!myId||pTimer) return;
  const ae=document.activeElement; if(ae&&/^(INPUT|TEXTAREA)$/.test(ae.tagName)) return;   // never while someone is typing
  refreshing=true;
  try{ const snap=await db.doc('data/users/'+myId+'/garden').get();
    if(loadFailed){ loadFailed=false; if(!home){ location.reload(); return; } }
    const remote=snap&&snap.exists?migrate(snap.data()):null;
    if(remote&&home&&!pTimer&&(remote.saved||0)>(home.saved||0)){ const hadDialog=typeof dlg!=='undefined'&&dlg.classList.contains('show'); adoptHome(remote); if(hadDialog&&!visiting) dlg.classList.remove('show'); }
    else if(home&&home.created&&(!remote||(home.saved||0)>(remote.saved||0))) flushSave();
  }catch(e){}
  refreshing=false;
}
setInterval(()=>{ if(!document.hidden&&(loadFailed||Date.now()-lastRemoteCheck>120000)){ lastRemoteCheck=Date.now(); refreshFromRemote(); } },20000);
let lastRemoteCheck=Date.now();

/* ================= canvas ================= */
const cvs=document.getElementById('c'), g=cvs.getContext('2d');
const bg=document.createElement('canvas'), bgc=bg.getContext('2d');
const pcv=document.createElement('canvas'); pcv.width=64; pcv.height=56; const pctx=pcv.getContext('2d');
const worldEl=document.getElementById('world');
let W=CW,H=CH,S=1,OX=0,OY=0,TH=CH,camY=0,camR=-1, X=g;
const R=(x,y,w,h,c)=>{X.fillStyle=c;X.fillRect(x,y,w,h);};
function disc(cx,cy,r,c){X.fillStyle=c;for(let dy=-r;dy<=r;dy++){const w=Math.round(Math.sqrt(Math.max(0,r*r-dy*dy+r*.6)));X.fillRect(cx-w,cy+dy,2*w+1,1);}}
function ell(cx,cy,rx,ry,c){X.fillStyle=c;for(let dy=-ry;dy<=ry;dy++){const w=Math.round(rx*Math.sqrt(Math.max(0,1-(dy*dy)/((ry+.5)*(ry+.5)))));X.fillRect(cx-w,cy+dy,2*w+1,1);}}

function resize(){
  const vw=innerWidth, vh=innerHeight;
  S=Math.min(vw/CW,vh/CH);
  W=Math.ceil(vw/S); H=Math.ceil(vh/S);
  OX=Math.floor((W-CW)/2); OY=Math.max(0,H-WORLD_H); TH=OY+WORLD_H+(vw<=560?Math.ceil(64/S):0); camR=-1;
  cvs.width=W; cvs.height=H; cvs.style.width=(W*S)+'px'; cvs.style.height=(H*S)+'px';
  worldEl.style.width=W+'px'; worldEl.style.height=TH+'px';
  bg.width=W; bg.height=TH; drawBG();
  g.imageSmoothingEnabled=false;
  layoutWorldUI(); initClouds();
}

