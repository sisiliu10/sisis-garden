/* ================= compost heap: projects you let go ================= */
const COMP={x:18,y:166};
function compostOf(){const d=V();return (d&&d.compost)||[];}
function drawCompost(t){
  const x0=COMP.x-12,y=COMP.y,n=compostOf().length,lv=n?Math.min(4,1+Math.floor(n/2)):1;
  const WL='#d9a35e',WM='#b98245',WD='#7a5230',GAP='#2e1c10',OL='#3b2416',S0='#2e1c10',S1='#4a2f1c',S2='#644126';
  // shadow
  g.globalAlpha=.22;R(x0-1,y,33,2,'#1d2b18');R(x0+1,y+2,28,1,'#1d2b18');g.globalAlpha=1;
  // back wall: slats with dark gaps, like a real compost crate
  for(let k=0;k<3;k++){const py=y-13+k*4;R(x0+1,py,22,3,WM);R(x0+1,py,22,1,WL);R(x0+1,py+2,22,1,WD);R(x0+1,py+3,22,1,GAP);
    R(x0+5+(k%2)*9,py+1,1,1,WD);R(x0+15-(k%2)*6,py+1,2,1,WD);}
  // the heap of dark earth (always a little there, grows with every project you let go)
  const hh=[0,14,15,17,18][lv],rows=[];
  for(let r=0;r<hh;r++){const w=Math.max(5,Math.round(21-(r*r)*15/(hh*hh)-r*.25));rows.push(w);const xs=COMP.x-Math.floor(w/2);
    R(xs,y-3-r,w,1,r===hh-1?S2:(r%3===0?S0:S1));R(xs,y-3-r,1,1,S0);R(xs+w-1,y-3-r,1,1,S0);if(r>hh-3)R(xs+1,y-3-r,Math.max(1,w-3),1,S2);}
  for(let r=2;r<hh-1;r+=2){R(Math.round(COMP.x-rows[r]/2+2+(r*7)%Math.max(2,rows[r]-4)),y-3-r,1,1,S2);}
  const top=y-3-hh;
  // food scraps, drawn big enough to read: banana peel, apple core, eggshell, orange peel, carrot greens
  const banana=(bx,by)=>{R(bx,by,4,1,'#f2d548');R(bx+1,by-1,2,1,'#f2d548');R(bx-1,by+1,1,1,'#f2d548');R(bx+4,by+1,1,1,'#f2d548');R(bx+1,by,2,1,'#ffe982');R(bx-1,by+2,1,1,'#7a5a20');R(bx+4,by+2,1,1,'#7a5a20');};
  const apple=(ax,ay)=>{R(ax,ay,3,1,'#d8403a');R(ax+1,ay+1,1,2,'#f3e7c4');R(ax,ay+3,3,1,'#d8403a');R(ax+1,ay-1,1,1,'#5a3a1a');};
  const egg=(ex,ey)=>{R(ex,ey,3,2,'#f6f1e4');R(ex,ey-1,1,1,'#f6f1e4');R(ex+2,ey-1,1,1,'#f6f1e4');R(ex+1,ey+1,1,1,'#d9cfb8');};
  const orange=(ox,oy)=>{R(ox,oy,3,1,'#f08a2c');R(ox-1,oy+1,1,1,'#f08a2c');R(ox+3,oy+1,1,1,'#f08a2c');R(ox,oy+1,3,1,'#fbc07a');};
  const greens=(gx,gy)=>{R(gx,gy-3,1,3,'#5aa83a');R(gx-1,gy-4,1,2,'#7cc84e');R(gx+1,gy-4,1,1,'#7cc84e');R(gx+2,gy-5,1,2,'#5aa83a');R(gx-2,gy-2,1,1,'#5aa83a');};
  const sc=[()=>greens(COMP.x+1,top+1),()=>banana(COMP.x-6,top+3),()=>apple(COMP.x+4,top+2),()=>egg(COMP.x-2,top+5),()=>orange(COMP.x+2,top+6),()=>apple(COMP.x-8,top+7)];
  sc.slice(0,2+lv).forEach(f=>f());
  // now and then a worm peeks out of the heap, wiggles and dives back in
  {const P=13,cyc=Math.floor(t/P),ph=t-cyc*P,spots=[[-5,3],[3,2],[-1,1],[6,4],[-7,5]],sp=spots[cyc%spots.length];
    if(ph<4.6){const h=Math.round(ph<.8?ph/.8*5:ph>3.8?(4.6-ph)/.8*5:5),r=Math.max(0,hh-1-sp[1]),sx=COMP.x+Math.max(-Math.floor(rows[r]/2)+2,Math.min(Math.floor(rows[r]/2)-3,sp[0]));
      const wy=top+sp[1];
      for(let i=0;i<h;i++){const wx=sx+Math.round(Math.sin(t*5+i*.9)*.8*(i/4));R(wx,wy-i,2,1,i===h-1?'#f6b3bf':(i%2?'#e48a9b':'#d97a8c'));}
      if(h>=4){const hx=sx+Math.round(Math.sin(t*5+(h-1)*.9)*.8*((h-1)/4));R(hx,wy-h+1,1,1,'#2a2430');}
      R(sx-1,wy+1,4,1,S1);}}
  // warm compost steams a little
  for(let k=0;k<2;k++){const ph=(t*.35+k*.5)%1,sx=COMP.x-4+k*8+Math.round(Math.sin(t*1.7+k*2)*1.2),sy=top-2-Math.round(ph*9);
    g.globalAlpha=.55*(1-ph);R(sx,sy,1,2,'#efe9df');R(sx+1,sy-1,1,1,'#efe9df');g.globalAlpha=1;}
  // a tiny fly doing loops
  {const fa=t*3.1,fx=Math.round(COMP.x+5+Math.cos(fa)*5),fy=Math.round(top-3+Math.sin(fa*2)*2);R(fx,fy,1,1,'#2a2430');if(Math.floor(t*12)%2)R(fx-1,fy-1,1,1,'rgba(255,255,255,.7)');}
  // corner posts
  [x0,x0+22].forEach(px=>{R(px,y-15,2,15,WM);R(px,y-15,1,15,WL);R(px,y-15,2,1,OL);R(px+1,y-14,1,14,WD);});
  // front: two slats with a gap, the earth shows through
  [[y-6],[y-3]].forEach(([py])=>{R(x0+1,py,22,2,WM);R(x0+1,py,22,1,WL);R(x0+1,py+2,22,1,GAP);});
  R(x0+6,y-5,1,1,WD);R(x0+16,y-2,2,1,WD);R(x0,y,24,1,OL);
  // grass tufts at the corners
  [[x0-2,y],[x0+23,y]].forEach(([gx,gy])=>{R(gx,gy-2,1,2,'#5a9a3c');R(gx+1,gy-3,1,3,'#6fb34a');R(gx+2,gy-1,1,1,'#5a9a3c');});
  // a little mushroom pops up next to the crate every now and then (stays a few minutes)
  {const W=240000,now=Date.now(),win=Math.floor(now/W),seen=(Math.imul(win,2654435761)>>>0)%3===0;
    if(seen){const k=Math.min(1,(now-win*W)/1200),mx=x0-5,my=y+2,hgt=Math.round(1+k*2);
      R(mx,my-hgt,2,hgt,'#f3ead6');R(mx+1,my-hgt,1,hgt,'#d9ccb0');
      if(k>.3){R(mx-2,my-hgt-2,6,2,'#d8403a');R(mx-1,my-hgt-3,4,1,'#d8403a');R(mx-1,my-hgt-2,1,1,'#ffffff');R(mx+2,my-hgt-3,1,1,'#ffffff');R(mx+3,my-hgt-1,1,1,'#ffffff');R(mx-2,my-hgt-1,6,1,'#a82e2a');}
      if(((win>>>1)%2)===0){const nx=x0+12,ny=y+5;R(nx,ny-2,1,2,'#f3ead6');R(nx-1,ny-3,3,1,'#c9864a');R(nx,ny-4,1,1,'#c9864a');}}}
  // a shovel leaning against the right post, blade stuck in the grass
  {const hx0=x0+24,hy0=y-21,hx1=x0+28,hy1=y-7;
    R(hx0-2,hy0-1,5,1,'#5e3a22');R(hx0-2,hy0,1,1,'#5e3a22');R(hx0+2,hy0,1,1,'#5e3a22');
    for(let i=0;i<=hy1-hy0;i++){const hx=Math.round(hx0+(hx1-hx0)*i/(hy1-hy0));R(hx,hy0+i,1,1,'#e0a85e');R(hx+1,hy0+i,1,1,'#9a6634');}
    const bx=hx1-1;R(bx,y-7,4,1,'#5d6670');R(bx-1,y-6,6,4,'#c3cdd6');R(bx-1,y-6,1,4,'#eef3f7');R(bx+4,y-6,1,4,'#8d98a3');R(bx,y-2,4,1,'#a8b3bd');R(bx+1,y-1,2,1,'#8d98a3');}
}
function compostFx(code){for(let i=0;i<10;i++)spawn({kind:'puff',x:COMP.x+(Math.random()*16-8),y:COMP.y-8-Math.random()*6,vy:-8,life:.6+Math.random()*.4});
  for(let i=0;i<6;i++)spawn({kind:'spark',x:COMP.x+(Math.random()*16-8),y:COMP.y-12,vy:-12,life:.6});
  if(code)toast(code+' went to the compost. You can replant it any time.',2600);}
const compM=document.createElement('div');compM.className='modal';compM.id='compM';
compM.innerHTML='<div class="panel"><h2>Compost</h2><div class="lead" id="cpLead"></div><div id="cpList" style="margin-top:12px"></div><div style="display:flex;justify-content:flex-end;margin-top:14px"><button class="btn" type="button" id="cpClose">Close</button></div></div>';
document.body.appendChild(compM);
compM.addEventListener('pointerdown',e=>{if(e.target===compM)compM.classList.remove('show');});
document.getElementById('cpClose').onclick=()=>compM.classList.remove('show');
function agoDays(ts){if(!ts)return '';const d=Math.floor((Date.now()-ts)/DAY);return d<1?'today':d===1?'yesterday':d+' days ago';}
function renderCompost(){
  const L=compostOf(),own=!visiting&&!!home,box=document.getElementById('cpList');box.innerHTML='';
  document.getElementById('cpLead').textContent=own?(L.length?'Projects you let go. Nothing is lost, they turn into soil for what comes next.':'Nothing here yet. When you compost a plant or bed, it lands here.')
    :(L.length?V().name+' let these go.':V().name+' has not composted anything yet.');
  L.forEach(c=>{const r=document.createElement('div');r.style.cssText='display:flex;gap:10px;align-items:center;padding:8px 0;border-bottom:1px solid #eee6d6';
    const tx=document.createElement('div');tx.style.cssText='flex:1;min-width:0';
    const b=document.createElement('b');b.textContent=c.code;b.style.cssText='font-family:Silkscreen,monospace;font-weight:400;letter-spacing:.5px';tx.appendChild(b);
    const sub=document.createElement('div');sub.style.cssText='font-size:13px;color:var(--muted)';sub.textContent=(c.name?c.name+', ':'')+'composted '+agoDays(c.ct);tx.appendChild(sub);
    r.appendChild(tx);
    if(own){
      const lb=document.createElement('button');lb.type='button';lb.className='lockb';paintLock(lb,c.lk,'entry');lb.onclick=()=>{toggleLock(c,'entry');paintLock(lb,c.lk,'entry');};r.appendChild(lb);
      const full=(c.bed?home.skills.length>=BED_SLOTS.length:home.projects.length>=SLOTS.length);
      const rp=document.createElement('button');rp.type='button';rp.className='btn dark';rp.textContent='Replant';rp.disabled=full;if(full)rp.title=c.bed?'All skill beds are taken':'No free spot for a plant';
      rp.onclick=()=>replant(c.id);r.appendChild(rp);
      const del=document.createElement('button');del.type='button';del.className='btn';del.textContent='✕';del.title='Delete for good';del.setAttribute('aria-label','Delete for good');
      del.onclick=()=>{if(!del.dataset.armed){del.dataset.armed=1;del.textContent='Delete?';return;}home.compost=home.compost.filter(x=>x.id!==c.id);persist();renderCompost();};r.appendChild(del);}
    box.appendChild(r);});
}
function openCompost(){renderCompost();compM.classList.add('show');}
function replant(id){
  const c=(home.compost||[]).find(x=>x.id===id);if(!c)return;
  const arr=c.bed?home.skills:home.projects,max=(c.bed?BED_SLOTS:SLOTS).length;if(arr.length>=max)return;
  const used=new Set(arr.map(p=>p.slot));let slot=0;while(used.has(slot))slot++;
  const p=cleanProject(Object.assign({},c,{slot,pos:null,w:Math.max(40,c.w||0),t:Date.now()}),slot,c.bed);
  arr.push(p);if(c.note)home.notes[p.id]=c.note;if(c.lg&&c.lg.length){home.logs=home.logs||{};home.logs[p.id]=c.lg;}
  home.compost=home.compost.filter(x=>x.id!==id);
  compM.classList.remove('show');persist();rebuildLabels();refreshChrome();
  const [px,py]=posOf(p);for(let i=0;i<10;i++)spawn({kind:'spark',x:px+(Math.random()*14-7),y:py-6-Math.random()*10,vy:-10,life:.7});
  toast(p.code+' is growing again.',2200);
}
/* ================= chat history ================= */
let chatMem=[],chatG=null;
const chatLogEl=document.createElement('div');chatLogEl.id='chatLog';
chatLogEl.innerHTML='<div class="ch"><span>Chat</span><button type="button" aria-label="Close">✕</button></div><div class="cl"></div>';document.body.appendChild(chatLogEl);
const chatList=chatLogEl.querySelector('.cl');
chatLogEl.querySelector('.ch button').onclick=()=>toggleChatLog(false);
// the chat history slides up while you are in the chat field (like in most online games), and hides again when you leave it
document.getElementById('chatIn').addEventListener('focus',()=>{if(window.__chatlog||chatMem.length)toggleChatLog(true);});
document.getElementById('chatIn').addEventListener('blur',()=>{setTimeout(()=>{if(document.activeElement!==document.getElementById('chatIn')&&!chatLogEl.matches(':hover'))toggleChatLog(false);},150);});
chatLogEl.addEventListener('mousedown',e=>{if(e.target.tagName!=='BUTTON')e.preventDefault();});
function sameMsg(a,b){return a.n===b.n&&a.text===b.text&&Math.abs(a.t-b.t)<20000;}
function logChat(m){const g=gardenKey();if(g!==chatG){chatG=g;chatMem=[];}if(chatMem.some(x=>sameMsg(x,m)))return;chatMem.push(m);if(chatMem.length>200)chatMem.shift();if(chatLogEl.classList.contains('show'))renderChat();}
function fmtT(t){const d=new Date(t),n=new Date(),hm=d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
  if(d.toDateString()===n.toDateString())return hm;const y=new Date(n-864e5);if(d.toDateString()===y.toDateString())return 'yesterday '+hm;return d.toLocaleDateString([],{day:'numeric',month:'short'})+' '+hm;}
function renderChat(){
  const g=gardenKey();if(g!==chatG){chatG=g;chatMem=[];}
  const L=chatMem.slice().sort((a,b)=>a.t-b.t).slice(-80),stick=chatList.scrollHeight-chatList.scrollTop-chatList.clientHeight<30;chatList.innerHTML='';
  if(!L.length){const e=document.createElement('div');e.className='ce';e.textContent='No messages yet. Say hi below.';chatList.appendChild(e);}
  L.forEach(m=>{const r=document.createElement('div');r.className='cm'+(m.me?' me':'');const b=document.createElement('b');b.textContent=m.n;r.appendChild(b);
    r.appendChild(document.createTextNode(m.text));const ti=document.createElement('i');ti.textContent=fmtT(m.t);r.appendChild(ti);chatList.appendChild(r);});
  if(stick||!chatList.dataset.seen){chatList.scrollTop=chatList.scrollHeight;chatList.dataset.seen=1;}
}
async function loadChat(){
  if(!window.__chatlog||!gardenKey())return;
  try{const L=await window.__chatlog.load(gardenKey(),myId);const g=gardenKey();if(g!==chatG){chatG=g;chatMem=[];}
    L.forEach(m=>{if(!chatMem.some(x=>sameMsg(x,m)))chatMem.push(m);});renderChat();}catch(e){}
}
function toggleChatLog(on){chatLogEl.classList.toggle('show',on);if(on){chatList.dataset.seen='';renderChat();loadChat();}}

