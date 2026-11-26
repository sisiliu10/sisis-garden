/* ================= Galgenmännchen, as a flower =================
   Everyone guesses letters together; every wrong letter costs the flower a petal (7 petals).
   A random word from the list, or one that a friend makes up (then they watch). */
const HANG_WORDS={
 'Tiere':'ELEFANT GIRAFFE PINGUIN SCHMETTERLING KROKODIL EICHHÖRNCHEN SCHILDKRÖTE KÄNGURU FLAMINGO ERDMÄNNCHEN DELFIN QUALLE PAPAGEI WASCHBÄR MAULWURF NASHORN',
 'Essen':'SPAGHETTI BREZEL PFANNKUCHEN ERDBEERE SCHOKOLADE KARTOFFEL KÄSEKUCHEN WASSERMELONE MANDARINE KNOBLAUCH PFIRSICH BROKKOLI LEBKUCHEN PIZZA HONIGMELONE',
 'Zuhause':'KÜHLSCHRANK STAUBSAUGER BÜCHERREGAL KISSEN SCHUBLADE WASCHMASCHINE BADEWANNE TEPPICH FERNSEHER TREPPE FENSTER KERZE WECKER BLUMENTOPF',
 'Natur':'REGENBOGEN WASSERFALL VULKAN GEWITTER SONNENBLUME LÖWENZAHN TANNENBAUM SCHNEEFLOCKE GLETSCHER WÜSTE PILZ KASTANIE SEEROSE',
 'Länder':'JAPAN ARGENTINIEN NORWEGEN ÄGYPTEN AUSTRALIEN MEXIKO PORTUGAL ISLAND KANADA INDONESIEN NEUSEELAND MAROKKO',
 'Freizeit':'FAHRRAD ACHTERBAHN SCHWIMMBAD PICKNICK GITARRE SKATEBOARD KARAOKE TRAMPOLIN SANDBURG ZELTLAGER RIESENRAD',
};
const HANG_MAX=7, HANG_KEYS=['QWERTZUIOPÜ','ASDFGHJKLÖÄ','YXCVBNM'];
let hOpen=false, hMy={id:'',l:{}}, hErr='', hFx={w:0,at:0,id:''}, hDone='';
const hW=pgWindow('hangM','GALGEN','MÄNNCHEN','t-hang',()=>closeHang());
const hClean=g=>{const w=str(g.w,20);if(typeof g.id!=='string'||!/^h[0-9a-z]{4,16}$/.test(g.id)||!/^[A-ZÄÖÜ]{3,20}$/.test(w))return null;
  return {k:'hang',id:g.id,at:num(g.at,0),by:str(g.by,14)||'Friend',w,cat:str(g.cat,20),own:g.own?1:0};};
const hLoc=(g,o)=>Object.assign(g,{at:g.at+o});
function hPlayers(g){
  const ps=pgFriends('hang',g?g.id:'');if(hOpen)ps.unshift(pgMe({l:g&&hMy.id===g.id?hMy.l:{}}));
  return g?pgKeep('hang',g.id,ps):ps;
}
function hLetters(j){const o={};if(j&&j.l&&typeof j.l==='object')for(const c in j.l)if(/^[A-ZÄÖÜ]$/.test(c))o[c]=num(j.l[c],0);return o;}
function hState(g,ps){
  ps=ps||hPlayers(g);const first={};
  ps.forEach(p=>{const L=hLetters(p.j);for(const c in L)if(!(c in first)||L[c]<first[c].t)first[c]={t:L[c],p:p.peer};});
  const set=new Set(Object.keys(first)),need=new Set(g.w.split(''));
  const wrong=[...set].filter(c=>!need.has(c)).sort((a,b)=>first[a].t-first[b].t);
  const solved=[...need].every(c=>set.has(c)),lost=!solved&&wrong.length>=HANG_MAX;
  const credit={};[...set].forEach(c=>{if(need.has(c))credit[first[c].p]=(credit[first[c].p]||0)+1;});
  return {set,wrong,solved,lost,credit,ps};
}
const hOver=(g,now)=>{const s=hState(g);return s.solved||s.lost||now-g.at>1800000;};
function hRound(){return pgRound('hang',hClean,hLoc,hOver);}
function hStart(word,own){
  const g=hRound();if(g&&!hOver(g,Date.now()))return;
  let cat='';if(!word){const cats=Object.keys(HANG_WORDS);cat=cats[Math.floor(Math.random()*cats.length)];const L=HANG_WORDS[cat].split(' ');word=L[Math.floor(Math.random()*L.length)];}
  word=String(word).toUpperCase().replace(/ß/g,'SS').replace(/[^A-ZÄÖÜ]/g,'');
  if(word.length<3||word.length>20){hErr='Das Wort braucht 3 bis 20 Buchstaben, ohne Leerzeichen.';hRender(true);return;}
  const S=pgS('hang');S.mine={k:'hang',id:pgId('h'),at:Date.now(),by:(me().name||'Friend').slice(0,14),w:word,cat:own?'':cat,own:own?1:0};hErr='';
  pgPub();Sfx.click();hTick();hRender(true);
}
function hGuess(c){
  const g=hRound();if(!hOpen||!g||hOver(g,Date.now())||(g.own&&g.mine))return;
  if(hMy.id!==g.id)hMy={id:g.id,l:{}};
  if(hState(g).set.has(c))return;
  hMy.l[c]=Date.now()-g.at;pjPub({k:'hang',id:g.id,l:hMy.l});
  try{g.w.includes(c)?Sfx.click():Sfx.beep(false,.6);}catch(e){}
  hTick();
}
function hTick(){
  const S=pgS('hang'),now=Date.now();
  if(S.mine){const open=pgRounds('hang',hClean,hLoc).filter(x=>!hOver(x,now)).sort(qFirst);
    if(open.length&&!open[0].mine){S.mine=null;pgPub();}
    else if(hOver(Object.assign({},S.mine,{mine:true}),now)&&!hOpen){S.mine=null;pgPub();}}
  const g=hRound();
  if(hOpen&&g&&!hOver(g,now)){if(hMy.id!==g.id){hMy={id:g.id,l:{}};pjPub({k:'hang',id:g.id,l:{}});}S.cur=g;}
  if(g&&hOver(g,now)&&S.cur&&S.cur.id===g.id&&!S.cur.endAt)S.cur.endAt=now;
  if(hOpen)hRender();
}
setInterval(hTick,150);
function openHang(){hOpen=true;hErr='';hW.m.classList.add('show');pjPub({k:'hang',id:'',l:{}});hTick();hRender(true);}
function closeHang(){hW.m.classList.remove('show');hOpen=false;pjPub(null);const S=pgS('hang');S.cur=null;
  if(S.mine&&!hPlayers(Object.assign({},S.mine,{mine:true})).some(p=>!p.gone)){S.mine=null;pgPub();}}
document.addEventListener('keydown',e=>{if(!hOpen||e.target.tagName==='INPUT'||e.metaKey||e.ctrlKey||e.altKey)return;const c=e.key.toUpperCase();if(/^[A-ZÄÖÜ]$/.test(c)){e.preventDefault();hGuess(c);}});
function hRender(force){
  if(!hOpen)return;
  const now=Date.now(),g=hRound(),B=hW.body,st=g?hState(g):null,over=g&&hOver(g,now),watch=g&&g.own&&g.mine;
  const set=(e,t)=>{if(e.textContent!==t)e.textContent=t;};
  set(hW.info,g&&!over?(g.own?'WORT VON '+String(g.by).toUpperCase():String(g.cat).toUpperCase()):'');
  // the flower is drawn every frame; the rest only when it changes
  const key=[g?g.id:'',st?[...st.set].join(''):'',over?1:0,hErr,watch?1:0].join('|');
  if(force||B.dataset.k!==key){B.dataset.k=key;B.innerHTML='';
    if(g){const cv=pgEl('canvas','hflower');cv.width=96;cv.height=56;B.appendChild(cv);hW.flower=cv;
      const wd=pgEl('div','hword');g.w.split('').forEach(c=>{const b=pgEl('span',st.set.has(c)?'on':'',st.set.has(c)||over?c:'');if(over&&!st.set.has(c))b.className='miss';wd.appendChild(b);});B.appendChild(wd);}
    if(g&&!over){
      if(watch){B.appendChild(pgEl('div','qnote','Dein Wort: '+g.w+'. Die anderen raten jetzt.'));}
      else{const kb=pgEl('div','hkeys');HANG_KEYS.forEach(r=>{const row=pgEl('div','hrow');r.split('').forEach(c=>{const ok=st.set.has(c);const b=pgBtn('hkey'+(ok?(g.w.includes(c)?' hit':' miss'):''),c,()=>hGuess(c));b.disabled=ok;row.appendChild(b);});kb.appendChild(row);});B.appendChild(kb);}
    } else {
      if(g){const won=st.solved;B.appendChild(pgEl('div','gres '+(won?'ok':'bad'),won?'Geschafft! Die Blume blüht.':'Verwelkt. Das Wort war '+g.w+'.'));
        if(won&&hDone!==g.id&&hMy.id===g.id){hDone=g.id;qConfetti();coinsForWin(5);}}
      const row=pgEl('div','gstart');row.appendChild(pgBtn('btn dark gbig','Zufallswort',()=>hStart('',false)));B.appendChild(row);
      const r2=pgEl('div','row');const inp=pgEl('input','inp');inp.maxLength=20;inp.placeholder='Oder Wort für die anderen ausdenken';inp.autocomplete='off';inp.setAttribute('aria-label','Eigenes Wort');
      const go=pgBtn('btn','Los',()=>hStart(inp.value,true));inp.addEventListener('keydown',e=>{if(e.key==='Enter')go.click();});r2.appendChild(inp);r2.appendChild(go);B.appendChild(r2);
      if(hErr)B.appendChild(pgEl('div','qnote',hErr));
    }
  }
  if(g&&hW.flower)hDrawFlower(hW.flower.getContext('2d'),g,st,now);
  const ps=st?st.ps:hPlayers(null);
  pgStrip(hW,ps,st?p=>(st.credit[p.peer]||0)+' B':null,null,over&&st.solved?p=>(st.credit[p.peer]||0)>0:null);
}
function hDrawFlower(X,g,st,now){
  const t=performance.now(),left=Math.max(0,HANG_MAX-st.wrong.length);
  if(hFx.id!==g.id){hFx={id:g.id,w:st.wrong.length,at:0};}
  if(st.wrong.length>hFx.w){hFx.w=st.wrong.length;hFx.at=t;}
  X.fillStyle='#2b5a35';X.fillRect(0,0,96,56);for(let x=0;x<96;x+=4){X.fillStyle='#24502e';X.fillRect(x,(x*7)%11,1,1);}
  X.fillStyle='#3a7a3a';X.fillRect(0,48,96,8);X.fillStyle='#4f9e43';for(let x=0;x<96;x+=3)X.fillRect(x,46+(x%2),2,3);
  const droop=st.lost?6:0,cx=48,cy=16+droop;
  X.fillStyle='#5aa84a';X.fillRect(47,cy+4,2,48-cy-4);X.fillRect(40,34,7,2);X.fillRect(38,32,4,2);X.fillRect(49,38,7,2);X.fillRect(54,36,4,2);
  const A=[0,1,2,3,4,5,6].map(i=>i*Math.PI*2/HANG_MAX-Math.PI/2);
  for(let i=0;i<HANG_MAX;i++){if(i>=left)continue;const x=Math.round(cx+Math.cos(A[i])*6),y=Math.round(cy+Math.sin(A[i])*6);
    X.fillStyle=st.lost?'#a57a88':'#f49ab8';X.fillRect(x-2,y-2,4,4);X.fillStyle=st.lost?'#8a6070':'#e87aa0';X.fillRect(x-2,y+1,4,1);}
  X.fillStyle=st.lost?'#9a8a3a':'#f2c94c';X.fillRect(cx-2,cy-2,4,4);X.fillStyle='#c98a1e';X.fillRect(cx-1,cy-1,2,2);
  // the petal that just fell drifts down
  const k=(t-hFx.at)/1400;if(hFx.at&&k<1){const i=left,x=Math.round(cx+Math.cos(A[i]||0)*6+Math.sin(k*9)*4),y=Math.round(cy+Math.sin(A[i]||0)*6+k*30);X.globalAlpha=1-k;X.fillStyle='#f49ab8';X.fillRect(x-2,y-1,4,3);X.globalAlpha=1;}
  // a happy flower sparkles
  if(st.solved)for(let i=0;i<6;i++){const a=t/600+i,x=Math.round(cx+Math.cos(a)*14),y=Math.round(cy+Math.sin(a)*10);X.fillStyle=i%2?'#fffdf7':'#f2c94c';X.fillRect(x,y,1,1);}
  X.fillStyle='#fffdf7';X.font='7px monospace';X.textAlign='left';
  for(let i=0;i<HANG_MAX;i++){X.fillStyle=i<st.wrong.length?'#e8506c':'#3a6a40';X.fillRect(70+(i%4)*6,6+Math.floor(i/4)*6,4,4);}
  X.fillStyle='#c9e6c0';X.fillText(st.wrong.join(' '),4,8);
}
