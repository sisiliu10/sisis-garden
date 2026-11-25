/* ================= loop ================= */
let last=performance.now(),uiTick=0;
let mySay=null, sayN=0;
const chatIn=document.getElementById('chatIn'), bubBox=document.getElementById('bubbles');let typingAt=0;
chatIn.addEventListener('input',()=>{typingAt=performance.now();});chatIn.addEventListener('blur',()=>{typingAt=0;});
document.getElementById('chatbar').addEventListener('submit',e=>{e.preventDefault();const t=chatIn.value.trim().slice(0,80);if(!t)return;
  sayN++;mySay={n:sayN,t,until:performance.now()+6000+t.length*60};chatIn.value='';chatIn.blur();
  logChat({t:Date.now(),n:me().name||'Me',text:t,me:true});
  try{if(window.__chatlog&&gardenKey())window.__chatlog.add({g:gardenKey(),n:(me().name||'Me').slice(0,14),text:t});}catch(e){}});
function drawBubbles(){
  const now=performance.now(), items=[];
  const sc=scene==='house'?'house':scene==='island'?'island':'garden';
  const toS=(x,y)=>sc==='island'?[(IX+x)*S,(IY+y)*S]:sc==='house'?[(RX+x)*S,(RY+y)*S]:[(OX+x)*S,(OY+y-camR)*S];
  if(mySay&&mySay.until>now) items.push({id:'me',x:av.x,y:av.y,t:mySay.t});
  else if(document.activeElement===chatIn&&chatIn.value.trim()&&now-typingAt<5000) items.push({id:'me~ty',x:av.x,y:av.y,ty:true});
  livePeers().forEach(p=>{if(p.scene!==sc)return;if(p.say)items.push({id:p.id,x:p.x,y:p.y,t:p.say});else if(p.typing)items.push({id:p.id+'~ty',x:p.x,y:p.y,ty:true});});
  const keep=new Set();
  items.forEach(it=>{keep.add(it.id);let el=bubBox.querySelector(`[data-b="${it.id}"]`);
    if(!el){el=document.createElement('div');el.className=it.ty?'bub bty':'bub';el.dataset.b=it.id;if(it.ty){el.innerHTML=PENCIL+'<i></i><i></i><i></i>';el.setAttribute('aria-label','is typing');}bubBox.appendChild(el);}
    if(!it.ty&&el.textContent!==it.t){el.textContent=it.t;el._w=0;}
    if(!el._w)el._w=el.offsetWidth/2+6;
    const [x,y]=toS(it.x,it.y-(it.id==='me'?30:36));el.style.left=clamp(x,el._w,Math.max(el._w,innerWidth-el._w))+'px';el.style.top=y+'px';});
  [...bubBox.children].forEach(el=>{if(!keep.has(el.dataset.b))el.remove();});
}
function frame(now){
  const dt=Math.min(.05,(now-last)/1000);last=now;const t=(now-t0)/1000;
  update(dt,t);updateAlpaca(dt);render(t);drawBubbles();processActs();sendPresence(now);tickLive(now);
  uiTick+=dt;if(waterFx)refreshLabels();if(uiTick>.5){uiTick=0;refreshLabels();if(!editing)updateDialog(false);}
  requestAnimationFrame(frame);
}
function isWater(x,y){if(!av.swim&&x>BOARD.x0-2&&Math.abs(y-BOARD.y)<4)return false;return x>POOL.x0+3&&x<POOL.x1-3&&y>POOL.y0+5&&y<POOL.y1-2;}
function startJump(tx,ty,high){av.jump={t:0,fx:av.x,fy:av.y,tx:clamp(tx,POOL.x0+8,POOL.x1-8),ty:clamp(ty,POOL.y0+9,POOL.y1-5),h:high?22:10,d:high?.75:.45};av.target=null;av.run=false;}
function splash(x,y,n,vol,big){Sfx.splash(big===undefined?n>=20:big,vol===undefined?(n<10?.35:1):vol);for(let i=0;i<n;i++)spawn({kind:'splash',x:x+(Math.random()*10-5),y:y-2,vx:(Math.random()-.5)*50,vy:-30-Math.random()*30,floor:y,life:.8});}
function update(dt,t){
  if(pendSlide&&!slide){const [bx,by]=slBase();if(Math.hypot(av.x-bx,av.y-by)<8){pendSlide=false;av.target=null;slide={ph:'climb',t:0};}else if(!av.target)pendSlide=false;}
  if(slide&&scene==='garden'){updateSlide(dt);updateCat(dt);return updateRest(dt,t);}
  if(scene==='garden'&&updateSwing(dt)){updateCat(dt);return updateRest(dt,t);}
  if(knock&&scene==='garden'){updateKnock(dt);updateCat(dt);return updateRest(dt,t);}
  if(av.jump&&scene==='garden'){const J=av.jump;J.t+=dt/J.d;const k=Math.min(1,J.t);av.x=J.fx+(J.tx-J.fx)*k;av.y=J.fy+(J.ty-J.fy)*k;av.moving=false;
    if(k>=1){av.jump=null;av.swim=true;splash(av.x,av.y-6,riding?28:J.h>15?22:12,undefined,riding||undefined);}
    updateCat(dt);return updateRest(dt,t);}
  let dx=0,dy=0;
  if(keys.arrowleft||keys.a)dx-=1;if(keys.arrowright||keys.d)dx+=1;if(keys.arrowup||keys.w)dy-=1;if(keys.arrowdown||keys.s)dy+=1;
  if(av.water>0){dx=dy=0;}
  else if(!dx&&!dy&&av.target){const tx=av.target.x-av.x,ty=av.target.y-av.y,dd=Math.hypot(tx,ty);if(dd<1.2){const cb=av.target.onArrive;av.target=null;av.run=false;if(cb)cb();}else{dx=tx/dd;dy=ty/dd;}}
  const len=Math.hypot(dx,dy); av.moving=false;
  // standing still: face the viewer (the back view is only for walking away, watering or throwing upwards)
  if(len===0&&av.water<=0&&performance.now()>(av.backHold||0)&&!slide)av.back=false;
  if(len>0){
    dx/=len;dy/=len;if(Math.abs(dx)>.2)av.dir=dx>0?1:-1;const sp=(av.swim?38:riding?(av.run?185:112):av.run?150:70)*dt,nx=av.x+dx*sp,ny=av.y+dy*sp;let mx=false,my=false;
    if(scene==='garden'&&!av.swim&&isWater(nx,ny)){startJump(nx+dx*10,ny+dy*10,false);return updateRest(dt,t);}
    if(scene==='garden'&&av.swim&&!isWater(nx,ny)){av.swim=false;splash(av.x,av.y-4,6);}
    if(!blocked(nx,av.y)){av.x=nx;mx=true;} if(!blocked(av.x,ny)){av.y=ny;my=true;}
    if(!mx&&!my&&av.target){const sx=av.x+dy*sp,sy=av.y-dx*sp;if(!blocked(sx,sy)){av.x=sx;av.y=sy;}else av.target=null;}
    av.moving=mx||my; if(Math.abs(dy)>.3)av.back=dy<0;
    if(av.run&&av.moving&&Math.random()<dt*14&&scene==='garden')spawn({kind:'puff',x:av.x-dx*4+(Math.random()*4-2),y:av.y-1,vy:-4,life:.35});
  }
  if(av.swim&&av.moving&&Math.random()<dt*10)spawn({kind:'splash',x:av.x+(Math.random()*12-6),y:av.y-8,vx:(Math.random()-.5)*16,vy:-14,floor:av.y-7,life:.4});
  updateCat(dt);
  return updateRest(dt,t);
}
function updateRest(dt,t){
  if(scene==='house'){houseUpdate(dt,t);return;}
  if(scene==='island'){isleUpdate(dt,t);islandSparkTick(dt);return;}
  if(av.x>55&&av.x<65&&av.y<150.5){if(riding)dismount();enterHouse();return;}
  setPrompt(av.x>46&&av.x<74&&av.y<172&&!editing?'Go inside':null,'↑');
  smokeT+=dt;if(smokeT>.45){smokeT=0;spawn({kind:'smoke',x:HC+10+Math.random()*2,y:HB-42,vx:3+Math.random()*3,vy:-6-Math.random()*3,life:2.2});}
  let best=null,bd=1e9;
  for(const p of projects()){const [px,py]=posOf(p),s=scaleOf(p),d=Math.hypot(av.x-px,(av.y-py)*1.1),lim=(p.kind==='tree'?24:21)+(s-1)*8;if(d<lim&&d<bd){bd=d;best=p;}}
  for(const b of skills()){const [bx,by]=posOf(b),qx=clamp(av.x,bx-BED_W/2,bx+BED_W/2),qy=clamp(av.y,by-BED_H/2,by+BED_H/2),d=Math.hypot(av.x-qx,av.y-qy)*2;if(d<20&&d<bd){bd=d;best=b;}}
  const camT=clamp(av.y+OY-H*.55,0,Math.max(0,TH-H));
  camY+=(camT-camY)*Math.min(1,dt*5);
  active=moving?null:best;
  if(active!==lastActive){
    lastActive=active; if(active)placeDialog(); dlg.classList.toggle('show',!!active);
    document.getElementById('title').style.opacity=active?0:1;
    if(active){ if(logPlant===active&&dDidIn.value.trim()){/* same plant came back while you are typing: keep your text */} else {logPlant=null;updateDialog(true);} if(pendingEdit===active.id){pendingEdit=null;openEdit(active);}}
    else if(document.activeElement!==dDidIn) editing=false;
    refreshLabels();
  }
  if(av.water>0){
    av.water-=dt;const p=av.pourFor;
    if(p&&waterFx&&waterFx.p===p){const c=canPose(waterFx);
      if(c.pouring){let n=dt*75;while(n>0){if(Math.random()<n)spawn({kind:'drop',x:c.tip[0]+(Math.random()*2-1),y:c.tip[1]+Math.random()*2,vx:c.m*(6+Math.random()*10)+(Math.random()*8-4),vy:6+Math.random()*14,floor:c.py-1+Math.round(Math.random()*3-1),life:2});n-=1;}}
      if(!waterFx.done&&c.e>=1.9){waterFx.done=true;if(waterFx.grow>p.progress){p.progress=waterFx.grow;burst(p,8);persist();}bounceAt[p.id]=performance.now();Sfx.grow();
        const base=p.bed?c.py+BED_H/2-2:c.py;
        spawn({kind:'ring',x:c.px,y:base,r:p.bed?16:11,life:.7});spawn({kind:'ring',x:c.px,y:base,r:p.bed?10:7,life:.5});
        for(let i=0;i<14;i++)spawn({kind:'spark',x:c.px+(Math.random()*26-13),y:c.top+Math.random()*(base-c.top)-2,vy:-10-Math.random()*10,life:.8+Math.random()*.5});
        for(let i=0;i<3;i++)spawn({kind:'pop',x:c.px-6+i*6,y:c.top-2-(i%2)*3,vy:-9-i*2,life:1.1});}}
    if(av.water<=0){av.water=0;av.pourFor=null;waterFx=null;refreshLabels();}
  }
  sprayT+=dt;if(sprayT>.07){sprayT=0;spawn({kind:'spray',x:FOUNT.x,y:FOUNT.y-25,vx:(Math.random()-.5)*16,vy:-10-Math.random()*8,floor:FOUNT.y-17,life:2});}
  petalT+=dt;
  if(petalT>.8){petalT=0;projects().filter(p=>p.kind==='plum'&&stageOf(p)===4&&waterOf(p)>=35).forEach(p=>{const [px,py]=posOf(p),s=scaleOf(p);spawn({kind:'petal',x:px+(Math.random()*16-8)*s,y:py-(18+Math.random()*8)*s,vx:4+Math.random()*4,vy:5,floor:py+6,life:6});});}
  parts.forEach(q=>{
    q.age+=dt;
    if(q.kind==='drop'){q.vy+=200*dt;q.y+=q.vy*dt;if(q.vx)q.x+=q.vx*dt;if(q.y>=q.floor){q.age=q.life;for(let i=0;i<2;i++)spawn({kind:'splash',x:q.x,y:q.floor,vx:(Math.random()-.5)*30,vy:-20,floor:q.floor+1,life:.3});}}
    else if(q.kind==='spray'||q.kind==='splash'){q.vy+=70*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;if(q.y>=q.floor)q.age=q.life;}
    else if(q.kind==='spark'||q.kind==='puff'||q.kind==='pop'){q.y+=q.vy*dt;}
    else if(q.kind==='heart'){q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=.97;}
    else if(q.kind==='cloth'){q.vy+=170*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;}
    else if(q.kind==='balloon'){const k=Math.min(1,q.age/q.life);q.x=q.sx+(q.tx-q.sx)*k;q.y=q.sy+(q.ty-q.sy)*k-Math.sin(Math.PI*k)*22;if(k>=1&&!q.done){q.done=1;q.age=q.life;q.onHit&&q.onHit();}}
    else if(q.kind==='smoke'){q.x+=q.vx*dt;q.y+=q.vy*dt;}
    else if(q.kind==='petal'){q.x+=q.vx*dt+Math.sin(q.age*3)*.15;q.y+=q.vy*dt;if(q.y>=q.floor)q.age=q.life;}
  });
  parts=parts.filter(q=>q.age<q.life);
  flies.forEach(f=>{
    f.next-=dt;
    if(f.next<=0){const ok=items().filter(p=>stageOf(p)>=3&&waterOf(p)>=35&&!weedsOf(p)),p=ok.length?pick(ok):null;
      if(p){const [px,py]=posOf(p);f.tx=px+(Math.random()*20-10);f.ty=py-plantTop(p)-4-Math.random()*8;}else{f.tx=40+Math.random()*160;f.ty=170+Math.random()*120;}
      f.next=3+Math.random()*4;}
    f.x+=(f.tx-f.x)*dt*.8;f.y+=(f.ty-f.y)*dt*.8+Math.sin(t*4+f.ph)*.25;
  });
  clouds.forEach(cl=>{cl.x+=cl.v*dt;if(cl.x>W+30)cl.x=-30;});
}
function render(t){
  X=g;
  if(scene==='house'){renderHouse(t);return;}
  if(scene==='island'){renderIsland(t);return;}
  const cr=Math.round(camY); if(cr!==camR){camR=cr;worldEl.style.transform=`scale(${S}) translateY(${-camR}px)`;updateJump();}
  g.drawImage(bg,0,-camR);
  clouds.forEach(cl=>drawCloud(cl.x,cl.y-camR,cl.s));
  drawRainbow(t,skyState().night);
  g.save();g.translate(OX,OY-camR);
  if(moving&&moveHover){const ok=canPlace(moving,moveHover.x,moveHover.y),x=Math.round(moveHover.x),y=Math.round(moveHover.y);g.globalAlpha=.5;
    if(moving.bed){R(x-BED_W/2,y-BED_H/2,BED_W,BED_H,ok?'#8f5a38':'#e8506c');}else{ell(x,y,9,3,ok?'#ffffff':'#e8506c');R(x,y-10,1,10,ok?'#ffffff':'#e8506c');}g.globalAlpha=1;}
  if(av.target&&!av.target.plant){const tx=Math.round(av.target.x),ty=Math.round(av.target.y);R(tx-2,ty,1,1,'#fff');R(tx+2,ty,1,1,'#fff');R(tx,ty-1,1,1,'#fff');R(tx,ty+1,1,1,'#fff');}
  const list=projects().map(p=>({y:posOf(p)[1],d:()=>withBounce(p,posOf(p)[1],()=>drawPlant(p,t))})).concat(skills().map(b=>({y:posOf(b)[1]+BED_H/2-2,d:()=>withBounce(b,posOf(b)[1]+BED_H/2,()=>drawBed(b,t))})));
  drawPool(t);
  list.push({y:FOUNT.y,d:()=>drawFountain(t)});
  list.push({y:SL.y,d:()=>drawSlide(t)});
  for(let r0=0;r0<lineRows();r0++)list.push({y:CLN.rows[r0],d:()=>drawLineRow(r0,t)});
  list.push({y:CLN.by,d:()=>drawBasket()});
  list.push({y:COMP.y,d:()=>drawCompost(t)});
  if(duckIdle())list.push({y:duck.y,d:()=>drawDuck(t)});
  if(alpIdle())list.push({y:alp.y,d:()=>drawAlpaca(alp.x,alp.y,alp.dir,alp.moving?Math.floor(t*5)%2+1:0,t)});
  list.push({y:HB,d:()=>drawCottage(t)});
  const myLook=me().look, blink=(t%4)<.12;
  if(av.jump){const J=av.jump,k=Math.min(1,J.t);list.push({y:9999,d:()=>riding?drawRider(av.x,av.y-Math.sin(Math.PI*k)*J.h,av.dir||1,myLook,true,t,null,passengerOf(myPeer()),rideKind):drawAvatar(g,av.x,av.y-Math.sin(Math.PI*k)*J.h,myLook,{frame:1,back:false,blink:false,t,shadow:false})});}
  else if(passOf&&peerById(passOf)){}
  else if(av.swim&&riding) list.push({y:av.y,d:()=>drawRiderSwim(av.x,av.y,av.dir||1,myLook,av.moving,t,myHeartUntil>performance.now()?'#e8506c':null,passengerOf(myPeer()),rideKind)});
  else if(av.swim) list.push({y:av.y,d:()=>drawSwimmer(av.x,av.y,myLook,{t,moving:av.moving,back:av.back,blink})});
  else if(slide){}
  else if(mySeat===null&&riding) list.push({y:av.y,d:()=>drawRider(av.x,av.y,av.dir||1,myLook,av.moving,t,myHeartUntil>performance.now()?'#e8506c':null,passengerOf(myPeer()),rideKind)});
  else if(mySeat===null) list.push({y:av.y,d:()=>{const rn=av.run&&av.moving,fr=av.moving?(rn?[1,2][Math.floor(t*10)%2]:[1,0,2,0][Math.floor(t*8)%4]):0;
    drawAvatar(g,av.x,av.y-(rn&&fr===1?1:0)-(av.kh||0),myLook,{run:rn||!!knock,frame:knock?1:fr,back:av.back,blink:blink||!!knock,can:!rn&&!knock&&!visiting&&!!active&&av.water<=0,pour:false,happy:av.water>0&&av.water<.7,heart:myHeartUntil>performance.now()?'#e8506c':(visiting?null:moodColor(gardenAvg(home))),t,shadow:!knock});}});
  if(hasCat()) list.push({y:cat.y,d:()=>drawCat(t)});
  livePeers().filter(p=>p.scene==='garden'&&!p.sg&&!(p.pl&&(p.pl===myPeer()?riding:(peerById(p.pl)||{}).ride))).forEach(p=>list.push({y:p.sl?SL.y+1:p.y,d:()=>p.sl?drawAvatar(g,p.x,p.y,p.look,p.sl===1?{side:true,dir:-1,frame:Math.floor((SL.y-1-p.y)/4.9)%2,happy:true,shadow:false,t}:{sit:true,kick:1,shadow:false,t}):p.ride&&p.swim?drawRiderSwim(p.x,p.y,(ghosts[p.id]&&ghosts[p.id].dir)||1,p.look,p.moving,t,null,passengerOf(p.id),p.rk):p.ride&&!p.swim?drawRider(p.x,p.y,(ghosts[p.id]&&ghosts[p.id].dir)||1,p.look,p.moving,t,(ghosts[p.id]&&ghosts[p.id].heartUntil>performance.now())?'#e8506c':null,passengerOf(p.id),p.rk):p.swim?drawSwimmer(p.x,p.y,p.look,{t,moving:p.moving,back:p.back}):drawAvatar(g,p.x,p.y,p.look,{run:p.run&&p.moving,frame:p.moving?(p.run?[1,2][Math.floor(t*10)%2]:[1,0,2,0][Math.floor(t*8+p.x)%4]):0,back:p.back,blink:((t+p.x)%4)<.12,can:p.water,pour:p.water,heart:(ghosts[p.id]&&ghosts[p.id].heartUntil>performance.now())?'#e8506c':null,t})}));
  {const nowp=performance.now(),drip=(x,y)=>{if(Math.random()<.6)spawn({kind:'drop',x:x+Math.round(Math.random()*10-5),y:y-20+Math.random()*10,vy:10,floor:y,life:1});};
   if(myWetUntil>nowp&&!av.swim)drip(av.x,av.y);
   livePeers().forEach(p=>{const gh=ghosts[p.id];if(gh&&gh.wetUntil>nowp&&p.scene==='garden'&&!p.swim)drip(p.x,p.y);});}
  const sleeping=visiting&&!hostLive();
  if(sleeping) list.push({y:host.y+6,d:()=>drawSleeper(t)});
  list.sort((a,b)=>a.y-b.y).forEach(o=>o.d());
  items().forEach(p=>{const s=scaleOf(p);drawFlies(p,fliesOf(p),t,s);drawThirst(p,t);});
  drawCan();
  parts.forEach(q=>{
    const x=Math.round(q.x),y=Math.round(q.y);
    if(q.kind==='drop'){R(x,y,1,2,'#4fb3e8');R(x,y,1,1,'#bfe9ff');}
    else if(q.kind==='spray'||q.kind==='splash')R(x,y,1,1,'#bfe9ff');
    else if(q.kind==='spark'){g.globalAlpha=1-q.age/q.life;R(x,y-1,1,3,'#fff6b0');R(x-1,y,3,1,'#fff6b0');R(x,y,1,1,'#ffffff');g.globalAlpha=1;}
    else if(q.kind==='puff'){g.globalAlpha=1-q.age/q.life;R(x,y,2,2,'#e9e2d4');g.globalAlpha=1;}
    else if(q.kind==='petal')R(x,y,2,1,'#f9b8cc');
    else if(q.kind==='ring'){const k=q.age/q.life,rx=2+k*q.r,ry=Math.max(1,rx/3);g.globalAlpha=.85*(1-k);for(let a=0;a<6.283;a+=.3)R(Math.round(q.x+Math.cos(a)*rx),Math.round(q.y+Math.sin(a)*ry),1,1,'#bfe9ff');g.globalAlpha=1;}
    else if(q.kind==='pop'){g.globalAlpha=Math.min(1,2.4*(1-q.age/q.life));R(x,y,1,1,'#4fb3e8');R(x-1,y+1,3,2,'#4fb3e8');R(x,y+3,1,1,'#2f78b8');R(x-1,y+1,1,1,'#bfe9ff');g.globalAlpha=1;}
    else if(q.kind==='cloth'){g.globalAlpha=Math.max(0,Math.min(1,2.2*(1-q.age/q.life)));g.drawImage(q.img,x,y);g.globalAlpha=1;}
    else if(q.kind==='balloon'){R(x-2,y-2,4,4,'#4fb3e8');R(x-1,y-3,2,1,'#4fb3e8');R(x-3,y-1,1,2,'#4fb3e8');R(x+2,y-1,1,2,'#2f7fc0');R(x-1,y+2,2,1,'#2f7fc0');R(x-1,y-2,1,1,'#bfe9ff');R(x,y+3,1,1,'#2a2430');}
    else if(q.kind==='heart'){g.globalAlpha=Math.min(1,2*(1-q.age/q.life));[[0,0],[2,0],[-1,1],[0,1],[1,1],[2,1],[3,1],[0,2],[1,2],[2,2],[1,3]].forEach(([a,b])=>R(x+a-1,y+b,1,1,'#e8506c'));R(x-1,y+1,1,1,'#ffb3c4');g.globalAlpha=1;}
    else if(q.kind==='smoke'){g.globalAlpha=.55*(1-q.age/q.life);const r=1+Math.floor(q.age*1.5);R(x-r+1,y-r+1,r*2,r*2,'#eef2f6');g.globalAlpha=1;}
  });
  flies.forEach(f=>{const x=Math.round(f.x),y=Math.round(f.y),fl=Math.floor(t*10+f.ph*3)%2;if(fl){R(x-2,y-1,2,2,f.c);R(x+1,y-1,2,2,f.c);}else{R(x-1,y,1,1,f.c);R(x+1,y,1,1,f.c);}R(x,y-1,1,2,'#3a2a2a');});
  g.restore();
  drawAtmosphere(t);
  placeTags(livePeers().filter(p=>p.scene==='garden').map(p=>p.pl?Object.assign({},p,{y:p.y-9}):p).concat(sleeping?[{id:'host-zz',name:roomLive()?visiting.data.name+' is asleep':visiting.data.name,x:host.x,y:host.y+19}]:[]),(x,y)=>[(OX+x)*S,(OY+y-camR)*S]);
}
function previewLoop(now){
  if(creator.classList.contains('show')){
    const t=now/1000;pvc.fillStyle='#7dc46c';pvc.fillRect(0,0,30,36);
    pvc.fillStyle='#6bb35c';[[3,30],[22,8],[25,28],[5,10]].forEach(([a,b])=>{pvc.fillRect(a,b,1,2);pvc.fillRect(a+2,b,1,2);pvc.fillRect(a+1,b+1,1,1);});
    drawAvatar(pvc,15,31,me().look,{blink:(t%3.5)<.12,t});
  }
  requestAnimationFrame(previewLoop);
}

/* ================= start-up ================= */
function start(){
  if(started) return; started=true;
  document.getElementById('loading').hidden=true;
  if(home) localSave();
  resize(); refreshChrome();
  if(home&&!home.created) openCreator();
  requestAnimationFrame(frame); requestAnimationFrame(previewLoop);
}
addEventListener('resize',()=>{if(started)resize();});
function adoptHome(h){
  home=h; localSave();
  if(started){ if(!visiting)closePanel(); rebuildLabels(); refreshChrome(); if(!home.created)openCreator(); }
}
const OWNER_ID=window.__OWNER_ID||'__none__';
let ownerVisited=false;
function forceOwnerVisit(){
  if(stayHome||(home&&home.hs)) return;
  if(ownerVisited||isOwner||visiting||myId===OWNER_ID||OWNER_ID==='__none__'||(home&&home.owner)) return;
  const o=gardensList.find(g=>g.id===OWNER_ID);
  if(!o) return;
  const data=o.data;
  ownerVisited=true; visiting={id:OWNER_ID,data}; visBooksFor=null; if(started)enterGarden();
}
function autoVisitOwner(){
  if(ownerVisited||stayHome||isOwner||visiting||!myId||(home&&home.hs)) return;
  const o=gardensList.find(g=>g.data.owner&&g.id!==myId); if(!o) return;
  ownerVisited=true; visiting={id:o.id,data:o.data}; visBooksFor=null; if(started)enterGarden();
}
function localSeen(){try{return !!localStorage.getItem(MEKEY);}catch(e){return true;}}
function maybeAutoVisit(){
  if(home||visiting) return;
  const o=gardensList.find(g=>g.data.owner)||gardensList[0];
  if(o){visiting={id:o.id,data:o.data}; visBooksFor=null; if(started)enterGarden(); start(); if(!localSeen()&&!loadFailed)openCreator();}
}
(async()=>{
  let fallbackTimer=setTimeout(()=>{ if(!home&&!visiting){ home=preset(STARTER,'Me'); } forceOwnerVisit(); start(); initRoom(); },10000);
  if(home) start();
  try{
    if(!window.claude||!window.claude.use){ throw 0; }
    const [d,u]=await Promise.all([window.claude.use('db'),window.claude.use('user')]);
    if(!d||!u) throw 0;
    myId=await u.id(); if(!myId) throw 0;
    try{ isOwner=!!(await u.isOwner()); }catch(e){}
    try{ const cw=await u.can('data.write'); canWrite=cw===null?true:!!cw; }catch(e){}
    db=d;
    let remote=null;
    try{ const snap=await Promise.race([db.doc('data/users/'+myId+'/garden').get(),new Promise((_,r)=>setTimeout(()=>r(0),10000))]); if(snap&&snap.exists) remote=migrate(snap.data()); }catch(e){ loadFailed=true; }
    if(loadFailed&&!home){ toast('Could not load your garden. Check your connection and reload the page.',9000); }
    if(remote&&(!home||(remote.saved||0)>(home.saved||0))) adoptHome(remote);
    else if(!home&&!loadFailed){
      if(isOwner) adoptHome(preset(SISI,'Sisi',SISI_SKILLS));
      else if(canWrite) adoptHome(preset(STARTER,'Me'));
    }
    if(home&&home.name==='Sisi'&&isOwner) home.owner=true;
    // live list of everyone's gardens
    db.collection('gardens').limit(60).onSnapshot(snap=>{
      gardensList=snap.docs.filter(x=>x.exists).map(x=>({id:x.id,data:cleanGarden(x.data())})).filter(x=>x.data);
      if(OWNER_ID!=='__none__')gardensList.forEach(x=>{x.data.owner=x.id===OWNER_ID;});
      handleInvite();
      if(visiting){const v=gardensList.find(x=>x.id===visiting.id);if(v){visiting.data=v.data;rebuildLabels();refreshChrome();}}
      if(gardensM.classList.contains('show')) renderGardens();
      maybeAutoVisit();
      autoVisitOwner();
    },()=>{});
    // Sisi's plants carry philosophers' names again (one-time rename of the descriptive labels)
    if(isOwner&&home&&Array.isArray(home.projects)){const PH={SANOVIO:'HIPPOCRATES',RECRUITING:'PLATO',EDUCATION:'SOCRATES',EVENTS:'EPICURUS',TEA:'LAOZI',SUBSTACK:'MONTAIGNE',WEBSITE:'NIETZSCHE',BABYSITTER:'ROUSSEAU',CHINESE:'CONFUCIUS'};let ch=false;
      home.projects.concat(home.skills||[]).forEach(q=>{const n=q&&PH[q.code];if(n&&!home.projects.concat(home.skills||[]).some(o=>o.code===n)){q.code=n;q.name=n.charAt(0)+n.slice(1).toLowerCase();ch=true;}});
      if(ch){home.saved=Date.now();localSave();if(started)rebuildLabels();}}
    if(home&&home.created&&!loadFailed){ writePriv(); writePub(); }
    loadRemoteBooks().then(()=>{if(home&&home.created)writePubBooks();});
    if((isOwner||myId===OWNER_ID)&&ownerVisited&&visiting&&home){visiting=null;if(started)enterGarden();}
    if(!handleInvite())forceOwnerVisit();
    initRoom();
    clearTimeout(fallbackTimer);
    if(home||visiting){ start(); if(!home&&!localSeen()&&!loadFailed) openCreator(); } else setTimeout(()=>{ if(!home&&!visiting){ localMe.name='Visitor'; } start(); },4000);
  }catch(e){
    clearTimeout(fallbackTimer);
    if(!home) home=preset(STARTER,'Me');
    forceOwnerVisit(); initRoom();
    start();
  }
})();
