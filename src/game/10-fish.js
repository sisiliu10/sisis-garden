/* ================= pond + fishing ================= */
// the pond sits at the end of the path. walk onto the dock, cast, and tap the moment the bobber is pulled under.
// caught fish go into the aquarium in your cottage (stored per person, visitors can look but not change it)
const FSPOT={x:120,y:524};
function inPond(x,y,m){m=m||0;const a=(x-POND.x)/(POND.rx+m),b=(y-POND.y)/(POND.ry+m*.6);return a*a+b*b<1;}
function onDock(x,y){return x>DOCK.x0-2&&x<DOCK.x1+2&&y>DOCK.y0-6&&y<DOCK.y1+1;}
function pondBlocked(x,y){return inPond(x,y,3)&&!(x>DOCK.x0+2&&x<DOCK.x1-2&&y<DOCK.y1-1);}
function onPondTap(x,y){return inPond(x,y,4)||onDock(x,y);}

/* ---------- fish: little pixel sprites, facing right ---------- */
const FT={
  s:["......ff....","ff..oddddo..",".ffodbbbbbo.","..fbbbbbbbeo",".ffolllllbo.","ff..ollllo..","......f....."],
  k:[".......fff....","ff...odddddo..",".ffoddbbbbbbo.","..fbbbbbbbbbeo","..fbbbbbbbbbbo",".ffollllllllo.","ff...ollllo...","........f....."],
  h:["..........f.....","ff..oddddddddo..",".ffodbbbbbbbbbbo","..fbbbbbbbbbbbeo",".ffollllllllllo.","ff..ollllllll..."],
  b:["..oooo....","..obbo....","..obbo....","..obbo....","..obbbooo.",".obbbbbbbo",".obbbbbbbo",".oddddddo."],
};
const FISH=[
  {id:'gold',n:'Goldfisch',w:30,win:950,coin:2,t:'s',c:{b:'#f28c28',d:'#d8641c',l:'#ffc36a',f:'#f7a54a',o:'#a84a16'}},
  {id:'rotf',n:'Rotfeder',w:22,win:880,coin:2,t:'s',c:{b:'#cfd6d8',d:'#8f9ea6',l:'#f4f6f6',f:'#e0503c',o:'#5f6c74'}},
  {id:'karp',n:'Karpfen',w:18,win:820,coin:3,t:'k',c:{b:'#c49a52',d:'#8f6a32',l:'#e8cc8a',f:'#a87f40',o:'#5e4220',p:'#a98340'},pat:(x,y,ch)=>ch==='b'&&(x+y*2)%4===0?'p':ch},
  {id:'bars',n:'Barsch',w:13,win:740,coin:4,t:'s',c:{b:'#a9c25a',d:'#5a7430',l:'#ece6a6',f:'#f0883a',o:'#405424'},pat:(x,y,ch)=>(ch==='b'||ch==='l')&&y<=3&&(x===5||x===7||x===9)?'d':ch},
  {id:'fore',n:'Forelle',w:9,win:660,coin:6,t:'s',c:{b:'#a6b7ae',d:'#6f8a80',l:'#eef0e6',f:'#9aaba2',o:'#46584f',p:'#ea8aa2',q:'#3a4a44'},pat:(x,y,ch)=>y===3&&ch==='b'&&x>3&&x<10?'p':(y===2&&ch==='b'&&(x===5||x===8))||(y===1&&x===7)?'q':ch},
  {id:'koi',n:'Koi',w:6,win:600,coin:8,t:'s',c:{b:'#f6f2ea',d:'#ece4d6',l:'#ffffff',f:'#f2ece0',o:'#a89a88',p:'#e0443a'},pat:(x,y,ch)=>((y===1&&x>=5&&x<=7)||(y===2&&x>=5&&x<=8)||(y===3&&x>=8&&x<=9)||(y===2&&x===3))&&ch!=='o'&&ch!=='e'?'p':ch},
  {id:'hech',n:'Hecht',w:4,win:520,coin:12,t:'h',c:{b:'#7fa05a',d:'#4f6e34',l:'#dfe4b0',f:'#8aa060',o:'#344a24',p:'#c8dc98'},pat:(x,y,ch)=>ch==='b'&&(x*3+y*5)%7===0?'p':ch},
  {id:'wels',n:'Wels',w:3,win:490,coin:15,t:'k',c:{b:'#6a5f56',d:'#4a423c',l:'#a89a8a',f:'#5a5048',o:'#2a2420'},extra:[[14,3,'#2a2420'],[14,5,'#2a2420'],[15,6,'#2a2420']]},
  {id:'gkoi',n:'Goldkoi',w:1,win:430,coin:30,t:'s',c:{b:'#f2c94c',d:'#d9a62a',l:'#fff0a0',f:'#ffe27a',o:'#9a6e12',p:'#ffffff'},pat:(x,y,ch)=>(y===2&&x===6)||(y===1&&x===7)?'p':ch},
];
const BOOT={id:'boot',n:'Alter Stiefel',w:6,win:1000,coin:0,t:'b',c:{b:'#6a4a30',d:'#3a2a1e',o:'#24180f'}};
const fishCache={};
function fishById(id){return FISH.find(f=>f.id===id)||(id==='boot'?BOOT:null);}
function fishImg(id,sil){
  const k=id+(sil?'~':'');if(fishCache[k])return fishCache[k];
  const f=fishById(id),rows=FT[f.t],w=Math.max(...rows.map(r=>r.length))+(f.extra?2:0),h=rows.length;
  const cv=document.createElement('canvas');cv.width=w;cv.height=h;const c=cv.getContext('2d');
  rows.forEach((row,y)=>[...row].forEach((ch0,x)=>{if(ch0==='.')return;const ch=f.pat?f.pat(x,y,ch0):ch0;
    c.fillStyle=sil?'#3a3440':ch==='e'?'#1d1924':(f.c[ch]||f.c.b);c.fillRect(x,y,1,1);}));
  if(f.extra)f.extra.forEach(([x,y,col])=>{c.fillStyle=sil?'#3a3440':col;c.fillRect(x,y,1,1);});
  if(!sil&&f.t!=='b'){c.fillStyle='rgba(255,255,255,.55)';const ey=rows.findIndex(r=>r.includes('e')),ex=rows[ey].indexOf('e');c.fillRect(ex,ey-1,1,1);}
  return fishCache[k]=cv;
}
// bait: rare fish three times as likely, no boots
function pickFish(bait){const all=bait?FISH:FISH.concat([BOOT]),wt=f=>bait&&f.w<=9?f.w*3:f.w;let s=all.reduce((a,f)=>a+wt(f),0)*Math.random();for(const f of all){s-=wt(f);if(s<=0)return f;}return FISH[0];}

/* ---------- your fish book (local first, then your own row in the database) ---------- */
let fishBooks={}, visFish={};
function fishKey(){return 'garden-fish-'+(myId||'me');}
function cleanFish(o){const c={};if(o&&o.c&&typeof o.c==='object')FISH.forEach(f=>{const v=+o.c[f.id];if(Number.isFinite(v)&&v>0)c[f.id]=Math.min(9999,Math.floor(v));});return {c};}
function myFish(){
  const k=fishKey();if(fishBooks[k])return fishBooks[k];
  let b={c:{}};try{b=cleanFish(JSON.parse(localStorage.getItem(k)));}catch(e){}
  fishBooks[k]=b;
  if(window.__fish&&myId)window.__fish.load().then(d=>{if(!d)return;const s=cleanFish(d);let more=false;
    for(const id in s.c){if((b.c[id]||0)<s.c[id]){b.c[id]=s.c[id];}else if((b.c[id]||0)>s.c[id])more=true;}
    for(const id in b.c)if(!(id in s.c))more=true;
    try{localStorage.setItem(k,JSON.stringify(b));}catch(e){}if(more)window.__fish.save(b);}).catch(()=>{});
  return b;
}
function saveFish(){const b=myFish();try{localStorage.setItem(fishKey(),JSON.stringify(b));}catch(e){}if(window.__fish&&myId)window.__fish.save(b);}
// whose fish to show in this cottage: yours at home, the host's when visiting
function tankFish(){
  if(!visiting)return myFish();
  const id=String(visiting.id||'');if(!visFish[id]){visFish[id]={c:{}};if(window.__fish&&/^[\w-]{1,64}$/.test(id))window.__fish.load(id).then(d=>{if(d){visFish[id]=cleanFish(d);if(fishM.classList.contains('show'))renderAquarium();}}).catch(()=>{});}
  return visFish[id];
}

/* ---------- the fishing itself ---------- */
let fish=null, fishSay=null;
function sayFish(t,ms){fishSay={t,until:performance.now()+(ms||1800)};}
function atSpot(){return Math.hypot(av.x-FSPOT.x,av.y-FSPOT.y)<3;}
function goFish(){
  if(fish||scene!=='garden')return;
  if(riding)dismount();
  av.run=false;
  if(atSpot()){castLine();return;}
  const onto={x:FSPOT.x,y:FSPOT.y,onArrive:castLine}, top={x:FSPOT.x,y:DOCK.y0-4,onArrive:()=>{av.target=onto;}};
  if(onDock(av.x,av.y)){av.target=onto;return;}
  if(av.y>POND.y-POND.ry-2){ // beside or below the pond: walk around it first
    const sx=av.x<POND.x?POND.x-POND.rx-9:POND.x+POND.rx+9;
    av.target={x:sx,y:av.y,onArrive:()=>{av.target={x:sx,y:POND.y-POND.ry-8,onArrive:()=>{av.target=top;}};}};return;}
  av.target=top;
}
function castLine(){
  if(scene!=='garden'||fish)return;
  av.back=false;av.target=null;
  let side=Math.random()<.5?-1:1,bx=0,by=0;
  for(let k=0;k<20;k++){bx=FSPOT.x+side*(16+Math.random()*28);by=POND.y+5+Math.random()*12;if(inPond(bx,by,-6))break;}
  const sp=pickFish(useBait()),wait=1.6+Math.random()*4.4;
  fish={ph:'cast',t:0,bx,by,side,wait,sp,nib:[],dip:0};
  if(Math.random()<.7)fish.nib.push(.5+Math.random()*Math.max(.3,wait-1.1));
  if(Math.random()<.3)fish.nib.push(.5+Math.random()*Math.max(.3,wait-1.1));
  fishSay=null;
  try{Sfx.cast();}catch(e){}
}
function rodTip(x,y,side){return [Math.round(x)+side*17,Math.round(y)-27];}
// a tap while fishing: in the bite window it lands the fish, before it is too early
function fishTap(){
  if(!fish)return false;
  const F=fish;
  if(F.ph==='bite'){F.ph='reel';F.t=0;try{Sfx.reel();}catch(e){}splash(F.bx,F.by,8,.3,false);return true;}
  if(F.ph==='wait'){sayFish('Zu früh!',1500);for(let i=0;i<4;i++)spawn({kind:'splash',x:F.bx+(Math.random()*6-3),y:F.by-1,vx:(Math.random()-.5)*20,vy:-14,floor:F.by,life:.4});fish=null;return true;}
  if(F.ph==='show'){fish=null;return true;}
  return true;
}
function fishUpdate(dt){
  if(!fish)return;
  if(scene!=='garden'||!atSpot()||av.target){fish=null;return;}
  const F=fish;F.t+=dt;
  if(F.ph==='cast'&&F.t>=.55){F.ph='wait';F.t=0;splash(F.bx,F.by,5,.22,false);spawn({kind:'ring',x:F.bx,y:F.by,r:7,life:.9});return;}
  if(F.ph==='wait'){
    F.dip=Math.max(0,F.dip-dt);
    if(F.nib.length&&F.t>=F.nib[0]){F.nib.shift();F.dip=.22;spawn({kind:'ring',x:F.bx,y:F.by,r:4,life:.6});}
    if(F.t>=F.wait){F.ph='bite';F.t=0;spawn({kind:'ring',x:F.bx,y:F.by,r:9,life:.7});spawn({kind:'ring',x:F.bx,y:F.by,r:5,life:.5});
      try{Sfx.plop();}catch(e){}try{navigator.vibrate&&navigator.vibrate(35);}catch(e){}}
    return;}
  if(F.ph==='bite'&&F.t>=F.sp.win/1000){sayFish(F.sp.id==='boot'?'Hm, nichts.':'Weg ist er …',1600);fish=null;return;}
  if(F.ph==='reel'&&F.t>=.5){F.ph='show';F.t=0;landFish(F.sp);return;}
  if(F.ph==='show'&&F.t>=2.4){fish=null;}
}
function landFish(sp){
  if(sp.id==='boot'){sayFish('Nur ein alter Stiefel',2200);return;}
  const b=myFish(),isNew=!b.c[sp.id];b.c[sp.id]=(b.c[sp.id]||0)+1;saveFish();
  sayFish((isNew?'Neu: ':'')+sp.n+'!',2400);
  try{Sfx.yay(.5);}catch(e){}
  for(let i=0;i<8;i++)spawn({kind:'spark',x:av.x+(Math.random()*20-10),y:av.y-44-Math.random()*10,vy:-10,life:.7});
  if(typeof earnCoins==='function')earnCoins(sp.coin,av.x,av.y-40,'fish');
}

/* ---------- drawing ---------- */
function pline(x0,y0,x1,y1,c,sag){const n=Math.max(1,Math.ceil(Math.max(Math.abs(x1-x0),Math.abs(y1-y0))));
  for(let i=0;i<=n;i++){const k=i/n;R(Math.round(x0+(x1-x0)*k),Math.round(y0+(y1-y0)*k+(sag?Math.sin(Math.PI*k)*sag:0)),1,1,c);}}
function drawBobber(x,y,st,t){
  x=Math.round(x);y=Math.round(y);
  if(st==='bite'){R(x-1,y,3,1,'#e8443a');R(x-2,y+1,5,1,'#8fd0d8');return;}
  const b=st==='dip'?1:Math.round(Math.sin(t*3)*.6);
  R(x-2,y+1,5,1,'#8fd0d8');R(x-1,y-3+b,3,2,'#e8443a');R(x,y-4+b,1,1,'#ff9a8a');R(x-1,y-1+b,3,1,'#ffffff');
}
function drawExcl(x,y,t){if(Math.floor(t*8)%2)return;x=Math.round(x);y=Math.round(y);R(x-2,y-1,5,10,'#2a2430');R(x-1,y,3,5,'#ffe27a');R(x-1,y+6,3,2,'#ffe27a');}
// rod + line + bobber for anyone fishing (you, or a friend from their presence)
function drawAngler(x,y,side,bx,by,st,t,spId,k){
  const hx=Math.round(x)+side*5,hy=Math.round(y)-12,[tx,ty]=rodTip(x,y,side);
  if(st!=='show'&&st!=='reel'){pline(hx,hy,tx,ty,'#7a4a2c');R(hx-1,hy-1,2,3,'#2a2430');}
  if(st==='cast'){const k2=Math.min(1,k),px=tx+(bx-tx)*k2,py=ty+(by-ty)*k2-Math.sin(Math.PI*k2)*16;g.globalAlpha=.75;pline(tx,ty,px,py,'#f6f6f6');g.globalAlpha=1;drawBobber(px,py,'fly',t);return;}
  if(st==='wait'||st==='dip'||st==='bite'){g.globalAlpha=.7;pline(tx,ty,bx,by-(st==='bite'?0:3),'#f6f6f6',st==='bite'?0:3);g.globalAlpha=1;drawBobber(bx,by,st,t);if(st==='bite')drawExcl(x,y-38,t);return;}
  if(st==='reel'){const k2=Math.min(1,k),px=bx+(x-bx)*k2,py=by+(y-44-by)*k2-Math.sin(Math.PI*k2)*18;pline(hx,hy,hx+side*10,hy-16,'#7a4a2c');const im=fishImg(spId);g.drawImage(im,Math.round(px-im.width/2),Math.round(py-im.height/2));return;}
  if(st==='show'){const im=fishImg(spId),bob=Math.round(Math.sin(t*5));g.drawImage(im,Math.round(x-im.width/2),Math.round(y-44-im.height/2)+bob);}
}
function drawMyFishing(t){
  if(!fish||scene!=='garden')return;const F=fish;
  const st=F.ph==='wait'&&F.dip>0?'dip':F.ph;
  drawAngler(av.x,av.y,F.side,F.bx,F.by,st,t,F.sp.id,F.ph==='cast'?F.t/.55:F.ph==='reel'?F.t/.5:0);
}
function fishPresence(){
  if(!fish||scene!=='garden')return 0;const F=fish;
  if(F.ph==='wait'||F.ph==='cast')return [Math.round(F.bx),Math.round(F.by),1,F.side];
  if(F.ph==='bite')return [Math.round(F.bx),Math.round(F.by),2,F.side];
  if(F.ph==='show'&&F.sp.id!=='boot')return [0,0,3,F.side,FISH.indexOf(F.sp)];
  return 0;
}
function drawPeerFishing(p,t){
  const f=p.fi;if(!f)return;const side=f[3]<0?-1:1;
  if(f[2]===3){const sp=FISH[f[4]];if(sp)drawAngler(p.x,p.y,side,0,0,'show',t,sp.id,0);return;}
  drawAngler(p.x,p.y,side,f[0],f[1],f[2]===2?'bite':'wait',t,null,0);
}

// still parts of the pond, painted once into the background
function drawPondBG(r){
  const cx=OX+POND.x,cy=OY+POND.y,rx=POND.rx,ry=POND.ry;
  ell(cx,cy+1,rx+5,ry+4,'#71b862');
  ell(cx,cy-1,rx+1,ry+1,'#8f6c45');
  ell(cx,cy+2,rx,ry,'#3d8a9c');
  ell(cx,cy+3,rx-5,ry-3,'#4796a8');
  ell(cx,cy+5,rx-20,ry-9,'#52a3b4');
  for(let x=-rx;x<=rx;x++){const yb=Math.round(cy+2+ry*Math.sqrt(Math.max(0,1-(x*x)/(rx*rx))));R(cx+x,yb,1,1,'#86c9c9');}
  // the far bank: a strip of earth under the grass edge
  for(let x=-rx+6;x<=rx-6;x+=1){const yt=Math.round(cy-1-(ry+1)*Math.sqrt(Math.max(0,1-(x*x)/((rx+1)*(rx+1)))));R(cx+x,yt,1,1,'#6bb35c');if(r()<.18)R(cx+x,yt+1,1,1,'#5aa84a');}
  // stones
  [[-.97,-.05,3],[-.62,-.86,2],[.42,-.95,3],[.95,.15,3],[.72,.78,2],[-.78,.7,3],[.18,1.0,2]].forEach(([a,b,s])=>{const x=Math.round(cx+a*(rx+3)),y=Math.round(cy+b*(ry+2));
    ell(x,y+1,s+1,Math.max(1,s-1),'#5f6b5a');ell(x,y,s,Math.max(1,s-1),'#a9aaa0');R(x-s+1,y-Math.max(1,s-1),s,1,'#cfd0c6');});
  // lily pads, one with a flower
  [[-44,7,4],[-33,14,3],[42,2,4],[54,11,3],[-14,17,3],[16,-6,3]].forEach(([a,b,s],i)=>{const x=cx+a,y=cy+b;
    ell(x,y,s+1,Math.max(1,s-2),'#3f8a3a');ell(x,y-1,s,Math.max(1,s-2),'#5aa84a');R(x+1,y-2,2,2,'#4796a8');R(x-s+1,y-1,2,1,'#7cc46a');
    if(i===0||i===3){R(x-2,y-3,4,2,'#f4a7c4');R(x-1,y-4,2,1,'#fcd3e2');R(x-1,y-3,2,1,'#ffe27a');}});
  // the dock: planks across, two posts in the water
  const dx=OX+DOCK.x0,dw=DOCK.x1-DOCK.x0,dy0=OY+DOCK.y0,dy1=OY+DOCK.y1;
  R(dx,dy1,dw,2,'#2f7080');
  [[dx+1,dy1-3],[dx+dw-4,dy1-3]].forEach(([px,py])=>{R(px,py,3,6,'#5a3a22');R(px,py,1,6,'#7a4e2e');R(px-1,py+6,5,1,'#86c9c9');});
  R(dx,dy0,dw,dy1-dy0,'#b9854f');
  for(let y=dy0;y<dy1;y+=4){R(dx,y,dw,1,'#d39a5e');R(dx,y+3,dw,1,'#8a5a36');if(r()<.6)R(dx+2+Math.floor(r()*(dw-5)),y+1,2,1,'#a8744a');}
  R(dx-1,dy0,1,dy1-dy0,'#6a4228');R(dx+dw,dy0,1,dy1-dy0,'#6a4228');
}
// moving parts: glints, fish shadows (one of them comes over when something bites)
function drawPond(t){
  for(let i=0;i<9;i++){const x=POND.x-56+((i*31+Math.floor(t*5))%112),y=POND.y-6+((i*7)%18);if(!inPond(x,y,-7)||onDock(x,y))continue;
    if((Math.floor(t*2)+i)%3)R(x,y,3,1,'#7cc0cc');}
  for(let i=0;i<3;i++){let x=POND.x+Math.cos(t*.25*(i+1)*.7+i*2.1)*POND.rx*.62,y=POND.y+4+Math.sin(t*.21*(i+2)*.6+i)*POND.ry*.42;
    const dir=Math.sin(t*.25*(i+1)*.7+i*2.1)>0?-1:1;
    if(i===0&&fish&&(fish.ph==='bite'||(fish.ph==='wait'&&fish.t>fish.wait-1.4))){const k=fish.ph==='bite'?1:clamp((fish.t-(fish.wait-1.4))/1.4,0,1);x+=(fish.bx-x)*k;y+=(fish.by+2-y)*k;}
    if(onDock(x,y))continue;
    g.globalAlpha=.35;ell(Math.round(x),Math.round(y),4,1,'#1f5866');R(Math.round(x)-dir*6,Math.round(y)-1,2,3,'#1f5866');g.globalAlpha=1;}
  if(Math.random()<.008){const x=POND.x+(Math.random()*2-1)*POND.rx*.7,y=POND.y+4+(Math.random()*2-1)*POND.ry*.5;if(inPond(x,y,-6)&&!onDock(x,y))spawn({kind:'ring',x,y,r:5,life:1.1});}
}
// reeds stand in the scene (depth-sorted), so you can walk behind them
const REEDS=[[POND.x-POND.rx+4,POND.y-6,0],[POND.x-POND.rx+10,POND.y+12,1],[POND.x+POND.rx-6,POND.y-9,2],[POND.x+POND.rx-14,POND.y+15,3]];
function drawReeds(x,y,i,t){
  const n=[5,3,4,3][i];
  for(let k=0;k<n;k++){const rx=x+k*2-n,h=9+((k*5+i*3)%7),sw=Math.round(Math.sin(t*1.3+k+i)*.6);
    R(rx,y-h,1,h,k%2?'#3c8a3a':'#4f9e43');R(rx+sw,y-h,1,1,'#58a84a');
    if(k%2===0){R(rx-1+sw,y-h-4,2,4,'#7a4a2c');R(rx+sw,y-h-5,1,1,'#3c8a3a');}}
  R(x-n-1,y,n*2+2,1,'#3c8a3a');
}

/* ---------- aquarium (cottage) ---------- */
function drawRoomTank(t){
  const own=tankFish(),ids=FISH.filter(f=>own.c[f.id]).map(f=>f.id);
  R(160,112,32,17,'#8a5a36');R(160,112,32,1,'#b07a4a');R(162,115,13,11,'#9a6a46');R(177,115,13,11,'#9a6a46');R(173,119,2,2,'#5a3420');R(178,119,2,2,'#5a3420');R(161,128,3,2,'#5a3420');R(188,128,3,2,'#5a3420');
  R(160,88,32,24,'#2f3e46');R(161,91,30,20,'#6cbfd8');R(161,91,30,2,'#a8e0ee');R(161,101,30,10,'#5fb0cc');R(161,107,30,4,'#e8d29a');R(163,108,2,1,'#c9b070');R(180,109,3,1,'#c9b070');
  R(159,87,34,3,'#24323a');R(160,87,32,1,'#46585f');
  [[164,98,9],[167,101,6],[186,96,11],[183,102,5]].forEach(([x,y,h],i)=>{for(let k=0;k<h;k++)R(x+Math.round(Math.sin(t*1.5+k*.6+i)*.7),y+k,1,1,i%2?'#4f9e43':'#3c8a3a');});
  for(let i=0;i<3;i++){const y=107-((t*9+i*7)%16);R(176+(i%2),Math.round(y),1,1,'#e8f8ff');}
  ids.slice(0,6).forEach((id,i)=>{const f=fishById(id),sp=.35+i*.07,ph=i*1.7,s=Math.sin(t*sp+ph),x=Math.round(176+s*11),y=94+((i*5)%11),d=Math.cos(t*sp+ph)>0?1:-1;
    R(x-1,y,3,2,f.c.b);R(x-d*2,y,1,2,f.c.f||f.c.b);R(x+d,y,1,1,'#1d1924');});
  R(161,91,1,20,'rgba(255,255,255,.35)');
}
const fishM=document.getElementById('fishM'),aqCv=document.getElementById('aqCv'),aqX=aqCv.getContext('2d');
let aqSwim=[],aqRaf=0;
function openAquarium(){renderAquarium();fishM.classList.add('show');cancelAnimationFrame(aqRaf);aqRaf=requestAnimationFrame(aqLoop);}
function closeAquarium(){fishM.classList.remove('show');cancelAnimationFrame(aqRaf);}
document.getElementById('fishNo').onclick=closeAquarium;
fishM.addEventListener('click',e=>{if(e.target===fishM)closeAquarium();});
function renderAquarium(){
  const b=tankFish(),got=FISH.filter(f=>b.c[f.id]),total=got.reduce((a,f)=>a+b.c[f.id],0);
  const who=visiting&&visiting.data&&visiting.data.name;
  document.getElementById('fishT').textContent=who?who+'s Aquarium':'Aquarium';
  document.getElementById('fishS').textContent=!got.length?(visiting?'Noch keine Fische drin.':'Noch leer. Unten im Garten ist ein Teich, dort kannst du angeln.'):got.length+' von '+FISH.length+' Arten, '+total+(total===1?' Fisch':' Fische')+' insgesamt.';
  const grid=document.getElementById('aqGrid');grid.innerHTML='';
  FISH.forEach(f=>{const n=b.c[f.id]||0,d=document.createElement('div');d.className='aqf'+(n?'':' no');
    const cv=document.createElement('canvas'),im=fishImg(f.id,!n);cv.width=16;cv.height=8;cv.getContext('2d').drawImage(im,Math.floor((16-im.width)/2),Math.floor((8-im.height)/2));
    const nm=document.createElement('span');nm.className='n';nm.textContent=n?f.n:'???';const c=document.createElement('span');c.className='c';c.textContent=n?n+'×':'';
    d.append(cv,nm,c);grid.appendChild(d);});
  aqSwim=[];got.forEach((f,i)=>{for(let k=0;k<Math.min(3,b.c[f.id]);k++)aqSwim.push({id:f.id,x:20+Math.random()*160,y:16+((aqSwim.length*13)%62),v:(6+Math.random()*8)*(Math.random()<.5?-1:1),ph:Math.random()*6});});
  aqSwim=aqSwim.slice(0,16);
}
function aqLoop(now){
  if(!fishM.classList.contains('show'))return;
  const t=now/1000,c=aqX,W2=200,H2=100;
  const band=['#8fd3e6','#7cc6dc','#6cb9d3','#5eabc9','#529fbf'];band.forEach((col,i)=>{c.fillStyle=col;c.fillRect(0,i*18,W2,18);});
  c.fillStyle='rgba(255,255,255,.12)';for(let i=0;i<4;i++){const x=((i*57+t*6)%260)-30;for(let y=0;y<80;y++)c.fillRect(Math.round(x+y*.35),y,6,1);}
  c.fillStyle='#e8d29a';c.fillRect(0,86,W2,14);c.fillStyle='#d6bd80';for(let i=0;i<30;i++)c.fillRect((i*37)%W2,88+(i*5)%10,2,1);
  c.fillStyle='#f2e2b0';c.fillRect(0,86,W2,1);
  [[22,40,'#3c8a3a'],[30,28,'#4f9e43'],[150,46,'#3c8a3a'],[160,30,'#58a84a'],[176,38,'#4f9e43'],[96,20,'#58a84a']].forEach(([x,h,col],i)=>{c.fillStyle=col;for(let k=0;k<h;k++){const sw=Math.round(Math.sin(t*1.2+k*.18+i)*(k/h)*3);c.fillRect(x+sw,86-k,2,1);}});
  c.fillStyle='#8a8a84';c.fillRect(110,80,14,6);c.fillStyle='#a9aaa0';c.fillRect(111,79,12,2);c.fillRect(60,82,9,4);c.fillStyle='#cfd0c6';c.fillRect(61,82,4,1);
  c.fillStyle='#e8f8ff';for(let i=0;i<6;i++){const y=84-((t*14+i*15)%84),x=117+Math.round(Math.sin(t*3+i)*1.5);c.fillRect(x,Math.round(y),i%3?1:2,i%3?1:2);}
  aqSwim.forEach(f=>{f.x+=f.v/60;if(f.x<8){f.x=8;f.v=-f.v;}if(f.x>W2-8){f.x=W2-8;f.v=-f.v;}
    const im=fishImg(f.id),y=Math.round(f.y+Math.sin(t*1.5+f.ph)*2);
    c.save();if(f.v<0){c.translate(Math.round(f.x),0);c.scale(-1,1);c.drawImage(im,-Math.round(im.width/2),y);}else c.drawImage(im,Math.round(f.x-im.width/2),y);c.restore();});
  c.fillStyle='rgba(255,255,255,.25)';c.fillRect(0,0,W2,1);
  aqRaf=requestAnimationFrame(aqLoop);
}
