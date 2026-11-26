/* ================= sound effects (generated live, no samples) ================= */
const Sfx=(()=>{
  // water splash, built from noise and bubbles (no pitched "thump"):
  // a soft low whoosh of displaced water, a bright spray that swells and rains back down, and lots of little bubbles
  function build(c,t,big,vol){
    const dur=big?1.6:1.05,v=(vol===undefined?1:vol)*(big?.6:.42);
    const out=c.createGain();out.gain.value=v;
    const tone=c.createBiquadFilter();tone.type='lowpass';tone.frequency.setValueAtTime(9500,t);tone.frequency.exponentialRampToValueAtTime(1700,t+dur);out.connect(tone);tone.connect(c.destination);
    const buf=noiseBuf(c,dur);
    const n1=c.createBufferSource();n1.buffer=buf;const lp=c.createBiquadFilter();lp.type='lowpass';lp.Q.value=.3;lp.frequency.setValueAtTime(big?650:800,t);lp.frequency.exponentialRampToValueAtTime(170,t+.5);
    const g1=c.createGain();g1.gain.setValueAtTime(.0001,t);g1.gain.linearRampToValueAtTime(big?.85:.6,t+.05);g1.gain.exponentialRampToValueAtTime(.001,t+(big?.65:.45));
    n1.connect(lp);lp.connect(g1);g1.connect(out);n1.start(t);n1.stop(t+.7);
    const n2=c.createBufferSource();n2.buffer=buf;const hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=1300;
    const bp=c.createBiquadFilter();bp.type='bandpass';bp.Q.value=.45;bp.frequency.setValueAtTime(2600,t);bp.frequency.exponentialRampToValueAtTime(4600,t+.18);bp.frequency.exponentialRampToValueAtTime(2400,t+dur);
    const g2=c.createGain();g2.gain.setValueAtTime(.0001,t);g2.gain.linearRampToValueAtTime(.8,t+.09);g2.gain.exponentialRampToValueAtTime(.001,t+dur);
    const fl=c.createGain(),steps=Math.max(8,Math.floor(dur*26)),curve=new Float32Array(steps);for(let i=0;i<steps;i++)curve[i]=.5+Math.random()*.5;fl.gain.setValueCurveAtTime(curve,t,dur);
    n2.connect(hp);hp.connect(bp);bp.connect(g2);g2.connect(fl);fl.connect(out);n2.start(t,.05);n2.stop(t+dur);
    for(let i=0,n=big?24:13;i<n;i++){
      const tt=t+.06+Math.pow(Math.random(),1.5)*dur*.78,f=420+Math.random()*1900,len2=.045+Math.random()*.05,pk=(.09+Math.random()*.13)*(1-(tt-t)/dur*.7);
      const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(f,tt);o.frequency.exponentialRampToValueAtTime(f*(1.5+Math.random()*.9),tt+len2);
      g.gain.setValueAtTime(.0001,tt);g.gain.linearRampToValueAtTime(pk,tt+.006);g.gain.exponentialRampToValueAtTime(.001,tt+len2+.03);
      o.connect(g);g.connect(out);o.start(tt);o.stop(tt+len2+.04);
    }
  }
  function splash(big,vol){
    if(document.hidden||!Snd.started())return;const c=Snd.get();if(!c)return;if(c.state==='suspended'){Snd.unlock();return;}
    try{build(c,c.currentTime+.01,big,vol);}catch(e){}
  }
  // slide: a soft slide-whistle "wheee" on the way down, then a happy little 8-bit "yay" jingle on landing
  // white noise, the raw material for splashes, steps and clicks
  function noiseBuf(c,dur){const b=c.createBuffer(1,Math.floor(c.sampleRate*dur),c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return b;}
  function ready(){if(document.hidden||!Snd.started())return null;const c=Snd.get();if(!c)return null;if(c.state==='suspended'){Snd.unlock();return null;}return c;}
  function whee(vol){const c=ready();if(!c)return;const t=c.currentTime+.01,v=(vol===undefined?1:vol)*.07;
    const o=c.createOscillator(),g=c.createGain(),lfo=c.createOscillator(),lg=c.createGain();
    o.type='sine';o.frequency.setValueAtTime(1250,t);o.frequency.exponentialRampToValueAtTime(420,t+.8);
    lfo.frequency.value=7;lg.gain.value=22;lfo.connect(lg);lg.connect(o.frequency);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.06);g.gain.setValueAtTime(v,t+.6);g.gain.exponentialRampToValueAtTime(.0005,t+.85);
    o.connect(g);g.connect(c.destination);o.start(t);lfo.start(t);o.stop(t+.9);lfo.stop(t+.9);}
  function yay(vol){const c=ready();if(!c)return;const t0=c.currentTime+.01,v=(vol===undefined?1:vol)*.11;
    const out=c.createGain();out.gain.value=1;const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=4200;out.connect(lp);lp.connect(c.destination);
    const echo=c.createDelay();echo.delayTime.value=.13;const fb=c.createGain();fb.gain.value=.28;out.connect(echo);echo.connect(fb);fb.connect(echo);echo.connect(lp);
    // G5 C6 E6 ... G6 (held), with a soft square "pluck" layered under a triangle
    [[784,0,.09],[1047,.075,.09],[1319,.15,.09],[1568,.24,.42]].forEach(([f,dt,d])=>{const t=t0+dt;
      [['triangle',1],['square',.22]].forEach(([ty,m])=>{const o=c.createOscillator(),g=c.createGain();o.type=ty;o.frequency.setValueAtTime(f,t);
        if(d>.2){o.frequency.setValueAtTime(f,t+.12);o.frequency.linearRampToValueAtTime(f*1.012,t+.2);o.frequency.linearRampToValueAtTime(f,t+.28);}
        g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*m,t+.008);g.gain.exponentialRampToValueAtTime(v*m*.5,t+d*.5);g.gain.exponentialRampToValueAtTime(.0004,t+d+.12);
        o.connect(g);g.connect(out);o.start(t);o.stop(t+d+.15);});});
    // a few sparkly high blips
    [2637,3136,2349].forEach((f,i)=>{const t=t0+.3+i*.06,o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=f;
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*.35,t+.005);g.gain.exponentialRampToValueAtTime(.0003,t+.12);o.connect(g);g.connect(out);o.start(t);o.stop(t+.14);});}
  // watering: a soft trickle from the can's rose (filtered noise that flutters), with little droplet plinks
  function pour(delay,vol){const c=ready();if(!c)return;const t=c.currentTime+(delay||0)+.01,dur=1.6,v=(vol===undefined?1:vol)*.3;
    const out=c.createGain();out.gain.value=v;out.connect(c.destination);
    const buf=noiseBuf(c,dur);
    const n=c.createBufferSource();n.buffer=buf;const bp=c.createBiquadFilter();bp.type='bandpass';bp.Q.value=.7;bp.frequency.setValueAtTime(1500,t);bp.frequency.linearRampToValueAtTime(2300,t+dur);
    const hs=c.createBiquadFilter();hs.type='highshelf';hs.frequency.value=4000;hs.gain.value=-8;
    const g=c.createGain();g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.55,t+.15);g.gain.setValueAtTime(.55,t+dur-.3);g.gain.exponentialRampToValueAtTime(.001,t+dur);
    const fl=c.createGain(),steps=64,cv=new Float32Array(steps);for(let i=0;i<steps;i++)cv[i]=.45+Math.random()*.55;fl.gain.setValueCurveAtTime(cv,t,dur);
    n.connect(bp);bp.connect(hs);hs.connect(g);g.connect(fl);fl.connect(out);n.start(t);n.stop(t+dur);
    for(let i=0;i<22;i++){const tt=t+.1+Math.random()*(dur-.35),f=700+Math.random()*1300,l=.04+Math.random()*.04,o=c.createOscillator(),gg=c.createGain();
      o.type='sine';o.frequency.setValueAtTime(f,tt);o.frequency.exponentialRampToValueAtTime(f*1.9,tt+l);
      gg.gain.setValueAtTime(.0001,tt);gg.gain.linearRampToValueAtTime(.12+Math.random()*.1,tt+.005);gg.gain.exponentialRampToValueAtTime(.001,tt+l+.03);
      o.connect(gg);gg.connect(out);o.start(tt);o.stop(tt+l+.05);}}
  // the plant is happy: a soft little bell arpeggio going up
  function grow(vol){const c=ready();if(!c)return;const t0=c.currentTime+.01,v=(vol===undefined?1:vol)*.09;
    const out=c.createGain();out.gain.value=1;const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=5200;out.connect(lp);lp.connect(c.destination);
    const echo=c.createDelay();echo.delayTime.value=.16;const fb=c.createGain();fb.gain.value=.25;out.connect(echo);echo.connect(fb);fb.connect(echo);echo.connect(lp);
    [[1047,0],[1319,.08],[1568,.16],[2093,.26]].forEach(([f,dt],i)=>{const t=t0+dt,dur=i===3?.9:.45;
      [[1,'sine',1],[2.01,'sine',.25],[1,'triangle',.3]].forEach(([mul,ty,m])=>{const o=c.createOscillator(),g=c.createGain();o.type=ty;o.frequency.value=f*mul;
        g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*m,t+.006);g.gain.exponentialRampToValueAtTime(.0003,t+dur);o.connect(g);g.connect(out);o.start(t);o.stop(t+dur+.05);});});}
  // the duck: a short nasal "quak" (a buzzy tone through two formant filters, the pitch bends down at the end)
  function quack(vol){const c=ready();if(!c)return;const t=c.currentTime+.01,v=(vol===undefined?1:vol)*.6,f=290+Math.random()*50,d=.24;
    const o=c.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(f*.9,t);o.frequency.linearRampToValueAtTime(f*1.1,t+.05);o.frequency.exponentialRampToValueAtTime(f*.7,t+d);
    const lfo=c.createOscillator(),lg=c.createGain();lfo.frequency.value=36;lg.gain.value=f*.05;lfo.connect(lg);lg.connect(o.frequency);
    const env=c.createGain();env.gain.setValueAtTime(.0001,t);env.gain.exponentialRampToValueAtTime(v,t+.018);env.gain.setValueAtTime(v,t+d*.5);env.gain.exponentialRampToValueAtTime(.0001,t+d);
    const f1=c.createBiquadFilter();f1.type='bandpass';f1.frequency.value=1000;f1.Q.value=4;
    const f2=c.createBiquadFilter();f2.type='bandpass';f2.frequency.value=2400;f2.Q.value=5;const g2=c.createGain();g2.gain.value=.55;
    o.connect(f1);o.connect(f2);f1.connect(env);f2.connect(g2);g2.connect(env);env.connect(c.destination);
    o.start(t);lfo.start(t);o.stop(t+d+.05);lfo.stop(t+d+.05);}
  // sitting down on the alpaca: a soft cushioned "fwump" plus the little hum alpacas make
  function sit(vol){const c=ready();if(!c)return;const t=c.currentTime+.01,v=(vol===undefined?1:vol);
    const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(62,t+.16);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.28*v,t+.012);g.gain.exponentialRampToValueAtTime(.0005,t+.22);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+.25);
    const n=c.createBufferSource();n.buffer=noiseBuf(c,.2);
    const nf=c.createBiquadFilter();nf.type='lowpass';nf.frequency.value=900;const ng=c.createGain();ng.gain.setValueAtTime(.12*v,t);ng.gain.exponentialRampToValueAtTime(.0005,t+.16);n.connect(nf);nf.connect(ng);ng.connect(c.destination);n.start(t);
    const h=c.createOscillator(),h2=c.createOscillator(),hg=c.createGain(),hf=c.createBiquadFilter(),lfo=c.createOscillator(),lg=c.createGain(),t2=t+.16;
    h.type='triangle';h2.type='sine';h.frequency.setValueAtTime(330,t2);h.frequency.linearRampToValueAtTime(410,t2+.16);h.frequency.linearRampToValueAtTime(345,t2+.42);
    h2.frequency.setValueAtTime(660,t2);h2.frequency.linearRampToValueAtTime(820,t2+.16);h2.frequency.linearRampToValueAtTime(690,t2+.42);
    lfo.frequency.value=9;lg.gain.value=7;lfo.connect(lg);lg.connect(h.frequency);hf.type='lowpass';hf.frequency.value=1400;
    hg.gain.setValueAtTime(0,t2);hg.gain.linearRampToValueAtTime(.075*v,t2+.06);hg.gain.setValueAtTime(.075*v,t2+.3);hg.gain.exponentialRampToValueAtTime(.0005,t2+.5);
    const h2g=c.createGain();h2g.gain.value=.25;h.connect(hf);h2.connect(h2g);h2g.connect(hf);hf.connect(hg);hg.connect(c.destination);
    [h,h2,lfo].forEach(x=>{x.start(t2);x.stop(t2+.55);});}
  // opening the front door: a real recorded door (Kenney RPG Audio, CC0), the synth version is only a fallback
  const DOOR_MP3='data:audio/mpeg;base64,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';let doorBuf=null,doorLoad=null;
  function loadDoor(c){if(doorBuf||doorLoad)return doorLoad;doorLoad=fetch(DOOR_MP3).then(r=>r.arrayBuffer()).then(a=>new Promise((res,rej)=>{const p=c.decodeAudioData(a,res,rej);if(p&&p.then)p.then(res,rej);})).then(b=>{doorBuf=b;return b;}).catch(()=>{doorBuf=false;});return doorLoad;}
  function door(vol){const c=ready();if(!c)return;const v=(vol===undefined?1:vol);
    const play=()=>{if(!doorBuf){doorSynth(vol);return;}const s=c.createBufferSource(),g=c.createGain();s.buffer=doorBuf;g.gain.value=.9*v;s.connect(g);g.connect(c.destination);s.start(c.currentTime+.01);};
    if(doorBuf!==null)play();else loadDoor(c).then(play);}
  function doorSynth(vol){const c=ready();if(!c)return;const t=c.currentTime+.01,v=(vol===undefined?1:vol);
    const nb=noiseBuf(c,.6);
    const click=(at,fq,a,len)=>{const n=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();n.buffer=nb;f.type='bandpass';f.frequency.value=fq;f.Q.value=4;
      g.gain.setValueAtTime(a*v,at);g.gain.exponentialRampToValueAtTime(.0005,at+len);n.connect(f);f.connect(g);g.connect(c.destination);n.start(at,Math.random()*.3,len+.02);};
    // handle goes down, latch clicks open (two small metal clicks and a wooden knock)
    click(t,3200,.22,.025);click(t+.07,1900,.3,.04);
    {const o=c.createOscillator(),g=c.createGain(),tk=t+.075;o.type='sine';o.frequency.setValueAtTime(210,tk);o.frequency.exponentialRampToValueAtTime(120,tk+.06);
     g.gain.setValueAtTime(.16*v,tk);g.gain.exponentialRampToValueAtTime(.0005,tk+.09);o.connect(g);g.connect(c.destination);o.start(tk);o.stop(tk+.1);}
    // hinge creak: stick-slip pulses through a woody resonance, the rate wobbles as the door swings
    {const t1=t+.16,dur=.62,o=c.createOscillator(),f1=c.createBiquadFilter(),f2=c.createBiquadFilter(),g=c.createGain();
     o.type='sawtooth';o.frequency.setValueAtTime(38,t1);o.frequency.linearRampToValueAtTime(70,t1+.18);o.frequency.linearRampToValueAtTime(52,t1+.34);o.frequency.linearRampToValueAtTime(84,t1+.5);o.frequency.linearRampToValueAtTime(60,t1+dur);
     f1.type='bandpass';f1.Q.value=6;f1.frequency.setValueAtTime(1150,t1);f1.frequency.linearRampToValueAtTime(1500,t1+.3);f1.frequency.linearRampToValueAtTime(1250,t1+dur);
     f2.type='lowpass';f2.frequency.value=2600;
     g.gain.setValueAtTime(0,t1);g.gain.linearRampToValueAtTime(.16*v,t1+.06);g.gain.setValueAtTime(.16*v,t1+.38);g.gain.linearRampToValueAtTime(.12*v,t1+.5);g.gain.exponentialRampToValueAtTime(.0005,t1+dur);
     o.connect(f1);f1.connect(f2);f2.connect(g);g.connect(c.destination);o.start(t1);o.stop(t1+dur+.02);}
    // a little air as it opens
    {const n=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain(),t2=t+.2;n.buffer=nb;f.type='lowpass';f.frequency.value=500;
     g.gain.setValueAtTime(0,t2);g.gain.linearRampToValueAtTime(.05*v,t2+.2);g.gain.exponentialRampToValueAtTime(.0005,t2+.55);n.connect(f);f.connect(g);g.connect(c.destination);n.start(t2,0,.58);}
  }
  // interface click: a short soft "tock", so every press answers at once (deeper for the main action of a window)
  function click(main){if(document.hidden)return;const c=Snd.get();if(!c)return;const t=c.currentTime+.005,f=main?520:760;
    const o=c.createOscillator(),g=c.createGain();o.type='triangle';o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*.55,t+.045);
    g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(main?.16:.11,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+.07);
    o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+.09);
    const len=Math.floor(c.sampleRate*.012),b=c.createBuffer(1,len,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len);
    const n=c.createBufferSource();n.buffer=b;const hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=2200;const ng=c.createGain();ng.gain.value=main?.07:.05;
    n.connect(hp);hp.connect(ng);ng.connect(c.destination);n.start(t);}
  // someone arrives: two soft rising notes, like a little door bell
  function join(){window.__joins=(window.__joins||0)+1;if(document.hidden)return;const c=Snd.get();if(!c)return;const t=c.currentTime+.01;
    [[659,0],[988,.11]].forEach(([f,d])=>{const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(f,t+d);
      g.gain.setValueAtTime(.0001,t+d);g.gain.linearRampToValueAtTime(.13,t+d+.012);g.gain.exponentialRampToValueAtTime(.0001,t+d+.42);o.connect(g);g.connect(c.destination);o.start(t+d);o.stop(t+d+.45);});}
  // game-show countdown: a short 8-bit beep for 3, 2, 1 and a higher, longer one for "go"
  function beep(go,vol){const c=ready();if(!c)return;const t=c.currentTime+.01,v=(vol===undefined?1:vol)*.09,f=go?1319:659,d=go?.38:.13;
    [['square',.5],['triangle',1]].forEach(([ty,m])=>{const o=c.createOscillator(),g=c.createGain();o.type=ty;o.frequency.setValueAtTime(f,t);
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*m,t+.006);g.gain.setValueAtTime(v*m,t+d*.7);g.gain.exponentialRampToValueAtTime(.0004,t+d);
      o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+d+.02);});}
  // fishing: a soft whoosh when you cast, a low "blub" when something bites, quick reel clicks when you pull
  function cast(){const c=ready();if(!c)return;const t=c.currentTime+.01,b=c.createBufferSource();b.buffer=noiseBuf(c,.4);const bp=c.createBiquadFilter();bp.type='bandpass';bp.Q.value=1.2;bp.frequency.setValueAtTime(900,t);bp.frequency.exponentialRampToValueAtTime(2800,t+.3);
    const g=c.createGain();g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.12,t+.08);g.gain.exponentialRampToValueAtTime(.001,t+.38);b.connect(bp);bp.connect(g);g.connect(c.destination);b.start(t);b.stop(t+.4);}
  function plop(){const c=ready();if(!c)return;const t=c.currentTime+.01,o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(520,t);o.frequency.exponentialRampToValueAtTime(150,t+.14);
    g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.22,t+.01);g.gain.exponentialRampToValueAtTime(.001,t+.2);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+.22);}
  function reel(){const c=ready();if(!c)return;const t0=c.currentTime+.01;for(let i=0;i<9;i++){const t=t0+i*.045,o=c.createOscillator(),g=c.createGain();o.type='square';o.frequency.value=1800+i*60;
    g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.03,t+.003);g.gain.exponentialRampToValueAtTime(.0005,t+.025);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+.03);}}
  // a small, friendly "wuff"
  function woof(){const c=ready();if(!c)return;const t0=c.currentTime+.01;[[0,1],[.17,.8]].forEach(([dt,v])=>{const t=t0+dt,o=c.createOscillator(),g=c.createGain(),lp=c.createBiquadFilter();o.type='sawtooth';
    o.frequency.setValueAtTime(420,t);o.frequency.exponentialRampToValueAtTime(260,t+.09);lp.type='lowpass';lp.frequency.value=1400;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.09*v,t+.012);g.gain.exponentialRampToValueAtTime(.001,t+.12);
    o.connect(lp);lp.connect(g);g.connect(c.destination);o.start(t);o.stop(t+.13);});}
  return {woof,cast,plop,reel,beep,click,join,splash,whee,yay,pour,grow,sit,quack,door,preload:()=>{const c=Snd.started()&&Snd.get();if(c)loadDoor(c);}};
})();

