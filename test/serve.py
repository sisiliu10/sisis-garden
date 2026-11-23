"""Serve the built game against a fake Supabase, logged in automatically, for the browser tests.
usage: python3 test/serve.py [port]   (default 8766)  ->  http://127.0.0.1:8766/?u=<any user id>
Every page load starts from test/fixture.json (Sisi's sample garden, André's garden), with times moved to 'now'."""
import json, os, sys, http.server, socketserver, functools
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); T = R + '/test'; OUT = '/tmp/garden-test'
os.makedirs(OUT, exist_ok=True)
fixture = json.load(open(T + '/fixture.json'))
page = open(R + '/index.html').read().replace('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js', 'supabase.js')
boot = ("<script>(function(){var u=new URLSearchParams(location.search).get('u')||'uid-x';"
        "window.__session={user:{id:u,email:u+'@x'}};var s=" + json.dumps(fixture) + ",d=Date.now()-s._now;delete s._now;"
        "(function fix(o){if(o&&typeof o==='object')for(var k in o){if((k==='t'||k==='saved')&&typeof o[k]==='number'&&o[k]>1e12)o[k]+=d;else fix(o[k]);}})(s);"
        "window.__store=s;})();</script>")
open(OUT + '/index.html', 'w').write(page.replace('<head>', '<head>' + boot, 1))
open(OUT + '/supabase.js', 'w').write(open(T + '/mock-supabase.js').read())
open(OUT + '/config.js', 'w').write("window.GARDEN_CONFIG={url:'https://x.supabase.co',key:'k'};")
port = next((int(a) for a in sys.argv[1:] if a.isdigit()), 8766)
if '--write-only' in sys.argv: sys.exit(print('written', OUT))
H = functools.partial(http.server.SimpleHTTPRequestHandler, directory=OUT)
H.log_message = lambda *a: None
socketserver.TCPServer.allow_reuse_address = True
print(f'serving http://127.0.0.1:{port}/'); socketserver.TCPServer(('127.0.0.1', port), H).serve_forever()
