"""Black-box helpers: only viewport input, visible text/roles, and rendered-DOM visibility checks."""
import os, re, time, random, io, datetime

BASE = os.environ.get("GARDEN_URL", "http://127.0.0.1:8766/")
DESKTOP = dict(viewport={"width": 1280, "height": 800})
PHONE = dict(viewport={"width": 390, "height": 844}, has_touch=True, is_mobile=True, device_scale_factor=2)

# An element counts as "seen" only if it is on screen, not covered, and not transparent/hidden.
JS_SEEN = """e=>{const r=e.getBoundingClientRect(); if(r.width<2||r.height<2) return false;
 const cx=r.left+r.width/2, cy=r.top+r.height/2; if(cx<0||cy<0||cx>innerWidth||cy>innerHeight) return false;
 let n=e; while(n){const s=getComputedStyle(n); if(s.opacity==='0'||s.visibility==='hidden'||s.display==='none') return false; n=n.parentElement}
 if(getComputedStyle(e).pointerEvents==='none') return true;  /* decorative text: geometry+opacity only */
 const t=document.elementFromPoint(cx,cy); return !!t && (t===e||e.contains(t)||t.contains(e));}"""

# Plant name labels float over the canvas; the plant card also shows the name as its title.
JS_LABELS = """(name)=>{const out=[];for(const e of document.querySelectorAll('body *')){
  if(e.childElementCount||e.textContent.trim()!==name) continue;
  let n=e,inCard=false; while(n&&n!==document.body){ if((n.innerText||'').includes('PROGRESS')){inCard=true;break} n=n.parentElement}
  if(inCard) continue; let v=true; n=e; while(n){const s=getComputedStyle(n); if(s.opacity==='0'||s.visibility==='hidden'||s.display==='none'){v=false;break} n=n.parentElement}
  const r=e.getBoundingClientRect(); if(v&&r.width>1&&r.bottom>0&&r.top<innerHeight) out.push({x:r.x,y:r.y,width:r.width,height:r.height});}
  return out}"""


def uid(tag):
    return f"bt-{tag}-{random.randint(0, 10**9)}"


class Ctx:
    def __init__(self, pw, device, code=2, temp=4.2, frozen_clock=False):
        self.mobile = device is PHONE
        self.browser = pw.chromium.launch()
        self.context = self.browser.new_context(**device)
        self.context.set_default_timeout(10000)
        self.pg = self.context.new_page()
        self.t0 = datetime.datetime.now()
        if frozen_clock:  # wall clock (Date) fixed from the start so we can later jump days ahead
            self.pg.clock.set_fixed_time(self.t0)
        body = '{"current":{"temperature_2m":%s,"weather_code":%d}}' % (temp, code)
        self.pg.route("**/api.open-meteo.com/**", lambda r: r.fulfill(
            status=200, body=body,
            headers={"content-type": "application/json", "access-control-allow-origin": "*"}))

    def close(self):
        try: self.browser.close()
        except Exception: pass

    # ---- input ----
    def press(self, loc):
        """Tap on phone, click on desktop, at the element's centre (like a player)."""
        loc = first_seen(loc)
        if not loc.evaluate(JS_SEEN):  # a player would scroll the panel to reach it
            try: loc.scroll_into_view_if_needed(timeout=2000); self.pg.wait_for_timeout(300)
            except Exception: pass
        bb = loc.bounding_box()
        x, y = bb["x"] + bb["width"] / 2, bb["y"] + bb["height"] / 2
        self.point(x, y)

    def point(self, x, y):
        if self.mobile: self.pg.touchscreen.tap(x, y)
        else: self.pg.mouse.click(x, y)

    def btn(self, name, exact=True):
        return self.pg.get_by_role("button", name=name, exact=exact)

    # ---- flows ----
    def open(self, name="Tessa"):
        pg = self.pg
        pg.goto(BASE + ("&" if "?" in BASE else "?") + "u=" + uid("p"))
        name_box = pg.get_by_placeholder("Your name")
        name_box.wait_for(state="visible")
        return name_box

    def enter(self, name="Tessa"):
        box = self.open(name)
        box.fill(name)
        self.press(self.btn("Into the garden →"))
        self.pg.wait_for_timeout(1200)

    def home(self):
        self.press(self.btn("← Home"))
        # back home the "you are visiting" line under the title goes away
        self.pg.get_by_text("you are visiting").wait_for(state="hidden", timeout=6000)
        self.pg.wait_for_timeout(800)

    def text(self):
        return self.pg.inner_text("body")

    def label_bb(self, name):
        prev = None
        for _ in range(40):  # wait until the camera stops moving
            r = self.pg.evaluate(JS_LABELS, name)
            bb = r[0] if r else None
            if bb and prev and abs(bb["x"] - prev["x"]) < .5 and abs(bb["y"] - prev["y"]) < .5:
                return bb
            prev = bb
            self.pg.wait_for_timeout(150)
        return prev

    def walk_to_plant(self, name, card_marker="PROGRESS"):
        """Tap/click the ground just next to the plant. Returns number of tries needed (0 = never opened)."""
        for i, (dx, dy) in enumerate([(0, 20), (30, 15), (-30, 15)]):
            bb = self.label_bb(name)
            if not bb: return 0
            self.point(bb["x"] + bb["width"] / 2 + dx, bb["y"] + dy)
            if wait_seen(self.pg, self.pg.get_by_text(card_marker, exact=True), 7000):
                self.pg.wait_for_timeout(400)
                return i + 1
        return 0

    def card_text(self):
        for c in self.pg.locator("div").filter(has=self.pg.get_by_text("PROGRESS", exact=True)).filter(
                has=self.pg.get_by_text("WATER", exact=True)).all()[::-1]:
            try:
                if c.evaluate(JS_SEEN): return c.inner_text()
            except Exception: pass
        return ""

    def card_vals(self):
        t = self.card_text()
        p = re.search(r"PROGRESS\s*(\d+)%", t); w = re.search(r"WATER\s*(\d+)%", t)
        return (int(p.group(1)) if p else None, int(w.group(1)) if w else None, t)

    def skip_days(self, days):
        self.pg.clock.set_fixed_time(self.t0 + datetime.timedelta(days=days))
        self.pg.wait_for_timeout(1200)

    def open_map_via_chip(self):
        self.press(self.pg.get_by_text("Only you", exact=True))
        return wait_seen(self.pg, self.pg.get_by_role("heading", name="Map"), 5000)

    def menu(self):
        self.press(self.pg.locator('button[aria-label="Map"]'))
        self.pg.wait_for_timeout(600)


def first_seen(loc):
    for l in loc.all():
        try:
            if l.evaluate(JS_SEEN): return l
        except Exception: pass
    return loc.first


def seen(loc):
    try:
        return any(l.evaluate(JS_SEEN) for l in loc.all())
    except Exception:
        return False


def wait_seen(pg, loc, timeout=6000):
    end = time.time() + timeout / 1000
    while time.time() < end:
        if seen(loc): return True
        pg.wait_for_timeout(150)
    return False


def wait_text(pg, pattern, timeout=6000):
    end = time.time() + timeout / 1000
    while time.time() < end:
        m = re.search(pattern, pg.inner_text("body"))
        if m: return m
        pg.wait_for_timeout(150)
    return None


def moving_pixels(pg, clip, n=3):
    """Fraction of pixels that change between two frames 250 ms apart (precipitation check)."""
    from PIL import Image, ImageChops
    res = []
    for _ in range(n):
        a = Image.open(io.BytesIO(pg.screenshot(clip=clip))).convert("L")
        pg.wait_for_timeout(250)
        b = Image.open(io.BytesIO(pg.screenshot(clip=clip))).convert("L")
        d = ImageChops.difference(a, b).point(lambda v: 255 if v > 30 else 0)
        res.append(d.histogram()[255] / (d.width * d.height))
    return sum(res) / len(res)
