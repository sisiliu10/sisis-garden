#!/usr/bin/env python3
"""Black-box E2E tests for Sisi's Garden. Usage: python3 run.py [journey-substring]"""
import os, sys, time, traceback
from concurrent.futures import ProcessPoolExecutor
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


def run_one(idx):
    from playwright.sync_api import sync_playwright
    import journeys
    title, fn, dev = journeys.JOURNEYS[idx]
    results = []
    def chk(name, ok, detail=""):
        results.append((f"[{title}] {name}", bool(ok), "" if ok else str(detail)))
    t = time.time()
    try:
        with sync_playwright() as pw:
            fn(pw, chk, dev)
    except Exception as e:
        results.append((f"[{title}] journey finished without error", False,
                        f"{type(e).__name__}: {str(e).splitlines()[0][:200]}"))
    return title, results, time.time() - t


def main():
    import journeys
    sel = [i for i, j in enumerate(journeys.JOURNEYS) if len(sys.argv) < 2 or sys.argv[1].lower() in j[0].lower()]
    t0 = time.time(); fails = 0
    with ProcessPoolExecutor(max_workers=int(os.environ.get("WORKERS", "4"))) as ex:
        for title, results, dt in ex.map(run_one, sel):
            for name, ok, detail in results:
                print(("PASS " if ok else "FAIL ") + name + (f"  -- {detail}" if detail else ""))
                fails += 0 if ok else 1
            sys.stdout.flush()
    print(f"# {len(sel)} journeys in {time.time()-t0:.0f}s")
    print("ALL PASS" if fails == 0 else f"FAILS: {fails}")
    return 0 if fails == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
