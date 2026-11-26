/* ================= cottage (inside) ================= */
const RW=196, RH=172, WALL=54;
let scene='garden', RX=0, RY=0, houseNear=null, napT=0, napping=false;
const HCOL=[[5,0,35,69],[39,0,99,77],[100,0,122,65],[120,0,158,91],[156,0,192,69],[5,118,33,152],[166,148,190,164]];
const HOBJ=[
  {x:66,y:84,label:'Open dashboard',act:()=>openDash(),box:[40,30,100,78]},
  {x:139,y:97,get label(){return napping?'Get up':(bedSleepers().length?'Lie down next to '+(livePeers().find(p=>p.scene==='house'&&p.nap)||{name:'them'}).name:'Take a nap');},act:()=>{napping=!napping;napT=napping?.01:0;av.target=null;av.moving=false;av.back=false;},box:[120,32,158,92]},
  {x:20,y:76,label:'Open bookshelf',act:()=>openBooks(),box:[4,16,36,68]},
  {x:42,y:140,label:'Play a game',act:()=>askQuiz(),box:[4,100,34,152]},
  // the wardrobe: only in your own cottage, it is where you change your outfit
  {x:174,y:78,own:true,label:'Open wardrobe',act:()=>{if(!visiting)openCreator(true);},box:[156,12,192,68]},
];
function roomOrigin(){RX=Math.floor((W-RW)/2);RY=Math.max(52,Math.floor((H-RH)/2)+6);}
function houseBlocked(x,y){
  const inDoor=Math.abs(x-RW/2)<12;
  if(x<8||x>RW-8||y<WALL+10) return true;
  if(y>RH-3&&!inDoor) return true;
  for(const [a,b,c,d] of HCOL) if(x>a&&x<c&&y>b&&y<d) return true;
  return false;
}
function enterHouse(){hideHomeHint(false);
  av.swim=false;av.jump=null;
  scene='house'; roomOrigin(); try{Sfx.door();}catch(e){}
  av.x=RW/2; av.y=RH-6; av.back=true; av.target=null; av.water=0;
  closePanel(); editing=false;
  worldEl.style.visibility='hidden'; bJump.hidden=true; setPrompt(null);
  cat.x=RW/2+14; cat.y=RH-10;
}
function exitHouse(){
  scene='garden'; worldEl.style.visibility='';
  av.x=HX; av.y=HB+8; av.back=false; av.target=null; napT=0; napping=false;
  camY=clamp(av.y+OY-H*.55,0,Math.max(0,TH-H)); camR=-1; setPrompt(null);
  cat.x=HX+14; cat.y=HB+12;
}
function goToDoor(){ if(scene==='garden') av.target={x:HX,y:167,onArrive:()=>{av.target={x:HX,y:148,onArrive:enterHouse};}}; }
function housePointer(lx,ly){
  if(ly>RH-14&&Math.abs(lx-RW/2)<14){av.target={x:RW/2,y:RH+4};return;}
  for(const o of HOBJ){ if(o.own&&visiting)continue; const b=o.box; if(b?(lx>=b[0]&&lx<=b[2]&&ly>=b[1]&&ly<=b[3]):(Math.abs(lx-o.x)<14&&Math.abs(ly-o.y)<10)){ av.target={x:o.x,y:o.y,onArrive:o.act}; return; } }
  av.target={x:clamp(lx,9,RW-9),y:clamp(ly,WALL+11,RH-4)};
}
function houseUpdate(dt,t){
  if(av.y>RH+1){exitHouse();return;}
  houseNear=null; let bd=1e9;
  for(const o of HOBJ){if(o.own&&visiting)continue;const d=Math.hypot(av.x-o.x,av.y-o.y);if(d<28&&d<bd){bd=d;houseNear=o;}}
  if(houseNear) setPrompt(houseNear.label,'E');
  else if(av.y>RH-24&&Math.abs(av.x-RW/2)<20) setPrompt('Go outside','↓');
  else setPrompt(null);
  if(napping&&(av.moving||av.target)){napping=false;napT=0;}
  if(napping){napT=Math.min(1,napT+dt); if(Math.random()<dt*1.6) spawn({kind:'z',x:146+Math.random()*4,y:50,vy:-9,life:1.6});}
  parts.forEach(q=>{q.age+=dt;if(q.kind==='z'){q.y+=q.vy*dt;q.x+=Math.sin(q.age*4)*.3;}});
  parts=parts.filter(q=>q.age<q.life);
}

/* ---- map: one button, bottom right, to switch between the places ---- */
const mapBtn=document.createElement('button');mapBtn.id='mapBtn';mapBtn.type='button';mapBtn.setAttribute('aria-label','Map');
mapBtn.innerHTML='<svg viewBox="0 0 16 16" width="22" height="22" shape-rendering="crispEdges"><path d="M1 3h4v11H1zM6 2h4v11H6zM11 3h4v11h-4z" fill="#fffdf6" stroke="#2a2430" stroke-width="1"/><path d="M3 5h1v1H3zM8 6h1v1H8zM12 9h2v1h-2zM7 9h2v1H7z" fill="#58a84a"/><path d="M12 5h1v2h-1z" fill="#e8506c"/></svg>';
const mapMenu=document.createElement('div');mapMenu.id='mapMenu';mapMenu.hidden=true;
[['garden','Garden'],['house','Cottage'],['island','Island'],['map','Map']].forEach(([k,l])=>{const b=document.createElement('button');b.type='button';b.dataset.k=k;b.textContent=l;b.onclick=()=>{mapMenu.hidden=true;goScene(k);};mapMenu.appendChild(b);});
document.body.appendChild(mapMenu);document.body.appendChild(mapBtn);
mapBtn.onclick=e=>{e.stopPropagation();mapMenu.querySelectorAll('button').forEach(b=>b.classList.toggle('here',b.dataset.k===scene));mapMenu.hidden=!mapMenu.hidden;};
document.addEventListener('pointerdown',e=>{if(!mapMenu.hidden&&!mapMenu.contains(e.target)&&e.target!==mapBtn&&!mapBtn.contains(e.target))mapMenu.hidden=true;});
function goScene(k){
  if(k==='map'){openMap();return;}
  if(k===scene||!started)return;
  if(k==='island'){enterIsland();return;}
  if(scene==='house')exitHouse();else if(scene==='island')exitIsland();
  if(k==='house')enterHouse();
}
const promptEl=document.getElementById('prompt');
function setPrompt(txt,key){
  if(!txt){if(promptEl.dataset.on){promptEl.hidden=true;delete promptEl.dataset.on;}return;}
  const v=txt+'|'+key; if(promptEl.dataset.on===v) return;
  promptEl.dataset.on=v; promptEl.hidden=false; promptEl.textContent=txt;
  const k=document.createElement('kbd'); k.textContent=key; promptEl.appendChild(k);
}
promptEl.onclick=()=>{
  if(scene==='house'){ if(houseNear) houseNear.act(); else av.target={x:RW/2,y:RH+4}; }
  else if(scene==='island') isleAct();
  else goToDoor();
};
function renderHouse(t){
  setTimeout(()=>{const bs=bedSleepers();placeTags(livePeers().filter(p=>p.scene==='house').map(p=>{const z=p.nap&&bs.find(b=>b.id===p.id);return z?Object.assign({},p,{x:z.x,y:66}):p;}),(x,y)=>[(RX+x)*S,(RY+y)*S]);},0);
  g.fillStyle='#1d1924'; g.fillRect(0,0,W,H);
  roomOrigin();
  g.save(); g.translate(RX,RY);
  // shell
  R(-4,-4,RW+8,RH+8,'#2e2734');
  // floor
  R(0,WALL,RW,RH-WALL,'#e2a35c');
  for(let y=WALL+9;y<RH;y+=10)R(0,y,RW,1,'#c98a46');
  for(let row=0,y=WALL;y<RH;y+=10,row++)for(let x=(row%2)*24+12;x<RW;x+=48)R(x,y,1,9,'#c98a46');
  R(RW/2-12,RH,24,6,'#e2a35c');R(RW/2-12,RH+5,24,1,'#c98a46');
  // wall
  R(0,0,RW,WALL,'#f6ead2');R(0,0,RW,3,'#e8d6b2');R(0,WALL-5,RW,5,'#d6bb92');R(0,WALL-5,RW,1,'#c4a678');
  // window
  const nt=skyState().night;
  R(102,9,36,28,'#ffffff');R(104,11,32,24,mix('#8fc8f0','#1f2a5a',nt));R(104,29,32,6,mix('#7dc46c','#2a4a3a',nt));R(104,28,32,1,mix('#5aa84a','#22402f',nt));
  if(nt>.3){[[107,14],[113,18],[124,13],[131,17],[128,24],[109,24]].forEach(([a,b])=>R(a,b,1,1,'#ffffff'));R(126,15,3,3,'#fff3c8');}
  if(nt<.3){R(108,15,7,2,'#ffffff');R(110,14,4,1,'#ffffff');R(124,19,6,2,'#ffffff');}
  R(119,11,2,24,'#ffffff');R(104,21,32,2,'#ffffff');R(100,37,40,2,'#e2d0ac');
  // sticky notes + a small frame
  R(80,16,5,5,'#f6d860');R(86,20,5,5,'#9fc4ef');R(82,24,5,5,'#f4a7b9');
  // rug
  ell(98,118,36,12,'#d9708f');ell(98,118,33,10,'#f2a8bc');ell(98,118,22,6,'#d9708f');ell(98,118,20,5,'#f7c7d4');
  // door mat
  R(RW/2-9,RH-7,18,6,'#b95a5a');R(RW/2-8,RH-6,16,4,'#d47c6a');
  // furniture + avatar, depth-sorted
  const myLook=me().look, blink=(t%4)<.12;
  const list=[
    {y:66,d:()=>{ // bookshelf
      R(6,18,28,48,'#6a3f27');R(7,19,26,46,'#8a5a36');R(9,21,22,42,'#5a3420');
      [34,46].forEach(sy=>R(9,sy,22,2,'#8a5a36'));
      const cols=['#c0573a','#4f7fe0','#f2c94c','#5aa84a','#9b7bd6','#e8506c','#ffffff'];
      [[21,13],[36,10],[48,0]].forEach(([sy,hgt],si)=>{if(!hgt)return;let x=10;let k=si*3;while(x<29){const w=2+(k%2);R(x,sy+(13-hgt)+(k%3===0?1:0),w,hgt-(k%3===0?1:0),cols[k%cols.length]);x+=w+((k%4===0)?1:0);k++;}});
      R(9,48,22,15,'#9a6a46');R(9,55,22,1,'#7a4a2f');R(18,51,4,1,'#5a3420');R(18,58,4,1,'#5a3420');
    }},
    {y:76,d:()=>{ // desk + computer
      R(40,52,59,4,'#b07a4a');R(40,52,59,1,'#c99260');R(42,56,4,19,'#8a5a36');R(93,56,4,19,'#8a5a36');
      R(74,56,19,13,'#9a6a46');R(74,62,19,1,'#7a4a2f');R(81,59,5,1,'#5a3420');R(81,65,5,1,'#5a3420');
      R(49,33,22,19,'#d8d1bb');R(50,34,20,17,'#ece6d2');R(52,36,16,12,'#22343f');
      const ps=items().slice(0,5);ps.forEach((p,i)=>{const w=Math.max(1,Math.round(p.progress/100*12));R(54,38+i*2,w,1,waterOf(p)<35?'#f0a46a':'#7cf08a');});
      if(Math.floor(t*2)%2)R(54+0,38+ps.length*2,2,1,'#7cf08a');
      R(56,51,8,1,'#c4bca4');
      R(77,43,13,9,'#7f97a3');R(78,44,11,3,'#9fb3bd');R(79,48,2,2,'#e8506c');R(83,48,5,1,'#cfdde3');
    }},
    {y:65,d:()=>{ // nightstand + lamp
      R(101,46,20,18,'#b0804e');R(102,47,18,16,'#c99a62');R(103,51,16,6,'#b0804e');R(110,53,3,1,'#7a4a2f');
      R(109,40,4,6,'#e6e0cc');R(105,30,12,10,'#9fc4ef');R(105,30,12,2,'#c7defa');R(106,39,10,1,'#7fa6d6');
      g.globalAlpha=.18;disc(111,40,9,'#fff2b0');g.globalAlpha=1;
    }},
    {y:90,d:()=>{ // bed
      R(121,34,36,17,'#8a5a36');R(122,35,34,15,'#a8714a');for(let i=0;i<5;i++)R(125+i*7,37,2,11,'#8a5a36');
      R(121,50,36,40,'#8a5a36');R(123,50,32,38,'#ffffff');R(127,52,24,9,'#e8eef9');R(128,53,22,7,'#ffffff');
      R(123,63,32,25,'#8fb6ea');R(123,63,32,3,'#c7defa');for(let y=70;y<86;y+=5)for(let x=127;x<153;x+=6)R(x+(y%10?3:0),y,1,1,'#ffffff');
      R(122,88,3,3,'#6a3f27');R(153,88,3,3,'#6a3f27');
    }},
    {y:68,d:()=>{ // wardrobe
      R(157,16,34,52,'#b9ab78');R(158,17,32,50,'#ecdfab');R(160,14,28,3,'#ecdfab');R(161,13,26,1,'#b9ab78');R(158,66,32,2,'#a8975e');
      if(creator.classList.contains('show')&&!visiting){ // doors open while you change: clothes on a rail
        R(159,18,30,47,'#6a5540');R(159,18,30,2,'#4a3a2c');R(160,22,28,1,'#c9b880');
        ['#e8506c','#9fc4ef','#f2c94c','#7cc46c','#f4a7b9'].forEach((c,i)=>{const x=161+i*5+(i>2?1:0);R(x+1,22,1,2,'#c9b880');R(x,24,4,11+(i%2)*6,c);R(x,24,4,1,'rgba(255,255,255,.35)');});
        R(160,54,12,8,'#8a5a36');R(176,54,12,8,'#8a5a36');R(165,57,2,1,'#5a3420');R(181,57,2,1,'#5a3420');
        R(151,17,6,49,'#ecdfab');R(151,17,1,49,'#b9ab78');R(191,17,6,49,'#ecdfab');R(196,17,1,49,'#b9ab78');R(153,40,1,4,'#a8975e');R(193,40,1,4,'#a8975e');
      } else {
        R(173,20,2,44,'#c9b880');R(168,40,2,4,'#a8975e');R(178,40,2,4,'#a8975e');
        R(161,22,10,16,'#e2d39a');R(177,22,10,16,'#e2d39a');
      }
    }},
    {y:150,d:()=>{ // arcade cabinet: quiz show
      R(7,104,24,46,'#2a2430');R(8,105,22,44,'#6a3fa0');R(8,105,22,7,'#e8506c');R(10,107,18,3,'#ffd0dc');
      R(10,114,18,13,'#1d1924');const qs=quizState(),bl=Math.floor(t*3)%2;
      R(12,116,14,2,qs&&qs.ph!=='lobby'?'#f2c94c':'#7cf08a');R(12,120,4,3,'#4f9e3f');R(17,120,4,3,'#e8506c');R(22,120,4,3,'#4f7fe0');if(bl)R(12,124,2,1,'#ffffff');
      R(8,128,22,7,'#53318a');R(12,129,2,4,'#2a2430');R(11,128,4,2,'#e8506c');R(19,130,3,2,'#f2c94c');R(24,130,3,2,'#4fb3e8');
      R(9,135,20,14,'#5b3690');R(13,138,12,7,'#4a2a78');R(17,140,4,1,'#f2c94c');R(7,149,24,1,'#2a2430');
    }},
    {y:163,d:()=>{ // plant
      R(170,150,16,13,'#a8462c');R(169,150,18,3,'#d9744c');R(171,153,14,1,'#c0573a');
      disc(178,142,6,'#3c8a3a');disc(173,144,4,'#4f9e43');disc(183,143,4,'#4f9e43');disc(178,137,4,'#58a84a');R(176,135,2,1,'#78c65e');R(181,140,2,1,'#78c65e');
    }},
    {y:napping?91:av.y,d:()=>{
      if(napping){ // in bed: head on the pillow, eyes closed, body under the blanket; a friend can lie down next to you
        bedSleepers().forEach(z=>drawAvatar(g,z.x,78,z.look,{frame:0,back:false,blink:true,t:0,shadow:false}));
        const br=Math.sin(t*1.6)>0?1:0;
        R(123,65,32,23,'#8fb6ea');R(123,65,32,3,'#c7defa');R(132,69-br,14,17+br,'#9cc0ee');R(132,69-br,14,1,'#b4d0f4');
        for(let y=70;y<86;y+=5)for(let x=127;x<153;x+=6)R(x+(y%10?3:0),y,1,1,'#ffffff');
        return;
      }
      const rn=av.run&&av.moving,fr=av.moving?(rn?[1,2][Math.floor(t*10)%2]:[1,0,2,0][Math.floor(t*8)%4]):0;drawAvatar(g,av.x,av.y-(rn&&fr===1?1:0),myLook,{frame:fr,back:av.back,blink,t,run:rn});}},
    {y:hasCat()?cat.y:-99,d:()=>{if(hasCat())drawCat(t);}},
    ...(!napping&&bedSleepers().length?[{y:91,d:()=>{bedSleepers().forEach(z=>drawAvatar(g,z.x,78,z.look,{frame:0,back:false,blink:true,t:0,shadow:false}));
        R(123,65,32,23,'#8fb6ea');R(123,65,32,3,'#c7defa');for(let y=70;y<86;y+=5)for(let x=127;x<153;x+=6)R(x+(y%10?3:0),y,1,1,'#ffffff');}}]:[]),
    ...livePeers().filter(p=>p.scene==='house'&&!p.nap).map(p=>({y:p.y,d:()=>drawAvatar(g,p.x,p.y,p.look,{run:p.run&&p.moving,frame:p.moving?(p.run?[1,2][Math.floor(t*10)%2]:[1,0,2,0][Math.floor(t*8+p.x)%4]):0,back:p.back,blink:((t+p.x)%4)<.12,t})})),
  ];
  list.sort((a,b)=>a.y-b.y).forEach(o=>o.d());
  // ceiling fan
  R(97,0,2,7,'#bdbdbd');
  const a=t*5;
  for(let b=0;b<4;b++){const an=a+b*Math.PI/2;for(let d=3;d<16;d++){const px=Math.round(98+Math.cos(an)*d),py=Math.round(9+Math.sin(an)*d*.3);R(px,py,2,1,'#f4f4f4');}}
  disc(98,9,2,'#d8d8d8');
  if(nt>0){g.globalCompositeOperation='multiply';g.globalAlpha=nt*.45;R(-4,-4,RW+8,RH+8,'#4a5296');g.globalCompositeOperation='lighter';g.globalAlpha=nt*.35;disc(111,38,15,'#2a1e06');disc(111,38,8,'#4a3810');disc(61,44,10,'#0a2a14');g.globalCompositeOperation='source-over';g.globalAlpha=1;}
  // naps
  if(napping&&napT>0){g.globalAlpha=napT*.38;R(-RX-4,-RY-4,W+8,H+8,'#1d1932');g.globalAlpha=1;}
  parts.forEach(q=>{if(q.kind==='z'){const x=Math.round(q.x),y=Math.round(q.y);g.globalAlpha=1-q.age/q.life;R(x,y,3,1,'#ffffff');R(x+1,y+1,1,1,'#ffffff');R(x,y+2,3,1,'#ffffff');g.globalAlpha=1;}});
  g.restore();
}

/* ================= bookshelf ================= */
const BKEY='garden-books', BK_MAX=1200;
let books=null, bkTab='currently-reading';
try{const b=JSON.parse(localStorage.getItem(BKEY));if(b&&Array.isArray(b.list))books=b;}catch(e){}
const booksM=document.getElementById('booksM');
function cleanBooks(b){
  if(!b||!Array.isArray(b.list)) return null;
  return {saved:num(b.saved,0),seeded:!!b.seeded,seeds:Array.isArray(b.seeds)?b.seeds.filter(x=>typeof x==='string').slice(0,20):undefined,list:b.list.slice(0,BK_MAX).filter(x=>x&&typeof x.ti==='string').map(x=>({id:str(String(x.id||''),20).replace(/[^\d]/g,''),ti:str(x.ti,120),au:str(x.au,60),sh:str(x.sh,40)||'to-read',ra:clamp(Math.round(num(x.ra,0)),0,5),dr:num(x.dr,0),da:num(x.da,0),m:!!x.m,en:str(x.en,120),ds:str(x.ds,420),yr:(num(x.yr,0)>0&&num(x.yr,0)<2200)?Math.round(x.yr):0}))};
}
books=cleanBooks(books);
if(!books) books={saved:1,list:[]};
const SEEDS=[
  {k:'sontag',ti:'Über Frauen',au:'Susan Sontag',sh:'currently-reading',en:'On Women',yr:2023,ds:'Seven essays and interviews from 1972 to 1975, collected in 2023, in which Sontag takes on aging, beauty, feminism, sexuality and fascism. Edited by her son David Rieff, with an introduction by Merve Emre.'},
  {k:'steppenwolf',ti:'Der Steppenwolf',au:'Hermann Hesse',sh:'to-read',en:'Steppenwolf',yr:1927,ds:'Harry Haller, a lonely intellectual nearing fifty, feels split between his cultured self and a wild, wolfish side that despises ordinary middle-class life. Meeting the free-spirited Hermine and a strange "Magic Theatre" pushes him to face the many selves inside him and learn to laugh at himself.'},
 ];
// these are the keeper's own books: only her shelf starts with them
function seedBooks(){
 const done=Array.isArray(books.seeds)?books.seeds:(books.seeded?['sontag']:[]);
 SEEDS.forEach(sd=>{if(done.includes(sd.k))return;done.push(sd.k);
   if(!books.list.some(b=>b.ti.toLowerCase()===sd.ti.toLowerCase()||(b.en||'').toLowerCase()===sd.en.toLowerCase()))books.list.push({id:'',ti:sd.ti,au:sd.au,sh:sd.sh,ra:0,dr:0,da:Date.now(),m:true,en:sd.en,ds:sd.ds,yr:sd.yr});});
 books.seeds=done;
 books.list.forEach(b=>{const sd=SEEDS.find(x=>x.ti===b.ti&&x.au===b.au);if(sd){if(!b.ds){b.en=sd.en;b.ds=sd.ds;}if(!b.yr)b.yr=sd.yr;}});}
// everyone else: take the keeper's books back off the shelf if an older version put them there
function unseedBooks(){
 if(!books||(!Array.isArray(books.seeds)&&!books.seeded))return false;
 books.list=books.list.filter(b=>!(SEEDS.some(x=>x.ti===b.ti&&x.au===b.au)&&!b.ra&&!b.dr&&!b.id));
 delete books.seeds;delete books.seeded;return true;
}
const writeBooks=makeWriter(booksRef,()=>books);
async function loadRemoteBooks(){
  const ref=booksRef(); if(!ref) return;
  try{const snap=await ref.get(); if(snap&&snap.exists){const r=cleanBooks(snap.data()); if(r&&(!books||r.saved>books.saved)){books=r;try{localStorage.setItem(BKEY,JSON.stringify(books));}catch(e){}}}
      else if(books) writeBooks();}catch(e){}
  if(!books) books={saved:1,list:[]};
  if(isOwner){const n=books.list.length;seedBooks();if(books.list.length!==n)saveBooks();}
  else if(unseedBooks())saveBooks();
}
document.getElementById('bkClose').onclick=()=>booksM.classList.remove('show');
function saveBooks(){books.saved=Date.now();try{localStorage.setItem(BKEY,JSON.stringify(books));}catch(e){}writeBooks();if(home&&home.created)writePubBooks();}
document.getElementById('bkAdd').addEventListener('submit',e=>{
  e.preventDefault(); if(visiting) return;
  const raw=document.getElementById('bkT').value.trim(), sh=['currently-reading','to-read','read'].includes(bkTab)?bkTab:'to-read';
  if(!raw){document.getElementById('bkT').focus();return;}
  const m=raw.match(/^(.+?)\s*(?:,|\bvon\b|\bby\b|\s-\s)\s*(.+)$/i), ti=(m?m[1]:raw).trim(), au=(m?m[2]:'').trim();
  const nb={id:'',ti:ti.slice(0,120),au:au.slice(0,60),sh,ra:0,dr:sh==='read'?Date.now():0,da:Date.now(),m:true,en:'',ds:''};
  books.list.unshift(nb);
  document.getElementById('bkT').value='';
  bkTab=sh; saveBooks(); renderBooks(); describeBook(nb);
});
let sampleFn=null, sampleChecked=false;
async function getSample(){ if(!sampleChecked){sampleChecked=true; try{sampleFn=window.claude&&window.claude.use?await window.claude.use('sample'):null;}catch(e){sampleFn=null;}} return sampleFn; }
async function describeBook(bk){
  const sample=await getSample(); if(!sample){renderBooks();return;}
  bk.pending=true; renderBooks();
  try{
    const prompt=`You are filling in an entry on a personal reading list.\nBook title as entered: "${bk.ti}"\nAuthor as entered: "${bk.au||'unknown'}"\n\nReply with JSON only, no markdown, in this shape: {"au":"...","en":"...","yr":1927,"ds":"..."}\n- au: the author's full name.\n- en: the title of this book's English edition. If the book was written in English, its original title. If there is no English edition, a faithful English translation of the title.\n- yr: the year the book was first published, in its original language, as a number (0 if unknown).\n- ds: exactly two plain sentences in English on what the book is about. No spoilers, no praise, no quotes.\nIf you do not know this book, set ds to "" and keep en as your best translation.`;
    const r=await sample(prompt,{modelTier:'quick'});
    const m=String(r&&r.text||'').match(/\{[\s\S]*\}/); const j=m?JSON.parse(m[0]):{};
    if(typeof j.au==='string'&&j.au.trim()&&(!bk.au||bk.au.length<4))bk.au=j.au.trim().slice(0,60);
    if(typeof j.en==='string') bk.en=j.en.slice(0,120);
    if(typeof j.ds==='string') bk.ds=j.ds.slice(0,420);
    if(Number.isFinite(+j.yr)&&+j.yr>0&&+j.yr<2200) bk.yr=Math.round(+j.yr);
  }catch(e){}
  delete bk.pending; saveBooks(); renderBooks();
}
function shelfName(sh){return sh==='currently-reading'?'Reading now':sh==='to-read'?'Want to read':sh==='read'?'Read':sh.replace(/-/g,' ');}
function renderBooks(){
  const lead=document.getElementById('bkLead'),tabs=document.getElementById('bkTabs'),list=document.getElementById('bkList');
  tabs.innerHTML='';list.innerHTML='';document.querySelectorAll('.bkhint').forEach(n=>n.remove());
  const own=!visiting;
  document.getElementById('bkAdd').hidden=!own;
  const B=own?books:visBooks;
  if(!own&&(!B||!B.list.length)){lead.textContent=visBooks===undefined?'Loading the bookshelf…':`${visiting.data.name} hasn't shared a bookshelf.`;return;}
  if(!B||!B.list.length){
    document.getElementById('bkAdd').hidden=false;lead.textContent='Add the books you are reading, want to read, or have read.';return;
  }
  const L=B.list, yr=new Date().getFullYear();
  const cnt=sh=>L.filter(b=>b.sh===sh).length;
  const readThisYear=L.filter(b=>b.sh==='read'&&b.dr&&new Date(b.dr).getFullYear()===yr).length;
  lead.textContent=`${readThisYear} book${readThisYear===1?'':'s'} read in ${yr}`;
  const shelves=['currently-reading','to-read','read'].concat([...new Set(L.map(b=>b.sh))].filter(x=>!['currently-reading','to-read','read'].includes(x)));
  if(!shelves.includes(bkTab)) bkTab=shelves[0];
  shelves.forEach(sh=>{const b=document.createElement('button');b.type='button';b.textContent=`${shelfName(sh)} (${cnt(sh)})`;if(sh===bkTab)b.classList.add('on');b.onclick=()=>{bkTab=sh;renderBooks();};tabs.appendChild(b);});
  const q='';
  let arr=L.filter(b=>b.sh===bkTab);
  arr.sort((a,b)=>bkTab==='read'?(b.dr||b.da)-(a.dr||a.da):b.da-a.da);
  arr.slice(0,250).forEach(bk=>{
    const a=document.createElement('div');a.className='bk';
    const l=document.createElement('div');const t=document.createElement('b');t.textContent=bk.en||bk.ti;
    const au=document.createElement('span');au.className='au';au.textContent=[bk.au,bk.yr?String(bk.yr):'',(bk.en&&bk.en.toLowerCase()!==bk.ti.toLowerCase())?'original: '+bk.ti:''].filter(Boolean).join(', ');
    l.appendChild(t);l.appendChild(au);
    const ds=document.createElement('div');ds.className='ds';
    if(bk.pending){ds.textContent='Looking up the English title and a short description…';ds.classList.add('wait');}
    else if(bk.ds){ds.textContent=bk.ds;ds.classList.add('clamp');ds.title='Tap to read more';ds.onclick=()=>ds.classList.toggle('clamp');}
    else if(own&&sampleFn){const bt=document.createElement('button');bt.type='button';bt.className='mv';bt.textContent='Add description & year';bt.onclick=()=>describeBook(bk);ds.appendChild(bt);}
    l.appendChild(ds);
    const r=document.createElement('div');r.className='rt';
    const mv=(label,sh)=>{const bt=document.createElement('button');bt.className='mv';bt.type='button';bt.textContent=label;bt.onclick=()=>{bk.sh=sh;if(sh==='read')bk.dr=Date.now();if(sh==='currently-reading')bk.da=Date.now();bkTab=sh;saveBooks();renderBooks();};r.appendChild(bt);};
    if(own&&bk.sh==='to-read') mv('Start reading','currently-reading');
    if(own&&bk.sh==='currently-reading') mv('Finished','read');
    if(bk.sh==='read'){const st=document.createElement('div');st.className='st';
      for(let i=1;i<=5;i++){const sp=document.createElement('span');sp.textContent=i<=bk.ra?'★':'☆';sp.title=i+' stars';if(own)sp.onclick=()=>{bk.ra=bk.ra===i?0:i;saveBooks();renderBooks();};st.appendChild(sp);}
      r.appendChild(st);
      const d=document.createElement('div');d.textContent=bk.dr?new Date(bk.dr).toLocaleDateString(undefined,{month:'short',year:'numeric'}):'';r.appendChild(d);}
    else if(bk.da){const d=document.createElement('div');d.textContent=(bk.sh==='currently-reading'?'since ':'added ')+new Date(bk.da).toLocaleDateString(undefined,{month:'short',year:'numeric'});r.appendChild(d);}
    if(own){const x=document.createElement('button');x.className='x';x.type='button';x.title='Remove';x.textContent='×';
      x.onclick=ev=>{ev.preventDefault();ev.stopPropagation();books.list=books.list.filter(b=>b!==bk);saveBooks();renderBooks();};r.appendChild(x);}
    a.appendChild(l);a.appendChild(r);list.appendChild(a);
  });
  if(!arr.length){const m=document.createElement('div');m.className='bkmore';m.textContent=q?'No books match.':'Nothing on this shelf.';list.appendChild(m);}
  else if(arr.length>250){const m=document.createElement('div');m.className='bkmore';m.textContent=`+ ${arr.length-250} more. Use search to narrow it down.`;list.appendChild(m);}
}
let visBooks=undefined, visBooksFor=null;
async function loadVisBooks(){ if(!visiting||!db) {visBooks=null;return;} if(visBooksFor===visiting.id) return; visBooksFor=visiting.id; visBooks=undefined;
  try{const sn=await db.doc('gardens/'+visiting.id+'/x/books').get(); visBooks=sn&&sn.exists?cleanBooks(sn.data()):null;}catch(e){visBooks=null;}
  if(booksM.classList.contains('show'))renderBooks(); }
function paintBkLock(){const lb=document.getElementById('bkLock');lb.hidden=!!visiting||!home;if(!lb.hidden)paintLock(lb,home.sb===false,'bookshelf');}
function openBooks(){ if(visiting) loadVisBooks();paintBkLock();renderBooks();booksM.classList.add('show');getSample().then(()=>{if(booksM.classList.contains('show'))renderBooks();});}

/* ================= dashboard ================= */
const dashM=document.getElementById('dashM');
document.getElementById('dashClose').onclick=()=>dashM.classList.remove('show');
function openDash(){
  const gd=V(); if(!gd) return;
  const list=document.getElementById('dashList'); list.innerHTML='';
  const all=items();
  const avgP=all.length?Math.round(all.reduce((a,p)=>a+p.progress,0)/all.length):0;
  const thirsty=all.filter(p=>waterOf(p)<35).length;
  document.getElementById('dashLead').textContent=`${gd.projects.length} project${gd.projects.length===1?'':'s'}, ${(gd.skills||[]).length} skill${(gd.skills||[]).length===1?'':'s'}, average progress ${avgP}%`+(thirsty?`, ${thirsty} need${thirsty===1?'s':''} water`:', everything watered')+(!visiting&&home?(()=>{const st=streakDays();return `, ${st}-day streak`+(home.cat?'':` (a cat moves in at 7)`);})():'');
  const section=(title,arr)=>{
    if(!arr.length) return;
    const h=document.createElement('div');h.className='dsec';h.textContent=title;list.appendChild(h);
    arr.slice().sort((a,b)=>waterOf(a)-waterOf(b)).forEach(p=>{
      const w=waterOf(p), nd=Math.floor(neglectDays(p));
      const row=document.createElement('div');row.className='drow';
      const top=document.createElement('div');top.className='top';
      const l=document.createElement('div');const b=document.createElement('b');b.textContent=p.code;l.appendChild(b);
      const nm=document.createElement('div');nm.className='nm';nm.textContent=p.name+(p.sub?' ('+p.sub+')':'');l.appendChild(nm);
      const r=document.createElement('div');r.className='nm';
      if(nd>=5){r.classList.add('warn');r.textContent=`untouched ${nd} days`;}else r.textContent=fmtAgo(p.last);
      top.appendChild(l);top.appendChild(r);row.appendChild(top);
      const bars=document.createElement('div');bars.className='bars';
      [['PROGRESS',p.progress,'#8fd17c'],['WATER',w,w<35?'#e8835a':'#4fb3e8']].forEach(([k,v,c])=>{
        const a=document.createElement('span');a.textContent=k;const bb=document.createElement('div');bb.className='bar';const i=document.createElement('i');i.style.width=v+'%';i.style.background=c;bb.appendChild(i);
        const vv=document.createElement('span');vv.textContent=Math.round(v)+'%';bars.appendChild(a);bars.appendChild(bb);bars.appendChild(vv);});
      row.appendChild(bars);
      const src=V(); const note=src&&src.notes&&src.notes[p.id];
      if(note){const ns=document.createElement('div');ns.className='ns';ns.textContent='Next: '+note;row.appendChild(ns);}
      const L=(src&&src.logs&&src.logs[p.id])||[];
      if(L.length){const d=document.createElement('details');const sm=document.createElement('summary');sm.textContent=`Log (${L.length}), last: ${L[L.length-1].text||'watered'}`;d.appendChild(sm);logRows(L.slice().reverse(),d);row.appendChild(d);}
      list.appendChild(row);
    });
  };
  if(V()){
    const recent=[];all.forEach(p=>((V().logs||{})[p.id]||[]).forEach(e=>recent.push({t:e.t,text:p.code+': '+(e.text||'watered')})));
    recent.sort((a,b)=>b.t-a.t);
    const wk=recent.filter(e=>Date.now()-e.t<7*DAY).length;
    if(recent.length){const h=document.createElement('div');h.className='dsec';h.textContent=`RECENT ACTIVITY (${wk} THIS WEEK)`;list.appendChild(h);const box=document.createElement('div');box.className='drow';logRows(recent.slice(0,6),box);list.appendChild(box);}
  }
  section('PROJECTS',gd.projects); section('SKILLS',gd.skills||[]);
  dashM.classList.add('show');
}

