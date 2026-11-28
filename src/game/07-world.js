/* ================= atmosphere ================= */
const sstep=(a,b,x)=>{const k=clamp((x-a)/(b-a),0,1);return k*k*(3-2*k);};
function hourNow(){let h=NaN;try{const o=localStorage.getItem('garden-hour');if(o)h=+o;}catch(e){}if(isNaN(h)){const d=new Date();h=d.getHours()+d.getMinutes()/60;}return h;}
// real sunrise and sunset for the viewer's place and season (dark at 17:00 in a German November)
let sunCache=null;
function sunTimes(){
  const d=new Date(),key=d.toDateString();if(sunCache&&sunCache.k===key)return sunCache;
  let tz='';try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone||'';}catch(e){}
  const y=d.getFullYear(),std=Math.max(new Date(y,0,1).getTimezoneOffset(),new Date(y,6,1).getTimezoneOffset());
  const PL={'Europe/Berlin':[52.5,13.4],'Europe/Vienna':[48.2,16.4],'Europe/Zurich':[47.4,8.5],'Asia/Shanghai':[31.2,121.5],'Asia/Hong_Kong':[22.3,114.2],'Asia/Tokyo':[35.7,139.7],'Europe/London':[51.5,-.1],'America/New_York':[40.7,-74],'America/Los_Angeles':[34,-118.2]};
  const lat=(PL[tz]||[])[0]??(/^Europe\//.test(tz)?50:/^(Asia|America)\//.test(tz)?38:45);
  const lon=(PL[tz]||[])[1]??(/^Europe\/(Berlin|Munich|Vienna)/.test(tz)?10:-std/4);
  const N=Math.floor((d-new Date(y,0,0))/864e5),rad=Math.PI/180;
  const dec=-23.44*Math.cos(2*Math.PI/365*(N+10))*rad,B=2*Math.PI*(N-81)/364;
  const eot=(9.87*Math.sin(2*B)-7.53*Math.cos(B)-1.5*Math.sin(B))/60;
  const c=(Math.sin(-.833*rad)-Math.sin(lat*rad)*Math.sin(dec))/(Math.cos(lat*rad)*Math.cos(dec));
  const w=Math.acos(clamp(c,-1,1))/rad/15, noon=12+(-d.getTimezoneOffset()/4-lon)/15-eot;
  return sunCache={k:key,rise:noon-w,set:noon+w};
}
function skyState(){const h=hourNow(),{rise,set}=sunTimes();
  const night=h<12?1-sstep(rise-1.1,rise+.2,h):sstep(set-.1,set+1.1,h);
  const warm=h<12?sstep(rise-.9,rise,h)*(1-sstep(rise+.4,rise+1.4,h)):sstep(set-1.4,set-.4,h)*(1-sstep(set+.1,set+.8,h));
  return {night,warm};}
function gardenHealthy(gd){const it=gd?gd.projects.concat(gd.skills||[]):[];return it.length>0&&it.every(p=>waterOf(p)>=60);}
function weather(t){
  const k=wxKind(WX.c),c=(t+140)%150,healthy=gardenHealthy(V()),bow=sstep(34,38,c)*(1-sstep(54,60,c));
  if(!k) return healthy?{rain:sstep(0,3,c)*(1-sstep(32,35,c)),rainbow:bow,snow:0,fog:0,grey:0,storm:0}:{rain:0,rainbow:0,snow:0,fog:0,grey:0,storm:0};
  const rain=(k==='rain'||k==='storm')?wxRainAmt(WX.c):0,snow=k==='snow'?1:0;
  return {rain,snow,rainbow:healthy&&!rain&&!snow&&k!=='fog'?bow:0,fog:k==='fog'?1:0,grey:k==='cloud'||rain||snow?1:0,storm:k==='storm'?1:0};
}
function drawRainbow(t,night){
  const wx=weather(t); if(wx.rainbow<=0||night>.5) return;
  const cx=OX+CW*.72, cy=OY+122-camR, cols=['#ff6a6a','#ffaa4a','#ffe45a','#6fd86a','#5aa8ff','#9a7aff'];
  g.globalAlpha=wx.rainbow*.5*(1-night*2);
  for(let b=0;b<6;b++){const r=74-b*2;for(let a=Math.PI;a<=2*Math.PI;a+=.8/r)R(Math.round(cx+Math.cos(a)*r),Math.round(cy+Math.sin(a)*r*.7),1,2,cols[b]);}
  g.globalAlpha=1;
}
function drawAtmosphere(t){
  const {night,warm}=skyState(), wx=weather(t);
  wxTint(t,wx);
  if(wx.rain>0){g.globalCompositeOperation='multiply';g.globalAlpha=wx.rain*.32;g.fillStyle='#8f9cbc';g.fillRect(0,0,W,H);}
  if(night>0){g.globalCompositeOperation='multiply';g.globalAlpha=night*.78;g.fillStyle='#3a4590';g.fillRect(0,0,W,H);}
  g.globalCompositeOperation='source-over';
  if(warm>0){g.globalAlpha=warm*.06;g.fillStyle='#ff9466';g.fillRect(0,0,W,H);}
  g.globalAlpha=1;
  if(night>.15){
    const skyB=OY+86-camR;
    if(skyB>4){
      for(let i=0;i<W/3;i++){const x=(i*73+11)%W,y=(i*131+7)%Math.max(8,Math.floor(skyB));if((i+Math.floor(t*1.5))%9===0)continue;g.globalAlpha=night*(i%3?.6:1);R(x,y,1,1,'#ffffff');}
      g.globalAlpha=night;const mx=Math.round(W*.83),my=Math.round(clamp(OY*.35+26-camR,9,skyB-14));
      if(my>-8)drawMoon(mx,my,6);
      g.globalAlpha=1;
    }
    // warm light from the cottage window
    g.globalCompositeOperation='lighter';g.globalAlpha=night*.5;
    const wxp=OX+HC+8,wyp=OY+HB-13-camR;disc(wxp,wyp,9,'#3a2a08');disc(wxp,wyp,5,'#7a5a14');
    g.globalCompositeOperation='source-over';g.globalAlpha=1;
  }
  wxParticles(t,wx,OY+142-camR);wxOver(t,wx);
}

/* ================= real weather (shown only as rain, snow and sky, no place or temperature), the real moon ================= */
const WX={c:-1,temp:null,at:0};
function wxKind(c){if(typeof c!=='number'||c<0)return '';if([71,73,75,77,85,86].includes(c))return 'snow';if(c>=95)return 'storm';if((c>=51&&c<=67)||(c>=80&&c<=82))return 'rain';if(c===45||c===48)return 'fog';if(c===3)return 'cloud';return 'clear';}
function wxRainAmt(c){return (c>=51&&c<=57)?.45:(c===61||c===80)?.7:1;}
function applyWx(o){if(!o||typeof o.c!=='number')return;WX.c=o.c;WX.temp=typeof o.t==='number'?o.t:null;WX.at=o.at||Date.now();}
async function loadWx(){
  try{const f=localStorage.getItem('garden-wx-test');if(f){applyWx(JSON.parse(f));return;}}catch(e){}
  let old=null;try{old=JSON.parse(localStorage.getItem('garden-wx')||'null');}catch(e){}
  if(old){applyWx(old);if(Date.now()-old.at<15*60e3)return;}
  try{const ctl=new AbortController();setTimeout(()=>ctl.abort(),8000);
    const r=await fetch('https://api.open-meteo.com/v1/forecast?latitude=48.14&longitude=11.58&current=temperature_2m,weather_code&timezone=Europe%2FBerlin',{signal:ctl.signal});
    const j=await r.json(),cur=j&&j.current;if(!cur||typeof cur.weather_code!=='number')return;
    const o={c:cur.weather_code,t:typeof cur.temperature_2m==='number'?cur.temperature_2m:null,at:Date.now()};applyWx(o);
    try{localStorage.setItem('garden-wx',JSON.stringify(o));}catch(e){}
  }catch(e){}
}
loadWx();setInterval(()=>{if(!document.hidden)loadWx();},15*60e3);
// 0 = new moon, .5 = full moon
function moonPhase(){let f=NaN;try{const o=localStorage.getItem('garden-moon');if(o)f=+o;}catch(e){}if(!isNaN(f))return f;
  const p=(Date.now()-Date.UTC(2000,0,6,18,14))/864e5/29.530588853;return p-Math.floor(p);}
function drawMoon(mx,my,r){
  const p=moonPhase(),k=Math.cos(2*Math.PI*(p<.5?p:p-.5)),cr=[[-2,-1],[-1,-1],[-2,0],[-1,0],[2,2],[3,2],[1,-3]];
  for(let dy=-r;dy<=r;dy++){const hw=Math.sqrt(Math.max(0,r*r-dy*dy+r*.6)),w=Math.round(hw);
    for(let dx=-w;dx<=w;dx++){const xn=hw?dx/hw:0,lit=p<.5?xn>k:xn<k;
      if(lit){R(mx+dx,my+dy,1,1,cr.some(c=>c[0]===dx&&c[1]===dy)?'#e9dcae':'#fff3c8');}
      else{const a=X.globalAlpha;X.globalAlpha=a*.28;R(mx+dx,my+dy,1,1,'#aab4d8');X.globalAlpha=a;}}}
}
// falling rain or snow over the whole screen (garden and island share it)
function wxParticles(t,wx,groundY){
  if(wx.rain>0){
    g.globalAlpha=wx.rain*.65;const n=Math.floor(W*H/300*Math.max(.5,wx.rain));
    for(let i=0;i<n;i++){const y=Math.floor((i*97.3+t*230+i*i*.37)%(H+12))-6,x=Math.floor((i*53.7+t*20+y*.25)%(W+20))-10;R(x,y,1,3,'#dcefff');}
    for(let k=0;k<10;k++){const x=Math.floor(Math.random()*W),y=Math.floor(groundY+Math.random()*(H-groundY));if(y>0)R(x,y,2,1,'#e6f4ff');}
    g.globalAlpha=1;
  }
  if(wx.snow>0){
    const n=Math.floor(W*H/380);
    for(let i=0;i<n;i++){const sp=10+(i%5)*4,y=Math.floor((i*91.7+t*sp)%(H+8))-4,x=Math.floor((i*57.3+Math.sin(t*.9+i)*5+t*4)%(W+10))-5;
      g.globalAlpha=i%3?.75:.95;R(x,y,i%4?1:2,i%4?1:2,'#ffffff');}
    g.globalAlpha=1;
  }
}
function wxTint(t,wx){
  if(wx.grey>0){g.globalCompositeOperation='multiply';g.globalAlpha=.16;g.fillStyle='#b6bccb';g.fillRect(0,0,W,H);g.globalCompositeOperation='source-over';g.globalAlpha=1;}
  if(wx.snow>0){g.globalCompositeOperation='multiply';g.globalAlpha=.12;g.fillStyle='#c6cfe0';g.fillRect(0,0,W,H);g.globalCompositeOperation='source-over';g.globalAlpha=1;}
}
function wxOver(t,wx){
  if(wx.fog>0){g.globalAlpha=.26;g.fillStyle='#e9eef2';g.fillRect(0,0,W,H);g.globalAlpha=.12;for(let y=0;y<H;y+=14){const o=Math.round(Math.sin(t*.2+y)*20);g.fillRect(o-20,y,W+40,5);}g.globalAlpha=1;}
  if(wx.storm>0){const f=t%11;if(f<.1||(f>.22&&f<.28)){g.globalAlpha=.32;g.fillStyle='#ffffff';g.fillRect(0,0,W,H);g.globalAlpha=1;}}
}

/* ================= who is online, everywhere ================= */
function allPeers(){if(!room)return [];try{return room.peers();}catch(e){return [];}}
function globalOnline(){return roomLive()?allPeers().length:0;}
function keyOf(id){return 'g-'+hashStr(id).toString(36);}
function peopleAt(key){return allPeers().filter(p=>!p.isMe&&p.presence&&p.presence.g===key);}

/* ================= the community island: everyone leaves one small thing ================= */
const IW=232,IH=200,ISL={cx:116,cy:92,rx:98,ry:62},JET={x0:108,x1:124,y0:146,y1:196},LH={x:188,y:58};
let IX=0,IY=0,isleItems=[],isleMine=[],isleLoaded=0,isleBusy=false,isleSig='',isleBg=null,isleT=0;
const ISLE_K=[['flower','Blume'],['tulip','Tulpe'],['stone','Steine'],['lantern','Laterne'],['shell','Muschel'],['mushroom','Pilz']];
const ISLE_DAY=3;
function isleOrigin(){IX=Math.floor((W-IW)/2);IY=Math.max(46,Math.floor((H-IH)/2));}
function isleShape(x,y,f){const dx=x-ISL.cx,dy=y-ISL.cy,a=Math.atan2(dy/ISL.ry,dx/ISL.rx),m=1+.06*Math.sin(3*a+1)+.04*Math.sin(5*a+2);const ex=dx/(ISL.rx*f*m),ey=dy/(ISL.ry*f*m);return ex*ex+ey*ey<1;}
function onJetty(x,y){return x>JET.x0+1&&x<JET.x1-1&&y>JET.y0-4&&y<JET.y1;}
function isleBlocked(x,y){
  if(Math.abs(x-LH.x)<9&&y>LH.y-4&&y<LH.y+5)return true;
  return !(isleShape(x,y,.96)||onJetty(x,y));
}
function isleFree(x,y){
  if(!isleShape(x,y,.9)||onJetty(x,y+6)||Math.abs(x-LH.x)<12&&Math.abs(y-LH.y)<10)return false;
  return !isleItems.some(it=>Math.abs(it.x-x)<6&&Math.abs(it.y-y)<5);
}
function cleanIsle(it,n,mine){if(!it||typeof it!=='object')return null;const k=ISLE_K.some(q=>q[0]===it.k)?it.k:null;if(!k)return null;
  const x=Math.round(num(it.x,-1)),y=Math.round(num(it.y,-1));if(!isleShape(x,y,.95))return null;
  return {k,x,y,t:num(it.t,0),n:str(it.n,14)||n||'Jemand',c:Math.abs(Math.round(num(it.c,0)))%4,mine:!!mine};}
async function loadIsle(){
  if(isleBusy||!window.__isle)return;isleBusy=true;
  try{const rows=await window.__isle.load();if(Array.isArray(rows)){const out=[],mine=[];
      rows.forEach(r=>{(Array.isArray(r.list)?r.list:[]).slice(-60).forEach(x=>{const c=cleanIsle(x,'',r.me);if(c){out.push(c);if(r.me)mine.push(c);}});});
      isleItems=out.sort((a,b)=>a.t-b.t);isleMine=mine;isleLoaded=Date.now();isleHudTxt();if(mapM.classList.contains('show'))renderMap();}}
  catch(e){}
  isleBusy=false;
}
function isleToday(){const d=new Date().toDateString();return isleMine.filter(i=>new Date(i.t).toDateString()===d).length;}
function isleLeft(){return Math.max(0,ISLE_DAY-isleToday());}
function isleSpot(){
  const d=av.dir||1;for(const [ox,oy] of [[d*8,0],[-d*8,0],[0,7],[0,-7],[d*7,6],[-d*7,6]]){const x=Math.round(av.x+ox),y=Math.round(av.y+oy);if(isleFree(x,y))return [x,y];}
  return null;
}
async function isleDrop(k){
  isleM.classList.remove('show');
  if(!myId||!window.__isle){toast('Melde dich an, dann kannst du etwas hinlegen.',2600);return;}
  if(!isleLeft()){toast('Für heute hast du genug hingelegt. Morgen wieder.',2600);return;}
  const sp=isleSpot();if(!sp){toast('Hier ist kein Platz. Geh ein Stück weiter.',2400);return;}
  const it={k,x:sp[0],y:sp[1],t:Date.now(),n:(me().name||'Jemand').slice(0,14),c:Math.floor(Math.random()*4)};
  const c=cleanIsle(it,'',true);if(!c)return;
  isleItems.push(c);isleMine.push(c);isleHudTxt();
  for(let i=0;i<8;i++)spawn({kind:'spark',x:c.x+(Math.random()*10-5),y:c.y-2-Math.random()*6,vy:-8-Math.random()*6,life:.6});
  try{Sfx.grow();}catch(e){}
  const ok=await window.__isle.save(isleMine.slice(-60).map(i=>({k:i.k,x:i.x,y:i.y,t:i.t,n:i.n,c:i.c})));
  if(!ok){toast('Konnte nicht speichern. Prüf deine Verbindung.',3000);isleItems=isleItems.filter(i=>i!==c);isleMine=isleMine.filter(i=>i!==c);isleHudTxt();return;}
  syncRoom();
}
function enterIsland(){
  if(!started)return;hideHomeHint(false);
  if(scene==='house')exitHouse();
  if(mySeat!==null)standUp();
  if(riding)dismount();riding=false;pendRide=false;slide=null;pendSlide=false;av.swim=false;av.jump=null;if(moving)endMove();
  scene='island';isleOrigin();try{Sfx.door(.5);}catch(e){}
  av.x=116;av.y=188;av.back=true;av.target={x:116,y:150};av.water=0;
  closePanel();editing=false;
  worldEl.style.visibility='hidden';bJump.hidden=true;setPrompt(null);isleHud.hidden=false;
  cat.x=av.x+12;cat.y=av.y;syncRoom();if(Date.now()-isleLoaded>4000)loadIsle();isleHudTxt();
}
function exitIsland(){
  scene='garden';worldEl.style.visibility='';isleHud.hidden=true;isleM.classList.remove('show');
  av.x=120;av.y=216;av.back=false;av.target=null;camY=clamp(av.y+OY-H*.55,0,Math.max(0,TH-H));camR=-1;setPrompt(null);
  cat.x=av.x+14;cat.y=av.y+4;syncRoom();rebuildLabels();refreshChrome();
}
function isleNearExit(){return onJetty(av.x,av.y)&&av.y>180;}
function isleUpdate(dt,t){
  if(av.y>JET.y1-3&&onJetty(av.x,av.y-2)){exitIsland();return;}
  const canDrop=!av.moving&&!av.target&&isleShape(av.x,av.y,.96)&&!!isleSpot()&&isleLeft()>0&&!!myId;
  if(isleNearExit())setPrompt('Zurück zum Garten','↓');else if(canDrop)setPrompt('Etwas hinlegen','E');else setPrompt(null);
  // someone placed something: fetch the new state right away; otherwise look again every 20 s
  let sig='';roomPeers().forEach(p=>{if(!p.isMe&&p.presence&&p.presence.s==='i')sig+=p.peer+':'+(p.presence.il||0)+',';});
  if(sig!==isleSig){const grew=isleSig&&sig.length>=isleSig.length;isleSig=sig;if(grew)loadIsle();}
  isleT+=dt;if(isleT>20){isleT=0;loadIsle();}
}
function islePointer(lx,ly){
  const it=isleItems.slice().reverse().find(i=>Math.abs(i.x-lx)<6&&ly>i.y-10&&ly<i.y+3);
  if(it){const nm=(ISLE_K.find(q=>q[0]===it.k)||['',''])[1],d=new Date(it.t);toast(nm+' von '+(it.mine?'dir':it.n)+', '+d.getDate()+'.'+(d.getMonth()+1)+'.',2600);return;}
  if(onJetty(lx,ly)&&ly>176){av.target={x:116,y:JET.y1};return;}
  let tx=lx,ty=ly;if(isleBlocked(tx,ty)){for(let k=1;k<=12;k++){const x=ISL.cx+(lx-ISL.cx)*(1-k/14),y=ISL.cy+(ly-ISL.cy)*(1-k/14);if(!isleBlocked(x,y)){tx=x;ty=y;break;}}}
  av.target={x:tx,y:ty};
}
function isleAct(){if(isleNearExit()){av.target={x:116,y:JET.y1};return;}openIslePick();}
// small pixel things; also drawn big as icons in the picker
const ISLE_COL=[['#e8506c','#ffb3c4'],['#f2c94c','#fff0a8'],['#ffffff','#f4e9ff'],['#7f8cff','#c8cfff']];
function drawIsleThing(k,x,y,c,t,night){
  const [a,b]=ISLE_COL[c||0];
  if(k==='flower'){R(x,y-5,1,5,'#4f9e3f');R(x+1,y-3,1,1,'#6fc25a');R(x-1,y-8,3,1,a);R(x-1,y-6,3,1,a);R(x-2,y-7,1,1,a);R(x+2,y-7,1,1,a);R(x,y-7,1,1,'#f2c94c');}
  else if(k==='tulip'){R(x,y-5,1,5,'#4f9e3f');R(x-1,y-3,1,2,'#6fc25a');R(x-1,y-8,3,3,a);R(x-1,y-9,1,1,a);R(x+1,y-9,1,1,a);R(x,y-8,1,1,b);}
  else if(k==='stone'){R(x-3,y-2,6,2,'#8f939c');R(x-2,y-3,4,1,'#a7abb3');R(x-1,y-5,3,2,'#b9bdc4');R(x,y-6,1,1,'#cfd2d8');R(x-3,y-1,6,1,'#6f737c');}
  else if(k==='lantern'){R(x,y-7,1,7,'#5a4636');R(x-2,y-11,5,1,'#3a2f38');R(x-2,y-10,1,3,'#3a2f38');R(x+2,y-10,1,3,'#3a2f38');R(x-1,y-10,3,3,night>.15?'#ffe08a':'#f6d77a');R(x-1,y-7,3,1,'#3a2f38');
    if(night>.15){g.globalCompositeOperation='lighter';g.globalAlpha=night*.55*(.85+.15*Math.sin(t*3+x));disc(x,y-9,6,'#3a2a08');disc(x,y-9,3,'#7a5a14');g.globalCompositeOperation='source-over';g.globalAlpha=1;}}
  else if(k==='shell'){R(x-2,y-2,5,2,'#f6d3c4');R(x-1,y-3,3,1,'#f9e2d8');R(x-2,y-1,5,1,'#e0a994');R(x-1,y-3,1,2,'#e0a994');R(x+1,y-3,1,2,'#e0a994');}
  else if(k==='mushroom'){R(x,y-3,2,3,'#f4ead8');R(x-2,y-5,6,2,'#d84a4a');R(x-1,y-6,4,1,'#d84a4a');R(x-1,y-5,1,1,'#ffffff');R(x+2,y-6,1,1,'#ffffff');}
}
function buildIsleBg(){
  isleBg=document.createElement('canvas');isleBg.width=IW;isleBg.height=IH;const c=isleBg.getContext('2d'),keep=X;X=c;const r=rng(31);
  for(let y=0;y<IH;y++)for(let x=0;x<IW;x++){
    if(isleShape(x,y,1)){R(x,y,1,1,'#86c96f');}
    else if(isleShape(x,y,1.1)){R(x,y,1,1,isleShape(x,y-2,1)?'#6fb35c':'#f0d8a0');}
    else if(isleShape(x,y,1.2)){R(x,y,1,1,'#7cc4ea');}
  }
  for(let i=0;i<260;i++){const x=Math.floor(r()*IW),y=Math.floor(r()*IH);if(isleShape(x,y,.97)&&isleShape(x+2,y,.97)){R(x,y,1,2,'#73b85e');R(x+2,y,1,2,'#73b85e');R(x+1,y+1,1,1,'#73b85e');}}
  for(let i=0;i<70;i++){const x=Math.floor(r()*IW),y=Math.floor(r()*IH);if(!isleShape(x,y,1.01)&&isleShape(x,y,1.09))R(x,y,1,1,'#e2c588');}
  // jetty
  R(JET.x0,JET.y0,JET.x1-JET.x0,JET.y1-JET.y0,'#b98a5a');for(let y=JET.y0+3;y<JET.y1;y+=4)R(JET.x0,y,JET.x1-JET.x0,1,'#93673f');
  R(JET.x0-1,JET.y0,1,JET.y1-JET.y0,'#7a5434');R(JET.x1,JET.y0,1,JET.y1-JET.y0,'#7a5434');
  [[JET.x0-2,JET.y1-6],[JET.x1,JET.y1-6],[JET.x0-2,JET.y0+18],[JET.x1,JET.y0+18]].forEach(([x,y])=>{R(x,y,3,6,'#6b4a2e');R(x,y,3,1,'#8f6a46');});
  // lighthouse, top right
  const lx=LH.x,ly=LH.y;R(lx-6,ly-1,13,3,'#9aa0a8');R(lx-5,ly-24,11,23,'#fdfaf2');
  for(let y=ly-21;y<ly-1;y+=8)R(lx-5,y,11,4,'#e8506c');R(lx+3,ly-24,2,23,'rgba(0,0,0,.12)');
  R(lx-6,ly-28,13,4,'#3a2f38');R(lx-4,ly-27,9,2,'#ffe08a');R(lx-5,ly-31,11,3,'#e8506c');R(lx-3,ly-33,7,2,'#e8506c');R(lx,ly-35,1,2,'#3a2f38');
  R(lx-1,ly-9,3,5,'#5a4636');
  X=keep;
}
function renderIsland(t){
  isleOrigin();if(!isleBg)buildIsleBg();
  const {night}=skyState(),wx=weather(t);
  g.fillStyle='#4b9bd6';g.fillRect(0,0,W,H);
  for(let i=0;i<Math.floor(W*H/450);i++){const x=Math.floor((i*61.3+t*(3+i%3))%(W+8))-4,y=Math.floor((i*37.9)%H),ph=Math.sin(t*1.3+i);if(ph>.2)R(x,y,3,1,'#6fb5e6');}
  g.save();g.translate(IX,IY);
  g.drawImage(isleBg,0,0);
  for(let i=0;i<40;i++){const a=i/40*6.283+t*.05,f=1.105+.012*Math.sin(t*1.7+i*2.1);
    const dx=Math.cos(a)*ISL.rx*f,dy=Math.sin(a)*ISL.ry*f;let fx=ISL.cx+dx,fy=ISL.cy+dy;
    const m=1+.06*Math.sin(3*a+1)+.04*Math.sin(5*a+2);fx=ISL.cx+dx*m;fy=ISL.cy+dy*m;if(!onJetty(fx,fy))R(Math.round(fx),Math.round(fy),2,1,'#eaf6ff');}
  if(av.target){const tx=Math.round(av.target.x),ty=Math.round(av.target.y);R(tx-2,ty,1,1,'#fff');R(tx+2,ty,1,1,'#fff');R(tx,ty-1,1,1,'#fff');R(tx,ty+1,1,1,'#fff');}
  const list=isleItems.map(it=>({y:it.y,d:()=>drawIsleThing(it.k,it.x,it.y,it.c,t,night)}));
  list.push({y:av.y,d:()=>{const rn=av.run&&av.moving,fr=av.moving?(rn?[1,2][Math.floor(t*10)%2]:[1,0,2,0][Math.floor(t*8)%4]):0;drawAvatar(g,av.x,av.y,me().look,{run:rn,frame:fr,back:av.back,blink:(t%4)<.12,t});}});
  livePeers().filter(p=>p.scene==='island').forEach(p=>list.push({y:p.y,d:()=>drawAvatar(g,p.x,p.y,p.look,{run:p.run&&p.moving,frame:p.moving?(p.run?[1,2][Math.floor(t*10)%2]:[1,0,2,0][Math.floor(t*8+p.x)%4]):0,back:p.back,blink:((t+p.x)%4)<.12,t})}));
  list.sort((a,b)=>a.y-b.y).forEach(o=>o.d());
  parts.forEach(q=>{if(q.kind==='spark'){const x=Math.round(q.x),y=Math.round(q.y);g.globalAlpha=1-q.age/q.life;R(x,y-1,1,3,'#fff6b0');R(x-1,y,3,1,'#fff6b0');g.globalAlpha=1;}});
  g.restore();
  wxTint(t,wx);
  if(wx.rain>0){g.globalCompositeOperation='multiply';g.globalAlpha=wx.rain*.28;g.fillStyle='#8f9cbc';g.fillRect(0,0,W,H);g.globalCompositeOperation='source-over';g.globalAlpha=1;}
  if(night>0){g.globalCompositeOperation='multiply';g.globalAlpha=night*.72;g.fillStyle='#3a4590';g.fillRect(0,0,W,H);g.globalCompositeOperation='source-over';g.globalAlpha=1;
    if(night>.15){g.globalCompositeOperation='lighter';
      isleItems.forEach(it=>{if(it.k==='lantern'){g.globalAlpha=night*.5;disc(IX+it.x,IY+it.y-9,6,'#3a2a08');disc(IX+it.x,IY+it.y-9,3,'#7a5a14');}});
      const bx=IX+LH.x,by=IY+LH.y-26,sw=Math.sin(t*.9);g.globalAlpha=night*.35;for(let i=1;i<26;i++)R(Math.round(bx+sw*i*2.2),by+Math.round(i*.15),2,1,'#ffe9a8');
      g.globalAlpha=night*.6;disc(bx,by,5,'#3a2a08');g.globalCompositeOperation='source-over';g.globalAlpha=1;
      isleItems.forEach(it=>{if(it.k==='lantern')R(IX+it.x-1,IY+it.y-10,3,3,'#ffe08a');});R(IX+LH.x-4,IY+LH.y-27,9,2,'#ffe08a');}}
  wxParticles(t,wx,IY+30);wxOver(t,wx);
  placeTags(livePeers().filter(p=>p.scene==='island'),(x,y)=>[(IX+x)*S,(IY+y)*S]);
  {const ty=Math.round((IY+20)*S)+'px';if(isleHud.style.top!==ty)isleHud.style.top=ty;}
}
function islandSparkTick(dt){parts.forEach(q=>{if(q.kind==='spark'){q.age+=dt;q.y+=q.vy*dt;}});parts=parts.filter(q=>q.age<q.life);}

/* counter on the island */
const isleHud=document.createElement('div');isleHud.id='isleHud';isleHud.hidden=true;isleHud.innerHTML='<div class="ih1">Gemeinschafts-Insel</div><div class="ih2" id="isleN"></div>';document.body.appendChild(isleHud);
function isleHudTxt(){const el=document.getElementById('isleN');if(!el)return;const n=isleItems.length;el.textContent=n===1?'1 Beitrag':n?n+' Beiträge':isleLoaded?'Noch keine Beiträge':'';}

/* picker: what to leave here */
const isleM=document.createElement('div');isleM.className='modal';isleM.id='isleM';
isleM.innerHTML='<div class="panel ipanel"><div class="askt">Was legst du hier hin?</div><div class="ipick" id="iPick"></div><p class="ileft" id="iLeft"></p><button class="gclose" id="iNo" type="button">Abbrechen</button></div>';
document.body.appendChild(isleM);
(function(){const box=isleM.querySelector('#iPick');ISLE_K.forEach(([k,l],i)=>{const b=document.createElement('button');b.type='button';b.dataset.k=k;
  const c=document.createElement('canvas');c.width=16;c.height=14;const keep=X;X=c.getContext('2d');drawIsleThing(k,8,13,i%4===0?0:i%4,0,0);X=keep;
  const s=document.createElement('span');s.textContent=l;b.appendChild(c);b.appendChild(s);b.onclick=()=>isleDrop(k);box.appendChild(b);});})();
isleM.querySelector('#iNo').onclick=()=>isleM.classList.remove('show');
let isleOpenT=0;
isleM.addEventListener('click',e=>{if(e.target===isleM&&performance.now()-isleOpenT>600)isleM.classList.remove('show');});
function openIslePick(){
  if(!myId){toast('Melde dich an, dann kannst du etwas hinlegen.',2600);return;}
  const left=isleLeft();if(!left){toast('Für heute hast du genug hingelegt. Morgen wieder.',2600);return;}
  if(!isleSpot()){toast('Hier ist kein Platz. Geh ein Stück weiter.',2400);return;}
  document.getElementById('iLeft').textContent=left===1?'Heute geht noch eins.':'Heute gehen noch '+left+'.';
  isleOpenT=performance.now();isleM.classList.add('show');
}

/* ================= the map: every garden as a small island ================= */
const mapM=document.createElement('div');mapM.className='modal';mapM.id='mapM';
mapM.innerHTML='<div class="panel mapp"><div class="maph"><h2>Map</h2><span class="mapon" id="mapOn"></span><button class="btn" id="mapClose" type="button" aria-label="Close">×</button></div><div class="sea" id="mapSea"></div></div>';
document.body.appendChild(mapM);
mapM.querySelector('#mapClose').onclick=()=>mapM.classList.remove('show');
mapM.addEventListener('click',e=>{if(e.target===mapM)mapM.classList.remove('show');});
let mapTimer=null;
function openMap(){mapM.classList.add('show');renderMap();if(Date.now()-isleLoaded>30000)loadIsle();clearInterval(mapTimer);mapTimer=setInterval(()=>{if(!mapM.classList.contains('show')){clearInterval(mapTimer);return;}renderMap(true);},2000);}
function mapGardens(){const fr=(home&&home.fr)||[];
  const all=myId&&home&&!gardensList.some(gd=>gd.id===myId)?gardensList.concat([{id:myId,data:home}]):gardensList;
  return all.filter(gd=>gd.id===myId||gd.data.owner||gd.data.listed||fr.includes(gd.id)||(visiting&&visiting.id===gd.id))
    .sort((a,b)=>(b.data.owner-a.data.owner)||((b.id===myId)-(a.id===myId))||a.data.name.localeCompare(b.data.name));}
function islandSprite(gd,big){
  const w=big?64:44,h=big?40:30,c=document.createElement('canvas');c.width=w;c.height=h;const keep=X;X=c.getContext('2d');
  const cx=w/2,cy=h/2+1,rx=w/2-3,ry=h/2-5;
  ell(cx,cy+2,rx+2,ry+2,'#7cc4ea');ell(cx,cy+1,rx,ry,'#f0d8a0');
  const dry=gd&&gardenAvg(gd.data)<35;ell(cx,cy-1,rx-3,ry-3,dry?'#b7b46a':'#86c96f');ell(cx,cy+ry-4,rx-6,1,dry?'#a3a05c':'#6fb35c');
  if(big){R(cx-1,cy-14,3,12,'#fdfaf2');R(cx-1,cy-10,3,3,'#e8506c');R(cx-2,cy-16,5,2,'#3a2f38');R(cx-1,cy-15,3,1,'#ffe08a');R(cx-2,cy-18,5,2,'#e8506c');
    const pick=isleItems.slice(-40);pick.forEach((it,i)=>{const x=Math.round(cx+(it.x-ISL.cx)/ISL.rx*(rx-5)),y=Math.round(cy-1+(it.y-ISL.cy)/ISL.ry*(ry-4));
      if(Math.abs(x-cx)<3&&y<cy)return;R(x,y,1,1,it.k==='stone'?'#9aa0a8':it.k==='lantern'?'#ffe08a':it.k==='mushroom'?'#d84a4a':it.k==='shell'?'#f6d3c4':ISLE_COL[it.c||0][0]);});}
  else if(gd){const ps=(gd.data.projects||[]).slice(0,6),r=rng(hashStr(gd.id));
    ps.forEach((p,i)=>{const x=Math.round(cx-12+i*5+r()*2),y=Math.round(cy-2+(i%2?2:-1));const tall=p.progress>60;R(x,y-(tall?5:3),1,tall?5:3,'#4f9e3f');R(x-1,y-(tall?7:4),3,2,p.kind==='tree'||p.kind==='plum'?'#3f8f44':ISLE_COL[i%4][0]);});
    R(cx+10,cy-6,6,4,'#f6ead2');R(cx+9,cy-8,8,2,'#c55a3c');R(cx+12,cy-4,2,2,'#7a5434');}
  X=keep;return c;
}
function renderMap(soft){
  const sea=document.getElementById('mapSea');if(!sea)return;
  const gs=mapGardens(),on=globalOnline();
  document.getElementById('mapOn').textContent=on>1?on+' online':roomLive()?'Nur du online':'';
  const sig=gs.map(gd=>gd.id+':'+peopleAt(keyOf(gd.id)).length+':'+Math.round(gardenAvg(gd.data)/10)).join('|')+'#'+peopleAt('isle').length+':'+isleItems.length+':'+(visiting?visiting.id:'')+scene+':'+sea.clientWidth;
  if(soft&&sea.dataset.sig===sig)return;sea.dataset.sig=sig;sea.innerHTML='';
  const Wd=sea.clientWidth||340,rings=[];let left=gs.length,ri=0;while(left>0){const cap=6+ri*5;rings.push(Math.min(cap,left));left-=cap;ri++;}
  const narrow=Wd<420,sx=Wd/2,ringX=Wd*(narrow?.255:.235),ringY=narrow?96:88,top=narrow?92:84;
  const Hd=Math.max(narrow?300:320,top*2+ringY*2*Math.max(1,rings.length)-ringY*.6);sea.style.height=Math.round(Hd)+'px';const sy=Hd/2;
  const place=(el,x,y)=>{el.style.left=Math.round(x)+'px';el.style.top=Math.round(y)+'px';sea.appendChild(el);};
  const mk=(name,sprite,count,cls,onTap,sub)=>{const b=document.createElement('button');b.type='button';b.className='isl '+(cls||'');b.appendChild(sprite);
    const n=document.createElement('span');n.className='in';n.textContent=name;b.appendChild(n);
    if(count>0){const o=document.createElement('span');o.className='io';o.textContent=count;o.title=count+' gerade da';n.appendChild(o);}
    if(sub){const s=document.createElement('span');s.className='is';s.textContent=sub;b.appendChild(s);}
    b.onclick=onTap;return b;};
  const isleN=peopleAt('isle').length+(scene==='island'?1:0);
  place(mk('Gemeinschafts-Insel',islandSprite(null,true),isleN,'big'+(scene==='island'?' here':''),()=>{mapM.classList.remove('show');if(scene!=='island')enterIsland();},isleItems.length?(isleItems.length===1?'1 Beitrag':isleItems.length+' Beiträge'):''),sx,sy);
  let idx=0;rings.forEach((cnt,r)=>{for(let j=0;j<cnt;j++,idx++){const gd=gs[idx],h=hashStr(gd.id);
      const a=-Math.PI/2+2*Math.PI*(j+.5)/cnt+r*.45+((h%100)/100-.5)*.22,rx=ringX*(1+r*.78),ry=ringY*(1+r*.92);
      const x=clamp(sx+Math.cos(a)*rx,46,Wd-46),y=sy+Math.sin(a)*ry;
      const mine=gd.id===myId,here=scene!=='island'&&((mine&&!visiting)||(visiting&&visiting.id===gd.id));
      const cnt2=peopleAt(keyOf(gd.id)).length+(here?1:0);
      place(mk(mine?'Du':gd.data.name,islandSprite(gd,false),cnt2,here?'here':'',()=>{mapM.classList.remove('show');
        if(mine){if(visiting)goHome();else if(scene!=='garden')goScene('garden');}
        else if(visiting&&visiting.id===gd.id){if(scene!=='garden')goScene('garden');}
        else{visit(gd);toast('Welcome to '+gd.data.name+"'s garden 🌱",2600);}}),x,y);}});
}

