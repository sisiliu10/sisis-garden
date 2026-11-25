/* ================= world UI ================= */
const labelsEl=document.createElement('div'); worldEl.appendChild(labelsEl);
const signEl=document.createElement('div'); signEl.className='sign'; signEl.textContent='SKILLS ↓'; worldEl.appendChild(signEl);
const signEl2=document.createElement('div'); signEl2.className='sign'; signEl2.textContent='TO-DOS ↓'; worldEl.appendChild(signEl2);
const signMine=document.createElement('div'); signMine.className='sign mine'; signMine.textContent='YOUR GARDEN'; signMine.hidden=true; worldEl.appendChild(signMine);
signMine.addEventListener('pointerdown',e=>{e.stopPropagation();e.preventDefault();hideHomeHint(true);goHome();});
let labels={};
function rebuildLabels(){
  labelsEl.innerHTML=''; labels={};
  items().forEach(p=>{
    const el=document.createElement('div'); el.className='label';
    const n=document.createElement('div'); if(p.lk&&!visiting){el.classList.add('lk');n.innerHTML='<svg class="lki" viewBox="0 0 5 7" fill="currentColor"><rect x="1" y="0" width="3" height="1"/><rect x="0" y="1" width="1" height="2"/><rect x="4" y="1" width="1" height="2"/><rect x="0" y="3" width="5" height="4"/></svg>';n.appendChild(document.createTextNode(p.code));}else n.textContent=p.code; el.appendChild(n);
    const wb=document.createElement('div'); wb.className='wb'; wb.appendChild(document.createElement('i')); el.appendChild(wb);
    const [x,y]=posOf(p); el.style.left=(OX+x)+'px'; el.style.top=(OY+y+(p.bed?BED_H/2+2:3))+'px';
    labelsEl.appendChild(el); labels[p.id]=el;
  });
  refreshLabels();
}
function layoutWorldUI(){
  document.getElementById('title').style.top=Math.round(Math.max(OY*.42+10,innerWidth<=480?46/S:0))+'px';
  signEl.style.left=(OX+63)+'px'; signEl.style.top=(OY+344)+'px'; signEl2.style.left=(OX+143)+'px'; signEl2.style.top=(OY+344)+'px';
  signMine.style.left=(OX+5)+'px'; signMine.style.top=(OY+344)+'px';
  rebuildLabels(); placeDialog();
}
function gardenAvg(gd){const ps=gd?gd.projects.concat(gd.skills||[]):[];return ps.length?ps.reduce((a,p)=>a+waterOf(p),0)/ps.length:100;}
function moodColor(avg){return avg>=60?'#e8506c':avg>=30?'#f0a43a':'#8b93a7';}
function refreshLabels(){
  items().forEach(p=>{const el=labels[p.id];if(!el)return;const w=shownWater(p);el.querySelector('i').style.width=w+'%';el.classList.toggle('low',w<35);el.classList.toggle('on',active===p);});
  const gd=V(), avg=Math.round(gardenAvg(gd));
  const mt=document.getElementById('moodTxt');
  if(visiting){mt.innerHTML='';const s=document.createElement('span');const vv=document.createElement('span');vv.className='long';vv.textContent='Visiting ';mt.appendChild(vv);s.textContent=gd.name;mt.appendChild(s);const l=document.createElement('span');l.className='long';l.textContent=`, ${avg}%`;mt.appendChild(l);}
  else{mt.innerHTML='';const s=document.createElement('span');s.textContent=me().name||'You';mt.appendChild(s);const l=document.createElement('span');l.className='long';l.textContent='’s garden';mt.appendChild(l);mt.appendChild(document.createTextNode(` ${avg}%`));}
  document.querySelector('#mood .h').style.color=moodColor(avg);
}
function refreshChrome(){
  const gd=V();
  document.getElementById('tName').textContent=(gd?gd.name:'My')+"'s";
  document.getElementById('tSub').textContent=visiting?'you are visiting':'keep your projects watered';
  document.title=(gd?gd.name:'My')+"'s Garden";
  document.getElementById('bHome').hidden=!(visiting&&home); signMine.hidden=!(visiting&&home);
  document.getElementById('bAdd').hidden=!!visiting||!home||(home.projects.length>=SLOTS.length&&home.skills.length>=BED_SLOTS.length);
  const ban=document.getElementById('banner');
  if(!home&&!visiting){ban.hidden=true;}
  else if(!home){if(!banShown){banShown=true;ban.hidden=false;ban.textContent='You are visiting. Look around as much as you like; nothing here can be changed.';setTimeout(()=>{ban.hidden=true;},7000);}}
  else ban.hidden=true;
}

/* ================= locks: things only I can see ================= */
function lockSvg(open){
  const px=open?[[1,0,3],[0,1,1],[0,2,1],[4,1,1]]:[[1,0,3],[0,1,1],[4,1,1],[0,2,1],[4,2,1]];
  let r='';px.forEach(([x,y,w])=>r+=`<rect x="${x}" y="${y}" width="${w}" height="1"/>`);
  r+='<rect x="0" y="3" width="5" height="4"/><rect x="2" y="4" width="1" height="2" fill="var(--paper,#fbf8f0)"/>';
  return `<svg viewBox="0 0 5 7" fill="currentColor" aria-hidden="true">${r}</svg>`;
}
function paintLock(btn,lk,what){btn.classList.toggle('on',!!lk);btn.innerHTML=lockSvg(!lk);
  btn.title=lk?'Only you can see this '+what+'. Tap to show it to visitors.':'Visitors can see this '+what+'. Tap to keep it to yourself.';btn.setAttribute('aria-label',btn.title);}
function toggleLock(o,what){if(!o||visiting||!home)return;o.lk=!o.lk;persist();toast(o.lk?'🔒 Only you can see this '+what+' now.':'Visitors can see this '+what+' again.',2200);}
/* ================= dialog ================= */
const dlg=document.getElementById('dlg'),dView=document.getElementById('dView'),dForm=document.getElementById('dForm');
document.getElementById('bkLock').addEventListener('click',()=>{if(!home||visiting)return;home.sb=home.sb===false;persist();writePubBooks();paintBkLock();toast(home.sb===false?'🔒 Only you can see this bookshelf now.':'Visitors can see this bookshelf again.',2200);});
document.getElementById('dLock').addEventListener('click',e=>{e.stopPropagation();if(!active)return;toggleLock(active,active.bed?'bed':'plant');paintLock(e.currentTarget,active.lk,active.bed?'bed':'plant');rebuildLabels();});
const dNote=document.getElementById('dNote'),dProg=document.getElementById('dProg'),msgEl=document.getElementById('dMsg');
let active=null,lastActive=undefined,editing=false,pendingEdit=null,banShown=false;
function closePanel(){active=null;lastActive=undefined;dlg.classList.remove('show');}
function placeDialog(){
  const titleTop=(OY*.42+10)*S, ax=(OX+av.x)*S, ay=(OY+av.y-camR)*S, gw=CW*S, side=(innerWidth-gw)/2;
  const dock=innerWidth>=820&&side>=170;   // enough empty grass next to the garden for a side panel
  dlg.classList.toggle('dock',dock);dlg.classList.toggle('dl',dock&&ax>innerWidth/2);dlg.classList.toggle('dr',dock&&ax<=innerWidth/2);
  const low=!dock&&ay<innerHeight*.5;
  dlg.classList.toggle('low',low);
  dlg.style.top=dock?'60px':low?'':Math.max(56,Math.min(titleTop-6,(OY+114)*S-280))+'px';
}
function fmtAgo(ts){
  if(!ts) return 'not watered yet';
  const m=Math.floor((Date.now()-ts)/60000);
  if(m<1) return 'watered just now'; if(m<60) return `watered ${m} min ago`;
  const h=Math.floor(m/60); if(h<24) return `watered ${h} h ago`;
  const d=Math.floor(h/24); return `watered ${d} day${d>1?'s':''} ago`;
}
function updateDialog(full){
  const p=active; if(!p) return;
  const own=!visiting;
  if(full){
    editing=false; dForm.hidden=true; dView.hidden=false;
    document.getElementById('dCode').textContent=p.code;
    {const lb=document.getElementById('dLock');lb.hidden=!own;if(own)paintLock(lb,p.lk,p.bed?'bed':'plant');}
    const dn=document.getElementById('dName'); dn.innerHTML='';
    if(p.sub){const s=document.createElement('span'); s.textContent=p.sub; dn.appendChild(s);}
    document.getElementById('dWhy').textContent='';
    dNote.hidden=true; dDidForm.hidden=!own;
    {const nt=V().notes&&V().notes[p.id];document.getElementById('dNoteRO').textContent=nt?'Next step: '+nt:'';}
    dNote.placeholder=p.bed?'Next practice step…':'Next step for this project…';
    const dl=document.getElementById('dLinks'); dl.innerHTML='';
    (p.links||[]).forEach(l=>{const a=document.createElement('a');a.className='lnk';a.href=l.u;a.target='_blank';a.rel='noopener';a.textContent=l.t+' ↗';dl.appendChild(a);});
    document.getElementById('dWater').hidden=!own; document.getElementById('dEdit').hidden=!own; document.getElementById('dMove').hidden=!own; document.getElementById('fKill').hidden=!own; closeKill();
    logAll=false; logEdit=null; logSure=false; closeLog(); renderLog(p);
    dProg.disabled=!own; dProg.value=p.progress;
    msgEl.textContent='';
  }
  const w=shownWater(p),st=stageOf(p),s=scaleOf(p);
  document.getElementById('dLv').textContent=((active.bed?BED_STAGES:STAGE_NAMES)[st]+(s>1?` ×${s.toFixed(2).replace(/0$/,'')}`:'')).toUpperCase();
  if(document.activeElement!==dProg) dProg.value=p.progress;
  dProg.style.setProperty('--p',p.progress+'%');
  document.getElementById('dProgV').textContent=p.progress+'%';
  document.getElementById('dBar').style.width=w+'%';
  document.getElementById('dBarW').classList.toggle('low',w<35);
  document.getElementById('dPct').textContent=Math.round(w)+'%';
  const nd=neglectDays(p), wd=weedsOf(p), fl=fliesOf(p);
  const meta=document.getElementById('dMeta'); meta.innerHTML='';
  const mood=w<=0?'Wilted.':w<35?'Thirsty!':w<70?'Doing okay.':'Happy and hydrated.';
  meta.appendChild(document.createTextNode(`${mood} ${cap(fmtAgo(p.last))}.`));
  if(wd){const bb=document.createElement('b');bb.textContent=` Untouched for ${Math.floor(nd)} days: ${wd} weed${wd>1?'s':''}${fl?', flies':''}.`;meta.appendChild(bb);}
}
dNote.addEventListener('input',()=>{if(!active||!home)return;home.notes[active.id]=dNote.value;persist();});
dProg.addEventListener('input',()=>{
  if(!active||visiting) return;
  const before=stageOf(active), sb=scaleOf(active);
  active.progress=+dProg.value; updateDialog(false);
  const after=stageOf(active), sa=scaleOf(active);
  if(after>before||sa>sb){burst(active,10);msgEl.textContent=after>before?`${active.code} grew → ${(active.bed?BED_STAGES:STAGE_NAMES)[after]}!`:`${active.code} is getting bigger.`;}
  persist();
});
dProg.addEventListener('change',()=>dProg.blur());
document.getElementById('dWater').addEventListener('click',()=>{if(active)submitLog();});

/* edit form */
const fKind=document.getElementById('fKind'); let fKindVal='sunflower', delArmed=false;
KINDS.concat(FLOWERS).forEach(k=>{const b=document.createElement('button');b.type='button';b.textContent=KIND_LABEL[k]||FLOWER_LABEL[k];b.dataset.k=k;b.dataset.bed=FLOWERS.includes(k)?'1':'';b.onclick=()=>{fKindVal=k;[...fKind.children].forEach(x=>x.classList.toggle('on',x.dataset.k===k));};fKind.appendChild(b);});
function openEdit(p){
  editing=true; dView.hidden=true; dForm.hidden=false; delArmed=false;
  document.getElementById('fCode').value=p.code; document.getElementById('fWhy').value=p.why;
  document.getElementById('fName').value=p.name; document.getElementById('fSub').value=p.sub; document.getElementById('fNote').value=home.notes[p.id]||''; renderLinkRows(p.links||[]); document.getElementById('fVis').checked=p.vis!==false;
  fKindVal=p.kind; [...fKind.children].forEach(x=>{x.classList.toggle('on',x.dataset.k===p.kind);x.hidden=!!x.dataset.bed!==!!p.bed;});
  document.getElementById('fKindL').textContent=p.bed?'FLOWERS':'PLANT';
  document.getElementById('fTitle').textContent=p.bed?'Edit skill bed':'Edit plant';
  document.getElementById('fDel').textContent=p.bed?'Compost bed':'Compost plant';
  setTimeout(()=>document.getElementById('fCode').focus(),50);
}
document.getElementById('dEdit').onclick=()=>{if(active&&!visiting)openEdit(active);};
let moving=null, moveHover=null;
const moveBar=document.getElementById('moveBar');
document.getElementById('dMove').onclick=()=>{if(!active||visiting)return;moving=active;moveHover=null;dlg.classList.remove('show');
  document.getElementById('moveTxt').textContent=`Tippe, wo ${moving.code} hin soll`;moveBar.hidden=false;av.target=null;};
document.getElementById('moveCancel').onclick=()=>endMove();
function endMove(){moving=null;moveHover=null;moveBar.hidden=true;lastActive=undefined;}
function canPlace(p,x,y){
  if(p.bed){
    if(y<376||y>470||x<-OX+BED_W/2+2||x>88) return false;
    if(Math.abs(x-120)<BED_W/2+9) return false;
    return !skills().some(b=>b!==p&&Math.abs(posOf(b)[0]-x)<BED_W+4&&Math.abs(posOf(b)[1]-y)<BED_H+4);
  }
  if(y<165||y>340||x<-OX+12||x>CW+OX-12) return false;
  if(Math.hypot((x-FOUNT.x)/34,(y-FOUNT.y)/16)<1) return false;
  if(x>POOL.x0-26&&x<BOARD.x1+6&&y>POOL.y0-10&&y<POOL.y1+10) return false;
  if(duckHere()&&Math.abs(x-DUCK.x)<20&&y>DUCK.y-12&&y<DUCK.y+14) return false;
  if(x>36&&x<96&&y<175) return false;
  return !projects().some(q=>q!==p&&Math.hypot(posOf(q)[0]-x,(posOf(q)[1]-y)*1.4)<26);
}
function placeAt(lx,ly){
  const p=moving,x=Math.round(lx),y=Math.round(ly);
  if(!canPlace(p,x,y)){document.getElementById('moveTxt').textContent=p.bed?'Da passt das Beet nicht hin. Unten links bei den Skills.':'Da passt die Pflanze nicht hin. Woanders auf der Wiese probieren.';return;}
  p.pos={x,y};persist();rebuildLabels();
  for(let i=0;i<10;i++)spawn({kind:'puff',x:x+(Math.random()*20-10),y:y+(Math.random()*4-2),vy:-6,life:.5});
  av.target=besideTarget(p);endMove();
}
cvs.addEventListener('pointermove',e=>{if(!moving||scene!=='garden')return;moveHover={x:e.clientX/S-OX,y:e.clientY/S+camR-OY};});
dForm.addEventListener('submit',e=>{
  e.preventDefault(); if(!active||visiting) return;
  const p=active;
  p.code=(document.getElementById('fCode').value.trim()||'PROJECT').toUpperCase().slice(0,24);
  p.why=document.getElementById('fWhy').value.trim().slice(0,160);
  p.name=p.code.charAt(0)+p.code.slice(1).toLowerCase();
  p.sub=document.getElementById('fSub').value.trim().slice(0,60);
  {const nv=document.getElementById('fNote').value.trim().slice(0,90);if(nv)home.notes[p.id]=nv;else delete home.notes[p.id];}
  p.links=[...document.querySelectorAll('#fLinks .lrow2')].map(r=>({t:r.children[0].value.trim().slice(0,40)||'Open page',u:r.children[1].value.trim().slice(0,300)})).filter(l=>/^https:\/\//.test(l.u)).slice(0,6);
  p.url=p.links[0]?p.links[0].u:'';
  p.kind=fKindVal; p.vis=document.getElementById('fVis').checked;
  persist(); rebuildLabels(); updateDialog(true);
});
document.getElementById('fCancel').onclick=()=>updateDialog(true);
function addLinkRow(l){const box=document.getElementById('fLinks');if(box.children.length>=6)return;
  const r=document.createElement('div');r.className='lrow2';
  const t=document.createElement('input');t.className='inp';t.maxLength=40;t.placeholder='Name, e.g. Landing page';t.value=l.t||'';
  const u=document.createElement('input');u.className='inp';u.maxLength=300;u.placeholder='https://…';u.value=l.u||'';
  const x=document.createElement('button');x.type='button';x.className='btn';x.textContent='×';x.onclick=()=>r.remove();
  r.appendChild(t);r.appendChild(u);r.appendChild(x);box.appendChild(r);}
function renderLinkRows(L){document.getElementById('fLinks').innerHTML='';L.forEach(addLinkRow);if(!L.length)addLinkRow({});}
document.getElementById('fAddLink').onclick=()=>addLinkRow({});
// take the open plant out of the garden (its notes and log too) and close the panel
function dropActive(){
  home.projects=home.projects.filter(x=>x!==active); home.skills=home.skills.filter(x=>x!==active); delete home.notes[active.id]; if(home.logs)delete home.logs[active.id];
  closePanel();
}
document.getElementById('fDel').onclick=()=>{
  if(!active||visiting) return;
  if(!delArmed){delArmed=true;document.getElementById('fDel').textContent='Tap again to compost';return;}
  {const c=JSON.parse(JSON.stringify(active));c.ct=Date.now();c.note=home.notes[active.id]||'';c.lg=(home.logs&&home.logs[active.id])||[];delete c.pos;
   home.compost=[c].concat(home.compost||[]).slice(0,30);compostFx(active.code);}
  dropActive();
  persist(); rebuildLabels(); refreshChrome();
};
function closeKill(){document.getElementById('dKillBar').hidden=true;document.getElementById('dBtns').hidden=false;}
document.getElementById('fKill').onclick=e=>{
  e.stopPropagation(); if(!active||visiting) return;
  document.getElementById('dKillTxt').textContent='Delete '+active.code+' for good? Notes and log go too.';
  document.getElementById('dBtns').hidden=true; document.getElementById('dKillBar').hidden=false;
};
document.getElementById('dKillNo').onclick=e=>{e.stopPropagation();closeKill();};
document.getElementById('dKillYes').onclick=e=>{
  e.stopPropagation(); if(!active||visiting) return;
  const code=active.code,[px,py]=posOf(active);
  dropActive(); closeKill();
  for(let i=0;i<12;i++)spawn({kind:'puff',x:px+(Math.random()*14-7),y:py-2-Math.random()*12,vy:-10,life:.5+Math.random()*.3});
  persist(); rebuildLabels(); refreshChrome(); toast(code+' deleted.',1800);
};
const addM=document.getElementById('addM');
document.getElementById('bAdd').onclick=()=>{
  if(!home||visiting) return;
  document.getElementById('aPlant').disabled=home.projects.length>=SLOTS.length;
  document.getElementById('aBed').disabled=home.skills.length>=BED_SLOTS.length;
  document.getElementById('aTodo').disabled=(home.todos||[]).length>=CLN.max;
  addM.classList.add('show');
};
document.getElementById('aCancel').onclick=()=>addM.classList.remove('show');
document.getElementById('aPlant').onclick=()=>addItem(false);
document.getElementById('aBed').onclick=()=>addItem(true);
document.getElementById('aTodo').onclick=()=>{addM.classList.remove('show');openLine();setTimeout(()=>{const i=document.getElementById('lnIn');if(i)i.focus();},60);};
function addItem(bed){
  addM.classList.remove('show');
  const arr=bed?home.skills:home.projects, max=(bed?BED_SLOTS:SLOTS).length;
  if(arr.length>=max) return;
  const used=new Set(arr.map(p=>p.slot)); let slot=0; while(used.has(slot)) slot++;
  const p=cleanProject({id:'p'+Date.now().toString(36),slot,code:bed?'NEW SKILL':'NEW SEED',why:'',name:bed?'New skill':'New project',sub:bed?'Skill':'',kind:pick(bed?FLOWERS:KINDS),progress:bed?10:0,w:100,t:Date.now(),last:0},slot,bed);
  arr.push(p); persist(); rebuildLabels(); refreshChrome();
  av.target=besideTarget(p); pendingEdit=p.id;
}

