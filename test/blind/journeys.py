"""Player journeys derived from the feature description. Each journey gets `chk(name, ok, detail)`."""
import re
from helpers import *

ITEMS = ["Blume", "Tulpe", "Steine", "Laterne", "Muschel", "Pilz"]


# 1 ---------------------------------------------------------------------------
def first_visit(pw, chk, device):
    c = Ctx(pw, device); pg = c.pg
    try:
        box = c.open()
        chk("asked for a name on first visit", seen(box))
        # the starting look is random, so pick a hair option that is NOT selected yet (unselected ones share a style)
        sty = "e=>getComputedStyle(e).backgroundColor+getComputedStyle(e).color"
        opts = [c.btn(n) for n in ("Long", "Bob", "Short")]
        styles = [o.evaluate(sty) for o in opts]
        hair = next(o for o, st in zip(opts, styles) if styles.count(st) >= 2)
        before = hair.evaluate(sty)
        c.press(hair); pg.wait_for_timeout(300)
        after = hair.evaluate(sty)
        chk("can pick a look (hair option becomes selected)", seen(c.btn("Into the garden →")) and before != after,
            f"{before} -> {after}")
        box.fill("Tessa"); c.press(c.btn("Into the garden →")); pg.wait_for_timeout(1500)
        chk("lands in game (name dialog closed)", not seen(pg.get_by_placeholder("Your name")))
        chk("new player first sees Sisi's garden as visitor",
            seen(pg.get_by_text("you are visiting")) and "Sisi's" in c.text())
        chk("hint says own garden is waiting", seen(pg.get_by_text(re.compile("own garden is waiting"))))
        chk("Home button visible", seen(c.btn("← Home")))
        c.home()
        t = c.text()
        chk("Home leads to own garden", "Tessa's" in t and not seen(pg.get_by_text("you are visiting")),
            t[:60].replace("\n", " "))
    finally:
        c.close()


# 2 ---------------------------------------------------------------------------
def visitor_read_only(pw, chk, device):
    c = Ctx(pw, device); pg = c.pg
    try:
        c.enter()
        tries = c.walk_to_plant("PLATO")
        chk("visitor: walking next to a plant opens its card", tries > 0, f"tries={tries}")
        p0, w0, t = c.card_vals()
        chk("visitor: card shows info (Progress/Water)", p0 is not None and w0 is not None, t[:80])
        offending = [n for n in ["Water", "Edit", "Move", "Delete", "Compost plant"] if seen(c.btn(n, exact=False))]
        chk("visitor: no water/edit/move/delete controls", not offending, f"visible: {offending}")
        sliders = [s for s in pg.get_by_role("slider").all() if s.evaluate(JS_SEEN) and s.is_enabled()]
        chk("visitor: progress not editable", not sliders)
        if not c.mobile:
            pg.keyboard.press("e"); pg.wait_for_timeout(2500)
            p1, w1, t1 = c.card_vals()
            chk("visitor: key E does not water", p1 == p0 and "Watered just now" not in t1, f"{p0}->{p1}")
    finally:
        c.close()


# 3/4 -------------------------------------------------------------------------
def add_and_water(pw, chk, device):
    c = Ctx(pw, device, frozen_clock=True); pg = c.pg
    try:
        c.enter(); c.home()
        c.press(c.btn("+ Add")); pg.wait_for_timeout(500)
        c.press(c.btn("Add Project")); pg.wait_for_timeout(800)
        name = pg.get_by_placeholder(re.compile("One word"))
        name.fill("ROCKET"); c.press(c.btn("Save")); pg.wait_for_timeout(1500)
        chk("+ Add: project appears as plant with name label", c.label_bb("ROCKET") is not None)
        tries = c.walk_to_plant("ROCKET")
        chk("own garden: walking next to plant opens card with Progress and Water", tries > 0, f"tries={tries}")
        p0, w0, _ = c.card_vals()
        note = first_seen(pg.get_by_placeholder(re.compile("Optional")))
        chk("note field is optional and empty", seen(note) and note.input_value() == "")
        c.press(c.btn("Water", exact=False))  # one tap, nothing typed
        pg.wait_for_timeout(3500)
        p1, w1, t1 = c.card_vals()
        chk("watering grows plant a few percent", p0 is not None and p1 is not None and 1 <= p1 - p0 <= 10,
            f"progress {p0}->{p1}")
        log = t1.split("LOG ENTR")[-1] if "LOG ENTR" in t1 else ""
        chk("log shows entry 'Watered' (no note)", re.search(r"\bWatered\b", log) is not None, log[:60].replace("\n", " "))
        # let the plant get thirsty (only the browser clock moves), then water again
        c.skip_days(4)
        _, w2, _ = c.card_vals()
        if w2 is None or w2 >= 100:  # card may need re-opening to refresh
            c.point(c.pg.viewport_size["width"] // 2, int(c.pg.viewport_size["height"] * .75)); pg.wait_for_timeout(2500)
            c.walk_to_plant("ROCKET"); _, w2, _ = c.card_vals()
        p2 = c.card_vals()[0]
        if c.mobile:
            c.press(c.btn("Water", exact=False))
        else:
            pg.keyboard.press("e")
        pg.wait_for_timeout(3500)
        p3, w3, t3 = c.card_vals()
        chk("water bar drops over days, then one " + ("tap" if c.mobile else "E key") + " fills it to full",
            w2 is not None and w2 < 100 and w3 == 100, f"water after 4 days {w2} -> {w3}")
        chk(("tap" if c.mobile else "E key") + " waters again (progress up, 2 log entries)",
            p3 is not None and p2 is not None and p3 > p2 and "2 LOG ENTRIES" in t3, f"{p2}->{p3}")
        note = first_seen(pg.get_by_placeholder(re.compile("Optional")))
        note.fill("sent the pitch deck"); note.press("Enter"); pg.wait_for_timeout(3500)
        _, _, t4 = c.card_vals()
        chk("typed note (Enter) is saved as log entry text", "sent the pitch deck" in t4.split("LOG ENTR")[-1])
    finally:
        c.close()


# 5 ---------------------------------------------------------------------------
def edit_and_delete(pw, chk, device):
    c = Ctx(pw, device); pg = c.pg
    dialogs = []
    pg.on("dialog", lambda d: (dialogs.append(d.message), d.dismiss()))
    try:
        c.enter(); c.home()
        c.press(c.btn("+ Add")); pg.wait_for_timeout(500)
        c.press(c.btn("Add Project")); pg.wait_for_timeout(800)
        pg.get_by_placeholder(re.compile("One word")).fill("KITE"); c.press(c.btn("Save")); pg.wait_for_timeout(1500)
        c.walk_to_plant("KITE")
        c.press(c.btn("Edit")); pg.wait_for_timeout(700)
        pg.get_by_placeholder(re.compile("One word")).fill("BAKERY"); c.press(c.btn("Save")); pg.wait_for_timeout(1500)
        chk("Edit renames the project", c.label_bb("BAKERY") is not None and not pg.evaluate(JS_LABELS, "KITE"))
        c.walk_to_plant("BAKERY")
        c.press(pg.get_by_role("button", name="Delete")); pg.wait_for_timeout(1000)
        still = c.label_bb("BAKERY") is not None
        asked = bool(dialogs) or seen(c.btn("Keep")) or bool(re.search(r"for good\?|sure|really", c.text(), re.I))
        chk("delete asks for confirmation first (plant still there)", still and asked)
        if seen(c.btn("Delete")):
            c.press(c.btn("Delete")); pg.wait_for_timeout(1500)
        chk("confirmed delete removes the plant", not pg.evaluate(JS_LABELS, "BAKERY"))
    finally:
        c.close()


# 6/7 -------------------------------------------------------------------------
def map_and_island(pw, chk, device):
    c = Ctx(pw, device); pg = c.pg
    try:
        c.enter(); c.home()
        chk("online chip says 'Only you' when alone", seen(pg.get_by_text("Only you", exact=True)))
        chk("tapping the chip opens the Map", c.open_map_via_chip())
        isl = c.btn("Gemeinschafts-Insel", exact=False)
        chk("map shows community island 'Gemeinschafts-Insel'", seen(isl))
        bb = first_seen(isl).bounding_box()
        others = [b for b in pg.get_by_role("button").all() if b.evaluate(JS_SEEN) and b.bounding_box()
                  and b.bounding_box()["width"] * b.bounding_box()["height"] < bb["width"] * bb["height"]
                  and b.bounding_box()["width"] > 40]
        chk("map shows smaller garden islands", len(others) >= 1, f"{[o.inner_text()[:10] for o in others]}")
        chk("own garden island labelled 'Du' on map", seen(pg.get_by_role("button", name=re.compile(r"^Du\b"))) or
            seen(pg.get_by_text("Du", exact=True)))
        c.press(isl); pg.wait_for_timeout(2000)
        chk("tapping community island goes there", seen(pg.get_by_text("Noch keine Beiträge")),
            "counter text missing")
    finally:
        c.close()


# 8 ---------------------------------------------------------------------------
def _goto_island(c):
    c.open_map_via_chip()
    c.press(c.btn("Gemeinschafts-Insel", exact=False))
    wait_seen(c.pg, c.pg.get_by_text("Gemeinschafts-Insel", exact=True), 5000)
    c.pg.wait_for_timeout(1200)


def _island_spots(c):
    vw = c.pg.viewport_size
    if c.mobile:
        return [(110, 370), (250, 360), (180, 430), (300, 420), (140, 300)]
    return [(520, 330), (700, 330), (600, 440), (760, 420), (500, 420)]


def island_contribute(pw, chk, device):
    c = Ctx(pw, device); pg = c.pg
    try:
        c.enter(); _goto_island(c)
        chk("island counter starts 'Noch keine Beiträge'", seen(pg.get_by_text("Noch keine Beiträge")))
        spots = _island_spots(c)
        prompt = c.btn("Etwas hinlegen", exact=False)
        expected = ["1 Beitrag", "2 Beiträge", "3 Beiträge"]
        placed = []
        for i in range(3):
            x, y = spots[i]
            c.point(x, y)
            got = wait_seen(pg, prompt, 7000)
            if i == 0: chk("standing on grass shows 'Etwas hinlegen' prompt", got)
            pg.wait_for_timeout(600)
            if got: c.press(prompt)
            pg.wait_for_timeout(800)
            opened = seen(c.btn(ITEMS[0]))
            if i == 0:
                chk(("tap" if c.mobile else "click") + " on 'Etwas hinlegen' opens picker", opened)
            if not opened and not c.mobile:  # fallback (key E) so the rest of the journey is still tested
                pg.keyboard.press("e"); pg.wait_for_timeout(800); opened = seen(c.btn(ITEMS[0]))
                if i == 0: chk("key E on grass opens picker", opened)
            if i == 0:
                chk("picker offers Blume, Tulpe, Steine, Laterne, Muschel, Pilz",
                    opened and all(seen(c.btn(n)) for n in ITEMS))
            if not opened:
                chk(f"place item #{i+1}", False, "picker did not open"); return
            c.press(c.btn(["Blume", "Laterne", "Pilz"][i])); pg.wait_for_timeout(1200)
            placed.append((x, y))
            chk(f"counter shows '{expected[i]}'", seen(pg.get_by_text(expected[i], exact=True)), c.text()[-80:])
        # 4th item the same day
        x, y = spots[3]; c.point(x, y); pg.wait_for_timeout(3000)
        if seen(prompt): c.press(prompt); pg.wait_for_timeout(800)
        if not c.mobile and not seen(c.btn(ITEMS[0])): pg.keyboard.press("e"); pg.wait_for_timeout(800)
        if seen(c.btn(ITEMS[1])): c.press(c.btn(ITEMS[1])); pg.wait_for_timeout(1200)
        chk("max 3 items per day (4th not placed)", seen(pg.get_by_text("3 Beiträge", exact=True))
            and not seen(pg.get_by_text("4 Beiträge")))
        # tap an item -> who left it
        c.point(*spots[4]); pg.wait_for_timeout(2500)
        found = None
        x0, y0 = placed[0]
        for dx, dy in [(0, 0), (-16, -10), (16, -10), (-16, 0), (16, 0), (0, -16), (-24, -14), (24, -14), (0, 10)]:
            c.point(x0 + dx, y0 + dy)
            m = wait_text(pg, r"Blume von ([^\n]+)", 900)
            if m: found = m.group(0); break
        chk("tapping an item shows who left it", bool(found) and re.search(r"dir|Tessa", found) is not None, str(found))
        if True:
            c.point(*((195, 560) if c.mobile else (640, 600)))  # walk down the jetty
            ok = wait_seen(pg, pg.get_by_text("Garden", exact=True), 8000)
            chk("walking down the jetty returns to the garden", ok and not seen(pg.get_by_text("3 Beiträge")))
    finally:
        c.close()


# 9/10 ------------------------------------------------------------------------
def menu_and_cottage(pw, chk, device):
    c = Ctx(pw, device); pg = c.pg
    try:
        c.enter()
        c.menu()
        names = ["Garden", "Cottage", "Island", "Map"]
        chk("menu lists Garden, Cottage, Island, Map", all(seen(c.btn(n)) for n in names),
            str([n for n in names if not seen(c.btn(n))]))
        c.press(c.btn("Island")); pg.wait_for_timeout(2000)
        chk("menu: Island goes to community island", seen(pg.get_by_text("Gemeinschafts-Insel", exact=True)))
        c.menu(); c.press(c.btn("Map")); pg.wait_for_timeout(1000)
        chk("menu: Map opens the map", seen(pg.get_by_role("heading", name="Map")))
        pg.keyboard.press("Escape"); pg.wait_for_timeout(300)
        if seen(c.btn("×")): c.press(c.btn("×")); pg.wait_for_timeout(500)
        c.menu(); c.press(c.btn("Garden")); pg.wait_for_timeout(2000)
        chk("menu: Garden goes back to a garden", seen(pg.get_by_text("Garden", exact=True)))
        c.menu(); c.press(c.btn("Cottage")); pg.wait_for_timeout(2000)
        chk("menu: Cottage enters the cottage", seen(c.btn("Go outside", exact=False)))
        c.point(*((105, 520) if c.mobile else (505, 520)))  # walk to the arcade cabinet
        prompt = c.btn("Play a game", exact=False)
        got = wait_seen(pg, prompt, 7000)
        chk("cottage: 'Play a game' offered at the arcade", got)
        pg.wait_for_timeout(600)
        if got: c.press(prompt)
        pg.wait_for_timeout(1000)
        opened = seen(pg.get_by_text("Mini Games"))
        chk(("tap" if c.mobile else "click") + " 'Play a game' opens 'Mini Games'", opened)
        if not opened and not c.mobile:
            pg.keyboard.press("e"); pg.wait_for_timeout(1000); opened = seen(pg.get_by_text("Mini Games"))
        chk("Mini Games offers Quiz Show and Vier gewinnt",
            opened and seen(c.btn("Quiz Show", exact=False)) and seen(c.btn("Vier gewinnt", exact=False)))
        if opened:
            connect_four(c, chk)
    finally:
        c.close()


# --- Connect Four -------------------------------------------------------------
def _board(c):
    cols = c.pg.get_by_role("button", name=re.compile(r"^Spalte \d$"))
    raw = cols.evaluate_all("""cs=>cs.map(c=>[...c.children].map(x=>{const s=getComputedStyle(x);const m=(s.backgroundColor.match(/\\d+/g)||[0,0,0]).map(Number);return m}))""")
    def cls(rgb):
        r, g, b = rgb[:3]
        if r > 170 and g < 150: return 1      # player disc (reddish)
        if r > 170 and g >= 150: return 2     # computer disc (yellowish)
        return 0
    return [[cls(x) for x in col] for col in raw]   # board[col][row], row 0 = top


def _four(board, who):
    C = len(board); R = len(board[0]) if C else 0
    for cx in range(C):
        for r in range(R):
            for dc, dr in [(1, 0), (0, 1), (1, 1), (1, -1)]:
                if all(0 <= cx + k * dc < C and 0 <= r + k * dr < R and board[cx + k * dc][r + k * dr] == who
                       for k in range(4)):
                    return True
    return False


def _drop(board, col, who):
    b = [list(x) for x in board]
    for r in range(len(b[col]) - 1, -1, -1):
        if b[col][r] == 0:
            b[col][r] = who; return b
    return None


def _score(board):
    s = 0
    C, R = len(board), len(board[0])
    for cx in range(C):
        for r in range(R):
            for dc, dr in [(1, 0), (0, 1), (1, 1), (1, -1)]:
                cells = [(cx + k * dc, r + k * dr) for k in range(4)]
                if not all(0 <= a < C and 0 <= b < R for a, b in cells): continue
                v = [board[a][b] for a, b in cells]
                if 2 not in v: s += [0, 1, 4, 30, 1000][v.count(1)]
                if 1 not in v: s -= [0, 1, 5, 40, 1000][v.count(2)]
    return s + sum(3 for r in range(R) if board[3][r] == 1)


def _minimax(board, depth, me):
    if _four(board, 1): return 10 ** 6 + depth, None
    if _four(board, 2): return -10 ** 6 - depth, None
    moves = [m for m in [3, 2, 4, 1, 5, 0, 6] if board[m][0] == 0]
    if depth == 0 or not moves: return _score(board), None
    best = None
    for m in moves:
        v, _ = _minimax(_drop(board, m, 1 if me else 2), depth - 1, not me)
        if best is None or (me and v > best[0]) or (not me and v < best[0]): best = (v, m)
    return best


def connect_four(c, chk):
    pg = c.pg
    c.press(c.btn("Vier gewinnt", exact=False)); pg.wait_for_timeout(1000)
    if seen(c.btn("Gegen den Computer", exact=False)):
        c.press(c.btn("Gegen den Computer", exact=False)); pg.wait_for_timeout(1000)
    cols = pg.get_by_role("button", name=re.compile(r"^Spalte \d$"))
    vp = pg.viewport_size
    cells = cols.evaluate_all("""cs=>cs.flatMap(c=>[...c.children].map(x=>{const r=x.getBoundingClientRect();
        const t=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
        return {l:r.left,t:r.top,r:r.right,b:r.bottom,ok:!!t&&(t===x||x.contains(t)||c===t)}}))""")
    rows = len(cells) // max(1, cols.count())
    fits = cells and all(x["l"] >= 0 and x["t"] >= 0 and x["r"] <= vp["width"] and x["b"] <= vp["height"] and x["ok"]
                         for x in cells)
    chk(f"Vier gewinnt: 7 columns x 6 rows all visible in {vp['width']}x{vp['height']}",
        cols.count() == 7 and rows == 6 and fits, f"cols={cols.count()} rows={rows} fits={fits}")
    if cols.count() != 7: return
    c.press(cols.nth(3)); pg.wait_for_timeout(400)
    b = _board(c)
    chk("disc drops to lowest free slot", b[3][5] == 1 and sum(map(sum, b)) == 1, str(b[3]))
    answered = False
    for _ in range(30):
        pg.wait_for_timeout(200)
        b = _board(c)
        if any(2 in col for col in b): answered = True; break
    chk("computer answers with its own disc", answered)
    # play on until the game is over
    for _ in range(25):
        if _four(b, 1) or _four(b, 2) or all(col[0] for col in b): break
        if not wait_text(pg, r"Du bist dran", 5000): break
        b = _board(c)
        _, m = _minimax(b, 4, True)
        if m is None: break
        c.press(cols.nth(m))
        for _ in range(25):
            pg.wait_for_timeout(200)
            nb = _board(c)
            if sum(map(lambda col: col.count(2), nb)) > sum(map(lambda col: col.count(2), b)) or _four(nb, 1): break
        b = _board(c)
    pg.wait_for_timeout(1200)
    b = _board(c)
    t = c.text()
    status = t[t.find("Computer"):][:120].replace("\n", " ") if "Computer" in t else ""
    if _four(b, 1):
        chk("4 in a row wins (player)", not re.search(r"Du bist dran|Computer ist dran", t) and
            re.search(r"gewonnen|gewinnst|Sieg|win", t, re.I) is not None, status)
    elif _four(b, 2):
        chk("4 in a row wins (computer)", not re.search(r"Du bist dran", t) and
            re.search(r"gewinnt|gewonnen|verloren|win", t, re.I) is not None, status)
    elif all(col[0] for col in b):
        # a full board without four in a row is a fair draw, not a bug
        chk("full board ends as a draw", re.search(r"Unentschieden", t) is not None and not re.search(r"Du bist dran", t), status)
    else:
        chk("game reaches an end with 4 in a row", False, f"no four found; {status}")


def connect_four_journey(pw, chk, device):
    menu_and_cottage(pw, chk, device)


# 11 --------------------------------------------------------------------------
def weather(pw, chk, device):
    clip = dict(x=40, y=450, width=320, height=250)
    rates = {}
    for code, temp in [(2, 4.6), (61, 4.2), (71, -2.4)]:
        c = Ctx(pw, device, code=code, temp=temp); pg = c.pg
        try:
            c.enter(); pg.wait_for_timeout(1500)
            if code == 2:
                chk("weather line 'München 5°C' (4.6 rounded)", seen(pg.get_by_text("München 5°C")),
                    re.findall(r"[^\n]*°C", c.text()))
            if code == 71:
                chk("weather line 'München -2°C' (-2.4 rounded)",
                    re.search(r"München\s*[-−]2\s*°C", c.text()) is not None, re.findall(r"[^\n]*°C", c.text()))
            rates[code] = moving_pixels(pg, clip)
        finally:
            c.close()
    chk("rain code 61 shows falling rain (moving pixels vs clear)", rates[61] > max(0.003, 5 * rates[2]), str(rates))
    chk("snow code 71 shows falling snow (moving pixels vs clear)", rates[71] > max(0.003, 5 * rates[2]), str(rates))


# 12/13 -----------------------------------------------------------------------
def chat_and_panels(pw, chk, device):
    c = Ctx(pw, device); pg = c.pg
    try:
        c.enter()
        box = pg.get_by_placeholder("Say something…")
        box.fill("hallo vom blindtest")
        c.press(pg.get_by_role("button", name="Send"))
        chk("chat: sent message is shown", wait_seen(pg, pg.get_by_text("hallo vom blindtest"), 4000))
        c.press(c.btn("?")); pg.wait_for_timeout(800)
        chk("? opens help panel", seen(pg.get_by_role("heading", name=re.compile("How it works|Help", re.I))))
        for n in ["Got it", "Close", "×"]:
            if seen(c.btn(n)): c.press(c.btn(n)); pg.wait_for_timeout(500); break
        chk("no Avatar button at the top (the outfit lives in the cottage wardrobe)", not seen(c.btn("Avatar")))
        c.home()  # new people start as visitors; the wardrobe is in their own cottage
        c.menu(); c.press(c.btn("Cottage")); pg.wait_for_timeout(2000)
        # tap the wardrobe on the right wall of the cottage, like a person would
        box = pg.locator("canvas#c").bounding_box(); W = pg.evaluate("()=>document.getElementById('c').width")
        sc = box["width"] / W; rw, rh = 196, 172; H = pg.evaluate("()=>document.getElementById('c').height")
        rx = (W - rw) // 2; ry = max(52, (H - rh) // 2 + 6)
        pg.mouse.click(box["x"] + (rx + 174) * sc, box["y"] + (ry + 40) * sc); pg.wait_for_timeout(3500)
        chk("the wardrobe opens the outfit editor", seen(pg.get_by_role("heading", name=re.compile("wardrobe", re.I))) and
            seen(c.btn("Randomize")))
        c.press(first_seen(pg.get_by_role("button", name=re.compile("Done|Into the garden|Save"))))
        pg.wait_for_timeout(800)
        c.menu(); c.press(c.btn("Garden")); pg.wait_for_timeout(1500)
        c.press(c.btn("Friends")); pg.wait_for_timeout(800)
        chk("Friends opens a list of gardens", seen(pg.get_by_role("heading", name="Friends")) and
            seen(pg.get_by_text("Sisi", exact=True)))
    finally:
        c.close()


JOURNEYS = [
    ("D first visit", first_visit, DESKTOP),
    ("P first visit", first_visit, PHONE),
    ("D visitor read-only", visitor_read_only, DESKTOP),
    ("P visitor read-only", visitor_read_only, PHONE),
    ("D add+water", add_and_water, DESKTOP),
    ("P add+water", add_and_water, PHONE),
    ("D edit+delete", edit_and_delete, DESKTOP),
    ("D map+island", map_and_island, DESKTOP),
    ("P map+island", map_and_island, PHONE),
    ("D island", island_contribute, DESKTOP),
    ("P island", island_contribute, PHONE),
    ("D menu+cottage+c4", menu_and_cottage, DESKTOP),
    ("P menu+cottage+c4", menu_and_cottage, PHONE),
    ("D weather", weather, DESKTOP),
    ("D chat+panels", chat_and_panels, DESKTOP),
    ("P chat+panels", chat_and_panels, PHONE),
]
