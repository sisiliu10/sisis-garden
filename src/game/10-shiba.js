/* ================= shiba (lives in Sisi's cottage) ================= */
// The dog is Sisi's own sprite (art/dog-sprite.png), drawn straight from the sprite sheet that
// tools/dog_sheet.py cuts from it: no redrawing, no smoothing, no shadow, no filters.
// A tiny tamagotchi: breathes and blinks, trots around, naps on the rug, eats from its bowl,
// hops and wags when you pet it, and looks sad when nobody petted it for a while.
const dogImg=new Image();dogImg.src=DOG_SHEET;
const shiba={x:60,y:140,tx:60,ty:140,dir:-1,mode:'idle',next:0,t:0,hop:0,heart:0,wagT:0,eatT:0,after:null,run:false};
const BOWL={x:46,y:160};
function shibaHere(){return scene==='house'&&(visiting?visiting.id===OWNER_ID:(isOwner||myId===OWNER_ID));}
function dogKey(k){return 'shiba-'+k+'-'+(myId||'me');}
function dogGet(k){try{return localStorage.getItem(dogKey(k));}catch(e){return null;}}
function dogSet(k,v){try{localStorage.setItem(dogKey(k),v);}catch(e){}}
// sad when nobody petted it for 20 hours (only at home; visitors meet a cheerful dog)
function shibaSad(){if(visiting)return false;const t=+dogGet('pet')||0;return Date.now()-t>20*3600e3;}
// the bowl fills itself every morning; you can also refill it by tapping it
function bowlFull(){return dogGet('bowl')!=='e:'+today();}
function shibaUpdate(dt){
  if(!shibaHere())return;
  const D=shiba,now=performance.now();D.t+=dt;D.hop=Math.max(0,D.hop-dt);D.heart=Math.max(0,D.heart-dt);D.wagT=Math.max(0,D.wagT-dt);
  if(D.mode==='eat'){D.eatT-=dt;if(D.eatT<=0){D.mode='idle';D.next=now+1500;D.wagT=1.2;dogSet('bowl','e:'+today());}return;}
  if(D.mode==='walk'){const dx=D.tx-D.x,dy=D.ty-D.y,d=Math.hypot(dx,dy);
    if(d<1.5){if(D.after==='sleep'){D.mode='sleep';D.next=now+9000+Math.random()*9000;}else if(D.after==='eat'&&bowlFull()){D.mode='eat';D.eatT=4;D.dir=BOWL.x<D.x?-1:1;}else{D.mode='idle';D.next=now+2000+Math.random()*4000;}D.after=null;return;}
    const sp=(D.run?58:shibaSad()?18:30)*dt,nx=D.x+dx/d*sp,ny=D.y+dy/d*sp;if(Math.abs(dx)>1)D.dir=dx>0?1:-1;
    if(!houseBlocked(nx,ny)){D.x=nx;D.y=ny;}else{D.mode='idle';D.after=null;D.next=now+800;}
    return;}
  if(now<D.next)return;
  // next thing to do: eat if the bowl is full, nap on the rug, come over to you, or trot somewhere
  const r=Math.random();D.run=false;D.after=null;D.mode='walk';
  if(bowlFull()&&r<.2){D.tx=BOWL.x+12;D.ty=BOWL.y;D.after='eat';}
  else if(r<.35){D.tx=96;D.ty=121;D.after='sleep';}
  else if(r<.6&&!napping){D.tx=clamp(av.x+(av.x>D.x?-16:16),12,RW-12);D.ty=clamp(av.y+2,WALL+16,RH-6);D.run=Math.hypot(av.x-D.x,av.y-D.y)>70;}
  else{for(let k=0;k<10;k++){const tx=14+Math.random()*(RW-28),ty=WALL+16+Math.random()*(RH-WALL-22);if(!houseBlocked(tx,ty)){D.tx=tx;D.ty=ty;break;}}}
}
function dogFrame(t){
  const D=shiba,sad=shibaSad();
  if(D.mode==='sleep')return Math.floor(t*.8)%2?'sleepb':'sleep';
  if(D.mode==='eat')return Math.floor(t*5)%2?'eat2':'eat1';
  if(D.mode==='walk')return Math.floor(t*(D.run?12:8))%2?'walk1':'walk2';
  if(D.wagT>0||D.hop>0)return ['wag1','idle','wag2','idle'][Math.floor(t*14)%4];
  const blink=(t%3.7)<.14;
  if(sad)return Math.floor(t*1.2)%2?'sadb':'sad';
  if(blink)return 'blink';
  return Math.floor(t*1.4)%2?'breath':'idle';
}
function drawBowl(){const x=BOWL.x,y=BOWL.y;R(x-6,y-4,12,4,'#3a5fb0');R(x-7,y-5,14,1,'#5a86e8');R(x-5,y,10,1,'#2a4580');
  if(bowlFull()){R(x-5,y-6,10,1,'#8a5a36');R(x-4,y-7,3,1,'#a8744a');R(x,y-7,3,1,'#8a5a36');R(x+3,y-6,1,1,'#a8744a');}}
function drawShiba(t){
  if(!dogImg.complete||!dogImg.naturalWidth)return;
  const D=shiba,fr=DOG_FR[dogFrame(t)]||0,right=D.dir>0;
  const hop=D.hop>0?Math.round(Math.sin((1-D.hop/.45)*Math.PI)*6):0;
  const x=Math.round(D.x)-(right?12:10),y=Math.round(D.y)-DOG_H-hop;
  g.drawImage(dogImg,fr*DOG_W,right?DOG_H:0,DOG_W,DOG_H,x,y,DOG_W,DOG_H);
  if(D.mode==='sleep'&&Math.floor(t*1.2)%2){const zx=x+(right?18:2),zy=y-2;R(zx,zy,3,1,'#ffffff');R(zx+1,zy+1,1,1,'#ffffff');R(zx,zy+2,3,1,'#ffffff');}
  if(D.heart>0){g.globalAlpha=Math.min(1,D.heart*2);const hx=Math.round(D.x)-1,hy=y-6-Math.round((1.4-D.heart)*6);[[0,0],[2,0],[-1,1],[0,1],[1,1],[2,1],[3,1],[0,2],[1,2],[2,2],[1,3]].forEach(([a,b])=>R(hx+a-1,hy+b,1,1,'#e8506c'));g.globalAlpha=1;}
}
function shibaAt(lx,ly){return shibaHere()&&Math.abs(lx-shiba.x)<12&&ly>shiba.y-20&&ly<shiba.y+4;}
function bowlAt(lx,ly){return shibaHere()&&Math.abs(lx-BOWL.x)<9&&Math.abs(ly-BOWL.y+3)<7;}
function petShiba(){const D=shiba;if(D.mode==='eat')return;D.mode='idle';D.after=null;D.next=performance.now()+2600;D.heart=1.4;D.hop=.45;D.wagT=2.8;D.dir=av.x>D.x?1:-1;dogSet('pet',String(Date.now()));try{Sfx.woof();}catch(e){}}
function fillBowl(){if(bowlFull())return;dogSet('bowl','f');try{Sfx.click();}catch(e){}const D=shiba;D.mode='walk';D.run=true;D.tx=BOWL.x+12;D.ty=BOWL.y;D.after='eat';}
