"""before/after check with noise: run the old build twice (B1,B2) and the new one once (C).
A scene passes when C differs from the old build no more than the old build differs from itself,
and the visible page elements (DOM) match, except texts that are picked at random on purpose."""
import sys,os,re
from PIL import Image, ImageChops
B1,B2,C=sys.argv[1:4]; bad=0
def px(a,b):
    a,b=Image.open(a).convert('RGB'),Image.open(b).convert('RGB')
    if a.size!=b.size: return 10**9
    d=ImageChops.difference(a,b).convert('L').point(lambda v:255 if v else 0)
    return d.histogram()[255]
RANDOM=re.compile(r'^(DIV#dMsg|BUTTON#\.:|BUTTON#\.more)')  # watering message and quiz topic chips are random by design
def dom(f): return [l for l in open(f).read().split('\n') if not RANDOM.match(l)]
for f in sorted(os.listdir(B1)):
    if f.endswith('.png'):
        noise=max(px(f'{B1}/{f}',f'{B2}/{f}'),1); d=min(px(f'{B1}/{f}',f'{C}/{f}'),px(f'{B2}/{f}',f'{C}/{f}'))
        ok=d<=noise*2+150
        print(('ok  ' if ok else 'DIFF'),f'{f:28s} noise {noise:6d}  new {d:6d}'); bad+=0 if ok else 1
    elif f.endswith('.dom.txt'):
        a,c=dom(f'{B1}/{f}'),dom(f'{C}/{f}')
        if a!=c:
            import difflib; print('DOM ',f); print('\n'.join(list(difflib.unified_diff(a,c,lineterm='',n=0))[2:10])); bad+=1
print('SAME AS BEFORE' if not bad else f'DIFFERENCES: {bad}')
