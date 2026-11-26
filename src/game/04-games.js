const askM=document.getElementById('askM');
/* ---------- Vier gewinnt ----------
   One game per cottage. Whoever opens it first hosts (a running game beats a waiting one, then the oldest),
   the host keeps the board and publishes it; the second player sends moves, everyone else watches.
   Alone? Play against the computer. */
const c4M=document.getElementById('c4M'),c4JoinB=document.getElementById('c4Join');
const C4W=7,C4H=6;
drawBunting(document.querySelector('#c4M .bunt').getContext('2d'));
let c4H=null, c4LastPub='', c4LastPubT=0, c4Seen={}, c4BotAt=0;
function c4Rank(id,ph,key){const t=parseInt(String(id).slice(1),36)||0;return [ph==='wait'?1:0,t,String(key)];}
function c4Leader(){
  if(!room) return {self:true};
  let best=null;
  if(c4H) best={self:true,r:c4Rank(c4H.id,c4H.ph,myPeer())};
  roomPeers().forEach(p=>{if(p.isMe||p.kind!=='viewer'||!p.presence||p.presence.s!=='h')return;const q=c4Clean(p.presence.c4);if(!q)return;
    const r=c4Rank(q.id,q.ph,p.peer);if(!best||rankLess(r,best.r))best={peer:p,r};});
  return best&&best.peer?{peer:best.peer}:{self:true};
}
function c4Clean(q){
  if(!q||typeof q!=='object'||typeof q.id!=='string'||!/^c[0-9a-z]{4,12}$/.test(q.id))return null;
  if(typeof q.b!=='string'||!/^[012]{42}$/.test(q.b))return null;
  const pl=x=>Array.isArray(x)&&typeof x[0]==='string'?[x[0].slice(0,80),str(x[1],14)||'Friend']:null;
  return {id:q.id,b:q.b,t:q.t===2?2:1,p1:pl(q.p1)||['?','?'],p2:pl(q.p2),ph:['wait','play','end'].includes(q.ph)?q.ph:'wait',
    w:[0,1,2,3].includes(q.w)?q.w:0,l:Array.isArray(q.l)?q.l.filter(i=>Number.isInteger(i)&&i>=0&&i<42).slice(0,7):[],last:Number.isInteger(q.last)?q.last:-1,mv:num(q.mv,0),rd:num(q.rd,0),bot:!!q.bot};
}
function c4Pub(){const H=c4H;return {id:H.id,b:H.b.join(''),t:H.t,p1:H.p1,p2:H.p2,ph:H.ph,w:H.w,l:H.l,last:H.last,mv:H.mv,rd:H.rd,bot:H.bot};}
function c4State(){const L=c4Leader();if(L.self)return c4H?c4Clean(c4Pub()):null;return c4Clean(L.peer.presence.c4);}
function c4New(){c4H={id:'c'+Date.now().toString(36),b:Array(42).fill(0),t:1,p1:[myPeer(),(me().name||'Me').slice(0,14)],p2:null,ph:'wait',w:0,l:[],last:-1,mv:0,rd:0,bot:false,start:1};c4Seen={};}
function c4Lines(b,i){
  const r=Math.floor(i/C4W),c=i%C4W,v=b[i];if(!v)return null;
  for(const [dr,dc] of [[0,1],[1,0],[1,1],[1,-1]]){
    const L=[i];
    for(const s of [1,-1]){let rr=r+dr*s,cc=c+dc*s;while(rr>=0&&rr<C4H&&cc>=0&&cc<C4W&&b[rr*C4W+cc]===v){L.push(rr*C4W+cc);rr+=dr*s;cc+=dc*s;}}
    if(L.length>=4)return L;
  }
  return null;
}
function c4Free(b,c){for(let r=C4H-1;r>=0;r--)if(!b[r*C4W+c])return r*C4W+c;return -1;}
function c4Play(c){
  const H=c4H;if(!H||H.ph!=='play'||c<0||c>=C4W)return false;
  const i=c4Free(H.b,c);if(i<0)return false;
  H.b[i]=H.t;H.last=i;H.mv++;
  const L=c4Lines(H.b,i);
  if(L){H.ph='end';H.w=H.t;H.l=L;}
  else if(H.b.every(x=>x)){H.ph='end';H.w=3;}
  else H.t=H.t===1?2:1;
  return true;
}
function c4BotMove(b){
  // win if possible, else block, else avoid giving a win away, prefer the middle
  const free=[...Array(C4W).keys()].filter(c=>c4Free(b,c)>=0);
  const tryWin=v=>{for(const c of free){const i=c4Free(b,c);b[i]=v;const w=c4Lines(b,i);b[i]=0;if(w)return c;}return -1;};
  let c=tryWin(2);if(c>=0)return c;c=tryWin(1);if(c>=0)return c;
  const safe=free.filter(c=>{const i=c4Free(b,c);b[i]=2;const above=i-C4W;let bad=false;if(above>=0){b[above]=1;bad=!!c4Lines(b,above);b[above]=0;}b[i]=0;return !bad;});
  const pool=safe.length?safe:free;const pref=[3,2,4,1,5,0,6];
  const top=pool.slice().sort((a,b)=>pref.indexOf(a)-pref.indexOf(b));
  return Math.random()<.75?top[0]:top[Math.floor(Math.random()*Math.min(3,top.length))];
}
function c4Peers(){return room?roomPeers().filter(p=>!p.isMe&&p.kind==='viewer'&&p.presence&&p.presence.s==='h'):[];}
function c4Tick(){
  // someone else's game wins while mine is still waiting: drop mine and watch or join theirs
  if(c4H&&c4H.ph==='wait'&&!c4H.p2){const L=c4Leader();if(!L.self){c4H=null;if(room)room.presence({c4:null}).catch(()=>{});}}
  const H=c4H;
  if(H){
    const now=Date.now(), ps=c4Peers();
    if(H.p2&&!H.bot&&!ps.some(p=>p.peer===H.p2[0])){H.p2=null;if(H.ph==='play'){H.ph='wait';}}
    if(H.ph==='wait'&&!H.p2){const j=ps.find(p=>p.presence.c4j&&p.presence.c4j.id===H.id);
      if(j){H.p2=[j.peer,str(j.presence.n,14)||'Friend'];H.bot=false;c4Reset(true);}}
    if(H.ph==='play'&&H.t===2&&H.p2&&!H.bot){const p=ps.find(x=>x.peer===H.p2[0]);const m=p&&p.presence.c4m;
      if(m&&m.id===H.id&&m.rd===H.rd&&m.n===H.mv&&Number.isInteger(m.c)){if(c4Play(m.c))Sfx.click();}}
    if(H.ph==='play'&&H.t===2&&H.bot){if(!c4BotAt)c4BotAt=now+650;if(now>=c4BotAt){c4BotAt=0;c4Play(c4BotMove(H.b.slice()));Sfx.click();}}
    if(H.ph==='end'&&H.p2&&!H.bot){const p=ps.find(x=>x.peer===H.p2[0]);const r=p&&p.presence.c4r;if(r&&r.id===H.id&&r.n===H.rd+1)c4Reset();}
    if(room){const st=c4Pub(),k=JSON.stringify(st);if(k!==c4LastPub||now-c4LastPubT>3000){c4LastPub=k;c4LastPubT=now;room.presence({c4:st}).catch(()=>{});}}
  }
  {const st=c4State(),role=c4MyRole(st);if(st&&st.ph==='end'&&st.p2&&!st.bot&&role){const key=st.id+'|'+st.rd;if(!c4Rec[key]){c4Rec[key]=1;c4Record(st.w===3?'d':st.w===role?'w':'l');if(st.w===role)coinsForWin(10);}}
   else if(st&&st.ph==='end'&&st.bot&&role&&st.w===role){const key='b'+st.id+'|'+st.rd;if(!c4Rec[key]){c4Rec[key]=1;coinsForWin(3);}}}
  if(c4M.classList.contains('show'))renderC4();
  const L=c4Leader(),st=L.self?null:c4State();
  const showJ=!!(st&&st.ph==='wait'&&!st.p2&&!c4M.classList.contains('show')&&scene==='house');
  if(c4JoinB.hidden===showJ)c4JoinB.hidden=!showJ;
  if(showJ){const tx=`Vier gewinnt mit ${st.p1[1]}: mitspielen`;if(c4JoinB.textContent!==tx)c4JoinB.textContent=tx;}
}
/* the leaderboard: wins against friends only (games against the computer don't count), kept by every player in their own doc */
let c4Mine=null,c4Board=null,c4Rec={};
async function c4LoadBoard(){const f=window.__c4;if(!f)return;const L=await f.load();if(!L)return;c4Board=L;const m=L.find(x=>x.me);c4Mine=m?{w:m.w,l:m.l,d:m.d}:(c4Mine||{w:0,l:0,d:0});renderC4Board();}
async function c4Record(r){const f=window.__c4;if(!f)return;if(!c4Mine)await c4LoadBoard();c4Mine=c4Mine||{w:0,l:0,d:0};c4Mine[r]++;
  await f.save({w:c4Mine.w,l:c4Mine.l,d:c4Mine.d,n:(me().name||'').slice(0,14),look:me().look});c4LoadBoard();}
function c4Face(look){const c=document.createElement('canvas');c.width=18;c.height=18;const X=c.getContext('2d');X.fillStyle='#cfe3f7';X.fillRect(0,0,18,18);try{drawAvatar(X,9,31,cleanLook(look),{blink:false,t:0,shadow:false});}catch(e){}return c;}
function renderC4Board(){
  const L=document.getElementById('c4Lb');if(!L)return;
  const rows=(c4Board||[]).filter(x=>x.w+x.l+x.d>0).sort((a,b)=>b.w-a.w||a.l-b.l).slice(0,8);
  const k=rows.map(x=>(x.me?1:0)+x.n+x.w+'/'+x.l).join(',');if(L.dataset.k===k)return;L.dataset.k=k;L.innerHTML='';
  if(!rows.length){const e=document.createElement('li');e.className='empty';e.textContent='Noch keine Siege. Spielt zu zweit, dann steht ihr hier.';L.appendChild(e);return;}
  rows.forEach((x,i)=>{const li=document.createElement('li');if(i===0)li.className='top';if(x.me)li.classList.add('me');
    const r=document.createElement('span');r.className='rk';r.textContent=i+1;li.appendChild(r);li.appendChild(c4Face(x.look));
    const n=document.createElement('span');n.className='nm';n.textContent=x.me?'Du':(x.n||'Friend');li.appendChild(n);
    const w=document.createElement('b');w.textContent=x.w+(x.w===1?' Sieg':' Siege');li.appendChild(w);L.appendChild(li);});
}
function c4Reset(first){const H=c4H;if(!H)return;H.b=Array(42).fill(0);H.ph=H.p2?'play':'wait';H.w=0;H.l=[];H.last=-1;H.mv=0;if(!first){H.rd++;H.start=H.start===1?2:1;}H.t=H.start;c4BotAt=0;c4Seen={};}
function c4MyRole(st){if(!st)return 0;if(st.p1[0]===myPeer())return 1;if(st.p2&&st.p2[0]===myPeer())return 2;return 0;}
function c4Move(c){
  const st=c4State();if(!st||st.ph!=='play')return;
  const role=c4MyRole(st);if(!role||st.t!==role)return;
  if(c4H&&c4Leader().self){if(c4Play(c)){Sfx.click();renderC4();}return;}
  if(c4Free(st.b.split('').map(Number),c)<0)return;
  if(room)room.presence({c4m:{id:st.id,rd:st.rd,n:st.mv,c}}).catch(()=>{});
}
function openC4(){
  const L=c4Leader(),st=c4State();
  if(L.self&&!c4H)c4New();
  else if(st&&st.ph==='wait'&&!st.p2&&!L.self&&room)room.presence({c4j:{id:st.id}}).catch(()=>{});
  c4M.classList.add('show');renderC4();renderC4Board();c4LoadBoard();
}
function closeC4(){
  c4M.classList.remove('show');
  if(room)room.presence({c4j:null,c4m:null,c4r:null}).catch(()=>{});
  if(c4H){c4H=null;if(room)room.presence({c4:null}).catch(()=>{});}
}
document.getElementById('c4Close').onclick=closeC4;
c4JoinB.onclick=()=>{c4JoinB.hidden=true;openC4();};
document.addEventListener('keydown',e=>{if(!c4M.classList.contains('show'))return;const n=parseInt(e.key,10);if(n>=1&&n<=7){e.preventDefault();c4Move(n-1);}},true);
function renderC4(){
  const st=c4State(),L=c4Leader(),who=document.getElementById('c4Who'),stE=document.getElementById('c4St'),B=document.getElementById('c4B'),row=document.getElementById('c4Row');
  if(!st){
    if(L.self&&!c4H){c4New();return renderC4();}
    stE.textContent='Das Spiel wurde beendet.';who.innerHTML='';B.innerHTML='';row.innerHTML='';return;
  }
  const role=c4MyRole(st), isHost=!!c4H&&L.self;
  const nm=p=>p?(p[0]===myPeer()?'Du':p[1]):'…';
  const whoK=[st.id,st.t,st.ph,nm(st.p1),nm(st.p2)].join('|');
  if(who.dataset.k!==whoK){who.dataset.k=whoK;who.innerHTML='';
    [[st.p1,1,'#e8506c'],[st.p2,2,'#f2c94c']].forEach(([p,v,col])=>{const d=document.createElement('div');d.className=st.ph==='play'&&st.t===v?'on':'off';
      const b=document.createElement('b');b.style.background=col;d.appendChild(b);d.appendChild(document.createTextNode(p?nm(p):'wartet …'));who.appendChild(d);});}
  let msg='';
  if(st.ph==='wait')msg=isHost?'Warte auf jemanden im Haus, oder spiel gegen den Computer.':(role===2?'Gleich geht’s los …':`${st.p1[1]} sucht jemanden.`);
  else if(st.ph==='play')msg=role===st.t?'Du bist dran.':`${nm(st.t===1?st.p1:st.p2)} ist dran.`;
  else msg=st.w===3?'Unentschieden.':(role===st.w?'Du hast gewonnen!':`${nm(st.w===1?st.p1:st.p2)} gewinnt.`);
  if(stE.textContent!==msg)stE.textContent=msg;
  if(st.ph==='end'&&!c4Seen['w'+st.id+st.rd]){c4Seen['w'+st.id+st.rd]=1;if(role&&role===st.w)Sfx.yay();}
  // board
  const canMove=st.ph==='play'&&role===st.t;
  const bK=st.b+'|'+st.l.join(',')+'|'+(canMove?1:0)+'|'+st.last;
  if(B.dataset.k!==bK){
    const prev=B.dataset.b||'';B.dataset.k=bK;B.dataset.b=st.b;B.innerHTML='';
    for(let c=0;c<C4W;c++){const col=document.createElement('div');col.className='c4col'+(canMove&&c4Free(st.b.split('').map(Number),c)>=0?'':' no');col.setAttribute('role','button');col.setAttribute('aria-label','Spalte '+(c+1));
      col.onclick=()=>c4Move(c);
      for(let r=0;r<C4H;r++){const i=r*C4W+c,v=st.b[i];const d=document.createElement('div');d.className='c4c'+(v==='1'?' p1':v==='2'?' p2':'')+(st.l.includes(i)?' win':'');
        if(i===st.last&&prev&&prev[i]==='0'){d.classList.add('drop');d.style.setProperty('--r',r+1);if(!isHost||role!==st.t)try{Sfx.click();}catch(e){}}
        col.appendChild(d);}
      B.appendChild(col);}
  }
  // actions
  const rK=[st.ph,isHost?1:0,role,st.bot?1:0,st.p2?1:0,st.rd].join('|');
  if(row.dataset.k!==rK){row.dataset.k=rK;row.innerHTML='';
    const add=(t,f,main)=>{const b=document.createElement('button');b.type='button';b.textContent=t;b.onclick=f;if(main)b.className='go';row.appendChild(b);};
    if(isHost&&st.ph==='wait')add('Gegen den Computer',()=>{c4H.p2=['bot','Computer'];c4H.bot=true;c4Reset(true);renderC4();});
    if(st.ph==='end'&&role){if(isHost)add('Nochmal',()=>{c4Reset();renderC4();},1);else add('Nochmal',()=>{if(room)room.presence({c4r:{id:st.id,n:st.rd+1}}).catch(()=>{});},1);}
  }
}
setInterval(c4Tick,200);
/* ---------- "Arbeitest du noch an …?" ----------
   Like Netflix asking if you are still watching: a project nobody watered for two weeks gets one friendly question.
   At most one question a day, only in your own garden. */
const stillM=document.getElementById('stillM');let stillP=null,stillArmed=false,stillDone=false;
function lastTouch(p){const lg=(home&&home.logs&&home.logs[p.id])||[];return Math.max(p.t||0,p.last||0,lg.length?num(lg[lg.length-1].t,0):0);}
function stillCandidate(){
  if(!home||visiting||scene!=='garden'||home.askDay===ofToday())return null;
  const now=Date.now(),ask=home.ask||{};
  return home.projects.filter(p=>now-lastTouch(p)>14*864e5&&(ask[p.id]||0)<now).sort((a,b)=>lastTouch(a)-lastTouch(b))[0]||null;
}
function stillAsk(p){
  stillP=p;stillArmed=false;
  const days=Math.floor((Date.now()-lastTouch(p))/864e5);
  document.getElementById('stillT').textContent=`Arbeitest du noch an ${p.code}?`;
  document.getElementById('stillS').textContent=[p.name&&p.name!==p.code?p.name:'',`Seit ${days} Tagen nicht gegossen.`].filter(Boolean).join('. ').replace('..','.');
  document.getElementById('stillNoS').textContent='Kommt auf den Kompost und bleibt dort sichtbar';
  home.askDay=ofToday();persist();
  stillM.classList.add('show');setTimeout(()=>document.getElementById('stillYes').focus(),30);
}
function stillClose(){stillM.classList.remove('show');stillP=null;}
document.getElementById('stillYes').onclick=()=>{const p=stillP;if(!p)return;home.ask[p.id]=Date.now()+3*864e5;persist();stillClose();
  const [x,y]=posOf(p);av.target={x,y:y+10};};
document.getElementById('stillLater').onclick=()=>{const p=stillP;if(!p)return;home.ask[p.id]=Date.now()+14*864e5;persist();stillClose();toast(`Okay, ${p.code} macht Pause. Ich frag in zwei Wochen wieder.`,4000);};
document.getElementById('stillNo').onclick=()=>{const p=stillP;if(!p)return;
  if(!stillArmed){stillArmed=true;document.getElementById('stillNoS').textContent='Nochmal tippen zum Kompostieren';return;}
  {const c=JSON.parse(JSON.stringify(p));c.ct=Date.now();c.note=home.notes[p.id]||'';c.lg=(home.logs&&home.logs[p.id])||[];delete c.pos;
   home.compost=[c].concat(home.compost||[]).slice(0,30);compostFx(p.code);}
  home.projects=home.projects.filter(x=>x!==p);delete home.notes[p.id];if(home.logs)delete home.logs[p.id];delete home.ask[p.id];
  if(active===p)closePanel();
  persist();rebuildLabels();refreshChrome();stillClose();};
(()=>{const c=document.getElementById('stillGrass').getContext('2d');c.fillStyle='#7dc46c';c.fillRect(0,4,160,8);c.fillStyle='#5aa84a';c.fillRect(0,4,160,1);
  for(let x=1;x<160;x+=3){const h=2+((x*7)%4);c.fillStyle=x%2?'#6bb35c':'#8fd17c';c.fillRect(x,6-h+2,1,h);}})();
setInterval(()=>{
  if(stillDone||document.querySelector('.modal.show')||creator.classList.contains('show')||!document.getElementById('loading').hidden)return;
  const p=stillCandidate();if(p){stillDone=true;setTimeout(()=>{if(!document.querySelector('.modal.show')&&stillCandidate()===p)stillAsk(p);else stillDone=false;},2500);}
},4000);
document.getElementById('askNo').onclick=()=>askM.classList.remove('show');
(()=>{const c=document.getElementById('askGrass').getContext('2d');c.fillStyle='#7dc46c';c.fillRect(0,4,160,8);c.fillStyle='#5aa84a';c.fillRect(0,4,160,1);
  for(let x=1;x<160;x+=3){const h=2+((x*7)%4);c.fillStyle=x%2?'#6bb35c':'#8fd17c';c.fillRect(x,6-h+2,1,h);}
  [[18,'#e85a5a'],[52,'#ffffff'],[90,'#f2c94c'],[131,'#f49ab8']].forEach(([x,col])=>{c.fillStyle=col;c.fillRect(x-1,3,3,1);c.fillRect(x,2,1,3);});})();

