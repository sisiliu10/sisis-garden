/* ================= Montagsmaler =================
   Everyone draws once on a small pixel canvas; the others guess the word. The drawer's device checks the guesses
   (the word never leaves it until the turn is over). The starter ends a turn early once everyone has it. */
const DRAW_WORDS='SONNE HAUS BAUM KATZE HUND FISCH AUTO FAHRRAD BLUME APFEL BANANE PIZZA EIS HERZ STERN MOND WOLKE SCHIFF FLUGZEUG RAKETE SCHNEEMANN BRILLE HUT SCHUH UHR SCHLÜSSEL BUCH LAMPE STUHL BETT GITARRE KUCHEN KERZE GESCHENK BALLON DRACHE SCHMETTERLING SPINNE SCHNECKE ENTE PINGUIN ELEFANT GIRAFFE SCHLANGE KRONE BURG LEUCHTTURM BERG VULKAN INSEL PALME KAKTUS PILZ KIRSCHE ERDBEERE KAROTTE BREZEL TASSE ZAHNBÜRSTE REGENSCHIRM BRIEF HANDY KAMERA AMPEL ZUG ANKER BRÜCKE ZELT LAGERFEUER REGENBOGEN BLITZ SCHNEEFLOCKE GEIST ROBOTER EINHORN KROKODIL HASE MAUS EULE BIENE IGEL WAL QUALLE TOMATE DONUT HAMBURGER GLÜHBIRNE KOPFHÖRER SOCKE RUCKSACK SCHERE KAKTUS SCHAUKEL'.split(' ');
const DRAW_PAL=['#fffdf7','#1d1238','#e8506c','#f2a33a','#f2c94c','#3f9a4a','#4f7fe0','#8a4fc0','#8a5a2a','#f49ab8'];
const D_GW=32, D_GH=24, D_T=75000, D_R=4500, D_LEAD=3000;
let dOpen=false, dMy={id:'',c:null,n:{},ok:{},w:{},gs:[]}, dWord={}, dCol=1, dPx=null, dLast=null, dDone='', dBeepK='', dFeedK='';
const dW=pgWindow('drawM','MONTAGS','MALER','t-draw',()=>closeDraw());
const dClean=g=>{if(typeof g.id!=='string'||!/^d[0-9a-z]{4,16}$/.test(g.id)||!Array.isArray(g.order)||g.order.length<2)return null;
  return {k:'draw',id:g.id,at:num(g.at,0),by:str(g.by,14)||'Friend',order:g.order.slice(0,6).map(x=>str(x,80)),nm:(Array.isArray(g.nm)?g.nm:[]).slice(0,6).map(x=>str(x,14)||'Friend'),t0:num(g.t0,0),
    cut:(Array.isArray(g.cut)?g.cut:[]).slice(0,6).map(v=>Number.isFinite(v)?v:0)};};
const dLoc=(g,o)=>Object.assign(g,{at:g.at+o,t0:g.t0+o,cut:g.cut.map(v=>v?v+o:0)});
function dTimes(g){const S=[],E=[];let t=g.t0;for(let i=0;i<g.order.length;i++){S.push(t);let e=t+D_T;if(g.cut[i]&&g.cut[i]<e)e=Math.max(t+1500,g.cut[i]);E.push(e);t=e+D_R;}return {S,E,end:t};}
function dPhase(g,now){const T=dTimes(g);if(now<T.S[0])return {ph:'count',T};
  for(let i=0;i<g.order.length;i++){if(now<T.E[i])return {ph:'draw',i,T};if(now<T.E[i]+D_R)return {ph:'rev',i,T};}return {ph:'end',T};}
const dOver=(g,now)=>dPhase(g,now).ph==='end';
function dRound(){return pgRound('draw',dClean,dLoc,dOver);}
function dPlayers(g){const ps=pgFriends('draw',g?g.id:'');if(dOpen)ps.unshift(pgMe(g&&dMy.id===g.id?dMy:{}));return g?pgKeep('draw',g.id,ps):ps;}
// what the drawer of turn i published
function dDrawer(g,i,ps){const pe=g.order[i];return ps.find(p=>p.peer===pe)||null;}
function dOk(g,i,ps){const d=dDrawer(g,i,ps),o=d&&d.j&&d.j.ok&&d.j.ok[i];const r={};if(o&&typeof o==='object')for(const k in o)r[k]=clamp(num(o[k],D_T),0,D_T);return r;}
function dScores(g,ps,upto){const sc={};ps.forEach(p=>sc[p.peer]=0);
  for(let i=0;i<=upto&&i<g.order.length;i++){const ok=dOk(g,i,ps),dr=g.order[i];
    for(const k in ok){sc[k]=(sc[k]||0)+40+Math.round(60*(1-ok[k]/D_T));sc[dr]=(sc[dr]||0)+25;}}
  return sc;}
// the canvas travels as runs: "<colour><count in base 36>,"
function dEnc(px){let s='',c=px[0],n=0;for(let i=0;i<=px.length;i++){if(i<px.length&&px[i]===c)n++;else{s+=c+n.toString(36)+',';c=px[i];n=1;}}return s;}
function dDec(s){const px=new Array(D_GW*D_GH).fill(0);if(typeof s!=='string')return px;let i=0;s.split(',').forEach(r=>{if(!r)return;const c=+r[0],n=parseInt(r.slice(1),36);if(!(c>=0&&c<DRAW_PAL.length)||!(n>0))return;for(let k=0;k<n&&i<px.length;k++)px[i++]=c;});return px;}
function dNorm(t){return pgNorm(t).split(' ').filter(w=>w&&!['der','die','das','ein','eine','einen'].includes(w)).join('');}
function dStart(){
  const g=dRound();if(g&&!dOver(g,Date.now()))return;
  const ps=dPlayers(null).filter(p=>!p.gone).slice(0,6);if(ps.length<2)return;
  const order=shuffled(ps),now=Date.now(),S=pgS('draw');
  S.mine={k:'draw',id:pgId('d'),at:now,by:(me().name||'Friend').slice(0,14),order:order.map(p=>p.peer),nm:order.map(p=>(p.n||'Friend').slice(0,14)),t0:now+D_LEAD,cut:[]};
  pgPub();Sfx.click();dTick();dRender(true);
}
function dGuess(t){const g=dRound(),P=g&&dPhase(g,Date.now());t=String(t||'').trim().slice(0,30);if(!t||!g||P.ph!=='draw'||g.order[P.i]===myPeer()||dMy.id!==g.id)return;
  dMy.gs=dMy.gs.concat([[P.i,t,Date.now()-P.T.S[P.i]]]).slice(-8);pjPub(dPub());Sfx.click();dTick();}
function dPub(){return {k:'draw',id:dMy.id,c:dMy.c,n:dMy.n,ok:dMy.ok,w:dMy.w,gs:dMy.gs};}
function dTick(){
  const S=pgS('draw'),now=Date.now();
  if(S.mine){const open=pgRounds('draw',dClean,dLoc).filter(x=>!dOver(x,now)).sort(qFirst);
    if(open.length&&!open[0].mine){S.mine=null;pgPub();}
    else if(dOver(Object.assign({},S.mine,{mine:true}),now)){S.mine=null;pgPub();}}
  const g=dRound();
  if(dOpen&&g&&!dOver(g,now)){if(dMy.id!==g.id){dMy={id:g.id,c:null,n:{},ok:{},w:{},gs:[]};pjPub(dPub());}S.cur=g;}
  if(g&&S.cur&&S.cur.id===g.id&&dOver(g,now)&&!S.cur.endAt)S.cur.endAt=now;
  if(g&&dMy.id===g.id){const P=dPhase(g,now),ps=dPlayers(g);let ch=false;
    // my turn to draw: pick a word, check what the others guess
    g.order.forEach((pe,i)=>{if(pe!==myPeer())return;const k=g.id+'|'+i;
      if((P.ph==='draw'&&P.i===i)&&!dWord[k]){const used=new Set(Object.values(dWord));dWord[k]=shuffled(DRAW_WORDS).find(w=>!used.has(w))||'SONNE';dMy.n[i]=dWord[k].length;dMy.c={i,px:''};dPx=new Array(D_GW*D_GH).fill(0);ch=true;}
      if(P.ph==='draw'&&P.i===i){const ok=dMy.ok[i]=dMy.ok[i]||{};
        ps.forEach(p=>{if(p.me||p.gone||ok[p.peer]!==undefined)return;const gs=Array.isArray(p.j.gs)?p.j.gs:[];
          const hit=gs.find(x=>Array.isArray(x)&&x[0]===i&&dNorm(x[1])===dNorm(dWord[k]));if(hit){ok[p.peer]=clamp(num(hit[2],D_T),0,D_T);ch=true;}});}
      if(dWord[k]&&(P.ph!=='draw'||P.i>i)&&!dMy.w[i]){dMy.w[i]=dWord[k];ch=true;}});
    if(ch)pjPub(dPub());
    // the starter ends a turn as soon as everybody has guessed it
    if(S.mine&&S.mine.id===g.id&&P.ph==='draw'&&!S.mine.cut[P.i]){const ok=dOk(g,P.i,ps),gu=ps.filter(p=>!p.gone&&p.peer!==g.order[P.i]);
      if(gu.length&&gu.every(p=>ok[p.peer]!==undefined)){S.mine.cut[P.i]=Date.now()+1200;pgPub();}}
    if(dOpen){const key=P.ph+(P.i??'');if(P.ph==='count'){const n=Math.ceil((P.T.S[0]-now)/1000);if(n<=3&&dBeepK!==g.id+'c'+n){dBeepK=g.id+'c'+n;try{Sfx.beep(false);}catch(e){}}}
      else if(P.ph==='draw'&&dBeepK!==g.id+key){dBeepK=g.id+key;try{Sfx.beep(true);}catch(e){}}}
  }
  if(dOpen)dRender();
}
setInterval(dTick,150);
function openDraw(){dOpen=true;dW.m.classList.add('show');pjPub({k:'draw',id:''});dTick();dRender(true);}
function closeDraw(){dW.m.classList.remove('show');dOpen=false;pjPub(null);const S=pgS('draw');S.cur=null;
  if(S.mine&&!dPlayers(Object.assign({},S.mine,{mine:true})).some(p=>!p.gone&&!p.me)){S.mine=null;pgPub();}}
function dCell(cv,e){const r=cv.getBoundingClientRect();return [clamp(Math.floor((e.clientX-r.left)/r.width*D_GW),0,D_GW-1),clamp(Math.floor((e.clientY-r.top)/r.height*D_GH),0,D_GH-1)];}
function dPaint(x0,y0,x1,y1){const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy;
  for(;;){dPx[y0*D_GW+x0]=dCol;if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx;}if(e2<=dx){e+=dx;y0+=sy;}}}
function dSendPx(i){dMy.c={i,px:dEnc(dPx)};pjSoon(dPub());}
function dRender(force){
  if(!dOpen)return;
  const now=Date.now(),g=dRound(),B=dW.body,P=g?dPhase(g,now):{ph:'lobby'},ps=dPlayers(g),ph=P.ph,i=P.i;
  const set=(e,t)=>{if(e.textContent!==t)e.textContent=t;};
  const drawer=g&&(ph==='draw'||ph==='rev')?g.order[i]:null,iDraw=drawer===myPeer();
  set(dW.info,ph==='draw'?Math.max(0,Math.ceil((P.T.E[i]-now)/1000))+' S':ph==='count'?'GLEICH':'');
  const key=[g?g.id:'',ph,i??'',ph==='lobby'?ps.length:'',ph==='end'?ps.map(p=>p.peer).join():''].join('|');
  if(force||B.dataset.k!==key){B.dataset.k=key;B.innerHTML='';dW.cv=null;dW.feed=null;dW.hint=null;
    if(ph==='lobby'||ph==='end'){
      if(ph==='end'){const sc=dScores(g,ps,g.order.length-1),R=ps.slice().sort((a,b)=>sc[b.peer]-sc[a.peer]),top=R.length?sc[R[0].peer]:0;
        B.appendChild(pgEl('div','gres ok',R.length>1&&sc[R[1].peer]===top?'Unentschieden!':R[0]&&R[0].me?'Du gewinnst!':R[0]?R[0].n+' gewinnt!':'Fertig'));
        const rk=pgEl('div','qrank');R.forEach((p,k)=>{const d=pgEl('div');d.appendChild(pgEl('span','',(k+1)+'. '+(p.me?'Du':p.n)));d.appendChild(pgEl('span','',sc[p.peer]+' Punkte'));rk.appendChild(d);});B.appendChild(rk);
        if(top>0&&dDone!==g.id&&dMy.id===g.id&&R.some(p=>p.me&&sc[p.peer]===top)){dDone=g.id;qConfetti();}}
      const n=ps.filter(p=>!p.gone).length,row=pgEl('div','gstart'),b=pgBtn('btn dark gbig',ph==='end'?'Nochmal':'Runde starten',()=>dStart());b.disabled=n<2;row.appendChild(b);B.appendChild(row);
      B.appendChild(pgEl('div','qnote',n<2?'Montagsmaler braucht mindestens zwei. Warte, bis jemand das Spiel öffnet.':`${n} Leute sind da. Jeder malt einmal, die anderen raten.`));
    } else if(ph==='count'){B.appendChild(pgEl('div','gres ok',String(Math.max(1,Math.ceil((P.T.S[0]-now)/1000)))));B.appendChild(pgEl('div','qnote',`Als Erstes malt ${g.order[0]===myPeer()?'du':g.nm[0]}.`));}
    else {
      const head=pgEl('div','dhead');
      if(ph==='draw'&&iDraw)head.appendChild(pgEl('div','dword','Du malst: '+(dWord[g.id+'|'+i]||'')));
      else if(ph==='draw'){head.appendChild(pgEl('div','qnote',(g.nm[i]||'Jemand')+' malt'));const h=pgEl('div','dhint');head.appendChild(h);dW.hint=h;}
      else{const d=dDrawer(g,i,ps),w=d&&d.j&&d.j.w&&d.j.w[i]?str(d.j.w[i],20):(iDraw?dWord[g.id+'|'+i]:'')||'…';head.appendChild(pgEl('div','dword','Das Wort war: '+w));}
      B.appendChild(head);
      const cv=pgEl('canvas','dcanvas'+(iDraw&&ph==='draw'?' mine':''));cv.width=D_GW;cv.height=D_GH;B.appendChild(cv);dW.cv=cv;
      if(iDraw&&ph==='draw'){
        let down=false;cv.addEventListener('pointerdown',e=>{down=true;cv.setPointerCapture(e.pointerId);const [x,y]=dCell(cv,e);dLast=[x,y];dPaint(x,y,x,y);dSendPx(i);e.preventDefault();});
        cv.addEventListener('pointermove',e=>{if(!down)return;const [x,y]=dCell(cv,e);dPaint(dLast[0],dLast[1],x,y);dLast=[x,y];dSendPx(i);});
        const up=()=>{down=false;};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
        const pal=pgEl('div','dpal');DRAW_PAL.forEach((c,k)=>{const b=pgBtn('dsw'+(k===dCol?' on':'')+(k===0?' er':''),'',()=>{dCol=k;pal.querySelectorAll('.dsw').forEach((x,j)=>x.classList.toggle('on',j===k));});b.style.background=c;b.setAttribute('aria-label',k===0?'Radierer':'Farbe '+k);pal.appendChild(b);});
        pal.appendChild(pgBtn('qlink','Leeren',()=>{dPx.fill(0);dSendPx(i);}));B.appendChild(pal);
      } else if(ph==='draw'){
        const row=pgEl('div','row');const inp=pgEl('input','inp');inp.maxLength=30;inp.placeholder='Was ist das?';inp.autocomplete='off';inp.setAttribute('aria-label','Raten');
        const go=pgBtn('btn dark','Raten',()=>{dGuess(inp.value);inp.value='';inp.focus();});inp.addEventListener('keydown',e=>{if(e.key==='Enter')go.click();});
        row.appendChild(inp);row.appendChild(go);B.appendChild(row);dW.inp=inp;
      }
      const f=pgEl('div','dfeed');B.appendChild(f);dW.feed=f;dFeedK='';
    }
  }
  // live parts: the picture, the hint, the guesses
  if(dW.cv&&g){const X=dW.cv.getContext('2d'),px=iDraw&&ph==='draw'?dPx:(()=>{const d=dDrawer(g,i,ps);return dDec(d&&d.j&&d.j.c&&d.j.c.i===i?d.j.c.px:(iDraw&&dPx?dEnc(dPx):''));})();
    for(let y=0;y<D_GH;y++)for(let x=0;x<D_GW;x++){const c=px[y*D_GW+x];X.fillStyle=c?DRAW_PAL[c]:((x+y)%2?'#fffdf7':'#f5efe2');X.fillRect(x,y,1,1);}}
  if(dW.hint&&g){const d=dDrawer(g,i,ps),n=d&&d.j&&d.j.n?num(d.j.n[i],0):0,ok=dOk(g,i,ps)[myPeer()]!==undefined;set(dW.hint,ok?'Richtig geraten!':n?'_ '.repeat(n).trim():'');dW.hint.classList.toggle('ok',ok);
    if(dW.inp)dW.inp.disabled=ok;}
  if(dW.feed&&g){const ok=dOk(g,i,ps),items=[];ps.forEach(p=>{(Array.isArray(p.j.gs)?p.j.gs:[]).forEach(x=>{if(Array.isArray(x)&&x[0]===i)items.push({p,t:str(x[1],30),ms:num(x[2],0)});});});
    items.sort((a,b)=>a.ms-b.ms);const seen=new Set(),out=[];items.forEach(x=>{if(ok[x.p.peer]!==undefined&&Math.abs(ok[x.p.peer]-x.ms)<5){if(seen.has(x.p.peer))return;seen.add(x.p.peer);out.push([x.p.me?'Du':x.p.n,'hat es erraten!',1]);}else if(!(ok[x.p.peer]!==undefined&&x.ms>ok[x.p.peer]))out.push([x.p.me?'Du':x.p.n,x.t,0]);});
    const k=JSON.stringify(out.slice(-6));if(k!==dFeedK){dFeedK=k;dW.feed.innerHTML='';out.slice(-6).forEach(([n,t,o])=>{const d=pgEl('div',o?'ok':'');d.appendChild(pgEl('b','',n));d.appendChild(document.createTextNode(' '+t));dW.feed.appendChild(d);});}}
  const sc=g?dScores(g,ps,ph==='end'?g.order.length-1:ph==='rev'?i:(i??0)-1):null,top=sc?Math.max(0,...Object.values(sc)):0;
  pgStrip(dW,ps,sc?p=>(sc[p.peer]||0)+' P':null,g&&ph==='draw'?p=>p.peer===drawer?'#f2a33a':(dOk(g,i,ps)[p.peer]!==undefined?'#3f9a4a':null):null,ph==='end'?p=>top>0&&sc[p.peer]===top:null);
}
