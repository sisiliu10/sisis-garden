/* ================= one shared audio context, woken up by every tap ================= */
const Snd=(()=>{
  let ctx=null;
  function get(){if(!ctx){try{ctx=new (window.AudioContext||window.webkitAudioContext)();}catch(e){ctx=null;}}return ctx;}
  // browsers (Safari most of all) only let sound start or resume inside a real tap or key press
  // iPhone/iPad: without this the mute switch on the side silences everything
  let sil=null;
  function media(){
    try{if(navigator.audioSession){if(navigator.audioSession.type!=='playback')navigator.audioSession.type='playback';return;}}catch(e){}
    if(!/iPad|iPhone|iPod/.test(navigator.userAgent)&&!(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1))return;
    try{if(!sil){const n=4000,buf=new ArrayBuffer(44+n),v=new DataView(buf),w=(o,t)=>{for(let i=0;i<t.length;i++)v.setUint8(o+i,t.charCodeAt(i));};
        w(0,'RIFF');v.setUint32(4,36+n,true);w(8,'WAVEfmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,8000,true);v.setUint32(28,8000,true);v.setUint16(32,1,true);v.setUint16(34,8,true);w(36,'data');v.setUint32(40,n,true);
        for(let i=0;i<n;i++)v.setUint8(44+i,128);
        sil=new Audio(URL.createObjectURL(new Blob([buf],{type:'audio/wav'})));sil.loop=true;sil.setAttribute('playsinline','');}
      if(sil.paused){const p=sil.play();if(p&&p.catch)p.catch(()=>{});}}catch(e){}
  }
  function unlock(){media();const c=get();if(c&&c.state!=='running'){try{const p=c.resume&&c.resume();if(p&&p.catch)p.catch(()=>{});
      const b=c.createBuffer(1,1,22050),sn=c.createBufferSource();sn.buffer=b;sn.connect(c.destination);sn.start(0);}catch(e){}}return c;}
  return {get,unlock,started:()=>!!ctx,state:()=>ctx?ctx.state:'none'};
})();
/* ================= lofi music (generated live, no samples) ================= */
const Lofi=(()=>{
  let ctx=null,out=null,on=false,timer=null,step=0,nextT=0,bar=0,noiseBuf=null,vinyl=null;
  const BPM=72,S16=60/BPM/4;
  const mtof=m=>440*Math.pow(2,(m-69)/12);
  const CH=[[53,57,60,64,67],[52,55,59,62,66],[50,53,57,60,64],[48,52,55,59,62]];
  const BASS=[41,40,38,36];
  const PENTA=[72,74,76,79,81,84];
  function noise(){const b=ctx.createBuffer(1,ctx.sampleRate*2,ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return b;}
  function init(){
    ctx=Snd.get();if(!ctx)return;
    const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2200;lp.Q.value=.4;
    out=ctx.createGain();out.gain.value=0;out.connect(lp);lp.connect(ctx.destination);
    noiseBuf=noise();
    // vinyl hiss + crackle
    const vb=ctx.createBuffer(1,ctx.sampleRate*3,ctx.sampleRate),vd=vb.getChannelData(0);
    for(let i=0;i<vd.length;i++){vd[i]=(Math.random()*2-1)*.06+(Math.random()<.0007?(Math.random()*2-1)*.9:0);}
    vinyl=ctx.createBufferSource();vinyl.buffer=vb;vinyl.loop=true;
    const vf=ctx.createBiquadFilter();vf.type='bandpass';vf.frequency.value=3000;vf.Q.value=.6;
    const vg=ctx.createGain();vg.gain.value=.25;vinyl.connect(vf);vf.connect(vg);vg.connect(out);vinyl.start();
  }
  function tone(f,t,dur,vol,type){
    const o=ctx.createOscillator(),o2=ctx.createOscillator(),g=ctx.createGain();
    o.type=type||'triangle';o2.type='sine';o.frequency.value=f;o2.frequency.value=f*1.003;
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.03);g.gain.exponentialRampToValueAtTime(.0008,t+dur);
    o.connect(g);o2.connect(g);g.connect(out);o.start(t);o2.start(t);o.stop(t+dur+.05);o2.stop(t+dur+.05);
  }
  function kick(t){const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.setValueAtTime(110,t);o.frequency.exponentialRampToValueAtTime(42,t+.18);
    g.gain.setValueAtTime(.55,t);g.gain.exponentialRampToValueAtTime(.001,t+.35);o.connect(g);g.connect(out);o.start(t);o.stop(t+.4);}
  function hit(t,freq,type,vol,dur){const s=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=noiseBuf;f.type=type;f.frequency.value=freq;
    g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(f);f.connect(g);g.connect(out);s.start(t,Math.random());s.stop(t+dur+.02);}
  function play(i,t){
    const c=bar%4;
    if(i===0){CH[c].forEach((m,k)=>tone(mtof(m),t+k*.018+Math.random()*.01,S16*15,.05,'triangle'));}
    if(i===0||i===10)tone(mtof(BASS[c]),t,S16*(i?5:8),.16,'sine');
    if(i===0||i===7&&Math.random()<.5||i===10)kick(t);
    if(i===4||i===12)hit(t,1700,'bandpass',.22,.18);
    if(i%2===0)hit(t,7500,'highpass',i%4?.03:.05,.05);
    if(i%4===2&&Math.random()<.32)tone(mtof(PENTA[Math.floor(Math.random()*PENTA.length)]),t,S16*6,.045,'sine');
  }
  function tick(){
    if(nextT<ctx.currentTime-.25)nextT=ctx.currentTime+.06;
    while(nextT<ctx.currentTime+.15){
      const sw=(step%2)?S16*.18:0;
      play(step,nextT+sw);
      nextT+=S16;step=(step+1)%16;if(!step)bar++;
    }
  }
  function start(){
    if(!ctx){init();if(!ctx)return;}
    Snd.unlock();
    if(!timer){nextT=ctx.currentTime+.1;step=0;timer=setInterval(tick,30);}
    out.gain.cancelScheduledValues(ctx.currentTime);out.gain.setTargetAtTime(.5,ctx.currentTime,.6);
    on=true;
  }
  function stop(){
    on=false;if(!ctx)return;
    out.gain.cancelScheduledValues(ctx.currentTime);out.gain.setTargetAtTime(0,ctx.currentTime,.2);
    setTimeout(()=>{if(!on){clearInterval(timer);timer=null;}},900);
  }
  return {start,stop,get on(){return on;}};
})();
let musicWanted=true;try{musicWanted=localStorage.getItem('garden-music')!=='off';}catch(e){}
const bMusic=document.getElementById('bMusic');
function paintMusic(){bMusic.classList.toggle('off',!musicWanted);bMusic.title=musicWanted?'Music off':'Music on';bMusic.setAttribute('aria-label',bMusic.title);}
paintMusic();
bMusic.addEventListener('click',e=>{e.stopPropagation();Snd.unlock();musicWanted=!musicWanted;try{localStorage.setItem('garden-music',musicWanted?'on':'off');}catch(_){}
  paintMusic();musicWanted?Lofi.start():Lofi.stop();
  setTimeout(()=>{const st=Snd.state();toast(!musicWanted?'Music off. Splashes and other sounds stay on.':st==='running'?'Music on.':'Music on. If you hear nothing, tap the garden once more.',3500);},350);});
// every tap or key press wakes the sound up again (after a tab switch, a call, a locked phone ...)
// one rule for the whole interface: anything you can press makes the same small click, right at the press
const PRESSABLE='button,.btn,a[href],select,input[type=checkbox],input[type=radio],label.chk,[role=button],.lockb,.dsec [cursor],.swatch,.opt';
let lastClickSnd=0;
function uiClick(e){const el=e.target&&e.target.closest&&e.target.closest(PRESSABLE);if(!el||el.disabled||el.id==='bMusic')return;
  const now=performance.now();if(now-lastClickSnd<60)return;lastClickSnd=now;
  try{Snd.unlock();Sfx.click(el.classList.contains('dark')||el.getAttribute('type')==='submit'||el.id==='done');}catch(_){}}
document.addEventListener('pointerdown',uiClick,true);
document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target&&e.target.matches&&e.target.matches('button,.btn,a[href],input[type=checkbox]'))uiClick(e);},true);
function onGesture(e){Snd.unlock();try{Sfx.preload();}catch(_){}if(e.target&&e.target.id==='bMusic')return;if(musicWanted&&!Lofi.on&&!document.hidden)Lofi.start();}
['pointerdown','mousedown','touchend','click','keydown'].forEach(ev=>addEventListener(ev,onGesture,{capture:true,passive:true}));
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(Lofi.on)Lofi.stop();}else if(musicWanted&&!Lofi.on&&Snd.started())Lofi.start();});

