"""Screenshots of 17 scenes on desktop and phone with a frozen clock and seeded randomness, to compare two builds.
usage: python3 test/snap/snap.py <built index.html> <outdir>   then   python3 test/snap/compare.py <old1> <old2> <new>"""
import asyncio, json, sys, os, datetime
from playwright.async_api import async_playwright
R=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
BUILT=os.path.abspath(sys.argv[1]); OUT=os.path.abspath(sys.argv[2]); os.makedirs(OUT,exist_ok=True)
PAGE='/tmp/garden-snap/index.html'; os.makedirs('/tmp/garden-snap',exist_ok=True)
MOCK=open(R+'/test/mock-supabase.js').read()
CFG="window.GARDEN_CONFIG={url:'https://x.supabase.co',key:'k'};"
open('/tmp/garden-snap/config.js','w').write(CFG)
FIX=json.load(open(R+'/test/fixture.json'))
# a window into the game for setting up scenes (the game runs inside a closure)
h=open(BUILT).read(); a="function flushSave(){"; assert h.count(a)==1
open(PAGE,'w').write(h.replace(a,"window.__t={ev:(s)=>eval(s)};"+a))
T0=datetime.datetime(2026,11,20,12,0,0)
def shifted(f):
    f=json.loads(json.dumps(f)); d=int(T0.timestamp()*1000)-f.pop('_now')
    def fix(o):
        if isinstance(o,dict):
            for k,v in o.items():
                if k in('t','saved') and isinstance(v,(int,float)) and v>1e12: o[k]=v+d
                else: fix(v)
        elif isinstance(o,list):
            for v in o: fix(v)
    fix(f); return f
SEED=r"""(function(){let s=7,f=11,inF=false;const H=t=>((t%2147483647)*2654435761)%2147483647||7;
Math.random=function(){if(inF){f=(f*48271)%2147483647;return f/2147483647;}s=(s*48271)%2147483647;return s/2147483647;};
const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=function(cb){return raf(ts=>{f=H(Date.now());inF=true;try{cb(ts);}finally{inF=false;}});};
addEventListener('DOMContentLoaded',()=>{const st=document.createElement('style');st.textContent='*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}';document.head.appendChild(st);});})();"""
def isle(n):
    return {'path':'gardens/uid-mia/x/isle','data':{'list':[{'k':k,'x':60+i*14,'y':80+(i%3)*12,'t':1795000000000+i,'n':'Mia','c':i%4} for i,k in enumerate(['flower','tulip','stone','lantern','shell','mushroom'][:n])]}}
SC=[  # name, setup-before-load (localStorage), steps after login
 ('visit_day',"localStorage.setItem('garden-hour','12');",[]),
 ('visit_night_rain',"localStorage.setItem('garden-hour','23');localStorage.setItem('garden-wx-test',JSON.stringify({c:61,t:4}));localStorage.setItem('garden-moon','0.3');",[]),
 ('visit_snow_fog',"localStorage.setItem('garden-hour','9');localStorage.setItem('garden-wx-test',JSON.stringify({c:73,t:-2}));",[]),
 ('home_card',"localStorage.setItem('garden-hour','15');",["goHome()","home.projects.push({id:'px1',slot:0,code:'TEST',name:'Test',kind:'tree',progress:30,w:40,t:Date.now()-2*864e5,last:0});persist();rebuildLabels()","(()=>{const p=home.projects[0];const [x,y]=posOf(p);av.x=x+10;av.y=y+6;av.target=null;})()"]),
 ('water',"localStorage.setItem('garden-hour','15');",["goHome()","home.projects.push({id:'px1',slot:0,code:'TEST',name:'Test',kind:'tree',progress:30,w:40,t:Date.now()-2*864e5,last:0});persist();rebuildLabels()","(()=>{const p=home.projects[0];const [x,y]=posOf(p);av.x=x+10;av.y=y+6;av.target=null;})()","document.getElementById('dWater').click()"]),
 ('house',"localStorage.setItem('garden-hour','20');",["goScene('house')"]),
 ('games',"",["goScene('house')","HOBJ.find(o=>/game/i.test(o.label||o.l||'')) ? HOBJ.find(o=>/game/i.test(o.label||o.l||'')).act() : 0"]),
 ('c4',"",["goScene('house')","openC4()"]),
 ('quiz',"",["goScene('house')","openQuiz()"]),
 ('island',"localStorage.setItem('garden-hour','12');",["enterIsland()"]),
 ('island_night',"localStorage.setItem('garden-hour','22');",["enterIsland()"]),
 ('map',"",["openMap()"]),
 ('help',"",["document.getElementById('bHelp')&&document.getElementById('bHelp').click()"]),
 ('avatar',"",["document.getElementById('bAvatar')&&document.getElementById('bAvatar').click()"]),
 ('friends',"",["document.getElementById('bGardens')&&document.getElementById('bGardens').click()"]),
 ('mapmenu',"",["document.getElementById('mapBtn')&&document.getElementById('mapBtn').click()"]),
 ('still',"localStorage.setItem('garden-hour','12');",["goHome()","home.projects.push({id:'px2',slot:0,code:'OLD',name:'Old',kind:'tea',progress:30,w:10,t:Date.now()-20*864e5,last:0});home.askDay='';home.ask={};persist();rebuildLabels()"]),
]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--font-render-hinting=none','--disable-gpu'])
        for vp,touch in [({'width':1280,'height':800},False),({'width':390,'height':844},True)]:
            for name,pre,steps in SC:
                if os.environ.get('ONLY') and name not in os.environ['ONLY'].split(','): continue
                c=await b.new_context(viewport=vp,has_touch=touch,is_mobile=touch,device_scale_factor=1)
                pg=await c.new_page(); errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
                await pg.clock.install(time=T0-datetime.timedelta(seconds=1)); await pg.clock.pause_at(T0)
                await pg.route('**/supabase.js',lambda r:r.fulfill(body=MOCK,content_type='text/javascript'))
                await pg.route('**/config.js',lambda r:r.fulfill(body=CFG,content_type='text/javascript'))
                await pg.route('**/api.open-meteo.com/**',lambda r:r.fulfill(body='{"current":{"temperature_2m":2.4,"weather_code":2}}',content_type='application/json',headers={'access-control-allow-origin':'*'}))
                await pg.route('**/fonts.googleapis.com/**',lambda r:r.abort()); await pg.route('**/fonts.gstatic.com/**',lambda r:r.abort())
                store=shifted(FIX); store['gardens/uid-mia/x/isle']=isle(6)
                await pg.add_init_script(SEED+f"window.__session={{user:{{id:'uid-snap',email:'s@x'}}}};window.__store={json.dumps(store)};"+pre)
                await pg.goto('file://'+PAGE); await asyncio.sleep(.6); await pg.clock.run_for(3500); await asyncio.sleep(.3)
                await pg.fill('#nm','Snap'); await pg.click('#done'); await asyncio.sleep(.4); await pg.clock.run_for(1500); await asyncio.sleep(.3)
                for s in steps:
                    try: await pg.evaluate("(c)=>__t.ev(c)",s)
                    except Exception as e: errs.append('step '+s[:40]+': '+str(e)[:80])
                    await asyncio.sleep(.3); await pg.clock.run_for(1200); await asyncio.sleep(.2)
                await pg.clock.run_for(2000)
                await pg.screenshot(path=f"{OUT}/{name}_{vp['width']}.png")
                html=await pg.evaluate("(()=>{const o=[];document.querySelectorAll('body *').forEach(e=>{const r=e.getBoundingClientRect();if(r.width&&r.height&&getComputedStyle(e).visibility!=='hidden')o.push(e.tagName+'#'+e.id+'.'+e.className+':'+(e.children.length?'':e.textContent.trim().slice(0,40))+'@'+[r.x,r.y,r.width,r.height].map(Math.round))});return o.join('\\n')})()")
                open(f"{OUT}/{name}_{vp['width']}.dom.txt",'w').write(html+'\n#errors '+json.dumps(errs))
                await c.close()
        await b.close()
    print('snapped',len(SC)*2,'->',OUT)
asyncio.run(main())
