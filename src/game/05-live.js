/* ================= live: see friends walking around ================= */
let lobby=null, room=null, roomInit=false, roomDead=false, roomUp=false, roomT0=0, roomErr='', lastPres='', lastPresT=0;
const ghosts={}, tagBox=document.createElement('div'); document.body.appendChild(tagBox);
function gardenKey(){if(scene==='island')return 'isle';const id=visiting?visiting.id:myId;return id?'g-'+hashStr(id).toString(36):null;}
async function initRoom(){
  if(roomInit) return; roomInit=true; roomT0=performance.now();
  try{
    if(!window.claude||!window.claude.use){roomDead=true;return;}
    lobby=await window.claude.use('room');
    if(!lobby){roomDead=true;roomErr='none';return;}
    room=lobby;
    try{lobby.onConnection(c=>{roomUp=!!c;if(c)lastPres='';},(e)=>{roomDead=true;roomUp=false;roomErr=(e&&e.code)||'error';});}catch(e){}
  }catch(e){lobby=null;room=null;roomDead=true;}
}
function syncRoom(){lastPres='';}
function roomLive(){ if(!room||roomDead) return false; try{return !!room.connected();}catch(e){return roomUp;} }
function roomPeers(){
  if(!room) return []; let ps; try{ps=room.peers();}catch(e){return [];}
  const k=gardenKey(); return ps.filter(p=>(p.isMe&&p.sameTab)||(!!k&&p.presence&&p.presence.g===k));
}
function isHostPeer(p){ return !p.isMe&&!!visiting&&((!!p.by&&p.by===visiting.id)||(!!p.presence&&p.presence.u===visiting.id)); }
function sendPresence(now){
  if(!room||now-lastPresT<60) return;
  const st={g:gardenKey(),u:myId||null,sw:av.swim||av.jump?1:0,say:(mySay&&mySay.until>performance.now())?{n:mySay.n,t:mySay.t}:null,ty:(document.activeElement===chatIn&&chatIn.value.trim()&&now-typingAt<5000)?1:0,x:Math.round(av.x*2)/2,y:Math.round((av.y-(av.kh||0))*2)/2,act:myAct,al:riding?1:0,pl:passOf||0,sl:slide?(slide.ph==='climb'?1:2):0,sg:mySeat===null?null:{s:mySeat,a:Math.round(swA*100)/100},s:scene==='house'?'h':scene==='island'?'i':'g',b:av.back?1:0,m:av.moving?1:0,r:av.run&&av.moving?1:0,n:(me().name||'Friend').slice(0,14),l:me().look,w:av.water>0?1:0,nap:napping&&scene==='house'?1:0};
  if(scene==='island')st.il=isleMine.length;
  {const fp=fishPresence();if(fp)st.fi=fp;}
  if(scene==='garden'&&alpIdle()&&alpLeader().me)st.ap=[Math.round(alp.x),Math.round(alp.y),alp.dir>0?1:-1,alp.moving?1:0];
  const k=JSON.stringify(st); if(k===lastPres&&now-lastPresT<2500) return;
  lastPres=k; lastPresT=now; try{const pr=room.presence(st);if(pr&&pr.catch)pr.catch(()=>{});}catch(e){}
}
// who is lying in the cottage bed right now: one sleeper in the middle, two side by side (same order on every screen)
function bedSleepers(){
  if(scene!=='house')return [];
  const L=livePeers().filter(p=>p.scene==='house'&&p.nap).map(p=>({id:p.id,look:p.look}));
  if(napping)L.push({id:myPeer(),look:me().look,me:true});
  L.sort((a,b)=>String(a.id)<String(b.id)?-1:1);
  const two=L.slice(0,2);two.forEach((z,i)=>z.x=two.length===1?139:(i?147:131));return two;
}
function livePeers(){
  if(!room) return [];
  const ps=roomPeers();
  const out=[], now=performance.now();
  for(const p of ps){
    if(p.isMe||p.kind!=='viewer') continue;
    const q=p.presence||{}; if(typeof q.x!=='number'||typeof q.y!=='number') continue;
    const inside=q.s==='h'||q.s==='i', cx=x=>inside?clamp(x,-200,400):clamp(x,-OX+14,CW+OX-14), tx=cx(q.x), ty=clamp(q.y,0,600);
    let gh=ghosts[p.peer]; if(!gh){ gh=ghosts[p.peer]={x:tx,y:ty,sc:q.s}; if(now-roomT0>4000){try{Sfx.join();}catch(e){}} }
    let fresh=false;if(gh.sc!==q.s){gh.sc=q.s;gh.buf=[];gh.off=undefined;gh.jit=0;gh.x=tx;gh.y=ty;gh.pxx=undefined;fresh=true;}
    if(typeof q._t==='number'){
      // smooth playback: keep the last positions with the sender's timestamps and replay them ~140 ms behind, interpolating in between,
      // so a friend's walk looks continuous even when network packets arrive in bursts
      const B=gh.buf||(gh.buf=[]),wall=Date.now();
      const add=(t,x,y)=>{if(B.length&&t<=B[B.length-1].t)return;x=cx(x);y=clamp(y,0,600);
        B.push({t,x,y});if(B.length>60)B.shift();const d=wall-t;gh.off=gh.off===undefined||d<gh.off?d:gh.off+(d-gh.off)*.03;const late=d-gh.off;gh.jit=Math.max(late,(gh.jit||0)*.985);};
      if(!fresh&&Array.isArray(q._h))q._h.forEach(e=>{if(Array.isArray(e)&&typeof e[0]==='number'&&typeof e[1]==='number'&&typeof e[2]==='number')add(e[0],e[1],e[2]);});
      add(q._t,tx,ty);
      // the playback delay grows with how bursty this friend's connection is (120 to 500 ms)
      const T=wall-gh.off-clamp(90+(gh.jit||0)*1.15,120,500);let px=B[B.length-1].x,py=B[B.length-1].y;
      if(T<=B[0].t){px=B[0].x;py=B[0].y;}
      else for(let i=B.length-1;i>0;i--){const a=B[i-1],b=B[i];if(T>=a.t&&T<=b.t){if(Math.hypot(b.x-a.x,b.y-a.y)>90){px=b.x;py=b.y;}else{const k=(T-a.t)/Math.max(1,b.t-a.t);px=a.x+(b.x-a.x)*k;py=a.y+(b.y-a.y)*k;}break;}}
      if(Math.hypot(px-gh.x,py-gh.y)>.05)gh.mvT=now;gh.x=px;gh.y=py;
    }else{const dt=Math.min(250,now-(gh.lt||now));gh.lt=now;const f=1-Math.exp(-dt/85);if(Math.hypot(tx-gh.x,ty-gh.y)>90){gh.x=tx;gh.y=ty;}else{gh.x+=(tx-gh.x)*f;gh.y+=(ty-gh.y)*f;}}
    gh.seen=now;
    {const swn=!!q.sw&&q.s!=='h';if(gh.swp===false&&swn&&scene==='garden')setTimeout(()=>Sfx.splash(false,.45),380);gh.swp=swn;}
    {const inh=q.s==='h'?1:0;if(gh.inh===0&&inh===1)Sfx.door(.4);gh.inh=inh;}
    {const aln=q.al?1:0;if(gh.alp===0&&aln===1&&scene==='garden'&&q.s!=='h')Sfx.sit(.5);if(gh.alp===1&&aln===0&&q.s==='g')alpDrop={x:gh.x,y:gh.y};gh.alp=aln;}
    {const sln=q.sl===1||q.sl===2?q.sl:0;if(scene==='garden'&&q.s!=='h'){if(gh.slp===1&&sln===2)Sfx.whee(.5);if(gh.slp===2&&sln===0)Sfx.yay(.55);}gh.slp=sln;}
    if(q.say&&typeof q.say.t==='string'&&q.say.n!==gh.sayN){if(gh.sayN!==undefined||now-roomT0>4000)logChat({t:Date.now(),n:str(q.n,14)||'Friend',text:q.say.t.slice(0,80)});gh.sayN=q.say.n;gh.sayT=q.say.t.slice(0,80);gh.sayUntil=now+6000+q.say.t.length*60;}
    const sgq=q.sg&&(q.sg.s===0||q.sg.s===1)?{s:q.sg.s,a:clamp(num(q.sg.a,0),-1.2,1.2)}:null;
    if(gh.pxx!==undefined&&Math.abs(gh.x-gh.pxx)>.02)gh.dir=gh.x>gh.pxx?1:-1;else if(gh.pxx===undefined&&Math.abs(tx-gh.x)>.6)gh.dir=tx>gh.x?1:-1;gh.pxx=gh.x;
    const apq=Array.isArray(q.ap)&&q.ap.length===4&&q.ap.slice(0,2).every(v=>typeof v==='number')?[clamp(q.ap[0],-OX+14,CW+OX-14),clamp(q.ap[1],0,600),q.ap[2],q.ap[3]]:null;
    out.push({fi:Array.isArray(q.fi)&&q.fi.length>=4&&q.fi.length<=5&&q.fi.every(v=>Number.isFinite(v))?q.fi.slice(0,5):null,pl:typeof q.pl==='string'&&q.pl?q.pl.slice(0,64):null,ap:apq,nap:q.nap===1&&q.s==='h'?1:0,sl:q.sl===1||q.sl===2?q.sl:0,ride:!!q.al,sg:sgq,say:gh.sayUntil>now?gh.sayT:'',typing:!!q.ty&&!(gh.sayUntil>now),id:p.peer,by:p.by,x:gh.x,y:gh.y,scene:q.s==='h'?'house':q.s==='i'?'island':'garden',back:!!q.b,moving:!!q.m||now-(gh.mvT||0)<150,run:!!q.r,swim:!!q.sw,water:!!q.w,name:str(q.n,14)||'Friend',look:cleanLook(q.l)});
  }
  return out;
}
function placeTags(list,toScreen){
  const keep=new Set();
  list.forEach(p=>{keep.add(p.id);let el=tagBox.querySelector(`[data-p="${p.id}"]`);
    if(!el){el=document.createElement('div');el.className='ptag';el.dataset.p=p.id;tagBox.appendChild(el);}
    if(el.textContent!==p.name){el.textContent=p.name;el._w=0;}
    if(!el._w)el._w=el.offsetWidth/2+4;
    const [sx,sy]=toScreen(p.x,p.y-29); el.style.left=clamp(sx,el._w,Math.max(el._w,innerWidth-el._w))+'px'; el.style.top=sy+'px';});
  [...tagBox.children].forEach(el=>{if(!keep.has(el.dataset.p))el.remove();});
}
function hostLive(){ if(!visiting||!room) return false; return roomPeers().some(isHostPeer); }
function onlineIds(){ const set=new Set(); if(!room) return set; try{room.peers().forEach(p=>{if(p.by)set.add(p.by);else if(p.presence&&typeof p.presence.u==='string')set.add(p.presence.u);});}catch(e){} return set; }

