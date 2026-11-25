/* ================= actions: hug, kiss, push ================= */
let myAct=null,actN=0,myHeartUntil=0,myWetUntil=0,knock=null;const actSeen={};
const actMenu=document.createElement('div');actMenu.id='actMenu';document.body.appendChild(actMenu);
[['pill','🦙 Mitreiten'],['swing','🎐 Anschubsen'],['kiss','💋 Kiss'],['push','💨 Push'],['balloon','💦 Balloon']].forEach(([k,l])=>{const b=document.createElement('button');b.className='btn';b.type='button';b.textContent=l;b.dataset.k=k;
  b.addEventListener('click',e=>{e.stopPropagation();const id=actMenu.dataset.p;closeActMenu();if(k==='pill')goPillion(id);else goAct(k,id);});actMenu.appendChild(b);});
function closeActMenu(){actMenu.classList.remove('show');}
function openActMenu(p,cx,cy){actMenu.dataset.p=p.id;actMenu.querySelectorAll('button').forEach(b=>{const k=b.dataset.k;b.hidden=k==='pill'?!canPillion(p):p.sg?!(k==='swing'||k==='balloon'||k==='kiss'):k==='swing';});actMenu.classList.add('show');
  const w=actMenu.offsetWidth||220,h=actMenu.offsetHeight||40;actMenu.style.left=clamp(cx-w/2,6,innerWidth-w-6)+'px';actMenu.style.top=clamp(cy-h-14,6,innerHeight-h-6)+'px';}
function peerAt(lx,ly){const ps=livePeers().filter(p=>p.scene==='garden'&&(!p.swim||p.sg));let best=null,bd=1e9;ps.forEach(p=>{const d=Math.hypot(lx-p.x,(ly-(p.y-11))*.6);if(Math.abs(lx-p.x)<10&&ly>p.y-28&&ly<p.y+4&&d<bd){bd=d;best=p;}});return best;}
function peerById(id){return livePeers().find(p=>p.id===id);}
let pendAct=null;
function fireAct(k,id){const q=peerById(id);if(!q)return;actN++;const nn=actN;myAct={k,to:id,n:nn,at:Date.now()};setTimeout(()=>{if(myAct&&myAct.n===nn)myAct=null;},2500);
  av.back=k==='balloon'?q.y<av.y-4:false;if(av.back)av.backHold=performance.now()+700;actFx(k,av.x,av.y,q.x,q.y,true,false,id);}
function goAct(k,id){const p=peerById(id);if(!p)return;if(av.swim||av.jump||knock)return;
  if(mySeat!==null&&k!=='balloon')standUp();
  if(k==='balloon'){fireAct(k,id);return;}
  pendAct={k,id,t0:performance.now(),aim:0};}
function tickPendAct(){
  const P=pendAct;if(!P)return;const q=peerById(P.id),now=performance.now();
  if(!q||scene!=='garden'||av.swim||av.jump||knock){pendAct=null;return;}
  const d=Math.hypot(av.x-q.x,av.y-q.y);
  if((P.k==='swing'&&q.sg?(()=>{const [gx,gy]=seatGround(q.sg.s);return Math.hypot(av.x-(gx+11),av.y-(gy-5))<6;})():d<15)||now-P.t0>3500){pendAct=null;av.target=null;av.run=false;fireAct(P.k,P.id);return;}
  if(now-P.aim>250){P.aim=now;av.run=d>50;if(P.k==='swing'&&q.sg){const [gx,gy]=seatGround(q.sg.s);av.target={x:gx+11,y:gy-5};}else{const side=av.x<=q.x?-1:1;av.target={x:q.x+side*9,y:q.y};}}
}
function heartBurst(x,y,n){for(let i=0;i<n;i++)spawn({kind:'heart',x:x+(Math.random()*14-7),y:y-20-Math.random()*6,vx:(Math.random()-.5)*14,vy:-14-Math.random()*10,life:1.1+Math.random()*.6});}
function actFx(k,ax,ay,bx,by,fromMe,toMe,toId){
  const now=performance.now();
  if(k==='swing'){for(let i=0;i<5;i++)spawn({kind:'spark',x:bx+(Math.random()*12-6),y:by-14-Math.random()*8,vy:-10,life:.5});if(toMe&&mySeat!==null){swV+=swV<-.3?-.4:1.7;}return;}
  if(k==='balloon'){const d=Math.min(.9,.35+Math.hypot(bx-ax,by-ay)/260);spawn({kind:'balloon',sx:ax,sy:ay-18,tx:bx,ty:by-14,x:ax,y:ay-18,life:d,onHit:()=>{splash(bx,by-14,22,.7,false);
    if(toMe)myWetUntil=performance.now()+4000;else if(toId&&ghosts[toId])ghosts[toId].wetUntil=performance.now()+4000;}});return;}
  if(k==='hug'){heartBurst((ax+bx)/2,(ay+by)/2,9);if(fromMe||toMe)myHeartUntil=now+1800;}
  else if(k==='kiss'){for(let i=0;i<4;i++)spawn({kind:'heart',x:ax+(bx-ax)*.2,y:ay-20,vx:(bx-ax)*1.6+(Math.random()-.5)*8,vy:-6-Math.random()*6,life:.7+i*.12});setTimeout(()=>heartBurst(bx,by,5),450);if(fromMe||toMe)myHeartUntil=now+1500;}
  else if(k==='push'){for(let i=0;i<8;i++)spawn({kind:'puff',x:bx+(Math.random()*10-5),y:by-4-Math.random()*10,vy:-6,life:.45});
    if(toMe)startKnock(ax,ay);}
}
function startKnock(ax,ay){
  slide=null;
  if(riding)dismount();
  if(scene!=='garden'||av.jump)return;let dx=av.x-ax,dy=av.y-ay,d=Math.hypot(dx,dy)||1;dx/=d;dy/=d;if(Math.abs(dx)<.3){dx=dx<0?-.6:.6;}
  let dist=46,tx,ty;for(;dist>6;dist-=6){tx=clamp(av.x+dx*dist,-OX+8,CW+OX-8);ty=clamp(av.y+dy*dist*.5,146,WORLD_H-6);if(isWater(tx,ty)||!blocked(tx,ty))break;}
  if(dist<=6)return;av.target=null;av.swim=false;knock={fx:av.x,fy:av.y,tx,ty,t:0,d:.6,spin:dx<0?-1:1};
}
function updateKnock(dt){const K=knock;K.t+=dt/K.d;const k=Math.min(1,K.t);av.x=K.fx+(K.tx-K.fx)*k;av.y=K.fy+(K.ty-K.fy)*k;av.kh=Math.sin(Math.PI*k)*16;av.moving=false;
  if(Math.random()<.5)spawn({kind:'puff',x:av.x,y:av.y-av.kh-6,vy:-2,life:.3});
  if(k>=1){knock=null;av.kh=0;if(isWater(av.x,av.y)){av.swim=true;splash(av.x,av.y-6,18);}else{for(let i=0;i<6;i++)spawn({kind:'puff',x:av.x+(Math.random()*12-6),y:av.y-1,vy:-5,life:.4});}}}
function processActs(){
  tickPendAct();
  if(!room)return;const ps=roomPeers();
  const mine=myPeer(),now=Date.now();
  for(const p of ps){if(p.isMe)continue;const a=(p.presence||{}).act;if(!a||typeof a.n!=='number'||actSeen[p.peer]===a.n)continue;
    const first=actSeen[p.peer]===undefined;actSeen[p.peer]=a.n;if(first&&!(a.at&&Math.abs(now-a.at)<8000))continue;
    if(!['hug','kiss','push','balloon','swing'].includes(a.k))continue;
    const ss=(p.presence||{}).s,myS=scene==='house'?'h':scene==='island'?'i':'g';if((ss||'g')!==myS)continue;
    const from=ghosts[p.peer];if(!from)continue;
    let bx,by,toMe=a.to===mine;
    const love=a.k==='hug'||a.k==='kiss';
    if(toMe){bx=av.x;by=av.y;}else{const gt=ghosts[a.to];if(!gt)continue;bx=gt.x;by=gt.y;if(love)gt.heartUntil=performance.now()+1800;}
    if(love)from.heartUntil=performance.now()+1800;
    actFx(a.k,from.x,from.y,bx,by,false,toMe,a.to);}
}
addEventListener('pointerdown',e=>{if(!actMenu.contains(e.target))closeActMenu();},true);

/* ================= live status ================= */
const liveEl=document.getElementById('live'),toastEl=document.getElementById('toast');
let liveT=0,liveKey='',toastTimer=null,liveHinted=false;
function toast(msg,ms){toastEl.textContent=msg;toastEl.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{toastEl.hidden=true;},ms||6000);}
function liveInfo(){const on=roomLive();return {on,n:on?1+roomPeers().filter(p=>!p.isMe&&p.kind==='viewer').length:0};}
function tickLive(now){
  if(now-liveT<500) return; liveT=now;
  const i=liveInfo(),all=i.on?Math.max(i.n,globalOnline()):0,k=i.on+':'+i.n+':'+all;
  if(k!==liveKey){liveKey=k;liveEl.classList.toggle('on',i.on);
    liveEl.innerHTML=!i.on?'Connecting':all<=1?'Only you':i.n>1&&all>i.n?'<span>'+i.n+' here</span><span class="all">'+all+' online</span>':i.n>1?i.n+' here':all+' online';
    liveEl.title=i.on?(i.n+' here, '+all+' online'):'Connecting';}
  if(!i.on&&roomInit&&now-roomT0>7000&&!liveHinted){liveHinted=true;try{console.info('[garden] live status'+liveDiag());}catch(e){}}
}
function liveDiag(){let all=0,mine=null;try{const ps=room?room.peers():[];all=ps.length;mine=ps.find(p=>p.isMe&&p.sameTab)||null;}catch(e){}
  return ' ['+(room?'room':'no room')+(roomErr?' '+roomErr:'')+', all '+all+', here '+roomPeers().length+', '+(gardenKey()||'no key')+(mine?(mine.guest?', guest':', member')+(mine.by?', id':', no id'):'')+(visiting?', visit':', home')+(myId?'':', signed out')+']';}
liveEl.addEventListener('click',()=>{try{console.info('[garden] live status'+liveDiag());}catch(e){}
  if(!liveInfo().on){toast('🌙 Connecting… this usually takes a few seconds.',3500);return;}
  openMap();});

/* ================= double swing (seen at an angle) ================= */
const SW={x:194,y:170,top:138,L:21};
const SWU=[-.8,.35]; // swing direction on screen: forward = towards front-left
let mySeat=null,swA=0,swV=0,pendSit=null;
function seatPivot(i){return [SW.x+(i?13:-13),SW.top+(i?4:-4)];}
function seatGround(i){return [SW.x+(i?13:-13),SW.y+(i?5:-3)];}
function seatPos(i,a){const [px,py]=seatPivot(i),s=Math.sin(a)*SW.L;return [px+s*SWU[0],py+Math.cos(a)*SW.L+s*SWU[1]];}
function seatTaken(i){if(mySeat===i)return true;return livePeers().some(p=>p.sg&&p.sg.s===i&&p.scene==='garden');}
function onSwing(lx,ly){return lx>SW.x-36&&lx<SW.x+36&&ly>SW.top-12&&ly<SW.y+13;}
function sitDown(i){if(seatTaken(i)&&mySeat!==i)return;mySeat=i;swA=0;swV=0;av.swim=false;av.back=false;av.target=null;lastPres='';}
function standUp(){if(mySeat===null)return;const [gx,gy]=seatGround(mySeat);mySeat=null;av.x=gx-6;av.y=gy+4;lastPres='';}
function pump(k){if(mySeat===null)return;const dir=Math.abs(swV)>.15?Math.sign(swV):(swA>0?-1:1);swV+=dir*k;}
function jumpOff(){
  if(mySeat===null)return;const i=mySeat,[sx,sy]=seatPos(i,swA),[gx,gy]=seatGround(i),fwd=swV>=0,pw=Math.min(1,Math.abs(swV)/2.4);
  mySeat=null;lastPres='';
  av.x=sx;av.y=sy+9;av.target=null;av.back=false;
  if(!fwd){av.x=gx+9;av.y=gy-4;return;}
  let dist=18+pw*56,tx,ty;for(;dist>6;dist-=5){tx=clamp(gx+SWU[0]*dist,-OX+8,CW+OX-8);ty=clamp(gy+SWU[1]*dist+4,146,WORLD_H-6);if(isWater(tx,ty)||!blocked(tx,ty))break;}
  if(dist>6)knock={fx:av.x,fy:av.y,tx,ty,t:0,d:.45+pw*.35,spin:-1};else{av.x=gx-6;av.y=gy+4;}
}
function updateSwing(dt){
  if(mySeat===null&&pendSit!==null){const [gx,gy]=seatGround(pendSit);if(Math.hypot(av.x-(gx-6),av.y-(gy+4))<9){const i=pendSit;pendSit=null;sitDown(i);}else if(!av.target)pendSit=null;}
  if(mySeat===null)return false;
  swV+=(-9.8*Math.sin(swA)-.12*swV)*dt;swA+=swV*dt;
  if(swA>1.05){swA=1.05;swV=-Math.abs(swV)*.5;}if(swA<-1.05){swA=-1.05;swV=Math.abs(swV)*.5;}
  const [sx,sy]=seatPos(mySeat,swA);av.x=sx;av.y=sy+9;av.moving=false;
  return true;
}
function drawRope(x0,y0,x1,y1,c){const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))|0;for(let k=0;k<=n;k++){const f=n?k/n:0;R(Math.round(x0+(x1-x0)*f),Math.round(y0+(y1-y0)*f),1,1,c);}}
addEventListener('keydown',e=>{if(mySeat===null||document.activeElement&&document.activeElement.tagName==='INPUT')return;const k=e.key.toLowerCase();
  if(k===' '){e.preventDefault();pump(.9);}else if(['arrowleft','arrowright','arrowup','arrowdown','a','d','w','s'].includes(k)){e.preventDefault();leaveSwing(null);}},true);
// tap elsewhere while sitting: jump off when swinging fast, otherwise just get up and walk there
function leaveSwing(tgt){
  if(mySeat===null)return;
  if(Math.abs(swV)>1.1){jumpOff();return;}
  standUp(); if(tgt) av.target={x:clamp(tgt.x,-OX+6,CW+OX-6),y:clamp(tgt.y,145,WORLD_H-6)};
}

/* ================= alpaca to ride ================= */
const alp={x:164,y:240,hx:164,hy:240,tx:164,ty:240,next:performance.now()+9000,dir:-1,moving:false};
let riding=false,pendRide=false;
function alpIdle(){return !riding&&!livePeers().some(p=>p.ride);}
function drawAlpaca(x,y,dir,frame,t){
  x=Math.round(x);y=Math.round(y);const C='#f4ecdc',Cl='#fffaf0',Cs='#d8ccb2',H='#6b5a46',O='#2a2430';
  ell(x,y,11,2,'rgba(40,80,40,.28)');
  [-6,-3,3,6].forEach((lx,i)=>{const lift=frame&&((i%2)===(frame-1))?1:0;R(x+lx-1,y-7,2,6-lift,Cs);R(x+lx-1,y-1-lift,2,1,H);});
  R(x-9,y-15,18,9,C);R(x-8,y-16,16,1,C);R(x-10,y-13,1,5,C);R(x+9,y-13,1,5,C);R(x-8,y-6,16,1,Cs);
  R(x-7,y-16,3,1,Cl);R(x+2,y-16,4,1,Cl);R(x-dir*10-1,y-14,2,3,Cl);
  const nx=x+dir*7;R(nx-2,y-23,4,10,C);R(nx-2,y-17,4,1,Cs);
  const hx=x+dir*8;R(hx-3,y-28,6,6,C);R(hx-2,y-29,4,1,Cl);R(hx-3,y-31,1,3,C);R(hx+2,y-31,1,3,C);
  R(dir>0?hx+2:hx-5,y-25,4,3,Cl);R(dir>0?hx+5:hx-5,y-25,1,1,O);R(hx+dir,y-26,1,1,O);R(dir>0?hx+3:hx-4,y-23,2,1,'#e9a0a8');
  R(x-4,y-16,8,3,'#e8506c');R(x-4,y-14,8,1,'#f2c94c');R(x-4,y-13,1,2,'#f2c94c');R(x+3,y-13,1,2,'#f2c94c');
}
function drawRiderSwim(x,y,dir,look,moving,t,heart,pass){
  const wl=Math.round(y-7+Math.sin(t*3)*0.6);
  g.save();g.beginPath();g.rect(x-30,wl-60,60,60);g.clip();
  drawRider(x,y+6,dir,look,false,t,heart,pass);g.restore();
  const k=Math.floor(t*4)%2;ell(Math.round(x),wl,14+k,2,'#9fdcfa');ell(Math.round(x),wl,11,1,'#3f9ad8');
  if(moving){R(Math.round(x-dir*15),wl,3,1,'#cfeefc');R(Math.round(x-dir*18),wl+1,2,1,'#cfeefc');}
}
function drawRider(x,y,dir,look,moving,t,heart,pass){
  const fr=moving?Math.floor(t*7)%2+1:0,bob=moving&&fr===1?1:0,front=pass?dir*2:-dir;
  drawAlpaca(x,y-bob,dir,fr,t);
  if(pass)drawAvatar(g,x-dir*6,y-9-bob,pass.look,{sit:true,ride:true,shadow:false,blink:((t+1.3)%4)<.12,t});
  drawAvatar(g,x+front,y-9-bob,look,{sit:true,ride:true,shadow:false,blink:(t%4)<.12,heart,t});
  R(Math.round(x+front)-2,Math.round(y)-13-bob,4,2,'#e8506c');
}
// riding together: tap someone on the alpaca, "Mitreiten", and you sit behind them; any tap or step gets you off again
let passOf=null,pendPass=null;
function passengerOf(id){return id===myPeer()?livePeers().find(p=>p.pl===id&&p.scene==='garden'):passOf===id?{me:true,look:me().look}:livePeers().find(p=>p.pl===id&&p.scene==='garden');}
function canPillion(p){return !!p&&p.ride&&!p.swim&&p.scene==='garden'&&!riding&&!passOf&&mySeat===null&&!passengerOf(p.id);}
function goPillion(id){const p=peerById(id);if(!canPillion(p)||av.swim||av.jump||knock)return;pendPass=id;av.run=false;av.target={x:p.x,y:p.y+3};}
function hopOn(id){pendPass=null;passOf=id;av.target=null;Sfx.sit();lastPres='';for(let i=0;i<5;i++)spawn({kind:'spark',x:av.x+(Math.random()*14-7),y:av.y-22-Math.random()*8,vy:-10,life:.5});}
function hopOff(){if(!passOf)return;const d=peerById(passOf),dir=(d&&ghosts[d.id]&&ghosts[d.id].dir)||1;passOf=null;
  const nx=av.x-dir*13;if(scene==='garden'&&!blocked(nx,av.y+3)&&!isWater(nx,av.y+3)){av.x=nx;av.y+=3;}lastPres='';}
function updatePillion(){
  if(pendPass){const d=peerById(pendPass);if(!canPillion(d)||!av.target){pendPass=null;}else{av.target={x:d.x,y:d.y+3};if(Math.hypot(av.x-d.x,av.y-d.y)<14)hopOn(pendPass);}}
  if(!passOf)return;
  const d=peerById(passOf);
  // off when the rider gets off or leaves, when two hop on at once (the lower id stays), or when I walk
  const twin=livePeers().find(p=>p.pl===passOf&&String(p.id)<String(myPeer()));
  if(scene!=='garden'||!d||!d.ride||d.scene!=='garden'||twin||['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].some(k=>keys[k])){hopOff();return;}
  av.x=d.x;av.y=d.y;av.dir=(ghosts[d.id]&&ghosts[d.id].dir)||av.dir;av.moving=d.moving;av.target=null;av.swim=false;
}
function goRide(){if(av.swim||av.jump||knock||mySeat!==null||passOf)return;pendRide=true;av.run=false;av.target={x:alp.x,y:alp.y+3};}
function mount(){pendRide=false;riding=true;Sfx.sit();av.target=null;av.x=alp.x;av.y=alp.y;av.dir=alp.dir;lastPres='';for(let i=0;i<5;i++)spawn({kind:'spark',x:av.x+(Math.random()*14-7),y:av.y-22-Math.random()*8,vy:-10,life:.5});}
function dismount(){if(!riding)return;if(av.swim||av.jump)return;riding=false;alp.x=alp.hx=alp.tx=av.x;alp.y=alp.hy=alp.ty=av.y;alp.dir=av.dir||1;alp.next=performance.now()+4000;
  const nx=av.x-(av.dir||1)*11;if(!blocked(nx,av.y+2)&&!isWater(nx,av.y+2)){av.x=nx;av.y+=2;}lastPres='';}
// one alpaca for everyone: the garden's owner (or, without them, the lowest peer id) moves it, the others follow
var alpDrop=null;
function alpLeader(){
  if(scene!=='garden'||!roomLive())return {me:true};
  const ps=livePeers().filter(p=>p.scene==='garden');if(!ps.length)return {me:true};
  if(!visiting)return {me:true};
  const h=ps.find(p=>p.by&&p.by===visiting.id);if(h)return {peer:h};
  const mine=myPeer(),low=ps.reduce((a,p)=>String(p.id)<String(a.id)?p:a,ps[0]);
  return String(mine)<String(low.id)?{me:true}:{peer:low};
}
function updateAlpaca(dt){
  updatePillion();
  if(scene!=='garden')return;
  if(riding){alp.x=av.x;alp.y=av.y;return;}
  if(alpDrop){alp.x=alp.hx=alp.tx=alpDrop.x;alp.y=alp.hy=alp.ty=alpDrop.y;alp.next=performance.now()+4000;alpDrop=null;}
  const L=alpLeader();
  if(!L.me&&!pendRide){const a=L.peer.ap;
    if(a){if(Math.hypot(a[0]-alp.x,a[1]-alp.y)>60){alp.x=a[0];alp.y=a[1];}else{const f=1-Math.exp(-dt*6);alp.x+=(a[0]-alp.x)*f;alp.y+=(a[1]-alp.y)*f;}
      alp.dir=a[2]>0?1:-1;alp.moving=!!a[3];alp.hx=alp.tx=a[0];alp.hy=alp.ty=a[1];return;}}
  if(pendRide){if(!alpIdle()){pendRide=false;}else if(Math.hypot(av.x-alp.x,av.y-(alp.y+3))<11){mount();return;}else if(!av.target)pendRide=false;}
  const now=performance.now();
  if(now>alp.next&&!pendRide){alp.next=now+3500+Math.random()*4500;for(let k=0;k<6;k++){const tx=alp.hx+(Math.random()*36-18),ty=alp.hy+(Math.random()*20-10);
    if(!blocked(tx,ty)&&!isWater(tx,ty)&&ty>150&&ty<345&&tx>-OX+14&&tx<CW+OX-14){alp.tx=tx;alp.ty=ty;break;}}}
  const dx=alp.tx-alp.x,dy=alp.ty-alp.y,d=Math.hypot(dx,dy);alp.moving=d>1&&!pendRide;
  if(alp.moving){alp.x+=dx/d*11*dt;alp.y+=dy/d*11*dt;if(Math.abs(dx)>.5)alp.dir=dx>0?1:-1;}
}

/* ================= slide ================= */
const SL={x:196,y:172};
let slide=null,pendSlide=false;
const slBase=()=>[SL.x+31,SL.y+1];
function chute(s){return [SL.x+11-35*s,SL.y-27+30*s+5*Math.sin(Math.PI*s)];}
function onSlide(lx,ly){return lx>SL.x-30&&lx<SL.x+36&&ly>SL.y-48&&ly<SL.y+9;}
function goSlide(){if(av.swim||av.jump||knock||slide)return;if(riding)dismount();pendSlide=true;av.run=false;const [bx,by]=slBase();av.target={x:bx,y:by};}
function updateSlide(dt){
  const S=slide;
  if(S.ph==='climb'){S.t+=dt/.9;const k=Math.min(1,S.t),lk=Math.min(1,k/.85),st=Math.floor(lk*6);
    // up the ladder rung by rung (little hops), feet on the rungs, then one step across onto the platform
    const ly=SL.y-1-29*Math.min(1,(st+sstep(0,1,(lk*6)%1))/6),lx=SL.x+29-8*((SL.y-1-ly)/29)+2;
    av.x=k<.85?lx:lx+(SL.x+16-lx)*sstep(.85,1,k);av.y=ly;S.step=st;av.back=true;av.moving=true;if(k>=1){S.ph='slide';S.t=0;Sfx.whee();}}
  else{S.t+=dt/.85;const k=Math.min(1,S.t),s=k*k*.6+k*.4,[cx,cy]=chute(s);av.x=cx;av.y=cy+4;av.back=false;av.moving=false;
    if(k>=1){slide=null;av.dir=-1;Sfx.yay();for(let i=0;i<8;i++)spawn({kind:'spark',x:av.x+(Math.random()*16-8),y:av.y-10-Math.random()*8,vy:-12,life:.6});const tx=clamp(av.x-13,-OX+8,CW+OX-8),ty=av.y+5;
      if(!blocked(tx,ty))knock={fx:av.x,fy:av.y,tx,ty,t:0,d:.32,spin:-1};
      for(let i=0;i<5;i++)spawn({kind:'puff',x:av.x+(Math.random()*8-4),y:av.y-1,vy:-5,life:.35});}}
}
function drawSlide(t){
  const x=SL.x,y=SL.y,M='#8f9aa3',Ml='#c3ccd3',Rd='#e8506c',Rl='#f58aa0',Rk='#b93a55';
  ell(x+16,y+2,13,3,'rgba(30,58,30,.28)');ell(x-14,y+5,14,2,'rgba(30,58,30,.22)');
  R(x+10,y-28,1,28,M);R(x+21,y-28,1,30,M);R(x-6,y-9,1,11,M);
  drawRope(x+29,y-1,x+21,y-30,M);drawRope(x+33,y+1,x+25,y-28,Ml);
  for(let k=1;k<6;k++){const f=k/6;R(Math.round(x+29-8*f),Math.round(y-1-29*f),5,1,Ml);}
  R(x+9,y-30,15,2,'#d6d0c5');R(x+9,y-28,15,1,'#a29a8d');R(x+9,y-38,1,8,M);R(x+23,y-38,1,8,M);R(x+9,y-38,15,1,Ml);
  const mine=slide,L=me().look;
  if(mine&&mine.ph==='climb')drawAvatar(g,av.x,av.y,L,{side:true,dir:-1,frame:(mine.step||0)%2,happy:true,shadow:false,t});
  for(let k=0;k<=44;k++){const [cx,cy]=chute(k/44),rx=Math.round(cx),ry=Math.round(cy);R(rx-3,ry,7,3,Rd);}
  for(let k=0;k<=44;k++){const [cx,cy]=chute(k/44),rx=Math.round(cx),ry=Math.round(cy);R(rx-1,ry,2,1,Rl);R(rx-4,ry-1,1,3,Rk);R(rx+4,ry-1,1,3,Rk);}
  {const [ex,ey]=chute(1);R(Math.round(ex)-5,Math.round(ey)+3,9,1,Rk);}
  if(mine&&mine.ph==='slide')drawAvatar(g,av.x,av.y,L,{sit:true,kick:1,shadow:false,blink:false,t});
}

/* ================= clotheslines = to-do list ================= */
const GD={"G":[{"r":["...ooooooooo...",".ooaaaxxxaaaoo.","oahaaaaxaaaaaao","oaaaaaaaaaaaaao","oabaaaaaaaaabao",".oooxxxxxxxooo.","...oaaaaaaao...","...oxxxxxxxo...","...oaaaaaaao...","...oxxxxxxxo...","...oaaaaaaao...","...obbbbbbbo...","...ooooooooo..."],"p":[4,10]},{"r":["ooooooooooo","oxxkxxxkxxo","oahaaaaaaao","oahaabaaabo","oahaaoaaabo","oahao.oaabo","oahao.oaabo","oahao.oaabo","oahao.oaabo","oahao.oaabo","oahao.oaabo","oahao.oaabo","owwwo.owwwo","ooooo.ooooo"],"p":[2,8]},{"r":["oooo...oooo..","oxxo...oxxo..","owwo...owwo..","oxxo...oxxo..","oaao...oaao..","ohao...ohao..","oaaoo..oaaoo.","oaaaxo.oaaaxo","obbbxo.obbbxo",".oooo...oooo."],"p":[1,8]},{"r":["...oo...oo...","..oaao.oaao..","..oaaoooaao..","..oaaaaaaao..","..ohaaaaaao..","...oxxxxxo...","..oaaaaaaao..",".oahaaaaaaao.",".oaaaawaaaao.","oahaaaaaaaaao","oaawaaaaawaao","oaaaaaaaaaaao","obbbbbbbbbbbo","ooooooooooooo"],"p":[3,9]},{"r":[".....ooooo.....","....obbbbbo....","..ooobbbbbooo..",".oaaaowbwoaaao.","oaahaawawaaaaao","oaaoaaaaaaaoaao","oaaoaaaaaaaoaao","oaaoaaaaaaaoaao","oaaoabbbbbaoaao","oaaoabaaabaoaao","oxxoaaaaaaaoxxo","oooobbbbbbboooo","...ooooooooo..."],"p":[6,8]},{"r":["ooooooooooooo","oxxxxxwxxxxxo","oahaaawaaaaao","oaawaaaaawaao","oahaaaoaaaabo","oaawao.oawabo","oahaao.oaaabo","obbbbo.obbbbo","oooooo.oooooo"],"p":[2,10]},{"r":[".ooooooo.","oaaaaaaao","oahaoaaao","oxxxoxxxo","oaaaoaaao","oahaoaaao","oxxxoxxxo","oaaaoaaao","oaaaobbbo","oxxxowowo","oahao....","oaaao....","oxxxo....","obbbo....","owowo...."],"p":[4]},{"r":["....ooooooo....","..oooxxxxxooo..",".oaaaaaaaaaaao.","oaahaaaaaaaaaao","oaaowxwxwxwoaao","oaaoxwxwxwxoaao","oaaoaaaaaaaoaao","oaaoaaaaaaaoaao","oaaoaaaaaaaoaao","oxxoaaaaaaaoxxo","oooobbbbbbboooo","...oxxxxxxxo...","...ooooooooo..."],"p":[4,10]},{"r":["ooooooooooo","oaaaaaaaaao","oxxxxxxxxxo","oahaaaaaaao","oahaaaaaaao","oaaaaaaaaao","oaaaaaaaaao","oaaaaaaaaao","oxxxxxxxxxo","oaaaaaaaaao","oxxxxxxxxxo","obbbbbbbbbo","owowowowowo"],"p":[2,8]},{"r":["....ooo....","...owwwo...","...owwwo...","..ooooooo..",".oaahaaaao.","oaahaaaaaao","oaaaaaaaaao","oxwxwxwxwxo","oxxxxxxxxxo","oxbxbxbxbxo",".ooooooooo."],"p":[5]}],"COL":[["#f08aa0","#fff3e0"],["#6f9fd8","#f2d16b"],["#f2cf63","#e2603c"],["#7fcf9a","#fff3e0"],["#b99ae6","#5f4a9a"],["#fff3e0","#e8506c"],["#f08a5c","#fff3e0"],["#6fc9cf","#2f6fa8"]],"BASKET":["..oooooooo..",".owwxxwwaao.","oooooooooooo","okbkbkbkbkbo","obkbkbkbkbko","okbkbkbkbkbo",".obkbkbkbko.","..oooooooo.."]};
const CLN={x0:134,x1:233,rows:[398,436],h:28,per:5,max:10,bx:223,by:406};
const tdKind=td=>Number.isInteger(td.k)?td.k%GD.G.length:(hashStr(td.id||td.text)>>>0)%GD.G.length;
const tdCi=td=>Number.isInteger(td.c)?td.c%GD.COL.length:(hashStr(td.id||td.text)>>>3)%GD.COL.length;
const todosOf=()=>{const v=V();return v&&Array.isArray(v.todos)?v.todos:[];};
const gCache={};let basketCv=null;
function spriteCanvas(rows,pal){const cv=document.createElement('canvas');cv.width=rows[0].length;cv.height=rows.length;const c=cv.getContext('2d');
  rows.forEach((r,y)=>{for(let x=0;x<r.length;x++){const ch=r[x];if(ch==='.')continue;c.fillStyle=pal[ch];c.fillRect(x,y,1,1);}});return cv;}
function garmentCanvas(k,ci){const key=k+'|'+ci;if(!gCache[key]){const [a,x]=GD.COL[ci];
  gCache[key]=spriteCanvas(GD.G[k].r,{o:mix(a,'#2a2430',.68),a,b:mix(a,'#000000',.18),h:mix(a,'#ffffff',.45),x,w:ci===5?'#f2d16b':'#fffdf7',k:mix(x,'#2a2430',.5)});}return gCache[key];}
function ropeY(row,x){const f=(x-CLN.x0)/(CLN.x1-CLN.x0);return CLN.rows[row]-CLN.h+2+Math.sin(Math.PI*f)*3;}
function clSlot(i){const row=Math.floor(i/CLN.per),j=i%CLN.per,x=CLN.x0+8+(CLN.x1-CLN.x0-16)*(j+.5)/CLN.per;return {row,x,y:ropeY(row,x)};}
function lineRows(){return todosOf().length>CLN.per?2:1;}
function drawPin(x,y){R(x,y-2,2,5,'#4a2c1a');R(x,y-2,1,4,'#f0c987');R(x+1,y-2,1,4,'#c08a4a');}
function drawPost(px,gy){const h=CLN.h,O='#4a2c1a',W='#a8714a',Wl='#c98f63',Wd='#7a4a2c';
  ell(px,gy,5,1,'rgba(30,58,30,.3)');
  R(px-2,gy-h,5,h,O);R(px-1,gy-h+1,3,h-1,W);R(px-1,gy-h+1,1,h-1,Wl);R(px+1,gy-h+1,1,h-1,Wd);
  R(px-5,gy-h-1,11,4,O);R(px-4,gy-h,9,2,W);R(px-4,gy-h,9,1,Wl);
}
function drawGarment(x,ly,td,sw){
  const k=tdKind(td),cv=garmentCanvas(k,tdCi(td)),w=cv.width,h=cv.height,x0=Math.round(x-w/2),y0=Math.round(ly),b1=Math.ceil(h*.4),b2=Math.ceil(h*.72),s1=Math.round(sw*.5),s2=Math.round(sw);
  g.drawImage(cv,0,0,w,b1,x0,y0,w,b1);g.drawImage(cv,0,b1,w,b2-b1,x0+s1,y0+b1,w,b2-b1);g.drawImage(cv,0,b2,w,h-b2,x0+s2,y0+b2,w,h-b2);
  GD.G[k].p.forEach(px=>drawPin(x0+px,y0));
}
function drawLineRow(row,t){
  const gy=CLN.rows[row];
  drawPost(CLN.x0,gy);drawPost(CLN.x1,gy);
  for(let x=CLN.x0+1;x<CLN.x1;x++){const y=Math.round(ropeY(row,x));R(x,y+1,1,1,'rgba(74,44,26,.4)');R(x,y,1,1,'#f6efdd');}
  const L=todosOf().slice(0,CLN.max);
  L.forEach((td,i)=>{const s=clSlot(i);if(s.row===row)drawGarment(s.x,s.y,td,Math.sin(t*1.5+i*1.7)*1.3);});
  if(row===0&&!L.length)[.3,.5,.72].forEach(f=>{const x=Math.round(CLN.x0+(CLN.x1-CLN.x0)*f);drawPin(x,Math.round(ropeY(0,x)));});
}
function drawBasket(){
  if(!basketCv)basketCv=spriteCanvas(GD.BASKET,{o:'#4a2c1a',k:'#e0b06a',b:'#b98444',w:'#fffdf7',x:'#f08aa0',a:'#6f9fd8'});
  ell(CLN.bx,CLN.by,7,2,'rgba(30,58,30,.3)');g.drawImage(basketCv,CLN.bx-6,CLN.by-8);
}
function garmentAt(lx,ly){const L=todosOf().slice(0,CLN.max);for(let i=L.length-1;i>=0;i--){const s=clSlot(i),cv=garmentCanvas(tdKind(L[i]),tdCi(L[i]));if(Math.abs(lx-s.x)<cv.width/2+2&&ly>s.y-3&&ly<s.y+cv.height+2)return i;}return -1;}
function onLine(lx,ly){if(Math.hypot(lx-CLN.bx,ly-(CLN.by-4))<9)return true;if(lx<CLN.x0-7||lx>CLN.x1+7)return false;
  for(let r=0;r<lineRows();r++){const gy=CLN.rows[r];if(ly>gy-CLN.h-5&&ly<gy+3)return true;}return false;}
function lineBlocked(x,y){for(let r=0;r<lineRows();r++){if(Math.abs(y-CLN.rows[r])<2.5&&(Math.abs(x-CLN.x0)<3.5||Math.abs(x-CLN.x1)<3.5))return true;}return Math.hypot(x-CLN.bx,(y-(CLN.by-2))*1.4)<6;}
// tap a piece of laundry: its to-do pops up with a Done button
const clTip=document.createElement('div');clTip.id='clTip';document.body.appendChild(clTip);
function closeTip(){clTip.classList.remove('show');}
function openTip(i,cx,cy){
  const td=todosOf()[i];if(!td)return;clTip.innerHTML='';const tx=document.createElement('span');tx.textContent=visiting?'🔒 This to-do is private.':td.text;clTip.appendChild(tx);
  if(!visiting&&home){const b=document.createElement('button');b.type='button';b.className='btn dark';b.textContent='Done ✓';b.addEventListener('click',e=>{e.stopPropagation();closeTip();doneTodo(td.id);});clTip.appendChild(b);}
  clTip.classList.add('show');const w=clTip.offsetWidth,h=clTip.offsetHeight;clTip.style.left=clamp(cx-w/2,6,Math.max(6,innerWidth-w-6))+'px';clTip.style.top=clamp(cy-h-18,6,innerHeight-h-6)+'px';
}
addEventListener('pointerdown',e=>{if(!clTip.contains(e.target))closeTip();},true);
const lineM=document.createElement('div');lineM.className='modal';lineM.id='lineM';
lineM.innerHTML='<div class="panel"><h2>To-dos</h2><div class="lead" id="lnLead"></div><form id="lnForm" autocomplete="off" style="display:flex;gap:8px;margin-top:12px"><input class="inp" id="lnIn" maxlength="60" placeholder="z. B. Retouren absenden" style="flex:1;min-width:0"><button class="btn dark" type="submit">Hang up</button></form><div id="lnList" style="margin-top:12px"></div><div style="display:flex;justify-content:flex-end;margin-top:14px"><button class="btn" type="button" id="lnClose">Close</button></div></div>';
document.body.appendChild(lineM);
function renderLine(){
  const L=todosOf(),own=!visiting&&!!home,box=document.getElementById('lnList');box.innerHTML='';
  document.getElementById('lnForm').style.display=own&&L.length<CLN.max?'flex':'none';
  document.getElementById('lnLead').textContent=own?(L.length?'Every piece of laundry is one to-do. Only you can read them. Take it down when it is done.':'Nothing on the line. Hang up your first to-do.')+(L.length>=CLN.max?' Both lines are full, take something down first.':''):(L.length?(V().name+' has '+L.length+' to-do'+(L.length>1?'s':'')+' on the line. What they are stays private.'):'Nothing on the line right now.');
  L.forEach(td=>{const r=document.createElement('div');r.style.cssText='display:flex;gap:10px;align-items:center;padding:7px 0;border-bottom:1px solid #eee6d6';
    const src=garmentCanvas(tdKind(td),tdCi(td)),ic=document.createElement('canvas');ic.width=src.width;ic.height=src.height;ic.getContext('2d').drawImage(src,0,0);
    ic.style.cssText='image-rendering:pixelated;width:'+src.width*3+'px;height:'+src.height*3+'px';
    const bx=document.createElement('span');bx.style.cssText='flex:none;width:50px;height:50px;display:flex;align-items:center;justify-content:center';bx.appendChild(ic);
    const tx=document.createElement('span');tx.textContent=own?td.text:'🔒 Private';tx.style.cssText='flex:1;min-width:0;overflow-wrap:anywhere'+(own?'':';color:var(--muted)');
    r.appendChild(bx);r.appendChild(tx);
    if(own){const b=document.createElement('button');b.type='button';b.className='btn';b.textContent='Done ✓';b.onclick=()=>doneTodo(td.id);r.appendChild(b);}
    box.appendChild(r);});
}
function openLine(){renderLine();lineM.classList.add('show');}
function closeLine(){lineM.classList.remove('show');}
function doneTodo(id){
  if(!home||visiting)return;const L=home.todos||[],i=L.findIndex(x=>x.id===id);if(i<0)return;
  if(i<CLN.max){const s=clSlot(i),td=L[i],cv=garmentCanvas(tdKind(td),tdCi(td));
    spawn({kind:'cloth',img:cv,x:s.x-cv.width/2,y:s.y,vx:Math.random()*40-20,vy:-70,life:1.1});
    for(let k=0;k<8;k++)spawn({kind:'spark',x:s.x+(Math.random()*12-6),y:s.y+2+Math.random()*10,vy:-12-Math.random()*8,life:.6});}
  L.splice(i,1);persist();if(lineM.classList.contains('show')){renderLine();if(!L.length)closeLine();}
}
document.getElementById('lnForm').addEventListener('submit',e=>{e.preventDefault();if(!home||visiting)return;const inp=document.getElementById('lnIn'),tx=inp.value.trim();if(!tx)return;
  home.todos=(home.todos||[]);if(home.todos.length>=CLN.max)return;
  const free=(n,f)=>{const used=new Set(home.todos.map(f)),opts=[];for(let v=0;v<n;v++)if(!used.has(v))opts.push(v);return opts.length?opts[Math.floor(Math.random()*opts.length)]:Math.floor(Math.random()*n);};
  home.todos.push({id:'t'+Date.now().toString(36)+Math.floor(Math.random()*1e3).toString(36),text:tx.slice(0,60),t:Date.now(),k:free(GD.G.length,tdKind),c:free(GD.COL.length,tdCi)});inp.value='';persist();renderLine();});
document.getElementById('lnClose').addEventListener('click',closeLine);
lineM.addEventListener('pointerdown',e=>{if(e.target===lineM)closeLine();});


/* ================= duck: lives by the pool in Sisi's garden, quacks when tapped (just the sound and its beak) ================= */
const DUCK={x:138,y:322};
const DUCK_PAL={w:'#fff5f4',p:'#fab4b4',P:'#d48581',g:'#517746',G:'#6a925d',l:'#98bd7a',b:'#bd6027',r:'#cf3336',m:'#812d2d',R:'#f34b62',o:'#fd9800',y:'#ffb84c',e:'#491718',h:'#ff96a0'};
const DUCK_ROWS=['........mmmmm....','.......mRhRRrm...','......mRRRrrrrm..','......mRRrrrrrm..','......mlGgGrlGgm.','......gGPwwwwPGg.','...PP.lPwwwwwwPg.','..PppPgPwwewwwwP.',
  '.PwwwpgPwwwwbbbb.','.PwwwwglPwwboyyyb','PwwwwwgGgwwbbbbb.','PwPpwwwgGGgggggg.','PwpPpwwwgGgGlgg..','PwwPpwPwwgpgpP...','PwwwPPwwwwwwppP..','.PwwwwwwwwwwwpP..','..PpwwwwwwwwpP...','...PPppppppPP....','....boo..boo.....','....bbb..bbb.....'];
// beak open: the same duck with rows 9 to 12 swapped
const DUCK_OPEN={9:'.PwwwwglPwwbyyyyb',10:'PwwwwwgGgwwemmm..',11:'PwPpwwwgGGgbooob.',12:'PwpPpwwwgGgGbbb..'};
function duckSprite(open){const c=document.createElement('canvas');c.width=17;c.height=20;const x=c.getContext('2d');
  DUCK_ROWS.forEach((r,j)=>{r=open&&DUCK_OPEN[j]||r;for(let i=0;i<r.length;i++)if(DUCK_PAL[r[i]]){x.fillStyle=DUCK_PAL[r[i]];x.fillRect(i,j,1,1);}});return c;}
const duckImg=[duckSprite(false),duckSprite(true)];
let duckQuackAt=-9e9;
function duckHere(){return visiting?(visiting.id===OWNER_ID||!!(visiting.data&&visiting.data.owner)):(isOwner||myId===OWNER_ID);}
function onDuck(x,y){return duckHere()&&Math.abs(x-DUCK.x)<11&&y>DUCK.y-22&&y<DUCK.y+3;}
function quack(){duckQuackAt=performance.now();Sfx.quack();}
function drawDuck(){
  const open=performance.now()-duckQuackAt<320;
  ell(DUCK.x,DUCK.y,8,2,'rgba(40,80,40,.28)');
  g.drawImage(duckImg[open?1:0],DUCK.x-8,DUCK.y-19);
}
