"""Build index.html (what GitHub Pages serves) from src/:
page.html + style.css + game/*.js (in game/order.json order) + bridge.js. No dependencies."""
import json, os, time, datetime
R = os.path.dirname(os.path.abspath(__file__)); S = R + '/src'
read = lambda p: open(p, encoding='utf-8').read()
css = read(S + '/style.css')[:-1]
game = ''.join(read(f'{S}/game/{f}') for f in json.load(open(S + '/game/order.json')))[:-1]
page = read(S + '/page.html').replace('/*STYLE*/', css, 1).replace('/*GAME*/', game, 1).replace('/*BRIDGE*/', read(S + '/bridge.js'), 1)
stamp = os.environ.get('BUILD_STAMP') or (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1)).strftime('%d.%m. %H:%M')
page = page.replace('__V__', os.environ.get('BUILD_V') or str(int(time.time()))).replace('__BUILD__', stamp)
open(R + '/index.html', 'w', encoding='utf-8').write(page)
open(R + '/version.txt', 'w').write(stamp + '\n')
print('built', len(page), 'chars, version', stamp)
