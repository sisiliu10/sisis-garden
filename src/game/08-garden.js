/* ================= the cat ================= */
const cat={x:100,y:230,moving:false,face:1,sit:0,purr:0};
function hasCat(){return !visiting&&!!(home&&home.cat);}
function streakDays(){
  if(!home) return 0; const days=new Set();
  Object.values(home.logs||{}).forEach(L=>L.forEach(e=>days.add(new Date(e.t).toDateString())));
  const d=new Date(); let n=0; if(!days.has(d.toDateString())) d.setDate(d.getDate()-1);
  while(days.has(d.toDateString())){n++;d.setDate(d.getDate()-1);}
  return n;
}
function updateCat(dt){
  if(!hasCat()) return;
  const dx=av.x-cat.x,dy=av.y-cat.y,d=Math.hypot(dx,dy);
  if(d>110){cat.x=av.x-12;cat.y=av.y+2;return;}
  if(d>16){const sp=Math.min(75,35+d*1.2)*dt,nx=cat.x+dx/d*sp,ny=cat.y+dy/d*sp;
    let mv=false;if(!blocked(nx,cat.y)){cat.x=nx;mv=true;}if(!blocked(cat.x,ny)){cat.y=ny;mv=true;}
    cat.moving=mv;if(Math.abs(dx)>2)cat.face=dx>0?1:-1;cat.sit=0;}
  else{cat.moving=false;cat.sit+=dt;}
  cat.purr=(!av.moving&&d<22&&cat.sit>2.5)?1:0;
}
function drawCat(t){
  const x=Math.round(cat.x),y=Math.round(cat.y),B='#8d929c',D='#5f646e',L='#c3c8d0',P='#f2a0b0',E='#7ddc6a';
  g.fillStyle='rgba(40,80,40,.25)';g.fillRect(x-5,y,10,1);g.fillRect(x-4,y+1,8,1);
  if(cat.moving){
    const f=cat.face,ox=x-6,oy=y-8,fr=Math.floor(t*10)%2;
    const r=(a,b,w,h,c)=>R(f>0?ox+a:ox+(12-a-w),oy+b,w,h,c);
    r(1,3,8,4,B);r(4,3,1,2,D);r(6,3,1,2,D);r(8,1,4,4,B);r(8,0,1,1,B);r(11,0,1,1,B);r(10,2,1,1,E);r(11,3,1,1,P);
    r(0,1,1,3,B);r(1,3,1,1,B);
    if(fr){r(2,7,1,1,D);r(7,7,1,1,D);}else{r(3,7,1,1,D);r(6,7,1,1,D);}
    return;
  }
  const ox=x-5,oy=y-10,bl=(t%3.7)<.12,sw=Math.sin(t*2.5)>0;
  R(ox+1,oy,2,2,B);R(ox+7,oy,2,2,B);R(ox+2,oy+1,1,1,P);R(ox+7,oy+1,1,1,P);
  R(ox+1,oy+2,8,5,B);R(ox,oy+3,10,3,B);R(ox+4,oy+2,2,1,D);R(ox+3,oy+3,1,1,D);R(ox+6,oy+3,1,1,D);
  if(bl||cat.purr){R(ox+2,oy+4,2,1,D);R(ox+6,oy+4,2,1,D);}else{R(ox+2,oy+4,2,1,E);R(ox+6,oy+4,2,1,E);}
  R(ox+4,oy+5,2,1,P);
  R(ox+2,oy+7,6,3,B);R(ox+1,oy+8,8,2,B);R(ox+4,oy+7,2,2,L);R(ox+2,oy+10,2,1,L);R(ox+6,oy+10,2,1,L);
  R(ox+9,oy+7,1,3,B);if(sw)R(ox+10,oy+5,1,3,D);else R(ox+10,oy+8,2,1,D);
  if(cat.purr){const hy=oy-5+(Math.sin(t*3)>0?0:-1);[[1,0],[3,0],[0,1],[1,1],[2,1],[3,1],[4,1],[1,2],[2,2],[3,2],[2,3]].forEach(([a,b])=>R(ox+3+a,hy+b,1,1,'#ff7a9a'));}
}

/* ================= work log ================= */
const dDidForm=document.getElementById('dDidForm'), dDidIn=document.getElementById('dDidIn'), dBtns=document.getElementById('dBtns');
function shortAgo(ts){const m=Math.floor((Date.now()-ts)/60000);if(m<1)return'now';if(m<60)return m+' min';const h=Math.floor(m/60);if(h<24)return h+' h';const d=Math.floor(h/24);if(d<7)return d+'d ago';return new Date(ts).toLocaleDateString(undefined,{day:'numeric',month:'short'});}
function logRows(entries,box){entries.forEach(e=>{const r=document.createElement('div');r.className='lrow';const w=document.createElement('span');w.className='when';w.textContent=shortAgo(e.t);const tx=document.createElement('span');tx.textContent=e.text||'Watered';r.appendChild(w);r.appendChild(tx);box.appendChild(r);});}
let logAll=false,logEdit=null,logSure=false;
const PENCIL='<svg viewBox="0 0 14 5" aria-hidden="true"><rect x="3" y="0" width="1" height="1" fill="#2a2430"/><rect x="4" y="0" width="1" height="1" fill="#2a2430"/><rect x="5" y="0" width="1" height="1" fill="#2a2430"/><rect x="6" y="0" width="1" height="1" fill="#2a2430"/><rect x="7" y="0" width="1" height="1" fill="#2a2430"/><rect x="8" y="0" width="1" height="1" fill="#2a2430"/><rect x="9" y="0" width="1" height="1" fill="#2a2430"/><rect x="10" y="0" width="1" height="1" fill="#2a2430"/><rect x="11" y="0" width="1" height="1" fill="#2a2430"/><rect x="12" y="0" width="1" height="1" fill="#2a2430"/><rect x="1" y="1" width="1" height="1" fill="#2a2430"/><rect x="2" y="1" width="1" height="1" fill="#f1d3a0"/><rect x="3" y="1" width="1" height="1" fill="#f6c533"/><rect x="4" y="1" width="1" height="1" fill="#f6c533"/><rect x="5" y="1" width="1" height="1" fill="#f6c533"/><rect x="6" y="1" width="1" height="1" fill="#f6c533"/><rect x="7" y="1" width="1" height="1" fill="#f6c533"/><rect x="8" y="1" width="1" height="1" fill="#f6c533"/><rect x="9" y="1" width="1" height="1" fill="#f6c533"/><rect x="10" y="1" width="1" height="1" fill="#b9bccb"/><rect x="11" y="1" width="1" height="1" fill="#f28aa3"/><rect x="12" y="1" width="1" height="1" fill="#f28aa3"/><rect x="13" y="1" width="1" height="1" fill="#2a2430"/><rect x="0" y="2" width="1" height="1" fill="#2a2430"/><rect x="1" y="2" width="1" height="1" fill="#2a2430"/><rect x="2" y="2" width="1" height="1" fill="#f1d3a0"/><rect x="3" y="2" width="1" height="1" fill="#f6c533"/><rect x="4" y="2" width="1" height="1" fill="#f6c533"/><rect x="5" y="2" width="1" height="1" fill="#f6c533"/><rect x="6" y="2" width="1" height="1" fill="#f6c533"/><rect x="7" y="2" width="1" height="1" fill="#f6c533"/><rect x="8" y="2" width="1" height="1" fill="#f6c533"/><rect x="9" y="2" width="1" height="1" fill="#f6c533"/><rect x="10" y="2" width="1" height="1" fill="#b9bccb"/><rect x="11" y="2" width="1" height="1" fill="#f28aa3"/><rect x="12" y="2" width="1" height="1" fill="#f28aa3"/><rect x="13" y="2" width="1" height="1" fill="#2a2430"/><rect x="1" y="3" width="1" height="1" fill="#2a2430"/><rect x="2" y="3" width="1" height="1" fill="#f1d3a0"/><rect x="3" y="3" width="1" height="1" fill="#d9952a"/><rect x="4" y="3" width="1" height="1" fill="#d9952a"/><rect x="5" y="3" width="1" height="1" fill="#d9952a"/><rect x="6" y="3" width="1" height="1" fill="#d9952a"/><rect x="7" y="3" width="1" height="1" fill="#d9952a"/><rect x="8" y="3" width="1" height="1" fill="#d9952a"/><rect x="9" y="3" width="1" height="1" fill="#d9952a"/><rect x="10" y="3" width="1" height="1" fill="#b9bccb"/><rect x="11" y="3" width="1" height="1" fill="#f28aa3"/><rect x="12" y="3" width="1" height="1" fill="#f28aa3"/><rect x="13" y="3" width="1" height="1" fill="#2a2430"/><rect x="3" y="4" width="1" height="1" fill="#2a2430"/><rect x="4" y="4" width="1" height="1" fill="#2a2430"/><rect x="5" y="4" width="1" height="1" fill="#2a2430"/><rect x="6" y="4" width="1" height="1" fill="#2a2430"/><rect x="7" y="4" width="1" height="1" fill="#2a2430"/><rect x="8" y="4" width="1" height="1" fill="#2a2430"/><rect x="9" y="4" width="1" height="1" fill="#2a2430"/><rect x="10" y="4" width="1" height="1" fill="#2a2430"/><rect x="11" y="4" width="1" height="1" fill="#2a2430"/><rect x="12" y="4" width="1" height="1" fill="#2a2430"/><rect x="4" y="1" width="6" height="1" fill="#fbe08a"/></svg>';
function renderLog(p){
  const box=document.getElementById('dLog'); box.innerHTML='';
  const src=visiting?visiting.data:home; if(!src) return;
  const L=((src.logs||{})[p.id]||[]); if(!L.length) return;
  const own=!visiting&&!!home;
  const hd=document.createElement('div');hd.className='lhh';
  const h=document.createElement('div');h.className='lh';h.textContent=`${L.length} LOG ENTR${L.length===1?'Y':'IES'}`;hd.appendChild(h);
  if(L.length>3){const mb=document.createElement('button');mb.type='button';mb.className='lmore';mb.textContent=logAll?'show less':'show all';
    mb.onclick=e=>{e.stopPropagation();logAll=!logAll;renderLog(p);};hd.appendChild(mb);}
  box.appendChild(hd);
  const list=document.createElement('div');if(logAll)list.className='lall';box.appendChild(list);
  (logAll?L.slice():L.slice(-3)).reverse().forEach(e=>{
    if(own&&logEdit===e){list.appendChild(logEditor(p,L,e));return;}
    const r=document.createElement('div');r.className='lrow';
    const w=document.createElement('span');w.className='when';w.textContent=shortAgo(e.t);
    const tx=document.createElement('span');tx.className='tx';tx.textContent=e.text||'Watered';if(!e.text)tx.style.color='var(--muted)';
    r.appendChild(w);r.appendChild(tx);
    if(own){const b=document.createElement('button');b.type='button';b.className='led';b.title='Edit or delete';b.setAttribute('aria-label','Edit or delete this entry');b.innerHTML=PENCIL;
      b.onclick=ev=>{ev.stopPropagation();logEdit=e;logSure=false;editing=true;renderLog(p);};r.appendChild(b);}
    list.appendChild(r);
  });
}
function logEditor(p,L,e){
  const f=document.createElement('form');f.className='ledit';f.autocomplete='off';
  const inp=document.createElement('input');inp.className='inp';inp.maxLength=140;inp.value=e.text;f.appendChild(inp);
  const bs=document.createElement('div');bs.className='dbtns';
  const ok=document.createElement('button');ok.className='btn';ok.type='submit';ok.textContent='Save';ok.style.background='var(--water)';ok.style.color='#fff';
  const no=document.createElement('button');no.className='btn';no.type='button';no.textContent='Cancel';
  const del=document.createElement('button');del.className='btn ldel'+(logSure?' sure':'');del.type='button';del.textContent=logSure?'Really delete?':'Delete';
  bs.appendChild(ok);bs.appendChild(no);bs.appendChild(del);f.appendChild(bs);
  const done=()=>{logEdit=null;logSure=false;editing=false;renderLog(p);};
  f.addEventListener('submit',ev=>{ev.preventDefault();const v=inp.value.trim();
    if(!v){inp.classList.remove('shake');void inp.offsetWidth;inp.classList.add('shake');inp.focus();return;}
    e.text=v.slice(0,140);persist();done();});
  no.onclick=ev=>{ev.stopPropagation();done();};
  del.onclick=ev=>{ev.stopPropagation();if(!logSure){logSure=true;del.classList.add('sure');del.textContent='Really delete?';return;}
    const i=L.indexOf(e);if(i>=0)L.splice(i,1);persist();done();refreshLabels();};
  inp.addEventListener('keydown',ev=>{if(ev.key==='Escape'){ev.stopPropagation();ev.preventDefault();done();}});
  setTimeout(()=>{inp.focus();inp.setSelectionRange(inp.value.length,inp.value.length);},30);
  return f;
}
// watering with a note: remember WHICH plant the form belongs to, so nothing else (walking, a re-render, a slow pour) can swallow the entry
let logPlant=null;
dBtns.parentNode.insertBefore(dDidForm,dBtns);
function closeLog(){ dDidIn.value=''; editing=false; const p=active;
  if(p){document.getElementById('dDidQ').textContent=p.bed?'WHAT DID YOU PRACTISE? (OPTIONAL)':'WHAT DID YOU DO? (OPTIONAL)';
    dDidIn.placeholder=p.bed?'Optional, e.g. 20 min of reading':'Optional, e.g. sent the pitch deck';} }
dDidIn.addEventListener('focus',()=>{editing=true;logPlant=active;});
dDidIn.addEventListener('input',()=>{logPlant=active;});
dDidIn.addEventListener('blur',()=>{if(dForm.hidden)editing=false;});
let lastSubmit=0;
function submitLog(){
  const p=logPlant||active; if(!p) return;
  const text=dDidIn.value.trim();
  const now=performance.now(); if(now-lastSubmit<400) return; lastSubmit=now;
  dDidIn.value=''; dDidIn.blur(); closeLog(); logPlant=null;
  if(av.water>0){if(waterFx&&waterFx.grow>waterFx.p.progress)waterFx.p.progress=waterFx.grow;av.water=0;waterFx=null;dlg.classList.remove('pouring');}   // a pour still running never blocks the next one
  doWater(p,text);
}
dDidForm.addEventListener('submit',e=>{e.preventDefault();submitLog();});
document.getElementById('dDidOk').addEventListener('click',e=>{e.preventDefault();submitLog();});
document.getElementById('dDidCancel').onclick=()=>{dDidIn.blur();closeLog();logPlant=null;};
dDidIn.addEventListener('keydown',e=>{
  if(e.key==='Enter'){ if(e.isComposing) return; e.preventDefault(); e.stopPropagation(); submitLog(); return; }
  if(e.key==='Escape'){e.stopPropagation();dDidIn.blur();closeLog();logPlant=null;}
});

/* ================= watering ================= */
function doWater(p,text){
  if(av.water>0||visiting||!home) return;
  text=String(text||'').trim();
  const L=home.logs[p.id]||(home.logs[p.id]=[]); L.push({t:Date.now(),text:text.slice(0,140)}); if(L.length>LOG_MAX) L.splice(0,L.length-LOG_MAX);
  let catNews=false; if(!home.cat&&streakDays()>=7){home.cat=true;catNews=true;cat.x=av.x-30;cat.y=av.y+6;}
  av.water=WATER_T; av.pourFor=p; av.back=posOf(p)[1]<av.y-6;
  const weeds=weedsOf(p), before=waterOf(p);
  waterFx={p,from:before,t0:performance.now(),m:av.x<=posOf(p)[0]?1:-1,done:false};
  dlg.classList.add('pouring'); Sfx.pour(.3);
  p.w=100; p.t=Date.now(); p.last=Date.now(); coinsForWatering(p);
  // every watering is real work logged, so the plant grows: +4% (the slider can still set any value by hand)
  const st0=stageOf(p),pr0=p.progress,pr1=Math.min(100,pr0+(pr0<100?4:0)),grew=pr1-pr0,stUp=stageOf({progress:pr1})>st0; waterFx.grow=pr1;
  const msg=stUp?`${p.code} grew into a ${(p.bed?BED_STAGES:STAGE_NAMES)[stageOf({progress:pr1})].toLowerCase()}! Now at ${pr1}%.`:catNews?'7 days in a row: a cat moved in! It will follow you around now.':weeds?`Pulled ${weeds} weed${weeds>1?'s':''} and watered. Welcome back to ${p.code}.`:
    (grew?`+${grew}% growth. `:'')+(before<35?'Much better. Logged.':pick(['Logged and watered.','Fresh water, happy plant.','Logged. Keep it going.']));
  if(weeds){const [x,y]=posOf(p);for(let i=0;i<14;i++)spawn({kind:'puff',x:x+(Math.random()*26-13),y:y+(Math.random()*6-2),vy:-6-Math.random()*6,life:.6});}
  persist();
  renderLog(p);
  setTimeout(()=>{if(p.progress<pr1){p.progress=pr1;persist();}dlg.classList.remove('pouring');if(active===p&&!editing){updateDialog(false);msgEl.textContent=msg;}refreshLabels();},WATER_T*1000);
}
const WATER_T=2.4;let waterFx=null;const bounceAt={};
// what the water bar and the plant show while the can is still pouring: it fills up with the stream
function shownWater(p){if(waterFx&&waterFx.p===p){const e=(performance.now()-waterFx.t0)/1000,k=clamp((e-.35)/1.5,0,1);return waterFx.from+(100-waterFx.from)*(1-(1-k)*(1-k));}return waterOf(p);}
const CAN_ROWS=["....OOOOO.........","...O.....O........","..OOOOOOOOOO....OO","..OHHBBBBBSO...ORO","..OHBBBBBBSO..OBO.","..OHBBBBBBSOOOBO..","..OBBBBBBBSBBBO...","..OBBBBBBBSOOO....","..OSSSSSSSSO......","...OOOOOOOO......."];
const canCv=(()=>{const c=document.createElement('canvas');c.width=18;c.height=10;const x=c.getContext('2d'),C={O:'#2a2430',B:'#5aaee6',H:'#a8dcfa',S:'#2f78b8',R:'#8fd0f5'};
  CAN_ROWS.forEach((row,y)=>[...row].forEach((ch,i)=>{if(C[ch]){x.fillStyle=C[ch];x.fillRect(i,y,1,1);}}));return c;})();
const CAN_TIP=[9,-4],CAN_TILT=.8;
function canPose(fx){
  const e=(performance.now()-fx.t0)/1000,p=fx.p,[px,py]=posOf(p),top=p.bed?py-BED_H/2:py-plantTop(p),m=fx.m;
  const ease=k=>k<0?0:k>1?1:1-(1-k)*(1-k);
  const tilt=e<.35?ease(e/.35):e<1.9?1:1-ease((e-1.9)/.3);
  const a=m*CAN_TILT*tilt,full=m*CAN_TILT,rot=(ang)=>[CAN_TIP[0]*m*Math.cos(ang)-CAN_TIP[1]*Math.sin(ang),CAN_TIP[0]*m*Math.sin(ang)+CAN_TIP[1]*Math.cos(ang)];
  const tx=px+m*1,ty=Math.min(top-8,py-26),rf=rot(full),cx=tx-rf[0],cy=ty-rf[1]-(e<.35?(1-ease(e/.35))*8:0)-(e>1.9?ease((e-1.9)/.4)*5:0);
  const rt=rot(a),al=e<.2?e/.2:e>2.0?Math.max(0,1-(e-2.0)/.35):1;
  return {e,a,m,cx,cy,tip:[cx+rt[0],cy+rt[1]],al,px,py,top,pouring:e>.32&&e<1.92};
}
function drawCan(){
  if(!waterFx||scene!=='garden')return;const c=canPose(waterFx);if(c.al<=0)return;
  g.save();g.globalAlpha=c.al;g.translate(Math.round(c.cx),Math.round(c.cy));g.rotate(c.a);g.scale(c.m,1);g.drawImage(canCv,-8,-6);g.restore();
}
function withBounce(p,base,f){const b=bounceAt[p.id];if(b===undefined){f();return;}const k=(performance.now()-b)/700;if(k>=1){delete bounceAt[p.id];f();return;}
  const a=Math.sin(k*Math.PI*3)*(1-k)*.2,px=posOf(p)[0];g.save();g.translate(px,base);g.scale(1-a*.6,1+a);g.translate(-px,-base);f();g.restore();}
function burst(p,n){const [x,y]=posOf(p),top=plantTop(p);setTimeout(()=>{for(let i=0;i<n;i++)spawn({kind:'spark',x:x+(Math.random()*24-12),y:y-Math.random()*top-4,vy:-8-Math.random()*8,life:.9+Math.random()*.5});},500);}

/* ================= particles, critters, avatar ================= */
let parts=[];
function spawn(o){parts.push(Object.assign({life:1,age:0},o));}
const flies=[{x:60,y:190,tx:60,ty:190,ph:0,c:'#ffffff',next:0},{x:180,y:280,tx:180,ty:280,ph:1.3,c:'#ffe27a',next:0}];
const av={x:120,y:216,back:false,moving:false,target:null,water:0,pourFor:null};
const host={x:40,y:172};
function drawSleeper(t){
  const hx=host.x,hy=host.y,L=visiting.data.look;
  g.fillStyle='rgba(40,80,40,.28)';g.fillRect(hx-13,hy+5,27,2);
  g.save();g.translate(hx,hy);g.rotate(-Math.PI/2);drawAvatar(g,0,12,L,{shadow:false,blink:true,t:0});g.restore();
  const ph=(t*.5)%1;[0,1,2].forEach(i=>{const k=(ph+i/3)%1,n=i===2?4:3,zx=Math.round(hx-12-k*5),zy=Math.round(hy-8-k*16);
    g.globalAlpha=k<.15?k/.15:Math.max(0,1-(k-.15)/.85);R(zx,zy,n,1,'#ffffff');for(let d=1;d<n-1;d++)R(zx+n-1-d,zy+d,1,1,'#ffffff');R(zx,zy+n-1,n,1,'#ffffff');g.globalAlpha=1;});
}
const keys={};
let t0=performance.now(),petalT=0,sprayT=0;

function blocked(x,y){
  if(scene==='house') return houseBlocked(x,y);
  if(scene==='island') return isleBlocked(x,y);
  {const fx=(x-FOUNT.x)/27,fy=(y-(FOUNT.y-1))/11; if(fx*fx+fy*fy<1) return true;}
  if(y<144||y>WORLD_H-5||x<-OX+6||x>CW+OX-6) return true;
  if(x>46&&x<86&&y<159&&!(x>55&&x<65)) return true;
  if(y>349&&y<362&&(x<105||x>135)) return true;
  for(const b of skills()){const [bx,by]=posOf(b);if(x>bx-BED_W/2-3&&x<bx+BED_W/2+3&&y>by-BED_H/2+3&&y<by+BED_H/2+3)return true;}

  if(scene==='garden'&&Math.hypot(x-(SL.x+15),(y-(SL.y-1))*1.5)<7) return true;
  if(scene==='garden'&&lineBlocked(x,y)) return true;
  if(scene==='garden'&&pondBlocked(x,y)) return true;
  if(decoBlocked(x,y)) return true;
  if(scene==='garden'&&x>COMP.x-14&&x<COMP.x+19&&y>COMP.y-6&&y<COMP.y+2) return true;
  if(visiting&&Math.abs(x-host.x)<14&&Math.abs(y-host.y)<5) return true;
  for(const p of projects()){const s=Math.min(scaleOf(p),1.6),[px,py]=posOf(p),rx=(p.kind==='tree'?7:6)*s;const ex=(x-px)/rx,ey=(y-py)/(4*s);if(ex*ex+ey*ey<1)return true;}
  return false;
}
addEventListener('keydown',e=>{
  const tg=e.target.tagName;
  if(tg==='INPUT'||tg==='TEXTAREA'||tg==='BUTTON'&&e.key===' '){ if(e.key==='Escape')e.target.blur(); return; }
  if(document.querySelector('.modal.show')){if(e.key==='Escape')closeModals();return;}
  const k=e.key.toLowerCase();
  if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].includes(k)){keys[k]=true;av.target=null;av.run=false;fish=null;e.preventDefault();}
  if(k==='e'||k===' '){
    if(scene==='house'){if(houseNear)houseNear.act();e.preventDefault();}
    else if(scene==='island'){isleAct();e.preventDefault();}
    else if(fish){fishTap();e.preventDefault();}
    else if(atSpot()){castLine();e.preventDefault();}
    else if(active&&!editing){logPlant=active;submitLog();e.preventDefault();}
    else if(promptEl.dataset.on){goToDoor();e.preventDefault();}
  }
});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false;});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;});
let lastTap={t:0,x:0,y:0};
cvs.addEventListener('pointerdown',e=>{
  pendAct=null;pendSit=null;pendRide=false;pendSlide=false;
  if(slide)return;
  if(mySeat!==null&&scene==='garden'){const lx0=e.clientX/S-OX,ly0=e.clientY/S+camR-OY;const pp0=peerAt(lx0,ly0);if(!pp0){if(onSwing(lx0,ly0)){pump(.9);return;}leaveSwing({x:lx0,y:ly0});return;}}
  {const now=performance.now(),dbl=now-lastTap.t<350&&Math.hypot(e.clientX-lastTap.x,e.clientY-lastTap.y)<40;lastTap={t:dbl?0:now,x:e.clientX,y:e.clientY};av.run=dbl;}
  if(document.activeElement&&document.activeElement.tagName==='INPUT')document.activeElement.blur();
  if(scene==='house'){housePointer(e.clientX/S-RX,e.clientY/S-RY);return;}
  if(scene==='island'){islePointer(e.clientX/S-IX,e.clientY/S-IY);return;}
  const lx=e.clientX/S-OX,ly=e.clientY/S+camR-OY;
  if(fish){if(fish.ph==='bite'||fish.ph==='show'||fish.ph==='reel'||onPondTap(lx,ly)){fishTap();return;}fish=null;}
  if(moving){av.run=false;placeAt(lx,ly);return;}
  if(passOf){hopOff();return;}
  if(onPondTap(lx,ly)){goFish();return;}
  if(lx>=BOARD.x0-4&&lx<=BOARD.x1+2&&Math.abs(ly-BOARD.y)<8&&!av.swim){av.run=false;av.target={x:BOARD.x1-3,y:BOARD.y,onArrive:()=>{av.target={x:BOARD.x0+2,y:BOARD.y,onArrive:()=>startJump(BOARD.x0-20,BOARD.y+4,true)};}};return;}
  if(lx>40&&lx<92&&ly>HB-46&&ly<HB+2){goToDoor();return;}
  let hit=null;
  for(const p of projects()){const [px,py]=posOf(p),s=scaleOf(p),top=plantTop(p);if(Math.abs(lx-px)<12*Math.min(s,1.6)+2&&ly>py-top-14&&ly<py+12){hit=p;break;}}
  if(!hit)for(const b of skills()){const [bx,by]=posOf(b);if(Math.abs(lx-bx)<BED_W/2+2&&ly>by-BED_H/2-12&&ly<by+BED_H/2+6){hit=b;break;}}
  {const pp=peerAt(lx,ly);if(pp&&!moving){av.run=false;openActMenu(pp,e.clientX,e.clientY);return;}}
  if(!moving&&riding&&Math.abs(lx-av.x)<12&&ly>av.y-36&&ly<av.y+4){dismount();return;}
  if(!moving&&!riding&&mySeat===null&&alpIdle()&&Math.abs(lx-alp.x)<14&&ly>alp.y-33&&ly<alp.y+4){goRide();return;}
  if(!moving&&onSlide(lx,ly)){goSlide();return;}
  if(!moving&&lx>COMP.x-15&&lx<COMP.x+21&&ly>COMP.y-26&&ly<COMP.y+4){av.run=false;av.target={x:COMP.x+23,y:COMP.y+3};openCompost();return;}
  if(!moving&&onLine(lx,ly)){av.target=null;const gi=garmentAt(lx,ly);if(gi>=0)openTip(gi,e.clientX,e.clientY);else openLine();return;}
  if(hit){av.target=besideTarget(hit);return;}
  if(Math.abs(lx-FOUNT.x)<28&&ly>FOUNT.y-28&&ly<FOUNT.y+12){av.target={x:FOUNT.x,y:FOUNT.y+14};return;}
  av.target={x:clamp(lx,-OX+6,CW+OX-6),y:clamp(ly,145,WORLD_H-6)};
});

function besideTarget(p){if(p.bed){const [bx,by]=posOf(p);return {x:bx,y:by+BED_H/2+7,plant:p};}const [px,py]=posOf(p),s=Math.min(scaleOf(p),1.6),side=px<120?1:-1;return {x:px+side*(10+6*s),y:py+3,plant:p};}

/* ================= creator ================= */
const creator=document.getElementById('creator'),optsEl=document.getElementById('opts'),nm=document.getElementById('nm');
const pv=document.getElementById('prev'),pvc=pv.getContext('2d');
function buildCreator(){
  optsEl.querySelectorAll('.opt.gen').forEach(n=>n.remove());
  const L=me().look;
  [['skin','SKIN','sw'],['hair','HAIR','tx'],['hairColor','HAIR COLOR','sw'],['top','TOP','sw'],['bottom','BOTTOM','tx'],['bottomColor','BOTTOM COLOR','sw'],['acc','ACCESSORY','tx']].forEach(([k,label,type])=>{
    const o=document.createElement('div');o.className='opt gen';
    o.innerHTML=`<div class="k">${label}</div><div class="sw ${type==='tx'?'tx':''}"></div>`;
    const box=o.querySelector('.sw');
    (isOwner?OPT[k]:(EXTRA_LOOK[k]||[]).filter(v=>!SHOP_ACC.includes(v)).concat(OPT[k])).concat(k==='acc'?SHOP_ACC.filter(owns):[]).forEach(v=>{
      const b=document.createElement('button');b.type='button';
      if(type==='sw'){b.style.background=v;b.setAttribute('aria-label',v);}
      else b.textContent=k==='acc'?ACC_LABEL[v]:k==='hair'?HAIR_LABEL[v]:v[0].toUpperCase()+v.slice(1);
      if(L[k]===v)b.classList.add('on');
      b.onclick=()=>{me().look[k]=v;box.querySelectorAll('button').forEach(x=>x.classList.remove('on'));b.classList.add('on');};
      box.appendChild(b);
    });
    optsEl.appendChild(o);
  });
  nm.value=me().name||'';
}
const GUEST_LOOK={skin:'#fde4d0',hair:'short',hairColor:'#c27a42',top:'#2b3550',bottom:'pants',bottomColor:'#2d2d35',acc:'glasses'};
// first visit: pick a look; later the wardrobe in your own cottage opens the same editor
function openCreator(ward){document.getElementById('crT').textContent=ward?'Your wardrobe':'Create your avatar';document.getElementById('crL').textContent=ward?'Pick what you wear today.':'Pick a look. Later you can change it in the wardrobe in your cottage.';document.getElementById('done').textContent=ward?'Done':'Into the garden →';const m=me(),fresh=!!m&&(!m.name||m.name==='Me'||m.name==='Visitor');if(!isOwner&&fresh&&!m.tailored){m.look=Object.assign({},GUEST_LOOK);['skin','hair','hairColor','top','bottom','bottomColor','acc'].forEach(k=>m.look[k]=pick(OPT[k]));m.tailored=1;}buildCreator();if(fresh){nm.value='';nm.placeholder='Your name';}creator.classList.add('show');}
function closeCreator(){
  if(loadFailed){toast('Could not load your garden. Check your connection and reload the page.',4000);return;}
  const m=me(),typed=(nm.value||'').trim().slice(0,14);
  if(!typed&&(!m.name||m.name==='Me'||m.name==='Visitor')){nm.focus();toast('Give your gardener a name first.',2400);return;}
  m.name=typed||m.name||'Me';
  const wasCreated=!!(home&&home.created);
  if(home) home.created=true;
  const first=!!home&&!wasCreated&&!homeHintSeen();
  creator.classList.remove('show'); persist(); refreshLabels(); refreshChrome();
  if(first)setTimeout(showHomeHint,900);
}
// first visit: a new gardener lands in someone else's garden, so point at the way to their own
const homeHint=document.createElement('div');homeHint.id='homeHint';document.body.appendChild(homeHint);
function homeHintSeen(){try{return localStorage.getItem('garden-homehint')==='1';}catch(e){return false;}}
function hideHomeHint(done){homeHint.classList.remove('show');document.getElementById('bHome').classList.remove('nudge');if(done){try{localStorage.setItem('garden-homehint','1');}catch(e){}}}
function showHomeHint(){const b=document.getElementById('bHome');if(!visiting||!home||b.hidden||homeHintSeen())return;
  homeHint.textContent='This is '+visiting.data.name+'’s garden. Your own garden is waiting here.';
  const r=b.getBoundingClientRect(),up=r.top>innerHeight/2;homeHint.classList.toggle('up',up);homeHint.style.left=Math.max(6,r.left)+'px';homeHint.style.top=(up?Math.max(6,r.top-10-(homeHint.offsetHeight||60)):(r.bottom+10))+'px';
  homeHint.classList.add('show');b.classList.add('nudge');setTimeout(()=>hideHomeHint(false),12000);}
addEventListener('resize',()=>hideHomeHint(false));
document.getElementById('rnd').onclick=()=>{['skin','hair','hairColor','top','bottom','bottomColor','acc'].forEach(k=>me().look[k]=pick(OPT[k]));const n=nm.value;buildCreator();nm.value=n;};
document.getElementById('done').onclick=closeCreator;
const help=document.getElementById('help');
document.getElementById('bHelp').onclick=()=>{renderNeighbours();help.classList.add('show');};
document.getElementById('helpOk').onclick=()=>help.classList.remove('show');
const gardensM=document.getElementById('gardens');
document.getElementById('bGardens').onclick=()=>{renderGardens();gardensM.classList.add('show');};
document.getElementById('gClose').onclick=()=>gardensM.classList.remove('show');
document.getElementById('bHome').onclick=()=>{hideHomeHint(true);goHome();};
function closeModals(){shopM.classList.remove('show');if(fishM.classList.contains('show'))closeAquarium();document.querySelectorAll('.modal.pgm.show').forEach(m=>m._close());compM.classList.remove('show');mapM.classList.remove('show');isleM.classList.remove('show');lineM.classList.remove('show');askM.classList.remove('show');if(quizM.classList.contains('show'))closeQuiz();if(c4M.classList.contains('show'))closeC4();stillM.classList.remove('show');dashM.classList.remove('show');booksM.classList.remove('show');if(creator.classList.contains('show'))closeCreator();help.classList.remove('show');gardensM.classList.remove('show');addM.classList.remove('show');}

/* ================= gardens (visiting) ================= */
function renderNeighbours(){
  const mine=document.getElementById('gMine'); mine.hidden=!home||!!visiting; document.getElementById('gListedRow').hidden=!home; if(home)document.getElementById('gListed').checked=isListed(); if(mine.hidden) return;
  document.getElementById('gSB').checked=home.sb!==false;document.getElementById('gListed').checked=isListed();
  const box=document.getElementById('nbList'); box.innerHTML='';
  (home.nb||[]).forEach((n,i)=>{const r=document.createElement('div');r.className='nbrow';const a=document.createElement('a');a.href=n.u;a.target='_blank';a.rel='noopener';a.textContent=n.n+'’s garden ↗';
    const x=document.createElement('button');x.className='btn';x.type='button';x.textContent='×';x.onclick=()=>{home.nb.splice(i,1);persist();renderNeighbours();};
    r.appendChild(a);r.appendChild(x);box.appendChild(r);});
}
document.getElementById('nbAdd').addEventListener('submit',e=>{e.preventDefault();if(!home)return;
  const n=document.getElementById('nbN').value.trim(),u=document.getElementById('nbU').value.trim();
  if(!/^https:\/\//.test(u)){document.getElementById('nbU').focus();return;}
  home.nb=(home.nb||[]).concat([{n:(n||'Friend').slice(0,30),u:u.slice(0,300)}]).slice(0,10);
  document.getElementById('nbN').value='';document.getElementById('nbU').value='';persist();renderNeighbours();});

document.getElementById('gSB').addEventListener('change',e=>{if(!home)return;home.sb=e.target.checked;persist();writePubBooks();});
document.getElementById('gListed').addEventListener('change',e=>{if(!home)return;home.listed=e.target.checked;persist();toast(home.listed?'Your garden is now in the list for everyone.':'Your garden is hidden from the list. Friends with your invite link can still visit.',3200);});
document.getElementById('gSearch').addEventListener('input',()=>renderGardens(true));
function addFriend(id){if(!home)return;home.friends=home.friends||[];if(!home.friends.includes(id)){home.friends.push(id);persist();}}
// enter a friend's garden by pasting their invite link (or just the code at its end)
document.getElementById('gEnter').addEventListener('submit',e=>{e.preventDefault();const inp=document.getElementById('gEnterIn'),raw=inp.value.trim();if(!raw)return;
  let id='';const m=raw.match(/[?&]g=([\w-]{6,64})/);if(m)id=m[1];else if(/^[\w-]{6,64}$/.test(raw))id=raw;
  if(id&&id===myId){toast('That is your own link 🙂',2400);return;}
  const gd=id&&gardensList.find(x=>x.id===id);
  if(!gd){toast(id?'No garden found for this link. Ask your friend to send it again.':'That does not look like an invite link.',3200);return;}
  addFriend(gd.id);
  inp.value='';gardensM.classList.remove('show');visit(gd);toast('Welcome to '+gd.data.name+"'s garden 🌱",3000);});
function isListed(){return !!home&&(home.listed===undefined?!!home.owner:!!home.listed);}
const inviteUrl=()=>location.origin+location.pathname+'?g='+encodeURIComponent(myId||'');
document.getElementById('gInvite').addEventListener('click',async()=>{if(!myId)return;const u=inviteUrl();
  try{if(navigator.share&&innerWidth<700){await navigator.share({title:"Come visit my garden",text:'Come visit my garden 🌱',url:u});return;}}catch(e){if(e&&e.name==='AbortError')return;}
  try{await navigator.clipboard.writeText(u);toast('Invite link copied. Whoever opens it lands in your garden.',3000);}catch(e){window.prompt('Copy your invite link:',u);}});
// invite links: ?g=<garden id> brings a friend straight into that garden and remembers it as a friend
let inviteId='';try{inviteId=new URLSearchParams(location.search).get('g')||localStorage.getItem('garden-invite')||'';}catch(e){}
function handleInvite(){
  if(!inviteId||!myId||stayHome)return false; if(inviteId===myId){inviteId='';try{localStorage.removeItem('garden-invite');}catch(e){}return false;}
  const gd=gardensList.find(x=>x.id===inviteId); if(!gd)return false;
  addFriend(gd.id);
  inviteId='';try{localStorage.removeItem('garden-invite');history.replaceState(null,'',location.pathname+location.hash);}catch(e){}
  ownerVisited=true;visiting={id:gd.id,data:gd.data};visBooksFor=null;if(started)enterGarden();toast('Welcome to '+gd.data.name+"'s garden 🌱",3000);return true;
}
function renderGardens(keep){
  if(!keep)renderNeighbours();
  const box=document.getElementById('glist'); box.innerHTML='';
  if(!db){const e=document.createElement('div');e.className='empty';e.textContent='Gardens sync once you are signed in.';box.appendChild(e);return;}
  const q=(document.getElementById('gSearch').value||'').trim().toLowerCase(),fr=(home&&home.friends)||[];
  const list=gardensList.filter(gd=>gd.id!==myId&&(gd.data.owner||gd.data.listed||fr.includes(gd.id)||(visiting&&visiting.id===gd.id))).filter(gd=>!q||gd.data.name.toLowerCase().includes(q)).sort((a,b)=>(b.id===myId)-(a.id===myId)||(b.data.owner-a.data.owner)||a.data.name.localeCompare(b.data.name));
  const all=gardensList.filter(gd=>gd.id!==myId&&(gd.data.owner||gd.data.listed||fr.includes(gd.id)||(visiting&&visiting.id===gd.id))).length;document.getElementById('gSearch').hidden=all<6&&!q;
  if(!list.length){const e=document.createElement('div');e.className='empty';e.textContent=q?'Nobody with that name. Paste their invite link below.':'No friends here yet. Paste a friend’s invite link below, or send them yours.';box.appendChild(e);return;}
  list.forEach(gd=>{
    const row=document.createElement('div');row.className='grow';
    const l=document.createElement('div');const b=document.createElement('b');b.textContent=gd.data.name+(gd.id===myId?' (you)':fr.includes(gd.id)?' ♥':'');l.appendChild(b);
    if(gd.id!==myId&&onlineIds().has(gd.id)){const on=document.createElement('span');on.className='online';on.textContent='  ● here now';b.appendChild(on);}
    const m=document.createElement('div');m.className='m';
    const ps=gd.data.projects, avgP=ps.length?Math.round(ps.reduce((a,p)=>a+p.progress,0)/ps.length):0;
    const sk=gd.data.skills||[];m.textContent=`${ps.length} project${ps.length!==1?'s':''}, ${sk.length} skill${sk.length!==1?'s':''}, avg progress ${avgP}%, water ${Math.round(gardenAvg(gd.data))}%`;l.appendChild(m);
    const btn=document.createElement('button');btn.className='btn';
    const isMine=gd.id===myId;
    btn.textContent=isMine?(visiting?'Go home':'You are here'):(visiting&&visiting.id===gd.id?'You are here':'Visit');
    btn.disabled=isMine?!visiting:(visiting&&visiting.id===gd.id);
    btn.onclick=()=>{gardensM.classList.remove('show');isMine?goHome():visit(gd);};
    row.appendChild(l);row.appendChild(btn);box.appendChild(row);
  });
}
function visit(gd){visiting={id:gd.id,data:gd.data};visBooksFor=null;enterGarden();}
let stayHome=false;
function goHome(){if(!home)return;stayHome=true;if(home.created&&!home.hs){home.hs=true;persist();}visiting=null;enterGarden();}
const bJump=document.getElementById('bJump');
function updateJump(){const need=TH-H>8;bJump.hidden=!need;if(need){const up=camR>(TH-H)/2,narrow=innerWidth<560;bJump.textContent=narrow?(up?'↑':'↓'):(up?'Projects ↑':'Skills ↓');}}
bJump.onclick=()=>{const toSkills=camR<=(TH-H)/2;av.target=null;av.x=120;av.y=toSkills?374:216;av.back=false;camY=clamp(av.y+OY-H*.55,0,Math.max(0,TH-H));};
function enterGarden(){
  slide=null;pendSlide=false;
  riding=false;pendRide=false;
  av.swim=false;av.jump=null;
  if(moving)endMove();
  if(scene==='house')exitHouse();
  if(scene==='island')exitIsland();
  syncRoom();
  camY=0;
  av.x=120;av.y=216;av.target=null;av.water=0;closePanel();
  document.getElementById('title').style.opacity=1;
  rebuildLabels();refreshChrome();
}

