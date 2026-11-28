/* ================= ideas (feature requests) ================= */
// Players send ideas for the game; everyone can read them and give a heart. Sisi (the owner) can mark one
// as planned, done or hide it. Each player's ideas and hearts live in their own doc (gardens/<id>/x/ideas).
const ideasM=document.getElementById('ideasM');
let ideaDocs={}, ideaLoaded=0, myIdeas=null;
function ideaKey(by,id){return by+':'+id;}
async function loadIdeas(force){
  if(!window.__ideas||!myId)return;
  if(!force&&Date.now()-ideaLoaded<20000)return;ideaLoaded=Date.now();
  const ids=[...new Set(gardensList.map(g=>g.id).concat([myId]))];
  const res=await Promise.all(ids.map(id=>window.__ideas.load(id).catch(()=>null)));
  ideaDocs={};ids.forEach((id,i)=>{if(res[i])ideaDocs[id]=res[i];});
  myIdeas=ideaDocs[myId]||{list:[],votes:[],st:{}};
  renderIdeas();ideaBadge();
}
function mine(){return myIdeas||(myIdeas={list:[],votes:[],st:{}});}
function saveIdeas(){ideaDocs[myId]=mine();if(window.__ideas)window.__ideas.save(mine());}
function nameOf(id){if(id===myId)return home?home.name:'You';const g=gardensList.find(x=>x.id===id);return g?g.data.name:'Someone';}
function allIdeas(){
  const st=(ideaDocs[OWNER_ID]&&ideaDocs[OWNER_ID].st)||{},votes={};
  Object.values(ideaDocs).forEach(d=>(d.votes||[]).forEach(k=>{votes[k]=(votes[k]||0)+1;}));
  const L=[];Object.entries(ideaDocs).forEach(([by,d])=>(d.list||[]).forEach(x=>{const k=ideaKey(by,x.id);L.push({by,id:x.id,k,text:x.text,t:x.t,st:st[k]||'',v:votes[k]||0});}));
  return L;
}
function renderIdeas(){
  const box=document.getElementById('ideaList');if(!box)return;box.innerHTML='';
  if(!window.__ideas||!myId){box.appendChild(el('div','empty','Ideas sync once you are signed in.'));return;}
  const owner=myId===OWNER_ID,my=mine();
  let L=allIdeas().filter(x=>x.st!=='hidden'||owner);
  const rank=x=>x.st==='done'?2:x.st==='hidden'?3:0;
  L.sort((a,b)=>rank(a)-rank(b)||b.v-a.v||b.t-a.t);
  if(!L.length){box.appendChild(el('div','empty','No ideas yet. Be the first.'));return;}
  L.forEach(x=>{
    const c=el('div','idea'+(x.st?' '+x.st:''));
    const top=el('div','itop');top.appendChild(el('span','iby',nameOf(x.by)));top.appendChild(el('span','iwhen',agoTxt(x.t)));
    if(x.st==='planned')top.appendChild(el('span','ist','planned'));if(x.st==='done')top.appendChild(el('span','ist','done'));if(x.st==='hidden')top.appendChild(el('span','ist','hidden'));
    c.appendChild(top);c.appendChild(el('div','itx',x.text));
    const row=el('div','irow');
    const voted=(my.votes||[]).includes(x.k),h=el('button','ivote'+(voted?' on':''),'♥ '+x.v);h.type='button';h.setAttribute('aria-label','Heart this idea');
    h.onclick=()=>{const m=mine();m.votes=voted?m.votes.filter(v=>v!==x.k):(m.votes||[]).concat([x.k]);saveIdeas();renderIdeas();};row.appendChild(h);
    if(x.by===myId){const d=el('button','ilink','Delete');d.type='button';d.onclick=()=>{if(!d.dataset.a){d.dataset.a=1;d.textContent='Tap again to delete';return;}const m=mine();m.list=m.list.filter(y=>y.id!==x.id);saveIdeas();renderIdeas();};row.appendChild(d);}
    if(owner)[['planned','Planned'],['done','Done'],['hidden','Hide']].forEach(([k,lab])=>{const b=el('button','ilink'+(x.st===k?' on':''),lab);b.type='button';
      b.onclick=()=>{const m=mine();m.st=m.st||{};if(m.st[x.k]===k)delete m.st[x.k];else m.st[x.k]=k;saveIdeas();renderIdeas();};row.appendChild(b);});
    c.appendChild(row);box.appendChild(c);});
}
document.getElementById('ideaF').addEventListener('submit',e=>{e.preventDefault();const i=document.getElementById('ideaIn'),t=nodot(i.value.trim()).slice(0,200);if(!t)return;
  if(!myId||!window.__ideas){toast('Sign in to send ideas.',2400);return;}
  const m=mine();m.list=(m.list||[]).concat([{id:Date.now().toString(36),text:t,t:Date.now()}]).slice(-30);saveIdeas();i.value='';toast('Thanks! Your idea is in the list.',2400);renderIdeas();});
function openIdeas(){help.classList.remove('show');ideasM.classList.add('show');renderIdeas();loadIdeas(true);
  if(myId===OWNER_ID){try{localStorage.setItem('ideas-seen',String(Date.now()));}catch(e){}ideaBadge();}}
document.getElementById('bIdeas').onclick=openIdeas;
document.getElementById('ideasNo').onclick=()=>ideasM.classList.remove('show');
ideasM.addEventListener('click',e=>{if(e.target===ideasM)ideasM.classList.remove('show');});
// Sisi gets a little number on the ? button when someone sent a new idea
function ideaBadge(){if(myId!==OWNER_ID)return;let seen=0;try{seen=+localStorage.getItem('ideas-seen')||0;}catch(e){}
  const n=allIdeas().filter(x=>x.by!==myId&&x.t>seen).length,b=document.getElementById('bHelp');b.classList.toggle('req',n>0);b.dataset.n=n||'';}
setInterval(()=>{if(myId===OWNER_ID&&!document.hidden)loadIdeas();},120000);
setTimeout(()=>{if(myId===OWNER_ID)loadIdeas(true);},8000);
