/* ================= Stadt Land Fluss =================
   A letter is drawn, everyone fills six fields. Whoever has all six can call "Stopp", then everyone has 5 more seconds.
   Then everybody checks the answers together: tap a friend's answer to vote it out. Unique answers score more. */
const SLF_CATS=['Stadt','Land','Fluss','Tier','Name','Beruf'], SLF_LET='ABDEFGHIKLMNOPRSTUW', SLF_T=120000, SLF_GRACE=5000, SLF_VOTE=60000, SLF_LEAD=3000;
let sOpen=false, sMy={id:'',a:['','','','','',''],st:0,v:{},vd:0}, sDone='', sBeepK='';
const sW=pgWindow('slfM','STADT LAND','FLUSS','t-slf',()=>closeSlf());
const sClean=g=>{if(typeof g.id!=='string'||!/^s[0-9a-z]{4,16}$/.test(g.id)||typeof g.L!=='string'||!/^[A-Z]$/.test(g.L))return null;
  return {k:'slf',id:g.id,at:num(g.at,0),by:str(g.by,14)||'Friend',L:g.L,t0:num(g.t0,0)};};
const sLoc=(g,o)=>Object.assign(g,{at:g.at+o,t0:g.t0+o});
function sJ(j){const a=Array.isArray(j&&j.a)?j.a.slice(0,6).map(x=>str(x,30)):[];while(a.length<6)a.push('');
  const v={};if(j&&j.v&&typeof j.v==='object')for(const k in j.v)if(j.v[k])v[str(k,80)]=1;return {a,st:num(j&&j.st,0),v,vd:j&&j.vd?1:0};}
function sPlayers(g){
  const ps=pgFriends('slf',g?g.id:'').map(p=>Object.assign(p,{s:sJ(p.j)}));
  if(sOpen)ps.unshift(Object.assign(pgMe(),{s:g&&sMy.id===g.id?sJ(sMy):sJ(null)}));
  return g?pgKeep('slf',g.id,ps).map(p=>p.s?p:Object.assign(p,{s:sJ(p.j)})):ps;
}
function sTimes(g,ps){
  let stop=0,by='';ps.forEach(p=>{if(p.s.st){const t=p.s.st+(p.o||0);if(!stop||t<stop){stop=t;by=p.me?'Du':p.n;}}});
  const W=Math.min(g.t0+SLF_T,stop?stop+SLF_GRACE:Infinity);
  const live=ps.filter(p=>!p.gone),allDone=live.length&&live.every(p=>p.s.vd);
  return {stop,by,W,V:W+SLF_VOTE,allDone};
}
function sPhase(g,now,ps){ps=ps||sPlayers(g);const T=sTimes(g,ps);
  const ph=now<g.t0?'count':now<T.W?'write':(now<T.V&&!T.allDone)?'vote':'end';return Object.assign(T,{ph,ps});}
const sOver=(g,now)=>sPhase(g,now).ph==='end';
function sRound(){return pgRound('slf',sClean,sLoc,sOver);}
// which answers count, and the points
function sValid(g,ps,p,i){const a=pgNorm(p.s.a[i]);if(!a||a[0]!==g.L.toLowerCase())return false;
  const n=ps.length,veto=ps.filter(q=>q.peer!==p.peer&&q.s.v[p.peer+'|'+i]).length;return !(veto>0&&veto*2>n-1);}
function sScores(g,ps){const sc={};ps.forEach(p=>sc[p.peer]=0);
  for(let i=0;i<6;i++){const ok=ps.filter(p=>sValid(g,ps,p,i));
    ok.forEach(p=>{const a=pgNorm(p.s.a[i]),same=ok.filter(q=>pgNorm(q.s.a[i])===a).length;sc[p.peer]+=ok.length===1?20:same>1?5:10;});}
  return sc;}
function sStart(){
  const g=sRound();if(g&&!sOver(g,Date.now()))return;
  const now=Date.now(),S=pgS('slf');S.mine={k:'slf',id:pgId('s'),at:now,by:(me().name||'Friend').slice(0,14),L:SLF_LET[Math.floor(Math.random()*SLF_LET.length)],t0:now+SLF_LEAD};
  pgPub();Sfx.click();sTick();sRender(true);
}
function sPubMe(fast){const g=sRound();const o={k:'slf',id:sMy.id,a:sMy.a,st:sMy.st,v:sMy.v,vd:sMy.vd};fast?pjSoon(o):pjPub(o);}
function sTick(){
  const S=pgS('slf'),now=Date.now();
  if(S.mine){const open=pgRounds('slf',sClean,sLoc).filter(x=>!sOver(x,now)).sort(qFirst);
    if(open.length&&!open[0].mine){S.mine=null;pgPub();}
    else if(sOver(Object.assign({},S.mine,{mine:true}),now)){S.mine=null;pgPub();}}
  const g=sRound();
  if(sOpen&&g&&!sOver(g,now)){if(sMy.id!==g.id){sMy={id:g.id,a:['','','','','',''],st:0,v:{},vd:0};sPubMe();}S.cur=g;}
  if(g&&S.cur&&S.cur.id===g.id&&sOver(g,now)&&!S.cur.endAt)S.cur.endAt=now;
  if(sOpen){if(g){const P=sPhase(g,now);
      if(P.ph==='count'){const n=Math.ceil((g.t0-now)/1000);if(n<=3&&sBeepK!==g.id+n){sBeepK=g.id+n;try{Sfx.beep(false);}catch(e){}}}
      else if(P.ph==='write'&&sBeepK!==g.id+'go'&&now-g.t0<800){sBeepK=g.id+'go';try{Sfx.beep(true);}catch(e){}}}
    sRender();}
}
setInterval(sTick,150);
function openSlf(){sOpen=true;sW.m.classList.add('show');pjPub({k:'slf',id:''});sTick();sRender(true);}
function closeSlf(){sW.m.classList.remove('show');sOpen=false;pjPub(null);const S=pgS('slf');S.cur=null;
  if(S.mine&&!sPlayers(Object.assign({},S.mine,{mine:true})).some(p=>!p.gone&&!p.me)){S.mine=null;pgPub();}}
function sRender(force){
  if(!sOpen)return;
  const now=Date.now(),g=sRound(),B=sW.body,P=g?sPhase(g,now):null,ph=P?P.ph:'lobby',ps=P?P.ps:sPlayers(null);
  const set=(e,t)=>{if(e.textContent!==t)e.textContent=t;};
  set(sW.info,ph==='write'?Math.max(0,Math.ceil((P.W-now)/1000))+' S':ph==='vote'?'PRÜFEN':'');
  const key=[g?g.id:'',ph,ph==='vote'||ph==='end'?ps.map(p=>p.peer+p.s.a.join(',')+Object.keys(p.s.v).join(',')+p.s.vd).join(';'):'',ph==='write'?(P.stop?1:0):''].join('|');
  if(force||B.dataset.k!==key){const keepFocus=document.activeElement&&B.contains(document.activeElement)?document.activeElement.dataset.i:null;B.dataset.k=key;B.innerHTML='';
    if(ph==='count'||ph==='write'){
      const top=pgEl('div','sletter');top.appendChild(pgEl('span','sL',ph==='count'?'?':g.L));
      top.appendChild(pgEl('span','qnote',ph==='count'?'Gleich wird der Buchstabe gezogen …':P.stop?`Stopp von ${P.by}! Noch kurz zu Ende schreiben.`:'Alles mit diesem Buchstaben'));B.appendChild(top);
      const bar=pgEl('div','qbar sbar');const bi=pgEl('i');bar.appendChild(bi);B.appendChild(bar);sW.bar=bi;
      if(ph==='write'){const f=pgEl('div','sform');
        SLF_CATS.forEach((c,i)=>{const lab=pgEl('label','sfield');lab.appendChild(pgEl('span','',c));const inp=pgEl('input','inp');inp.maxLength=30;inp.autocomplete='off';inp.autocapitalize='words';inp.spellcheck=false;inp.dataset.i=i;inp.value=sMy.a[i]||'';
          inp.addEventListener('input',()=>{sMy.a[i]=inp.value.slice(0,30);sPubMe(true);sStopBtn(g);});
          inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();const n=f.querySelector('input[data-i="'+(i+1)+'"]');n?n.focus():inp.blur();}});
          lab.appendChild(inp);f.appendChild(lab);});
        B.appendChild(f);const stp=pgBtn('btn dark gbig sstop','Stopp!',()=>{if(sMy.st||!sAllFilled(g))return;sMy.st=Date.now();sPubMe();try{Sfx.beep(true);}catch(e){}sTick();});
        B.appendChild(stp);sW.stop=stp;sStopBtn(g);
        if(keepFocus!==null){const n=f.querySelector('input[data-i="'+keepFocus+'"]');if(n)n.focus();}}
    } else if(ph==='vote'||ph==='end'){
      const sc=ph==='end'?sScores(g,ps):null;
      if(ph==='end'){const R=ps.slice().sort((a,b)=>sc[b.peer]-sc[a.peer]),top=R.length?sc[R[0].peer]:0;
        B.appendChild(pgEl('div','gres ok',R.length>1&&sc[R[1].peer]===top?'Unentschieden!':R[0]&&R[0].me?'Du gewinnst!':R[0]?R[0].n+' gewinnt!':'Fertig'));
        const rk=pgEl('div','qrank');R.forEach((p,i)=>{const d=pgEl('div');d.appendChild(pgEl('span','',(i+1)+'. '+(p.me?'Du':p.n)));d.appendChild(pgEl('span','',sc[p.peer]+' Punkte'));rk.appendChild(d);});B.appendChild(rk);
        if(top>0&&sDone!==g.id&&sMy.id===g.id&&R.some(p=>p.me&&sc[p.peer]===top)){sDone=g.id;qConfetti();coinsForWin(R.length>1?8:3);}}
      else B.appendChild(pgEl('div','qnote','Prüft zusammen: Tipp auf eine Antwort, die nicht zählen soll.'));
      const L=pgEl('div','svote');
      SLF_CATS.forEach((c,i)=>{const card=pgEl('div','scat');card.appendChild(pgEl('b','',c+' mit '+g.L));
        ps.forEach(p=>{const ok=sValid(g,ps,p,i),mine=!!sMy.v[p.peer+'|'+i],a=p.s.a[i]||'–';
          const row=pgBtn('sans'+(ok?'':' out')+(mine?' veto':''),'',()=>{if(ph!=='vote'||p.me||!p.s.a[i])return;const k=p.peer+'|'+i;if(sMy.v[k])delete sMy.v[k];else sMy.v[k]=1;sPubMe();sTick();});
          row.disabled=ph!=='vote'||!!p.me||!p.s.a[i];row.appendChild(pgEl('span','sn',p.me?'Du':p.n));row.appendChild(pgEl('span','sa',a));card.appendChild(row);});
        L.appendChild(card);});
      B.appendChild(L);
      if(ph==='vote'){const done=pgBtn('btn dark gbig',sMy.vd?'Warte auf die anderen …':'Fertig geprüft',()=>{sMy.vd=1;sPubMe();sTick();});done.disabled=!!sMy.vd;B.appendChild(done);}
    }
    if(ph==='lobby'||ph==='end'){const row=pgEl('div','gstart');row.appendChild(pgBtn('btn dark gbig',ph==='end'?'Nächste Runde':'Runde starten',()=>sStart()));B.appendChild(row);
      if(ph==='lobby')B.appendChild(pgEl('div','qnote','Ein Buchstabe, sechs Felder: Stadt, Land, Fluss, Tier, Name, Beruf.'));}
  }
  if((ph==='count'||ph==='write')&&sW.bar){const left=ph==='count'?1:Math.max(0,(P.W-now)/SLF_T);sW.bar.style.width=(100*Math.min(1,left)).toFixed(1)+'%';sW.bar.parentNode.classList.toggle('low',ph==='write'&&P.W-now<10000);}
  if(ph==='count'){const l=B.querySelector('.sL');if(l)l.textContent=SLF_LET[Math.floor(performance.now()/90)%SLF_LET.length];}
  const sc=ph==='end'?sScores(g,ps):null,top=sc?Math.max(0,...Object.values(sc)):0;
  pgStrip(sW,ps,sc?p=>sc[p.peer]+' P':null,ph==='write'?p=>p.s.st?'#e8506c':(sAllFilled(g,p.s.a)?'#3f9a4a':null):ph==='vote'?p=>p.s.vd?'#3f9a4a':null:null,sc?p=>top>0&&sc[p.peer]===top:null);
}
function sAllFilled(g,a){a=a||sMy.a;return a.every(x=>{const n=pgNorm(x);return n&&n[0]===g.L.toLowerCase();});}
function sStopBtn(g){if(!sW.stop)return;const ok=sAllFilled(g)&&!sMy.st;sW.stop.disabled=!ok;sW.stop.textContent=sMy.st?'Gestoppt':'Stopp!';}
