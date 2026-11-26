/* ================= background ================= */
function drawBG(){
  X=bgc; const r=rng(7), hz=OY+104;
  R(0,0,W,H,'#6fa6e3'); R(0,hz-46,W,46,'#79ade6'); R(0,hz-30,W,30,'#84b6ea'); R(0,hz-18,W,18,'#90bfee');
  for(let x=-6;x<W+12;x+=8+Math.floor(r()*6)){const rr=5+Math.floor(r()*7),y=hz-10-Math.floor(r()*8);disc(x,y,rr,'#dcefff');disc(x-1,y-1,rr-1,'#ffffff');}
  R(0,hz-6,W,10,'#dcefff');
  for(let x=0;x<W;x++){const h=15+6*Math.sin(x*.032+1)+4*Math.sin(x*.09+2)+2*Math.sin(x*.21);R(x,Math.round(hz-h+6),1,Math.round(h+10),'#a8e0da');R(x,Math.round(hz-h+6),1,1,'#c4ece6');}
  for(let x=0;x<W;x++){const h=9+5*Math.sin(x*.047+3)+3*Math.sin(x*.13+1);R(x,Math.round(hz-h+10),1,Math.round(h+10),'#86d0c4');R(x,Math.round(hz-h+10),1,1,'#a3ddd2');}
  const top=x=>Math.round(OY+116+3*Math.sin(x*.045)+2*Math.sin(x*.12+1));
  for(let x=0;x<W;x++) R(x,top(x),1,OY+144-top(x),'#5aa84a');
  for(let i=0;i<Math.ceil(W/38);i++){const x=Math.floor(r()*W),y=OY+122+Math.floor(r()*8);ell(x,y,9+Math.floor(r()*6),4,'#7b4f33');ell(x-1,y-1,8+Math.floor(r()*4),3,'#9a6a46');ell(x-2,y-2,4,1,'#b4825a');}
  for(let x=-4;x<W+8;x+=5+Math.floor(r()*5)){const y=top(x)+2+Math.floor(r()*5),rr=3+Math.floor(r()*4);disc(x,y,rr,'#3c8a3a');disc(x-1,y-1,rr-1,'#4f9e43');R(x-1,y-rr+1,2,1,'#6cbc58');}
  for(let x=-4;x<W+8;x+=7+Math.floor(r()*7)){const y=OY+134+Math.floor(r()*6),rr=3+Math.floor(r()*3);disc(x,y,rr,'#3c8a3a');disc(x-1,y-1,rr-1,'#58a84a');}
  for(let i=0;i<W/6;i++){const x=Math.floor(r()*W),y=OY+120+Math.floor(r()*20),c=r()<.7?'#e2483c':'#f3a73a';R(x-1,y,3,1,c);R(x,y-1,1,3,c);R(x,y,1,1,'#ffd9a0');}
  const gt=OY+140;
  R(0,gt,W,TH-gt,'#7dc46c');
  for(let x=0;x<W;x++){if(Math.sin(x*.7)+Math.sin(x*.23)>.3)R(x,gt,1,1,'#6bb35c');}
  R(0,gt+1,W,1,'#74bd64');
  const n=Math.floor(W*(TH-gt)/90);
  for(let i=0;i<n;i++){const x=Math.floor(r()*W),y=gt+4+Math.floor(r()*(TH-gt-4)),c=r()<.5?'#6bb35c':'#8fd17c';R(x,y,1,2,c);R(x+2,y,1,2,c);R(x+1,y+1,1,1,c);if(r()<.3){R(x+4,y-1,1,2,c);R(x+3,y,1,1,c);}}
  for(let i=0;i<n/5;i++){const x=Math.floor(r()*W),y=gt+6+Math.floor(r()*(TH-gt-6)),c=['#e85a5a','#5a86e8','#ffffff','#ffffff','#f2c94c'][Math.floor(r()*5)];R(x,y,1,1,c);if(r()<.4)R(x+1,y+2,1,1,'#ffffff');}
  // skills area: path, hedge with a gate
  const fy=OY+356, px0=OX+113, pe=OY+DOCK.y0+2;
  R(px0,fy,14,pe-fy,'#d8c08f');R(px0,fy,1,pe-fy,'#c4a978');R(px0+13,fy,1,pe-fy,'#c4a978');
  for(let i=0;i<(pe-fy)/5;i++){R(px0+2+Math.floor(r()*10),fy+Math.floor(r()*(pe-fy-2)),2,1,'#bfa577');}
  drawPondBG(r);
  for(let x=-4;x<W+8;x+=6){if(x>OX+98&&x<OX+142)continue;disc(x,fy,4,'#3c8a3a');disc(x-1,fy-1,3,'#4f9e43');R(x-1,fy-3,2,1,'#6cbc58');if(r()<.25){R(x+1,fy-2,1,1,'#e2483c');}}
  [OX+100,OX+137].forEach(gx=>{R(gx,fy-7,3,11,'#7a4a2c');R(gx,fy-7,3,1,'#a8714a');R(gx+2,fy-6,1,10,'#5a3420');});
  // pool deck in the middle of the garden
  const P={x0:OX+POOL.x0,x1:OX+POOL.x1,y0:OY+POOL.y0,y1:OY+POOL.y1};
  R(P.x0-7,P.y0-7,P.x1-P.x0+14,P.y1-P.y0+14,'#b9b2a6');
  for(let y=P.y0-7;y<P.y1+7;y+=4)for(let x=P.x0-7+((y/4)%2)*3;x<P.x1+7;x+=6)R(x,y,1,1,'#a29a8d');
  R(P.x0-7,P.y0-7,P.x1-P.x0+14,1,'#d6d0c5');R(P.x0-1,P.y0-1,P.x1-P.x0+2,P.y1-P.y0+2,'#7d766b');
  [P.x0+6,P.x0+12].forEach(lx=>{R(lx,P.y0-6,1,9,'#e6e6e6');R(lx+1,P.y0-6,1,9,'#9a9a9a');});R(P.x0+6,P.y0-2,7,1,'#cfcfcf');
  X=g;
}
let clouds=[];
function initClouds(){const r=rng(31);clouds=[];const n=Math.max(4,Math.round(W/60));const tb=OY*.42+76;for(let i=0;i<n;i++)clouds.push({x:r()*W,y:tb+r()*Math.max(4,OY+88-tb),s:4+Math.floor(r()*4),v:1.5+r()*2.5});}
function drawCloud(x,y,s){x=Math.round(x);y=Math.round(y);const parts=[[0,0,s],[s+2,1,s-1],[-s-1,2,s-2],[Math.round(s*.4),-Math.round(s*.6),s-1]];parts.forEach(([a,b,r])=>disc(x+a,y+b+1,r,'#d6ebfb'));parts.forEach(([a,b,r])=>disc(x+a,y+b,r,'#ffffff'));}

/* ================= avatar ================= */
// side view (profile), used while climbing the slide ladder; dir 1 = facing right, -1 = facing left
function drawAvatarSide(ctx,fx,fy,look,o){
  const ox=Math.round(fx)-7, oy=Math.round(fy)-25, fl=(o.dir||1)<0;
  const r=(a,b,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(ox+(fl?14-a-w:a),oy+b,w,h);};
  const O='#2a2430',sk=look.skin,skd=shade(sk,-.12),hc=look.hairColor,hd=shade(hc,-.3),hl=shade(hc,.2),tc=look.top,td=shade(tc,-.16),bc=look.bottomColor,bd=shade(bc,-.22);
  const st=look.hair,f=o.frame||0,up=f===1,legC=look.bottom==='pants'?bc:sk;
  // hair that hangs behind the head
  if(st==='long'){r(1,4,5,13,hc);r(1,4,1,13,hd);r(2,16,4,1,hd);r(1,3,1,1,O);r(0,4,1,13,O);r(1,17,5,1,O);}
  if(st==='bob'){r(1,4,5,8,hc);r(1,4,1,8,hd);r(0,4,1,8,O);r(1,12,5,1,O);}
  if(st==='pony'){r(1,3,2,2,hc);r(0,5,2,7,hc);r(0,5,1,7,hd);r(2,3,1,1,'#e85a7a');}
  if(st==='bun'){r(1,-2,4,4,hc);r(2,-3,2,1,hc);r(1,-1,1,2,hd);r(2,-2,1,1,hl);}
  // back leg, then back arm (reaching up the ladder)
  const bl=up?0:2;
  r(5,20,2,3-bl,shade(legC,-.18));r(5,23-bl,3,2,O);
  // back arm reaching forward to the rail (other phase than the front arm)
  {const hy=up?12:10,c=shade(tc,-.3);r(9,13,2,1,c);r(11,hy+1,2,1,c);r(13,hy,1,1,skd);r(13,hy-1,1,1,skd);}
  // body
  r(4,12,6,6,O);r(5,12,4,6,tc);r(5,17,4,1,td);
  if(look.bottom==='pants'){r(4,18,6,2,O);r(5,18,4,2,bc);r(5,19,4,1,bd);}else{r(3,18,7,2,bc);r(3,19,7,1,bd);}
  // front leg: knee lifted onto the next rung on alternate steps
  if(up){r(7,19,3,2,legC);r(9,21,2,2,legC);r(9,23,3,1,O);r(8,22,1,1,O);}else{r(7,20,2,3,legC);r(7,23,3,2,O);}
  // front arm
  {const hy=up?10:12;r(6,12,3,3,O);r(7,12,2,2,tc);r(8,15,3,1,O);r(9,14,2,1,tc);r(9,13,1,1,tc);r(10,hy+2,2,1,O);r(11,hy+1,1,1,tc);r(10,hy+1,1,1,tc);r(12,hy,2,2,sk);r(12,hy-1,2,1,O);r(14,hy,1,2,O);r(12,hy+2,2,1,O);}
  // head in profile (same 10px width as the front view), nose pokes out one pixel
  r(2,3,10,8,O);r(3,11,7,1,O);r(3,3,8,8,sk);r(11,6,1,2,sk);r(12,6,1,1,O);r(12,7,1,1,O);r(11,8,1,1,O);r(3,10,1,1,O);r(10,10,1,1,O);r(4,10,6,1,skd);
  // hair cap, back of the head, little fringe; ear sits just in front of the hair
  r(3,-1,8,1,O);r(2,0,1,1,O);r(11,0,1,1,O);r(1,1,1,4,O);r(12,1,1,2,O);r(2,0,9,3,hc);r(11,1,1,2,hc);r(4,0,4,1,hl);r(9,1,2,1,hl);
  r(2,3,5,(st==='short'?5:7),hc);r(2,3,1,(st==='short'?5:7),hd);r(7,3,4,1,hc);r(10,4,1,1,hc);if(st==='short'){r(3,8,3,1,hd);}
  if(st!=='long')r(7,6,1,2,skd);
  if(o.happy){r(9,6,1,1,O);r(8,7,1,1,O);r(10,7,1,1,O);}else if(o.blink)r(9,7,2,1,O);else{r(9,6,1,2,O);}
  r(8,8,2,1,'#f5a0ac');if(o.happy){r(10,9,1,1,O);r(9,9,1,1,'#c75b6c');}else r(10,9,1,1,'#c75b6c');
  if(look.acc==='glasses'){const G='#9a5a26',GL='#c98a4e';r(8,5,3,1,G);r(8,8,3,1,G);r(8,6,1,2,G);r(10,6,1,2,GL);r(5,6,3,1,G);}
  if(look.acc==='shades'){r(8,6,3,2,'#141418');r(5,6,3,1,'#141418');r(10,6,1,1,'#66779a');}
  if(look.acc==='headband'){for(let i=0;i<8;i++)r(3+i,2,1,1,i%2?'#ffffff':'#e3dcef');}
  if(look.acc==='clip'){r(4,1,2,1,'#f49ab0');r(6,1,1,1,'#ffd1dc');}
}
function drawAvatar(ctx,fx,fy,look,o){
  if(o.side)return drawAvatarSide(ctx,fx,fy,look,o);
  const ox=Math.round(fx)-7, oy=Math.round(fy)-25;
  const r=(a,b,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(ox+a,oy+b,w,h);};
  const O='#2a2430',sk=look.skin,hc=look.hairColor,hd=shade(hc,-.3),hl=shade(hc,.2),tc=look.top,td=shade(tc,-.16),bc=look.bottomColor,bd=shade(bc,-.22);
  const back=!!o.back,f=o.frame||0,st=look.hair;
  if(o.shadow!==false){ctx.fillStyle='rgba(40,80,40,.28)';ctx.fillRect(ox+3,oy+24,8,1);ctx.fillRect(ox+2,oy+25,10,1);ctx.fillRect(ox+3,oy+26,8,1);}
  if(o.heart){const hy=-10+(Math.sin(o.t*3)>0?0:-1);[[1,0],[3,0],[0,1],[1,1],[2,1],[3,1],[4,1],[1,2],[2,2],[3,2],[2,3]].forEach(([a,b])=>r(5+a,hy+b,1,1,o.heart));r(6,hy+1,1,1,'rgba(255,255,255,.7)');}
  if(st==='long'){r(1,3,12,15,hc);r(1,3,1,15,hd);r(12,3,1,15,hd);r(2,17,10,1,hd);}
  if(st==='bob'){r(1,3,12,9,hc);r(1,3,1,9,hd);r(12,3,1,9,hd);}
  if(st==='pony'){r(11,1,3,3,hc);r(12,4,2,8,hc);r(13,4,1,8,hd);r(12,12,1,1,hd);r(11,2,1,1,'#e85a7a');}
  if(st==='bun'){r(4,-4,6,4,hc);r(5,-5,4,1,hc);r(4,-4,1,4,hd);r(5,-3,2,1,hl);}
  const legC=look.bottom==='pants'?bc:sk;
  if(o.sit){
    // sitting on the swing: hands up on the chains, legs kick forward or tuck back with the swing
    const k=o.kick||0;
    if(o.ride){r(3,20,2,3,legC);r(9,20,2,3,legC);r(2,23,3,2,O);r(9,23,3,2,O);}
    else if(k>.3){r(3,20,2,2,legC);r(7,20,2,2,legC);r(2,22,2,1,legC);r(6,22,2,1,legC);r(0,23,3,2,O);r(4,23,3,2,O);}
    else if(k<-.3){r(5,20,2,2,legC);r(9,20,2,2,legC);r(5,22,3,2,O);r(9,22,3,2,O);}
    else{r(4,20,2,3,legC);r(8,20,2,3,legC);r(3,23,3,2,O);r(8,23,3,2,O);}
    if(o.ride){r(1,12,1,5,O);r(12,12,1,5,O);r(2,12,2,5,tc);r(10,12,2,5,tc);r(2,16,2,1,td);r(10,16,2,1,td);r(2,17,2,1,sk);r(10,17,2,1,sk);}
    else{r(1,12,3,2,tc);r(10,12,3,2,tc);r(0,9,2,4,tc);r(12,9,2,4,tc);r(0,12,2,1,td);r(12,12,2,1,td);r(0,8,2,1,sk);r(12,8,2,1,sk);}
  }else if(o.run){
    // running: one knee pulled up high, the other leg stretched back; arms swing hard
    const A=f!==2, up=A?4:8, dn=A?8:4, so=A?-1:1;
    r(up,20,2,1,legC);r(up+(A?-1:1),21,2,1,legC);r(up+(A?-2:1),21,3,2,O);
    r(dn,20,2,4,legC);r(dn+so*-1,23,3,2,O);
    r(1,12+(A?-1:2),1,4,O);r(2,12+(A?-1:2),2,4,tc);r(2,15+(A?-1:2),2,1,sk);
    r(12,12+(A?2:-1),1,4,O);r(10,12+(A?2:-1),2,4,tc);r(10,15+(A?2:-1),2,1,sk);
  }else{
  const lu=f===1?1:0,ru=f===2?1:0;
  r(4,20,2,3-lu,legC);r(8,20,2,3-ru,legC);r(3,23-lu,3,2,O);r(8,23-ru,3,2,O);
  r(1,12,1,5,O);r(12,12,1,5,O);r(2,12,2,5,tc);r(10,12,2,5,tc);r(2,16,2,1,td);r(10,16,2,1,td);r(2,17,2,1,sk);r(10,17,2,1,sk);
  }
  r(4,12,6,6,tc);r(4,17,6,1,td);if(!back){if(tc==='#2b3550')r(5,12,4,1,'#f2f2f2');r(6,12,2,1,sk);}
  if(look.bottom==='pants'){r(4,18,6,2,bc);r(4,19,6,1,bd);}else{r(3,18,8,1,bc);r(2,19,10,2,bc);r(2,20,10,1,bd);}
  r(2,3,10,8,O);r(4,11,6,1,O);r(3,3,8,8,sk);r(3,10,1,1,O);r(10,10,1,1,O);
  r(3,-1,8,1,O);r(2,0,1,1,O);r(11,0,1,1,O);r(1,1,1,2,O);r(12,1,1,2,O);r(3,0,8,1,hc);r(2,1,10,2,hc);r(4,0,3,1,hl);
  if(back){
    if(st==='short'){r(2,3,10,6,hc);r(3,9,8,1,hd);}else{r(2,3,10,8,hc);r(3,10,8,1,hd);}
    if(st==='long'){r(2,11,10,6,hc);r(2,16,10,1,hd);r(6,11,1,6,hd);}
    if(st==='bob')r(2,11,10,1,hd);
  }else{
    r(3,3,8,1,hc);r(3,4,2,1,hc);r(6,4,2,1,hc);r(9,4,2,1,hc);
    if(st==='long'||st==='bob'){r(2,3,1,7,hc);r(11,3,1,7,hc);}else{r(2,3,1,3,hc);r(11,3,1,3,hc);if(st==='short'){r(2,6,1,2,sk);r(11,6,1,2,sk);}}
    if(o.blink){r(4,7,2,1,O);r(8,7,2,1,O);}else{r(4,6,2,2,O);r(8,6,2,2,O);r(4,6,1,1,'#fff');r(8,6,1,1,'#fff');}
    r(3,8,2,1,'#f5a0ac');r(9,8,2,1,'#f5a0ac');r(6,9,2,1,'#c75b6c');
    if(look.acc==='glasses'){const G='#9a5a26',GL='#c98a4e';r(4,5,2,1,G);r(8,5,2,1,G);r(4,8,2,1,G);r(8,8,2,1,G);r(3,6,1,2,G);r(6,6,1,2,G);r(7,6,1,2,GL);r(10,6,1,2,G);r(4,5,1,1,GL);r(8,5,1,1,GL);}
    if(look.acc==='shades'){r(3,6,3,2,'#141418');r(8,6,3,2,'#141418');r(6,6,2,1,'#141418');r(4,6,1,1,'#66779a');r(9,6,1,1,'#66779a');}
  }
  if(look.acc==='headband'){for(let i=0;i<10;i++)r(2+i,2,1,1,i%2?'#ffffff':'#e3dcef');}
  if(look.acc==='clip'){r(9,1,2,1,'#f49ab0');r(11,1,1,1,'#ffd1dc');}
  if(o.can){r(12,14,4,4,'#6fb0c8');r(12,14,4,1,'#a2d6e6');r(12,17,4,1,'#4f8ea6');r(13,13,2,1,'#4f8ea6');
    if(o.pour){r(16,16,2,1,'#6fb0c8');r(18,17,1,1,'#6fb0c8');}else{r(16,14,1,1,'#6fb0c8');r(17,13,1,1,'#6fb0c8');r(18,12,1,1,'#6fb0c8');}}
}

/* ================= plants (drawn at 1x into an offscreen tile, then scaled) ================= */
function drawPlantTile(p,t){
  X=pctx; pctx.clearRect(0,0,64,56);
  const st=stageOf(p),w=shownWater(p),d=clamp((40-w)/40,0,1);
  const c={L:mix('#4f9e3f','#a3954a',d),LL:mix('#78c65e','#c2b26a',d),LD:mix('#2f6f2c','#76662f',d),
    fl:col=>mix(col,'#a8937c',d*.75),dr:w<35?1:0,sw:Math.sin(t*1.3+p.slot*2)>.75?1:0,t,w,d};
  const x=32,y=52;
  ell(x,y,7,2,'#6c4229');ell(x,y-1,6,1,'#8a5a3a');
  if(st===0){R(x,y-4,1,3,c.LD);R(x-2,y-5,2,1,c.L);R(x+1,y-6,2,1,c.LL);}
  else if(st===1){R(x,y-8,1,7,c.LD);R(x-3,y-8,3,2,c.L);R(x-4,y-7,1,1,c.L);R(x+1,y-10,3,2,c.LL);R(x+4,y-10,1,1,c.LL);}
  else ({sunflower:pSun,lantern:pLantern,plum:pPlum,tea:pTea,tree:pTree,bamboo:pBamboo,beet:pBeet})[p.kind](x,y,st,c);
  X=g;
}
function pSun(x,y,st,c){
  const h=st===2?13:st===3?19:24;
  R(x,y-h,2,h,c.LD);R(x,y-h,1,h,c.L);
  R(x-5,y-7,5,2,c.L);R(x-6,y-6,1,1,c.L);R(x-4,y-7,3,1,c.LL);
  R(x+2,y-10,5,2,c.L);R(x+7,y-11,1,1,c.L);R(x+3,y-10,3,1,c.LL);
  if(st>=3){R(x-5,y-15,5,2,c.L);R(x-4,y-15,3,1,c.LL);}
  if(st===2){disc(x,y-h,2,c.LL);return;}
  const Y=c.fl('#f8cd3a'),YD=c.fl('#e0a020'),BR=c.fl('#6b3f1f');
  if(st===3){const hx=x+c.dr,hy=y-h-1+c.dr;disc(hx,hy,3,c.L);[[-1,-4],[1,-4],[-4,0],[4,0],[0,4]].forEach(([a,b])=>R(hx+a,hy+b,1,1,Y));return;}
  [[-1,-15],[-2,-16],[-3,-17],[-4,-18]].forEach(([a,b])=>R(x+a,y+b,1,1,c.LD));
  const sx=x-7,sy=y-21+c.dr;disc(sx,sy,4,YD);disc(sx,sy,3,Y);disc(sx,sy,1,BR);
  const hx=x+c.dr*2+c.sw,hy=y-h-3+c.dr*2;
  disc(hx,hy,7,YD);disc(hx,hy,6,Y);
  for(let k=0;k<8;k++){const a=k/8*Math.PI*2;R(Math.round(hx+Math.cos(a)*5),Math.round(hy+Math.sin(a)*5),1,1,c.fl('#ffe27a'));}
  disc(hx,hy,3,BR);R(hx-1,hy-1,1,1,c.fl('#8b5a32'));R(hx+1,hy,1,1,'#4a2a14');R(hx-1,hy+1,1,1,'#4a2a14');R(hx+1,hy+2,1,1,'#4a2a14');
}
function pLantern(x,y,st,c){
  const h=st===2?11:st===3?16:20, lit=st===4;
  const pod=lit?[c.fl('#f0862a'),c.fl('#ffc06a'),c.fl('#c4561c')]:[c.L,c.LL,c.LD];
  const lan=(cx,cy)=>{
    if(lit&&c.w>=35){X.globalAlpha=.16+.08*Math.sin(c.t*2+cx);disc(cx,cy+2,5,'#ffd27a');X.globalAlpha=1;}
    R(cx,cy-1,1,1,c.LD);R(cx-1,cy,3,1,pod[0]);R(cx-2,cy+1,5,2,pod[0]);R(cx-1,cy+3,3,1,pod[0]);R(cx,cy+4,1,1,pod[2]);R(cx,cy+1,1,2,pod[2]);R(cx-1,cy+1,1,1,pod[1]);
  };
  R(x,y-h,1,h,c.LD);disc(x-3,y-6,2,c.L);R(x-3,y-7,1,1,c.LL);disc(x+3,y-8,2,c.L);R(x+3,y-9,1,1,c.LL);
  if(st===2){disc(x,y-h,2,c.LL);disc(x-2,y-h+3,1,c.L);return;}
  const dy=c.dr;
  R(x+1,y-h+2,4,1,c.LD);R(x+5,y-h+3,1,1,c.LD);R(x-4,y-h+5,4,1,c.LD);R(x-5,y-h+6,1,1,c.LD);
  disc(x,y-h,2,c.L);R(x-1,y-h-1,1,1,c.LL);disc(x+3,y-h+1,1,c.LL);disc(x-3,y-h+4,1,c.L);
  lan(x+5,y-h+5+dy);lan(x-5,y-h+8+dy);
  if(st===4){R(x+1,y-h+9,3,1,c.LD);R(x+4,y-h+10,1,1,c.LD);lan(x+4,y-h+12+dy);R(x-1,y-h-2,1,1,c.LD);R(x-2,y-h-3,1,1,c.LD);}
}
function pPlum(x,y,st,c){
  const B='#4a2e24',BL='#6b4434',pk=c.fl('#f49ab8'),pkL=c.fl('#ffd3e0'),pkD=c.fl('#c9557e');
  if(st===2){R(x,y-12,1,12,B);R(x+1,y-9,2,1,B);R(x+3,y-10,1,1,B);R(x-2,y-6,2,1,B);R(x-3,y-7,1,1,B);[[3,-11],[-3,-8],[0,-13]].forEach(([a,b])=>R(x+a,y+b,1,1,pkD));return;}
  R(x-1,y-14,3,14,B);R(x+1,y-14,1,14,BL);R(x-2,y-1,5,1,B);
  [[-2,-14],[-3,-15],[-4,-16],[-5,-17]].forEach(([a,b])=>R(x+a,y+b,1,1,B));R(x-6,y-21,1,4,B);R(x-8,y-19,2,1,B);
  [[2,-16],[3,-17],[4,-18],[5,-19]].forEach(([a,b])=>R(x+a,y+b,1,1,B));R(x+6,y-23,1,4,B);R(x+7,y-21,2,1,B);
  R(x,y-22,1,8,B);R(x+1,y-25,1,3,B);R(x-1,y-24,1,2,B);
  const pts=[[-6,-22],[-8,-19],[-4,-17],[6,-24],[8,-21],[4,-19],[1,-26],[0,-21],[-2,-25],[3,-14],[-3,-12],[-7,-15],[9,-18]];
  if(st===3){pts.forEach(([a,b],i)=>{if(i%3!==2){R(x+a,y+b,2,1,pkD);R(x+a,y+b-1,1,1,pk);}});return;}
  pts.forEach(([a,b],i)=>{const bx=x+a,by=y+b+(c.dr&&i%3===0?1:0),col=i%3===0?pkL:pk;R(bx-1,by,3,1,col);R(bx,by-1,1,3,col);R(bx,by,1,1,'#fff1b8');});
}
function pTea(x,y,st,c){
  const r=st===2?4:st===3?6:8,cy=y-r+c.dr;
  if(st>=3){disc(x+r-2,cy+2,r-3,c.LD);disc(x-r+2,cy+2,r-3,c.LD);}
  disc(x,cy,r,c.LD);disc(x-1,cy-1,r-1,c.L);disc(x-2,cy-2,Math.max(1,r-4),c.LL);
  if(st>=3){disc(x+r-3,cy+1,r-4,c.L);disc(x-r+2,cy+1,r-4,c.L);}
  [[2,1],[-3,2],[4,-3],[-1,-4],[1,3]].forEach(([a,b])=>{if(Math.abs(a)<r&&Math.abs(b)<r)R(x+a,cy+b,1,1,c.LD);});
  if(st===4){const wh=c.fl('#ffffff');[[-5,-3],[2,-6],[6,0],[-2,1],[-7,3],[4,4],[0,-2]].forEach(([a,b])=>{const fx=x+a,fy=cy+b;R(fx-1,fy,3,1,wh);R(fx,fy-1,1,3,wh);R(fx,fy,1,1,c.fl('#f2d46b'));});}
}
function pTree(x,y,st,c){
  const T='#7a4a2c',TD='#5a3420';
  if(st===2){R(x,y-10,1,10,T);disc(x,y-13,4,c.LD);disc(x-1,y-14,3,c.L);R(x-2,y-16,2,1,c.LL);return;}
  if(st===3){R(x-1,y-12,2,12,T);R(x,y-12,1,12,TD);disc(x,y-19,7,c.LD);disc(x-1,y-20,6,c.L);disc(x-3,y-23,2,c.LL);return;}
  R(x-2,y-15,4,15,T);R(x+1,y-15,1,15,TD);R(x-3,y-2,1,2,T);R(x+2,y-2,1,2,TD);
  disc(x,y-25,13,c.LD);disc(x-6,y-23,8,c.L);disc(x+6,y-25,8,c.L);disc(x,y-30,9,c.L);disc(x-4,y-31,4,c.LL);disc(x+5,y-28,3,c.LL);disc(x-8,y-24,2,c.LL);
  [[-9,-18],[3,-17],[10,-22],[-3,-22],[6,-33]].forEach(([a,b])=>R(x+a,y+b,1,1,c.LD));
  [[-7,-19],[5,-21],[-2,-27],[8,-30],[-9,-29],[1,-35]].forEach(([a,b])=>{R(x+a,y+b,2,2,c.fl('#e04848'));R(x+a,y+b,1,1,c.fl('#ff9b8f'));});
}
function pBamboo(x,y,st,c){
  const S=mix('#8cbf52','#b3a65c',c.d),SL=mix('#b4dc7a','#cfc283',c.d),SD=mix('#5d8c34','#7d6f3a',c.d);
  const stalk=(sx,h)=>{R(sx,y-h,2,h,S);R(sx,y-h,1,h,SL);for(let k=5;k<h;k+=5)R(sx,y-k,2,1,SD);R(sx,y-h,2,1,SD);};
  const leaf=(lx,ly,dir)=>{for(let i=0;i<4;i++)R(lx+i*dir,ly+Math.floor(i/2)+c.dr,1,1,i<2?c.L:c.LD);R(lx+dir,ly-1+c.dr,1,1,c.LL);};
  if(st===2){stalk(x,12);leaf(x+2,y-12,1);leaf(x-1,y-9,-1);return;}
  if(st===3){stalk(x-1,19);stalk(x+2,13);leaf(x+1,y-19,1);leaf(x-2,y-16,-1);leaf(x+4,y-13,1);leaf(x-2,y-10,-1);return;}
  stalk(x-3,26);stalk(x,21);stalk(x+3,15);
  leaf(x-1,y-26,1);leaf(x-4,y-24,-1);leaf(x+2,y-21,1);leaf(x-4,y-18,-1);leaf(x+5,y-15,1);leaf(x+2,y-11,1);leaf(x-4,y-9,-1);
  R(x-5,y-27,1,1,c.LL);R(x+6,y-17,1,1,c.LL);
}
function pBeet(x,y,st,c){
  const red=c.fl('#a3214a'),redL=c.fl('#d2577a'),redD=c.fl('#6e1230'),stem=c.fl('#c23a5e');
  if(st===2){R(x-1,y-6,1,5,stem);R(x+1,y-7,1,6,stem);disc(x-3,y-8,2,c.L);disc(x+3,y-9,2,c.L);disc(x,y-10,2,c.LL);return;}
  if(st===3){ell(x,y-1,4,2,red);R(x-2,y-2,2,1,redL);R(x-2,y-10,1,8,stem);R(x,y-12,1,10,stem);R(x+2,y-9,1,7,stem);
    disc(x-4,y-12,3,c.L);disc(x+4,y-11,3,c.L);disc(x,y-14,3,c.LL);R(x-4,y-12,1,2,stem);R(x+4,y-11,1,2,stem);return;}
  disc(x,y-4,5,red);disc(x-2,y-6,2,redL);R(x+3,y-5,1,3,redD);R(x,y+1,1,2,redD);
  R(x-3,y-15,1,7,stem);R(x,y-17,1,8,stem);R(x+3,y-14,1,6,stem);
  disc(x-6,y-17,3,c.L);disc(x+6,y-16,3,c.L);disc(x,y-20,3,c.LL);disc(x-2,y-14,2,c.L);disc(x+3,y-12,2,c.LD);
  R(x-6,y-17,1,2,stem);R(x+6,y-16,1,2,stem);R(x,y-20,1,2,stem);
}

/* skill beds */
function drawBed(p,t){
  const [bx,by]=posOf(p),x0=bx-BED_W/2,y0=by-BED_H/2,w=shownWater(p),d=clamp((40-w)/40,0,1),dr=w<35?1:0;
  R(x0-1,y0+2,BED_W+2,BED_H,'#5f9a50');
  R(x0,y0,BED_W,BED_H,'#6a3f27');
  R(x0+1,y0+1,BED_W-2,BED_H-2,mix('#8f5a38','#a8805a',d*.7));
  R(x0+1,y0+1,BED_W-2,1,'#a8714a');
  for(let r=0;r<3;r++)R(x0+2,y0+8+r*9,BED_W-4,1,'#76482d');
  const L=mix('#4f9e3f','#a3954a',d),LD=mix('#2f6f2c','#76662f',d),n=p.progress/100*12;
  for(let k=0;k<12;k++){
    const gi=clamp(n-k,0,1); if(gi<=0)continue;
    const cell=BED_ORDER[k],c=cell%4,r=Math.floor(cell/4);
    drawBloom(p.kind,Math.round(x0+6+c*11.4),y0+8+r*9,gi,L,LD,d,dr,t,k);
  }
  drawWeeds(p,weedsOf(p),1);
}
function drawBloom(kind,cx,cy,gi,L,LD,d,dr,t,k){
  if(gi<.34){R(cx,cy-2,1,2,LD);R(cx-1,cy-2,1,1,L);R(cx+1,cy-3,1,1,L);return;}
  const col=FLOWER_COL[kind]||FLOWER_COL.tulip,fc=c=>mix(c,'#a8937c',d*.75);
  if(gi<.67){R(cx,cy-5,1,5,LD);R(cx-1,cy-3,1,1,L);R(cx+1,cy-4,1,1,L);R(cx,cy-6+dr,1,1,fc(col[2]));return;}
  const hx=cx+(dr&&k%2?1:0),hy=cy-8+dr;
  R(cx,cy-6,1,6,LD);R(cx-1,cy-3,1,2,L);R(cx+1,cy-4,1,2,L);
  const A=fc(col[0]),B=fc(col[1]);
  if(kind==='tulip'){R(hx-1,hy,3,3,A);R(hx-1,hy-1,1,1,A);R(hx+1,hy-1,1,1,A);R(hx,hy+1,1,1,B);}
  else if(kind==='peony'){R(hx-2,hy,5,3,A);R(hx-1,hy-1,3,1,A);R(hx-1,hy+3,3,1,A);R(hx-1,hy+1,3,1,B);R(hx,hy,1,1,B);}
  else if(kind==='daisy'){R(hx-1,hy+1,3,1,A);R(hx,hy,1,3,A);R(hx-2,hy+1,1,1,A);R(hx+2,hy+1,1,1,A);R(hx,hy-1,1,1,A);R(hx,hy+1,1,1,B);}
  else if(kind==='lavender'){R(hx,hy-2,1,6,A);R(hx-1,hy-1,1,1,B);R(hx+1,hy,1,1,B);R(hx-1,hy+1,1,1,A);R(hx+1,hy+2,1,1,B);}
  else if(kind==='cornflower'){R(hx-1,hy,3,2,A);R(hx-2,hy-1,1,1,A);R(hx+2,hy-1,1,1,A);R(hx,hy-1,1,1,A);R(hx,hy,1,1,B);}
  else {R(hx-1,hy,3,3,A);R(hx-2,hy+1,5,1,A);R(hx,hy-1,1,1,A);R(hx,hy+1,1,1,B);}
}

/* neglect: weeds + flies (drawn in world space) */
function drawWeeds(p,n,s){
  if(!n) return;
  const [px,py]=posOf(p), r=rng(hashStr(p.id));
  const W1='#6d7f2c',W2='#8a9a38',WD='#4a5a1c';
  for(let i=0;i<n;i++){
    const a=(i/n)*Math.PI*2+r()*.6, dist=(9+r()*6)*Math.min(s,1.5);
    let wx=Math.round(px+Math.cos(a)*dist), wy=Math.round(py+1+Math.sin(a)*4);
    if(p.bed){wx=Math.round(px-BED_W/2+4+r()*(BED_W-8));wy=Math.round(py-BED_H/2+8+r()*(BED_H-8));}
    const k=i%3;
    if(k===0){ // dandelion
      R(wx-3,wy-1,3,1,W1);R(wx+1,wy-1,3,1,W1);R(wx-2,wy-2,2,1,W2);R(wx+1,wy-2,2,1,W2);R(wx,wy-7,1,6,WD);
      if(i%2){R(wx-1,wy-9,3,2,'#f2c230');R(wx,wy-10,1,1,'#f8dc6a');}else{R(wx-1,wy-10,3,3,'#efe9dc');R(wx,wy-9,1,1,'#c9c1b0');}
    }else if(k===1){ // tall grassy weed
      R(wx,wy-9,1,9,W2);R(wx-1,wy-7,1,7,W1);R(wx+1,wy-8,1,8,WD);R(wx-2,wy-5,1,5,WD);R(wx+2,wy-4,1,4,W1);R(wx-3,wy-2,1,2,W1);
    }else{ // thistle
      R(wx,wy-7,1,7,WD);R(wx-2,wy-4,2,1,W1);R(wx+1,wy-5,2,1,W1);R(wx-3,wy-3,1,1,W2);R(wx+3,wy-6,1,1,W2);
      R(wx-1,wy-9,3,2,'#9c5bb5');R(wx,wy-10,1,1,'#c48ad8');R(wx-1,wy-7,3,1,W2);
    }
  }
}
function drawFlies(p,n,t,s){
  const [px,py]=posOf(p), top=plantTop(p);
  for(let i=0;i<n;i++){
    const a=t*(2.4+i*.7)+i*2.1;
    const fx=Math.round(px+Math.cos(a)*(7+i*2)*Math.min(s,1.4)+Math.sin(t*9+i)*1.5), fy=Math.round(py-Math.max(6,top*.5)+Math.sin(a*1.4+i)*6);
    R(fx,fy,2,1,'#1e1a22');R(fx,fy+1,1,1,'#3b3542');
    if(Math.floor(t*24+i)%2){R(fx-1,fy-1,1,1,'#e6ecf5');R(fx+2,fy-1,1,1,'#e6ecf5');}else{R(fx,fy-1,2,1,'#c9d3e2');}
  }
}
function drawThirst(p,t){
  const w=shownWater(p); if(w>=35) return;
  const [px,py]=posOf(p), x=px, y=Math.round(py-plantTop(p)-11+(Math.sin(t*3+px)>0?0:-1));
  R(x-4,y,9,8,'#2a2430');R(x-3,y-1,7,10,'#2a2430');R(x-3,y,7,8,'#ffffff');R(x-4,y+1,9,6,'#ffffff');
  R(x-1,y+9,2,1,'#2a2430');R(x,y+10,1,1,'#2a2430');R(x-1,y+8,2,1,'#ffffff');
  const dc=w<=0?'#9a8f84':'#4fb3e8';
  R(x,y+1,1,1,dc);R(x-1,y+2,3,2,dc);R(x-2,y+4,5,2,dc);R(x-1,y+6,3,1,dc);R(x-1,y+4,1,1,'#bfe9ff');
}
function drawPlant(p,t){
  drawPlantTile(p,t);
  const s=scaleOf(p),[px,py]=posOf(p);
  g.drawImage(pcv,0,0,64,56,Math.round(px-32*s),Math.round(py-52*s),Math.round(64*s),Math.round(56*s));
  drawWeeds(p,weedsOf(p),s);
}

/* ================= fountain ================= */
function drawPool(t){
  const {x0,x1,y0,y1}=POOL;
  R(x0,y0,x1-x0,y1-y0,'#3f9ad8');R(x0,y0,x1-x0,3,'#2f7fc0');
  for(let y=y0+5;y<y1;y+=6)for(let x=x0+2;x<x1;x+=6)R(x,y,4,1,'#4fb3e8');
  for(let i=0;i<14;i++){const xx=x0+4+((i*37+Math.floor(t*14))%(x1-x0-8)),yy=y0+6+((i*13)%(y1-y0-9));R(xx,yy,3,1,'#9fdcfa');}
  // float ring + duck
  const b=Math.sin(t*2)>0?0:1;
  const fx=x1-18,fy=y0+22,dx=x0+14,dy=y1-10;
  ell(fx,fy+b,6,3,'#e8506c');ell(fx,fy+b,3,1,'#3f9ad8');R(fx-3,fy-2+b,2,1,'#ffffff');R(fx+3,fy+1+b,2,1,'#ffffff');
  R(dx,dy-b,6,3,'#f2c94c');R(dx+5,dy-2-b,3,3,'#f2c94c');R(dx+8,dy-1-b,2,1,'#f0862a');R(dx+6,dy-2-b,1,1,'#2a2430');
  // diving board
  R(BOARD.x0,BOARD.y-2,BOARD.x1-BOARD.x0,3,'#ffffff');R(BOARD.x0,BOARD.y+1,BOARD.x1-BOARD.x0,1,'#9fb3bd');R(BOARD.x1-5,BOARD.y+2,3,6,'#8a8a8a');
}
function drawSwimmer(x,y,look,o){
  const wl=Math.round(y-9+Math.sin(o.t*3)*0.6);
  g.save();g.beginPath();g.rect(x-20,wl-40,40,40);g.clip();
  drawAvatar(g,x,y+2,look,Object.assign({},o,{shadow:false,can:false}));g.restore();
  const k=Math.floor(o.t*4)%2;ell(Math.round(x),wl,9+k,2,'#9fdcfa');ell(Math.round(x),wl,7,1,'#3f9ad8');
  if(o.moving){R(Math.round(x)-9,wl-1-k,2,1,'#ffffff');R(Math.round(x)+8,wl-2+k,2,1,'#ffffff');}
}
function drawFountain(t){
  const x=FOUNT.x,y=FOUNT.y,k=Math.floor(t*10);
  ell(x,y+1,26,10,'#5f9a50');ell(x,y,25,10,'#8f877b');ell(x,y-1,25,9,'#d9d2c6');ell(x,y-1,24,8,'#c8c0b3');
  ell(x,y-2,21,6,'#2f7fc0');ell(x,y-2,20,5,'#4fb3e8');
  for(let i=0;i<6;i++){const a=(t*.6+i/6)*Math.PI*2;R(Math.round(x+Math.cos(a)*14),Math.round(y-2+Math.sin(a)*3.5),2,1,'#9fdcfa');}
  R(x-3,y-15,6,13,'#cfc8bc');R(x-3,y-15,2,13,'#e6e0d6');R(x+2,y-15,1,13,'#a9a195');
  ell(x,y-16,10,3,'#a9a195');ell(x,y-17,10,3,'#e0d9ce');ell(x,y-17,8,2,'#4fb3e8');
  for(let i=0;i<10;i++){if((i+k)%3!==0){R(x-10,y-15+i,1,1,'#7fd0f5');R(x+10,y-15+i,1,1,'#7fd0f5');}}
  for(let i=0;i<7;i++){if((i+k)%3!==1)R(x,y-25+i,1,1,'#bfe9ff');}
  R(x,y-26,1,1,'#ffffff');
}

/* ================= cottage (outside) ================= */
const HC=66, HB=158, HX=60; // house centre, base line, door centre (core coords)
let smokeT=0;
function drawCottage(t){
  const x0=HC-18;
  R(x0-1,HB-1,38,3,'#5f9a50');
  // chimney
  R(x0+25,HB-44,6,10,'#a99a8a');R(x0+24,HB-45,8,2,'#8a7b6c');R(x0+25,HB-43,1,9,'#c4b6a6');
  // walls
  R(x0+2,HB-21,32,21,'#8b6a4a');R(x0+3,HB-21,30,20,'#f4e8cf');R(x0+3,HB-21,30,2,'#e2d2b2');
  R(x0+3,HB-3,30,3,'#c9b48e');for(let i=0;i<30;i+=5)R(x0+3+i,HB-3,1,3,'#b09a74');
  // door
  R(HX-5,HB-14,10,14,'#5a3420');R(HX-4,HB-13,8,13,'#9a6440');R(HX-4,HB-13,8,1,'#7a4a2f');
  R(HX-2,HB-12,1,12,'#7a4a2f');R(HX+1,HB-12,1,12,'#7a4a2f');R(HX+2,HB-7,1,1,'#f2c94c');
  R(HX-6,HB-1,12,1,'#b09a74');
  // window with shutters + flower box
  const nn=skyState().night;R(x0+21,HB-17,10,8,'#ffffff');R(x0+22,HB-16,8,6,mix('#8fc8f0','#ffd27a',nn));R(x0+25,HB-16,2,6,'#ffffff');R(x0+22,HB-14,8,1,'#ffffff');R(x0+23,HB-16,1,1,'#d6efff');
  R(x0+19,HB-17,2,8,'#c0573a');R(x0+31,HB-17,2,8,'#c0573a');R(x0+19,HB-17,2,1,'#d9744c');R(x0+31,HB-17,2,1,'#d9744c');
  R(x0+20,HB-8,12,2,'#7a4a2f');[[21,'#f49ab8'],[24,'#f2c94c'],[27,'#ffffff'],[30,'#f49ab8']].forEach(([a,c])=>{R(x0+a,HB-10,2,2,c);R(x0+a,HB-9,1,1,'#4f9e3f');});
  // little sign with a heart
  R(HX-4,HB-19,8,4,'#7a4a2f');R(HX-3,HB-18,6,2,'#a8714a');R(HX-2,HB-18,1,1,'#e8506c');R(HX,HB-18,1,1,'#e8506c');R(HX-1,HB-17,1,1,'#e8506c');
  // roof
  for(let i=0;i<20;i++){
    const y=HB-40+i, w=Math.round(16+i*.65), x=HC-w;
    R(x,y,w*2,1,i%4===3?'#b5552a':'#dd7a40');
    if(i%4===1)for(let k=x+2;k<HC+w-1;k+=5)R(k,y,1,1,'#c4612f');
  }
  R(HC-16,HB-41,32,1,'#8a3f1e');R(HC-29,HB-21,58,1,'#8a3f1e');
  R(HC-14,HB-37,5,1,'#f0965a');R(HC-17,HB-32,5,1,'#f0965a');
}

