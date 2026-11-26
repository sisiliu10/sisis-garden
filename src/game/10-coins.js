/* ================= coins + shop ================= */
// coins come from: shiny coins in the grass, watering a project (once a day each), fish, and mini game wins.
// they buy decorations for the garden and cottage, hats for the wardrobe, and bait for the pond.
const SHOP=[
  {id:'bench',n:'Bank am Teich',p:40,g:'Garten'},
  {id:'lant',n:'Laternen am Weg',p:60,g:'Garten'},
  {id:'arch',n:'Rosenbogen am Tor',p:80,g:'Garten'},
  {id:'bird',n:'Vogelhäuschen',p:35,g:'Garten'},
  {id:'flam',n:'Flamingo im Teich',p:45,g:'Garten'},
  {id:'gnome',n:'Gartenzwerg',p:25,g:'Garten'},
  {id:'poster',n:'Poster',p:20,g:'Häuschen'},
  {id:'lamp',n:'Stehlampe',p:30,g:'Häuschen'},
  {id:'rug',n:'Mintgrüner Teppich',p:25,g:'Häuschen'},
  {id:'bow',n:'Schleife',p:20,g:'Outfit',acc:1},
  {id:'cap',n:'Cap',p:25,g:'Outfit',acc:1},
  {id:'straw',n:'Strohhut',p:30,g:'Outfit',acc:1},
  {id:'crown',n:'Krone',p:150,g:'Outfit',acc:1},
  {id:'bait',n:'Köder für 5 Würfe',p:15,g:'Teich',use:1},
];
const SHOP_ACC=SHOP.filter(s=>s.acc).map(s=>s.id);
function today(){const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
function cleanWallet(o){
  o=o&&typeof o==='object'?o:{};const n=v=>Number.isFinite(+v)&&+v>0?Math.min(999999,Math.floor(+v)):0;
  return {n:n(o.n),v:n(o.v),own:Array.isArray(o.own)?o.own.filter(x=>SHOP.some(s=>s.id===x&&!s.use)).slice(0,40):[],bait:Math.min(99,n(o.bait)),
    day:typeof o.day==='string'?o.day.slice(0,10):'',dg:n(o.dg),dw:Array.isArray(o.dw)?o.dw.filter(x=>typeof x==='string').slice(0,30):[]};
}
let wallets={}, visOwn={};
function walletKey(){return 'garden-coins-'+(myId||'me');}
function wallet(){
  const k=walletKey();if(wallets[k])return wallets[k];
  let w=cleanWallet(null);try{w=cleanWallet(JSON.parse(localStorage.getItem(k)));}catch(e){}
  wallets[k]=w;
  if(window.__coins&&myId)window.__coins.load().then(d=>{if(!d)return;const s=cleanWallet(d);
    if(s.v>w.v){Object.assign(w,s);try{localStorage.setItem(k,JSON.stringify(w));}catch(e){}paintCoins();}else if(w.v>s.v)window.__coins.save(w);}).catch(()=>{});
  return w;
}
function saveWallet(){const w=wallet();w.v++;try{localStorage.setItem(walletKey(),JSON.stringify(w));}catch(e){}if(window.__coins&&myId)window.__coins.save(w);paintCoins();}
function dayReset(w){const d=today();if(w.day!==d){w.day=d;w.dg=0;w.dw=[];}}
function owns(id){return wallet().own.includes(id);}
// what the garden you are standing in has bought (yours at home, the host's when visiting)
function hereOwns(id){
  if(!visiting)return owns(id);
  const vid=String(visiting.id||'');
  if(!visOwn[vid]){visOwn[vid]=[];if(window.__coins&&/^[\w-]{1,64}$/.test(vid))window.__coins.load(vid).then(d=>{if(d)visOwn[vid]=cleanWallet(d).own;}).catch(()=>{});}
  return visOwn[vid].includes(id);
}

/* ---------- counter ---------- */
const coinBtn=document.getElementById('coins'),coinNum=document.getElementById('coinN'),coinPop=document.getElementById('coinPop');
let shownCoins=null;
function paintCoins(){const n=wallet().n;if(shownCoins===null)shownCoins=n;coinNum.textContent=n;}
function earnCoins(n,x,y,why){
  n=Math.floor(n||0);if(n<=0)return;
  const w=wallet();w.n+=n;saveWallet();
  try{Sfx.coin(n>=8);}catch(e){}
  coinBtn.classList.remove('bump');void coinBtn.offsetWidth;coinBtn.classList.add('bump');
  if(document.querySelector('.modal.show')||scene!=='garden'||x===undefined){coinPop.textContent='+'+n;coinPop.classList.remove('show');void coinPop.offsetWidth;coinPop.classList.add('show');}
  else for(let i=0;i<Math.min(6,n);i++)spawn({kind:'coin',x:x+(Math.random()*14-7),y:y-Math.random()*4,vy:-22-Math.random()*14,vx:(Math.random()-.5)*16,life:.8+i*.05});
}
coinBtn.onclick=()=>openShop();

/* ---------- coins in the grass ---------- */
let gcoins=[], gcoinNext=performance.now()+8000;
const GROUND_MAX=25;
function coinSpot(){for(let k=0;k<30;k++){const x=-OX+14+Math.random()*(CW+OX*2-28),y=170+Math.random()*(WORLD_H-190);
  if(!blocked(x,y)&&!isWater(x,y)&&!inPond(x,y,8)&&Math.hypot(x-av.x,y-av.y)>40)return [Math.round(x),Math.round(y)];}return null;}
function coinsUpdate(dt){
  if(scene!=='garden'||!myId)return;
  const now=performance.now(),w=wallet();dayReset(w);
  if(now>gcoinNext){gcoinNext=now+35000+Math.random()*45000;if(gcoins.length<3&&w.dg<GROUND_MAX){const s=coinSpot();if(s)gcoins.push({x:s[0],y:s[1],v:Math.random()<.12?5:1,t:now});}}
  for(let i=gcoins.length-1;i>=0;i--){const c=gcoins[i];if(Math.hypot(av.x-c.x,(av.y-c.y)*1.3)<9){gcoins.splice(i,1);
    const v=Math.min(c.v,GROUND_MAX-w.dg);if(v>0){w.dg+=v;earnCoins(v,c.x,c.y-6,'ground');}}}
}
function drawGroundCoins(t){
  gcoins.forEach((c,i)=>{const ph=Math.floor(t*6+i*2)%6,wd=[5,4,2,1,2,4][ph],x=Math.round(c.x),y=Math.round(c.y-4+Math.sin(t*3+i)*1),big=c.v>1;
    g.globalAlpha=.3;R(x-3,Math.round(c.y),6,1,'#2f5a2a');g.globalAlpha=1;
    const hw=Math.floor(wd/2)+(big?1:0),h=big?7:5;
    R(x-hw,y-Math.floor(h/2),wd+(big?2:0),h,'#c9962a');R(x-hw+(wd>2?1:0),y-Math.floor(h/2)+1,Math.max(1,wd+(big?2:0)-(wd>2?2:0)),h-2,big?'#ffd76a':'#f2c94c');
    if(wd>2)R(x-hw+1,y-Math.floor(h/2)+1,1,1,'#fff6c8');
    if((Math.floor(t*2)+i)%4===0){R(x+3,y-5,1,3,'#fff8d0');R(x+2,y-4,3,1,'#fff8d0');}});
}
function coinAt(lx,ly){return gcoins.find(c=>Math.abs(lx-c.x)<8&&Math.abs(ly-c.y)<9);}

/* ---------- earning hooks ---------- */
function coinsForWatering(p){if(!p||visiting||!myId)return;const w=wallet();dayReset(w);if(w.dw.includes(p.id))return;w.dw.push(p.id);const [px,py]=posOf(p);earnCoins(3,px,py-20,'water');}
function coinsForWin(n){earnCoins(n);}

/* ---------- bait: the next casts pull rarer fish ---------- */
function useBait(){const w=wallet();if(w.bait>0){w.bait--;saveWallet();return true;}return false;}

/* ---------- decorations ---------- */
const DECO_AT={bench:[186,500],bird:[30,488],flam:[176,542],gnome:[100,474],arch:[120,356]};
function decoBlocked(x,y){
  if(scene!=='garden')return false;
  if(hereOwns('bench')&&x>DECO_AT.bench[0]-12&&x<DECO_AT.bench[0]+12&&y>DECO_AT.bench[1]-4&&y<DECO_AT.bench[1]+2)return true;
  if(hereOwns('bird')&&Math.hypot(x-DECO_AT.bird[0],(y-DECO_AT.bird[1])*1.5)<4)return true;
  if(hereOwns('gnome')&&Math.hypot(x-DECO_AT.gnome[0],(y-DECO_AT.gnome[1])*1.5)<4)return true;
  if(hereOwns('lant')){for(const ly of [380,428,476])for(const lx of [108,132])if(Math.abs(x-lx)<3&&Math.abs(y-ly)<3)return true;}
  return false;
}
function drawBench(x,y){R(x-10,y-9,20,3,'#a8714a');R(x-10,y-9,20,1,'#c99260');R(x-11,y-5,22,3,'#b07a4a');R(x-11,y-5,22,1,'#d39a5e');R(x-9,y-2,2,3,'#6a4228');R(x+7,y-2,2,3,'#6a4228');R(x-9,y-6,1,1,'#6a4228');R(x+8,y-6,1,1,'#6a4228');R(x-10,y-10,1,4,'#6a4228');R(x+9,y-10,1,4,'#6a4228');}
function drawLantern(x,y,t,night){R(x,y-14,1,14,'#3a3440');R(x-2,y-19,5,5,'#2a2430');R(x-1,y-18,3,3,night?'#ffe27a':'#fff3c8');R(x-3,y-20,7,1,'#2a2430');R(x-1,y-1,3,1,'#3a3440');
  if(night){g.globalAlpha=.22+.04*Math.sin(t*3+x);disc(x,y-16,7,'#ffe9a0');g.globalAlpha=1;}}
function drawArch(x,y,front){ // two posts and a round top covered in roses
  const L=x-20,Rr=x+20;
  if(front){for(let a=0;a<=Math.PI;a+=.08){const px=Math.round(x+Math.cos(a)*20),py=Math.round(y-22-Math.sin(a)*12);R(px-1,py-1,3,3,'#3c8a3a');}
    [[.3,'#e8506c'],[.75,'#f4a7c4'],[1.2,'#e8506c'],[1.6,'#ffffff'],[2.0,'#e8506c'],[2.45,'#f4a7c4'],[2.85,'#e8506c']].forEach(([a,c])=>{const px=Math.round(x+Math.cos(a)*20),py=Math.round(y-22-Math.sin(a)*12);R(px-1,py-1,2,2,c);});}
  else{[L,Rr].forEach(px=>{R(px-1,y-23,3,23,'#3c8a3a');[[-6,'#e8506c'],[-13,'#f4a7c4'],[-19,'#e8506c']].forEach(([dy,c])=>R(px-1,y+dy,2,2,c));});}
}
function drawBird(x,y,t){R(x,y-16,2,16,'#7a4a2c');R(x-5,y-25,12,9,'#c0573a');R(x-6,y-26,14,2,'#8a3a28');R(x-4,y-24,10,8,'#e2a35c');disc(x+1,y-20,2,'#3a2418');R(x,y-16,2,1,'#5a3420');
  const hop=Math.floor(t*1.5)%5,bx=x+(hop<3?-3:4),by=y-27-(hop===1||hop===4?1:0);R(bx,by,3,2,'#5a86e8');R(bx+(hop<3?-1:3),by,1,1,'#f2c94c');R(bx+1,by-1,1,1,'#5a86e8');}
function drawFlamingo(x,y,t){const b=Math.round(Math.sin(t*1.2)*.5);R(x,y-8,1,8,'#e8789a');R(x-4,y-14+b,8,5,'#f48aaa');R(x-3,y-15+b,5,1,'#f9b0c6');R(x+3,y-22+b,1,8,'#f48aaa');R(x+3,y-24+b,3,2,'#f48aaa');R(x+5,y-23+b,2,1,'#2a2430');R(x+4,y-24+b,1,1,'#ffffff');R(x-3,y,7,1,'#86c9c9');}
function drawGnome(x,y){R(x-3,y-2,7,2,'#4a3a2c');R(x-3,y-8,7,6,'#4f7fe0');R(x-2,y-11,5,3,'#ffffff');R(x-2,y-13,5,2,'#fde4d0');R(x-1,y-12,1,1,'#2a2430');R(x+1,y-12,1,1,'#2a2430');R(x-3,y-15,7,2,'#e8443a');R(x-2,y-17,5,2,'#e8443a');R(x-1,y-19,3,2,'#e8443a');R(x,y-20,1,1,'#e8443a');}
// garden decorations as depth-sorted items
function decoItems(t){
  const L=[],night=skyState().night>.3;
  if(hereOwns('bench'))L.push({y:DECO_AT.bench[1],d:()=>drawBench(...DECO_AT.bench)});
  if(hereOwns('lant'))[380,428,476].forEach(ly=>[108,132].forEach(lx=>L.push({y:ly,d:()=>drawLantern(lx,ly,t,night)})));
  if(hereOwns('arch')){const [x,y]=DECO_AT.arch;L.push({y:y-1,d:()=>drawArch(x,y,false)});L.push({y:y+30,d:()=>drawArch(x,y,true)});}
  if(hereOwns('bird'))L.push({y:DECO_AT.bird[1],d:()=>drawBird(...DECO_AT.bird,t)});
  if(hereOwns('flam'))L.push({y:DECO_AT.flam[1],d:()=>drawFlamingo(...DECO_AT.flam,t)});
  if(hereOwns('gnome'))L.push({y:DECO_AT.gnome[1],d:()=>drawGnome(...DECO_AT.gnome)});
  return L;
}
// cottage decorations
function drawPoster(){R(60,7,20,24,'#2a2430');R(61,8,18,22,'#fff3d6');R(62,9,16,12,'#8fc8f0');disc(70,16,3,'#f2c94c');R(62,18,16,3,'#5aa84a');R(64,23,12,1,'#e8506c');R(64,25,9,1,'#c9b880');R(64,27,11,1,'#c9b880');}
function drawFloorLamp(night){R(38,100,2,30,'#3a3440');R(35,129,8,2,'#3a3440');R(33,92,12,8,'#f4e2b8');R(33,92,12,1,'#fff3d6');R(33,99,12,1,'#d6bb92');if(night){g.globalAlpha=.25;disc(39,104,12,'#fff0b0');g.globalAlpha=1;}}
function rugColors(){return hereOwns('rug')?['#4fa58a','#8fd6bd','#4fa58a','#bdeedd']:['#d9708f','#f2a8bc','#d9708f','#f7c7d4'];}

/* ---------- hats (drawn on the avatar, front and side view) ---------- */
function drawHat(r,acc,side){
  const s=side?1:0;
  if(acc==='straw'){r(4,-3,6,1,'#b8913e');r(3,-2,8,2,'#f2d27a');r(3,0,8,1,'#d6404a');r(0+s,1,14-s,1,'#e8c46a');r(0+s,2,14-s,1,'#c9a24e');}
  if(acc==='cap'){r(4,-3,6,1,'#3a5fb0');r(3,-2,8,3,'#4f7fe0');r(7,-3,1,1,'#ffffff');if(side)r(10,1,4,1,'#3a5fb0');else r(2,1,10,1,'#3a5fb0');}
  if(acc==='bow'){r(7,-2,2,3,'#e8506c');r(10,-2,2,3,'#e8506c');r(9,-1,1,1,'#b83a50');r(7,-2,1,1,'#ff9ab0');}
  if(acc==='crown'){r(3,-2,8,2,'#f2c94c');r(3,-4,1,2,'#f2c94c');r(6,-4,2,2,'#f2c94c');r(10,-4,1,2,'#f2c94c');r(3,0,8,1,'#c9962a');r(5,-2,1,1,'#e8506c');r(8,-2,1,1,'#4f7fe0');r(6,-4,1,1,'#fff3b0');}
}

/* ---------- shop ---------- */
const shopM=document.getElementById('shopM');
function shopPreview(it){
  const cv=document.createElement('canvas');cv.width=32;cv.height=26;const c=cv.getContext('2d'),keep=X;X=c;
  try{
    if(it.acc){drawAvatar(c,16,30,Object.assign({},me().look,{acc:it.id}),{shadow:false,t:0});}
    else if(it.id==='bench')drawBench(16,23);
    else if(it.id==='lant')drawLantern(16,25,0,false);
    else if(it.id==='arch'){drawArch(16,25,false);drawArch(16,25,true);}
    else if(it.id==='bird')drawBird(15,27,0);
    else if(it.id==='flam'){c.fillStyle='#4fa3b2';c.fillRect(0,22,32,4);drawFlamingo(14,24,0);}
    else if(it.id==='gnome')drawGnome(16,24);
    else if(it.id==='poster'){c.translate(-54,-5);drawPoster();}
    else if(it.id==='lamp'){c.translate(-23,-95);drawFloorLamp(false);}
    else if(it.id==='rug'){const k=['#4fa58a','#8fd6bd','#4fa58a','#bdeedd'];ell(16,14,14,7,k[0]);ell(16,14,12,6,k[1]);ell(16,14,8,4,k[2]);ell(16,14,7,3,k[3]);}
    else if(it.id==='bait'){R(9,8,14,12,'#8a6a44');R(9,8,14,2,'#a5825a');R(11,11,10,7,'#5a3a22');R(12,12,3,1,'#e88aa0');R(16,14,4,1,'#e88aa0');R(13,16,3,1,'#e88aa0');}
  }finally{X=keep;}
  return cv;
}
function openShop(){renderShop();shopM.classList.add('show');}
function closeShop(){shopM.classList.remove('show');}
document.getElementById('shopNo').onclick=closeShop;
shopM.addEventListener('click',e=>{if(e.target===shopM)closeShop();});
function renderShop(){
  const w=wallet();
  document.getElementById('shopN').textContent=w.n;
  const box=document.getElementById('shopList');box.innerHTML='';
  ['Garten','Häuschen','Outfit','Teich'].forEach(grp=>{
    const h=document.createElement('div');h.className='shg';h.textContent=grp;box.appendChild(h);
    const grid=document.createElement('div');grid.className='shgrid';box.appendChild(grid);
    SHOP.filter(s=>s.g===grp).forEach(it=>{
      const have=!it.use&&w.own.includes(it.id),d=document.createElement('div');d.className='shi'+(have?' have':'');
      const nm=document.createElement('span');nm.className='n';nm.textContent=it.n;
      const b=document.createElement('button');b.type='button';b.className='shb';
      if(have){b.textContent=it.acc?'Im Schrank':'Gekauft';b.disabled=true;}
      else{b.innerHTML='<i class="ci"></i>'+it.p;b.disabled=w.n<it.p;b.onclick=()=>buy(it);}
      if(it.use&&w.bait){nm.textContent=it.n+' ('+w.bait+' übrig)';}
      d.append(shopPreview(it),nm,b);grid.appendChild(d);});
  });
  document.getElementById('shopHow').textContent=w.n?'Münzen gibt es fürs Gießen, für Fische, für Siege in den Mini-Games und manchmal glitzern sie im Gras.':'Noch keine Münzen. Gießen, Angeln, Mini-Games gewinnen, und manchmal glitzern sie im Gras.';
}
function buy(it){
  const w=wallet();if(w.n<it.p)return;
  if(!it.use&&w.own.includes(it.id))return;
  w.n-=it.p;if(it.use)w.bait+=5;else w.own.push(it.id);
  saveWallet();try{Sfx.yay(.45);}catch(e){}
  renderShop();
}
