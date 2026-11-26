/* ================= party games: what the multiplayer mini games share =================
   Same idea as the quiz: whoever starts a round publishes it once in their presence ("pg"),
   each player keeps their own moves in "pj", and every device runs the round on its own clock. */
const PG={};
function pgS(k){return PG[k]||(PG[k]={mine:null,cur:null,book:{}});}
function pgPub(){let m=null;for(const k in PG)if(PG[k].mine){m=PG[k].mine;break;}if(room)room.presence({pg:m}).catch(()=>{});}
let pjMine=null;
function pjPub(o){pjMine=o;if(room)room.presence({pj:o}).catch(()=>{});}
// a throttled version for fast moves (strokes, typing)
let pjT=0,pjTimer=null;function pjSoon(o){pjMine=o;const w=Math.max(0,160-(Date.now()-pjT));clearTimeout(pjTimer);pjTimer=setTimeout(()=>{pjT=Date.now();if(room)room.presence({pj:pjMine}).catch(()=>{});},w);}
function pgId(c){return c+Date.now().toString(36)+Math.random().toString(36).slice(2,5);}
// every round of one game: mine and my friends', their times moved onto my clock by loc(g,offset)
function pgRounds(k,clean,loc){
  const S=pgS(k),out=[];
  if(S.mine)out.push(Object.assign({},S.mine,{peer:myPeer(),mine:true,raw:S.mine.at}));
  qFriends().forEach(p=>{const g=p.presence.pg;if(!g||typeof g!=='object'||g.k!==k)return;const c=clean(g);if(!c)return;
    out.push(Object.assign(loc(c,qOffOf(p)),{peer:p.peer,raw:c.at}));});
  if(S.cur&&!out.some(g=>g.id===S.cur.id))out.push(S.cur);
  return out;
}
// the round on screen: the oldest one still going, else the one I played last
function pgRound(k,clean,loc,over){
  const now=Date.now(),open=pgRounds(k,clean,loc).filter(g=>!over(g,now)).sort(qFirst);
  if(open.length)return open[0];
  const S=pgS(k);return S.cur&&over(S.cur,now)&&now-(S.cur.endAt||now)<600000?S.cur:null;
}
// friends playing round id (or waiting in the lobby when id is '')
function pgFriends(k,id){
  const L=[];qFriends().forEach(p=>{const j=p.presence.pj;if(!j||typeof j!=='object'||j.k!==k||j.id!==id)return;
    L.push({peer:p.peer,n:str(p.presence.n,14)||'Friend',l:cleanLook(p.presence.l),j,o:qOffOf(p)});});
  return L;
}
function pgMe(j){return {peer:myPeer(),n:me().name||'Ich',l:me().look,j:j||{},o:0,me:true};}
// friends who left during a round still count in its results
function pgKeep(k,id,ps){const B=pgS(k).book[id]=pgS(k).book[id]||{};ps.forEach(p=>{if(!p.gone)B[p.peer]={n:p.n,l:p.l,j:p.j,o:p.o};});
  for(const q in B)if(!ps.some(p=>p.peer===q))ps.push(Object.assign({peer:q,gone:true},B[q]));return ps;}
function pgNorm(t){return String(t||'').toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').replace(/[^a-z0-9 ]/g,'').trim();}
function pgEl(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e;}
function pgBtn(cls,txt,fn){const b=pgEl('button',cls,txt);b.type='button';b.onclick=fn;return b;}

/* a game window: dark panel with a pixel logo, the same frame for every party game */
function pgWindow(id,logoA,logoB,theme,onClose){
  const m=pgEl('div','modal pgm');m.id=id;
  const p=pgEl('div','gpnl '+theme);p.setAttribute('role','dialog');p.setAttribute('aria-label',logoA+' '+logoB);
  const top=pgEl('div','qtop'),lg=pgEl('div','c4logo',logoA),sp=pgEl('span','',logoB);lg.appendChild(sp);
  const info=pgEl('div','qinfo'),x=pgBtn('btn','×',()=>onClose());x.setAttribute('aria-label','Schließen');
  top.appendChild(lg);top.appendChild(info);top.appendChild(x);p.appendChild(top);
  const body=pgEl('div','gbody');p.appendChild(body);
  const strip=pgEl('div','pstrip'),cv=pgEl('canvas');cv.width=240;cv.height=34;const nm=pgEl('div','qnames');strip.appendChild(cv);strip.appendChild(nm);p.appendChild(strip);
  m.appendChild(p);document.body.appendChild(m);m._close=onClose;
  return {m,info,body,cv,nm,ctx:cv.getContext('2d'),k:''};
}
// a row of players with their avatars: marks(p) can put a small badge over a head, score(p) a number under the name
function pgStrip(W,players,score,mark,win){
  const X=W.ctx,w=240,h=34,t=performance.now();
  X.fillStyle='#1d1238';X.fillRect(0,0,w,h);for(let x=0;x<w;x+=6){X.fillStyle='#241748';X.fillRect(x,30,3,4);}
  const n=Math.max(1,players.length);
  players.forEach((p,i)=>{const cx=Math.round((i+.5)*w/n),wi=win&&win(p);
    if(wi)for(let k=0;k<14;k++){const yy=((t/1000*(14+k%4*5)+k*11)%30),xx=cx-10+((k*23)%21);X.fillStyle=Q_CONF[k%Q_CONF.length];X.fillRect(xx,yy,(k+Math.floor(t/150))%3?2:1,1);}
    if(!p.gone)drawAvatar(X,cx,31,p.l,{blink:false,t:0});
    const mk=mark&&mark(p);if(mk){X.fillStyle='#fffdf7';X.fillRect(cx+5,4,7,7);X.fillStyle=mk;X.fillRect(cx+6,5,5,5);}});
  const k=players.map(p=>p.peer+':'+p.n+':'+(score?score(p):'')+':'+(win&&win(p)?1:0)).join(',');
  if(W.nm.dataset.k!==k){W.nm.dataset.k=k;W.nm.innerHTML='';
    players.forEach(p=>{const d=pgEl('div',win&&win(p)?'win':'',p.me?'Du':p.n);if(score){d.appendChild(pgEl('b','',String(score(p))));}W.nm.appendChild(d);});}
}

/* ================= Mini Games menu: arcade cards with a little pixel scene for each game ================= */
const GAMES=[
 {k:'quiz',n:'Quiz Show',s:'Fragen raten, startet sofort',open:()=>openQuiz(),live:()=>{const q=quizState();return q&&!q.mine?`Läuft bei ${q.by}`:'';}},
 {k:'draw',n:'Montagsmaler',s:'Einer malt, alle raten',open:()=>openDraw(),live:()=>pgLive('draw')},
 {k:'slf',n:'Stadt Land Fluss',s:'Ein Buchstabe, sechs Wörter',open:()=>openSlf(),live:()=>pgLive('slf')},
 {k:'hang',n:'Galgenmännchen',s:'Wort erraten, bevor die Blume welkt',open:()=>openHang(),live:()=>pgLive('hang')},
 {k:'c4',n:'Vier gewinnt',s:'Zu zweit oder gegen den Computer',open:()=>openC4(),live:()=>{const L=c4Leader(),c=c4State();return !L.self&&c?(c.ph==='wait'?`${c.p1[1]} sucht jemanden`:`${c.p1[1]} spielt`):'';}},
];
function pgLive(k){let by='';qFriends().forEach(p=>{const g=p.presence.pg;if(g&&g.k===k&&!by)by=str(g.by,14)||'Friend';});return by?`Läuft bei ${by}`:'';}
const GART={
 quiz(X){X.fillStyle='#2a1a55';X.fillRect(0,0,48,30);for(let i=0;i<8;i++){X.fillStyle=i%2?'#33206a':'#2d1c60';X.beginPath();X.moveTo(24,-4);X.lineTo(i*7-3,30);X.lineTo(i*7+4,30);X.fill();}
   for(let x=2;x<48;x+=4){X.fillStyle=x%8?'#f2c94c':'#8a6a20';X.fillRect(x,1,2,1);}X.fillStyle='#e8506c';X.fillRect(0,24,48,6);X.fillStyle='#3b2a6e';X.fillRect(9,17,10,7);X.fillRect(29,17,10,7);
   X.fillStyle='#fffdf7';X.fillRect(20,5,8,10);X.fillStyle='#e8506c';[[22,7],[23,6],[24,6],[25,7],[25,8],[24,9],[24,10],[24,12]].forEach(([x,y])=>X.fillRect(x,y,1,1));},
 draw(X){X.fillStyle='#2f7d7a';X.fillRect(0,0,48,30);X.fillStyle='#7a4a2a';X.fillRect(14,22,2,8);X.fillRect(32,22,2,8);X.fillRect(23,2,2,4);X.fillStyle='#5a3418';X.fillRect(12,21,24,2);
   X.fillStyle='#fffdf7';X.fillRect(12,5,24,16);X.fillStyle='#f2c94c';X.fillRect(15,8,4,4);X.fillStyle='#3f9a4a';X.fillRect(12,17,24,4);X.fillStyle='#e8506c';X.fillRect(25,12,7,5);X.fillStyle='#b5552a';X.fillRect(24,10,9,2);X.fillStyle='#1d1238';X.fillRect(27,14,2,3);
   X.fillStyle='#f49ab8';X.fillRect(38,9,2,10);X.fillStyle='#1d1238';X.fillRect(38,19,2,2);},
 slf(X){X.fillStyle='#c98a1e';X.fillRect(0,0,48,30);X.fillStyle='#fffdf7';X.fillRect(8,3,32,26);X.fillStyle='#b9d6f2';for(let y=9;y<28;y+=4)X.fillRect(9,y,30,1);X.fillStyle='#e8506c';X.fillRect(15,4,1,25);
   X.fillStyle='#1d1238';[[18,5,6,1],[17,6,2,1],[17,7,6,1],[22,8,2,1],[17,9,6,1]].forEach(a=>X.fillRect(a[0],a[1]+1,a[2],a[3]));X.fillStyle='#4f7fe0';X.fillRect(18,14,12,1);X.fillRect(18,18,9,1);X.fillRect(18,22,14,1);
   X.fillStyle='#f2c94c';X.fillRect(36,16,3,12);X.fillStyle='#1d1238';X.fillRect(36,28,3,1);X.fillStyle='#f49ab8';X.fillRect(36,14,3,2);},
 hang(X){X.fillStyle='#3a7a3a';X.fillRect(0,0,48,30);X.fillStyle='#2e6a30';for(let x=0;x<48;x+=3)X.fillRect(x,26,2,4);X.fillStyle='#5aa84a';X.fillRect(23,12,2,15);X.fillRect(19,18,4,2);
   X.fillStyle='#f2c94c';X.fillRect(22,8,4,4);X.fillStyle='#f49ab8';[[22,4],[27,7],[27,11],[17,11],[17,7]].forEach(([x,y])=>X.fillRect(x,y,4,3));X.fillStyle='#f49ab8';X.fillRect(36,20,2,2);X.fillRect(40,24,2,1);
   X.fillStyle='#fffdf7';for(let i=0;i<5;i++)X.fillRect(5+i*4,27,3,1);},
 c4(X){X.fillStyle='#142456';X.fillRect(0,0,48,30);X.fillStyle='#2f5fd0';X.fillRect(8,4,32,24);
   for(let r=0;r<4;r++)for(let c=0;c<6;c++){const v=(r===3&&c<4)||(r===2&&c===2)||(r===2&&c===3)||(r===1&&c===3);X.fillStyle=!v?'#142456':((r+c)%2?'#e8506c':'#f2c94c');X.fillRect(10+c*5,6+r*5,4,4);}},
};
function renderMenu(){
  const box=document.getElementById('gPick');let best=null;
  if(!box.dataset.built){box.dataset.built=1;box.innerHTML='';
    GAMES.forEach(g=>{const b=pgEl('button','mcard g-'+g.k);b.type='button';b.dataset.k=g.k;
      const cv=pgEl('canvas');cv.width=48;cv.height=30;GART[g.k](cv.getContext('2d'));b.appendChild(cv);
      const tx=pgEl('span','gtx');tx.appendChild(pgEl('span','gn',g.n));tx.appendChild(pgEl('span','gs',g.s));b.appendChild(tx);
      b.onclick=()=>{askM.classList.remove('show');Sfx.click();g.open();};box.appendChild(b);});}
  GAMES.forEach(g=>{const b=box.querySelector('[data-k="'+g.k+'"]'),s=b.querySelector('.gs'),lv=g.live()||'';
    const t=lv?lv+': mitmachen':g.s;if(s.textContent!==t)s.textContent=t;b.classList.toggle('live',!!lv);if(lv&&!best)best=b;});
  return best||box.firstChild;
}
function askQuiz(){const f=renderMenu();askM.classList.add('show');setTimeout(()=>f&&f.focus(),30);}
setInterval(()=>{if(askM.classList.contains('show'))renderMenu();},800);
