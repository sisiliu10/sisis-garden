/* ================= shiba (lives in Sisi's cottage) ================= */
// a small shiba of our own design: trots around the room, naps on the rug, wags when you are close, tap it for a pat
// facing left, small like a puppy: big head turned to you, open smile with raised corners, cream chest, curled tail with a light tip
const SHIBA_BASE=[
".o....o.......",
"odo..odo......",
"obdoooodbo.oo.",
"obbbbbbbboollo",
"obbebbebboollo",
"ommllllbbo.obo",
"olmlllmlbobbo.",
".olmmmllbbbbo.",
".ollllbbbbbbo.",
"..obkbbbbkbbo.",
];
const SHIBA_LEGS={stand:["..obokbo.okbo.","..oo.oo..oo.o."],walk:["..obokbo.okbo.",".oo..oo.oo..o."],sit:["..obbbbbbbbbo.","..ooooooooooo."]};
const SHIBA_COL={o:'#7d2512',b:'#ff9618',d:'#ee6214',k:'#e0641a',l:'#ffe4be',e:'#28180f',m:'#5a1c14'};
const shibaCache={};
function shibaImg(pose,wag,sleep){
  const k=pose+wag+(sleep?'z':'');if(shibaCache[k])return shibaCache[k];
  let rows=SHIBA_BASE.concat(SHIBA_LEGS[pose]||SHIBA_LEGS.stand);
  if(sleep){rows=rows.map((r,y)=>y===4?r.replace(/e/g,'o'):y===7?r.replace('mmm','lml'):r);rows=rows.slice(0,10).concat(["..ooooooooooo."]);}
  rows=rows.map(r=>r.padEnd(16,'.'));
  if(wag){const sh=(r,n)=>{const a=r.slice(0,10),t=r.slice(10);return n>0?a+'.'.repeat(n)+t.slice(0,t.length-n):a+t.slice(-n)+'.'.repeat(-n);};
    rows=rows.map((r,y)=>wag>0?(y===2||y===3?sh(r,1):r):(y===2?sh(r,-1):r));}
  const w=16,h=rows.length,cv=document.createElement('canvas');cv.width=w*2;cv.height=h;const c=cv.getContext('2d');
  for(let f=0;f<2;f++)rows.forEach((r,y)=>[...r].forEach((ch,x)=>{if(ch==='.')return;c.fillStyle=SHIBA_COL[ch];c.fillRect(f?w*2-1-x:x,y,1,1);}));
  return shibaCache[k]=cv;
}
const shiba={x:60,y:140,tx:60,ty:140,dir:1,mode:'idle',next:0,t:0,hop:0,heart:0};
function shibaHere(){return scene==='house'&&(visiting?visiting.id===OWNER_ID:(isOwner||myId===OWNER_ID));}
function shibaUpdate(dt){
  if(!shibaHere())return;
  const S0=shiba,now=performance.now();S0.t+=dt;S0.hop=Math.max(0,S0.hop-dt);S0.wagT=Math.max(0,(S0.wagT||0)-dt);S0.heart=Math.max(0,S0.heart-dt);
  const near=Math.hypot(av.x-S0.x,av.y-S0.y)<26;
  if(S0.mode==='walk'){const dx=S0.tx-S0.x,dy=S0.ty-S0.y,d=Math.hypot(dx,dy);
    if(d<1.5){S0.mode=Math.random()<.25?'sit':'idle';S0.next=now+2500+Math.random()*4000;}
    else{const sp=(S0.run?58:30)*dt,nx=S0.x+dx/d*sp,ny=S0.y+dy/d*sp;if(Math.abs(dx)>1)S0.dir=dx>0?1:-1;
      if(!houseBlocked(nx,ny)){S0.x=nx;S0.y=ny;}else{S0.mode='idle';S0.next=now+800;}}
    return;}
  if(S0.mode==='sleep'&&now<S0.next)return;
  if(now<S0.next)return;
  // pick the next thing to do: nap on the rug, come over to you, or trot somewhere
  const r=Math.random();S0.run=false;
  if(r<.15){S0.tx=96;S0.ty=121;S0.mode='walk';S0.after='sleep';}
  else if(r<.4&&!napping){S0.tx=clamp(av.x+(av.x>S0.x?-14:14),12,RW-12);S0.ty=clamp(av.y+2,WALL+14,RH-6);S0.mode='walk';S0.run=Math.hypot(av.x-S0.x,av.y-S0.y)>70;}
  else{for(let k=0;k<10;k++){const tx=12+Math.random()*(RW-24),ty=WALL+14+Math.random()*(RH-WALL-20);if(!houseBlocked(tx,ty)){S0.tx=tx;S0.ty=ty;break;}}S0.mode='walk';}
  if(S0.after==='sleep'&&S0.mode==='walk'&&S0.tx!==96)S0.after=null;
}
function shibaArrive(){if(shiba.after==='sleep'){shiba.after=null;shiba.mode='sleep';shiba.next=performance.now()+9000+Math.random()*9000;}}
function drawShiba(t){
  const S0=shiba;if(S0.mode==='walk'&&Math.hypot(S0.tx-S0.x,S0.ty-S0.y)<2)shibaArrive();
  const sleep=S0.mode==='sleep',near=Math.hypot(av.x-S0.x,av.y-S0.y)<30;
  const pose=sleep?'stand':S0.mode==='walk'?(Math.floor(t*(S0.run?12:8))%2?'walk':'stand'):S0.mode==='sit'?'sit':'stand';
  // petted: a happy, fast wag for a few seconds; otherwise a slow one now and then when you are close
  const wf=Math.floor(t*14)%4,wag=sleep?0:S0.wagT>0?[1,0,-1,0][wf]:(near&&Math.floor(t*3)%4===0)?1:0;
  const im=shibaImg(pose,wag,sleep),w=16,x=Math.round(S0.x-w/2),y=Math.round(S0.y-im.height-(S0.hop>0?Math.round(Math.sin((1-S0.hop/.35)*Math.PI)*5):0));
  g.globalAlpha=.25;ell(Math.round(S0.x)+(S0.dir>0?0:-1),Math.round(S0.y),7,2,'#5a3a20');g.globalAlpha=1;
  g.drawImage(im,S0.dir>0?w:0,0,w,im.height,x,y,w,im.height);
  if(sleep&&Math.floor(t*1.2)%2){const zx=x+(S0.dir>0?12:1),zy=y-4;R(zx,zy,3,1,'#ffffff');R(zx+1,zy+1,1,1,'#ffffff');R(zx,zy+2,3,1,'#ffffff');}
  if(S0.heart>0){g.globalAlpha=Math.min(1,S0.heart*2);const hx=Math.round(S0.x)-1,hy=y-6-Math.round((1.2-S0.heart)*6);[[0,0],[2,0],[-1,1],[0,1],[1,1],[2,1],[3,1],[0,2],[1,2],[2,2],[1,3]].forEach(([a,b])=>R(hx+a-1,hy+b,1,1,'#e8506c'));g.globalAlpha=1;}
}
function shibaAt(lx,ly){return shibaHere()&&Math.abs(lx-shiba.x)<12&&ly>shiba.y-16&&ly<shiba.y+4;}
function petShiba(){const S0=shiba;S0.mode='idle';S0.next=performance.now()+2500;S0.heart=1.2;S0.hop=.35;S0.wagT=2.6;S0.dir=av.x>S0.x?1:-1;try{Sfx.woof();}catch(e){}}
