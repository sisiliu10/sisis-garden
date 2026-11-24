/* Sisi's Garden web app: login + Supabase bridge.
   Gives the game the same small interface it had inside Claude (db, user, room). */
(()=>{
  const CFG = window.GARDEN_CONFIG || {};
  const $ = id => document.getElementById(id);
  const gate = $('gate'), gMsg = $('gMsg'), gForm = $('gForm'), gEmail = $('gEmail'), gBtn = $('gBtn');
  let counted = false; const sbRef = () => window.__gardenSb;
  const showGate = (msg, form) => { gate.hidden = false; gMsg.textContent = msg || ''; gForm.hidden = !form; const gc = $('gCode'); if (gc) gc.hidden = true; if (form) showCount(); };
  // "Join 12 gardeners …" on the sign-up screen, with the real number of gardens
  async function showCount() {
    if (counted || !sbRef()) return; counted = true;
    try {
      const { data, error } = await sbRef().rpc('garden_count'); const n = Number(data);
      if (error || !Number.isFinite(n)) return;
      const el = $('gCount'); el.textContent = '';
      if (n < 20) { el.append('Be one of the ', Object.assign(document.createElement('b'), { textContent: 'first gardeners' }), ' and grow your projects.'); el.hidden = false; return; }
      el.append('Join ', Object.assign(document.createElement('b'), { textContent: n.toLocaleString('en-US') }),
        n === 1 ? ' gardener keeping their projects watered.' : ' gardeners keeping their projects watered.');
      el.hidden = false;
    } catch (e) {}
  }

  // an invite link (?g=<garden id>) must survive the login round trip through the email
  try { const gi = new URLSearchParams(location.search).get('g'); if (gi && /^[\w-]{6,64}$/.test(gi)) localStorage.setItem('garden-invite', gi); } catch (e) {}
  // installable on the phone's home screen
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});

  /* ---------- always the newest version, without hard reloads ---------- */
  const BUILD = '__BUILD__';
  const goNew = v => location.replace(location.pathname + '?v=' + encodeURIComponent(v) + location.hash);
  let updChip = null;
  async function checkVersion(auto) {
    try {
      const r = await fetch('version.txt?t=' + Date.now(), { cache: 'no-store' }); if (!r.ok) return;
      const v = (await r.text()).trim(); if (!v || v === BUILD) return;
      let done = null; try { done = sessionStorage.getItem('upd'); } catch (e) {}
      if (auto && done !== v) { try { sessionStorage.setItem('upd', v); } catch (e) {} goNew(v); return; }
      if (!updChip) { updChip = document.createElement('button'); updChip.type = 'button'; updChip.className = 'btn dark';
        updChip.style.cssText = 'position:fixed;left:50%;top:58px;transform:translateX(-50%);z-index:60;white-space:nowrap';
        updChip.textContent = 'New version, tap to update'; document.body.appendChild(updChip); }
      updChip.onclick = () => goNew(v);
    } catch (e) {}
  }
  if (!/access_token|error_description/.test(location.hash)) checkVersion(true);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) checkVersion(false); });
  setInterval(() => { if (!document.hidden) checkVersion(false); }, 180000);

  if (!window.supabase || !CFG.url || !CFG.key || /YOUR_/.test(CFG.url + CFG.key)) {
    showGate('Setup missing: add the Supabase URL and key in config.js.', false); return;
  }
  const sb = window.supabase.createClient(CFG.url, CFG.key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'implicit' },
    realtime: { params: { eventsPerSecond: 40 } },
  });
  window.__gardenSb = sb;
  window.__sb = sb;

  let uid = null, ownerId = '', isOwner = false, launched = false;

  /* ---------- db ---------- */
  const err = (e) => ({ code: 'invalid_argument', message: (e && e.message) || String(e) });
  async function getDoc(path) {
    const { data, error } = await sb.from('docs').select('data').eq('path', path).maybeSingle();
    if (error) throw err(error);
    return data ? { exists: true, data: () => data.data } : { exists: false, data: () => undefined };
  }
  async function setDoc(path, obj) {
    const { error } = await sb.from('docs').upsert({ path, owner: uid, data: obj, updated_at: new Date().toISOString() });
    if (error) throw err(error);
  }
  const doc = path => ({ get: () => getDoc(path), set: o => setDoc(path, o) });
  let chN = 0;
  const db = {
    doc,
    collection: name => ({
      doc: id => doc(name + '/' + id),
      limit: n => ({
        onSnapshot(cb, onErr) {
          let alive = true, t = null;
          const load = async () => {
            const { data, error } = await sb.from('docs').select('path,data').like('path', name + '/%').limit(500);
            if (!alive) return;
            if (error) { onErr && onErr(err(error)); return; }
            const docs = data.filter(r => r.path.split('/').length === 2).slice(0, n)
              .map(r => ({ id: r.path.split('/')[1], exists: true, data: () => r.data }));
            cb({ docs });
          };
          load();
          const ch = sb.channel('docs-' + name + '-' + (++chN))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'docs' }, () => { clearTimeout(t); t = setTimeout(load, 250); })
            .subscribe();
          const iv = setInterval(load, 60000);
          return () => { alive = false; clearInterval(iv); sb.removeChannel(ch); };
        },
      }),
    }),
  };

  /* ---------- live room (Supabase Realtime presence) ---------- */
  const peerKey = Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  let ch = null, connected = false, mine = {}, snap = [], connFns = [], lastTrack = 0, tTimer = null, retry = null, lastCast = 0, cTimer = null;
  const live = {}; // fast position updates (broadcast), newer than the slow presence state
  const sessT = Date.now();
  // One avatar per person: my own other tabs or an old session of mine are never shown,
  // and of somebody else's sessions only the newest counts (a reload leaves a stale one behind for a moment).
  function rebuild() {
    const st = ch ? ch.presenceState() : {}, best = {};
    for (const k in st) {
      const metas = st[k]; if (!metas || !metas.length || k === peerKey) continue;
      const m = metas[metas.length - 1], u = m.u || k;
      if (u === uid) continue;
      if (!best[u] || (m.s || 0) > (best[u].m.s || 0)) best[u] = { k, m };
    }
    // a friend whose movement already arrived but who is not in the presence list yet (it lags behind): show them now
    const now = Date.now();
    for (const k in live) { const lv = live[k]; if (st[k] || k === peerKey || !lv.u || lv.u === uid || now - lv.at > 10000) continue;
      if (!best[lv.u] || lv.at > (best[lv.u].m.s || 0)) best[lv.u] = { k, m: { u: lv.u, s: lv.at, at: 0, p: {} } }; }
    const out = [Object.freeze({ peer: peerKey, by: uid, isMe: true, sameTab: true, kind: 'viewer', guest: false, presence: Object.freeze(Object.assign({}, mine)), updatedAt: Date.now() })];
    for (const u in best) { const { k, m } = best[u];
      const lv = live[k], p = lv && lv.at > (m.at || 0) ? Object.assign({}, lv.p, { _t: lv.at, _h: lv.h }) : Object.assign({}, m.p || {}, m.at ? { _t: m.at } : {});
      out.push(Object.freeze({ peer: k, by: m.u || null, isMe: false, sameTab: false, kind: 'viewer', guest: false, presence: Object.freeze(p), updatedAt: Date.now() })); }
    for (const k in live) if (!st[k] && now - live[k].at > 10000) delete live[k];
    snap = Object.freeze(out);
  }
  function setConn(c) { if (c === connected) return; connected = c; connFns.forEach(f => { try { f(c); } catch (e) {} }); }
  function flush() {
    clearTimeout(tTimer); tTimer = null;
    if (!ch || !connected) return;
    lastTrack = performance.now();
    const c = ch;
    // if the server did not take it, the line is dead even if the browser still thinks it is open: reconnect
    ch.track({ u: uid, s: sessT, at: Date.now(), p: JSON.parse(JSON.stringify(mine)) }).then(r => { if (r !== 'ok' && ch === c) { clearTimeout(retry); retry = setTimeout(connect, 800); } }).catch(() => { if (ch === c) { clearTimeout(retry); retry = setTimeout(connect, 800); } });
  }
  // movement goes out ~15 times a second as a light broadcast; the presence state (who is here) only every 1.5 s
  function cast() {
    clearTimeout(cTimer); cTimer = null;
    if (!ch || !connected) return;
    lastCast = performance.now();
    try { ch.send({ type: 'broadcast', event: 'p', payload: { k: peerKey, u: uid, at: Date.now(), p: JSON.parse(JSON.stringify(mine)) } }); } catch (e) {}
  }
  function schedule() {
    rebuild();
    if (!cTimer) cTimer = setTimeout(cast, Math.max(0, 66 - (performance.now() - lastCast)));
    if (!tTimer) tTimer = setTimeout(flush, Math.max(0, 1500 - (performance.now() - lastTrack)));
  }
  function connect() {
    clearTimeout(retry);
    if (ch) { try { sb.removeChannel(ch); } catch (e) {} ch = null; }
    setConn(false);
    const c = sb.channel('garden-live', { config: { presence: { key: peerKey }, broadcast: { self: false, ack: false } } });
    ch = c;
    c.on('presence', { event: 'sync' }, () => { if (ch === c) rebuild(); })
     .on('presence', { event: 'join' }, (e) => { const key = e && e.key; if (ch === c && key && key !== peerKey) { cast(); rebuild(); } })
     .on('presence', { event: 'leave' }, (e) => { const key = e && e.key; if (ch === c && key && key !== peerKey) { const st = c.presenceState() || {}; if (!st[key]) { delete live[key]; rebuild(); } } })
     .on('broadcast', { event: 'p' }, ({ payload: q }) => {
        if (ch !== c || !q || !q.k || q.k === peerKey || q.u === uid || !q.p) return;
        if (live[q.k] && live[q.k].at >= q.at) return;
        // a new place starts a new path: never replay the walk from the cottage in the garden
        const h = (live[q.k] && live[q.k].p && live[q.k].p.s === q.p.s && live[q.k].h) || [];
        if (typeof q.p.x === 'number' && typeof q.p.y === 'number') { h.push([q.at, q.p.x, q.p.y]); if (h.length > 30) h.shift(); }
        const fresh = !live[q.k] && !(ch.presenceState() || {})[q.k];
        live[q.k] = { at: q.at || Date.now(), p: q.p, h, u: q.u || null }; rebuild();
        // someone new is here: tell them where I am right away instead of at my next move
        if (fresh) cast();
      })
     .subscribe(status => {
        if (ch !== c) return;
        if (status === 'SUBSCRIBED') { setConn(true); flush(); cast(); rebuild(); }
        else if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setConn(false); rebuild(); clearTimeout(retry); retry = setTimeout(connect, 2500);
        }
      });
  }
  // a tab in the background loses its live line without noticing (browsers slow its timers down);
  // coming back after a while always rejoins fresh, so friends see you again right away, no reload needed
  let hiddenAt = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { hiddenAt = Date.now(); return; }
    if (!connected || Date.now() - hiddenAt > 15000) connect(); else flush();
  });
  addEventListener('pageshow', e => { if (e.persisted) connect(); });
  // keep my presence fresh while I stand still, and repair a channel that dropped out
  setInterval(() => {
    if (document.hidden || !uid) return;
    const st = ch && ch.state;
    if (!ch || st === 'closed' || st === 'errored') { connect(); return; }
    if (connected && performance.now() - lastTrack > 10000) flush();
  }, 5000);
  // leaving the page: take my avatar out right away instead of waiting for the server to notice
  addEventListener('pagehide', () => { try { if (ch) { ch.untrack(); sb.removeChannel(ch); } } catch (e) {} });
  addEventListener('online', () => { if (!connected) connect(); });
  const room = {
    peers: () => snap,
    presence: async patch => { for (const k in patch) { if (patch[k] === null) delete mine[k]; else mine[k] = patch[k]; }
      // quiz moves (new question, an answer, the reveal) go out at once, also as presence, so a friend never waits for them
      if ('qs' in patch || 'qz' in patch) { rebuild(); cast(); flush(); return; }
      schedule(); },
    connected: () => connected,
    onConnection: (fn) => { connFns.push(fn); setTimeout(() => fn(connected), 0); return () => { connFns = connFns.filter(f => f !== fn); }; },
    onPeers: () => () => {},
    emit: async () => {},
    on: () => () => {},
  };

  /* ---------- chat history: everyone keeps their own messages, a garden's history is all of them merged ---------- */
  let myChat = null;
  window.__chatlog = {
    async add(m) {
      if (!uid) return;
      if (!myChat) { try { const d = await getDoc('gardens/' + uid + '/x/chat'); myChat = (d.exists && d.data() && Array.isArray(d.data().list)) ? d.data().list : []; } catch (e) { myChat = []; } }
      myChat.push({ g: String(m.g).slice(0, 20), t: Date.now(), n: String(m.n || '').slice(0, 14), text: String(m.text || '').slice(0, 80) });
      if (myChat.length > 300) myChat = myChat.slice(-300);
      try { await setDoc('gardens/' + uid + '/x/chat', { list: myChat }); } catch (e) {}
    },
    async load(g) {
      const { data, error } = await sb.from('docs').select('path,data').like('path', 'gardens/%/x/chat');
      if (error || !Array.isArray(data)) return [];
      const out = [];
      data.forEach(r => { const mineRow = r.path === 'gardens/' + uid + '/x/chat';
        ((r.data && r.data.list) || []).forEach(x => { if (x && x.g === g && typeof x.text === 'string') out.push({ t: +x.t || 0, n: String(x.n || 'Friend').slice(0, 14), text: x.text.slice(0, 80), me: mineRow }); }); });
      return out.sort((a, b) => a.t - b.t).slice(-120);
    },
  };

  /* ---------- community island: everyone keeps their own little things, the island shows all of them ---------- */
  window.__isle = {
    async load() {
      const { data, error } = await sb.from('docs').select('path,data').like('path', 'gardens/%/x/isle');
      if (error || !Array.isArray(data)) return null;
      return data.map(r => ({ me: r.path === 'gardens/' + uid + '/x/isle', list: (r.data && Array.isArray(r.data.list)) ? r.data.list.slice(-60) : [] }));
    },
    async save(list) {
      if (!uid) return false;
      try { await setDoc('gardens/' + uid + '/x/isle', { list: (list || []).slice(-60) }); return true; } catch (e) { return false; }
    },
  };

  /* ---------- AI quiz questions and topic ideas (limits are enforced on the server) ---------- */
  window.__quiz = {
    async make(o) {
      const once = async () => {
        try {
          const { data, error } = await sb.functions.invoke('agents', { body: { kind: 'quiz', topic: String(o.topic || '').slice(0, 80), level: o.level, n: o.n, avoid: (o.avoid || []).slice(-30) } });
          if (error) return { error: 'net' };
          return data || { error: 'net' };
        } catch (e) { return { error: 'net' }; }
      };
      // the free AI is sometimes busy for a moment: one quiet second try before giving up
      let r = await once();
      if (r && r.error && r.error !== 'off' && r.error !== 'limit') { await new Promise(f => setTimeout(f, 1200)); r = await once(); }
      return r;
    },
    async topics(o) {
      try {
        const { data, error } = await sb.functions.invoke('agents', { body: { kind: 'topics', avoid: ((o && o.avoid) || []).slice(-24) } });
        if (error) return { error: 'net' };
        return data || { error: 'net' };
      } catch (e) { return { error: 'net' }; }
    },
  };

  /* ---------- user ---------- */
  const user = { id: async () => uid, isOwner: async () => isOwner, can: async () => true };

  /* ---------- start ---------- */
  const DEVICE_KEYS = ['sisis-garden-v2', 'sisis-garden-v1', 'garden-me', 'garden-books', 'garden-homehint', 'garden-brezn'];
  async function launch(session) {
    if (launched) return; launched = true;
    uid = session.user.id;
    // what the browser remembers belongs to one account: a different login starts clean, never with the previous person's garden
    try { if (localStorage.getItem('garden-uid') !== uid) { DEVICE_KEYS.forEach(k => localStorage.removeItem(k)); localStorage.setItem('garden-uid', uid); } } catch (e) {}
    gate.hidden = true;
    // claim or read who owns this app (the database only lets Sisi's own login claim it)
    try { await setDoc('app/owner', { id: uid }); isOwner = true; ownerId = uid; }
    catch (e) { try { const o = await getDoc('app/owner'); if (o.exists && o.data() && o.data().id) ownerId = o.data().id; } catch (e2) {} }
    window.__OWNER_ID = ownerId || '__none__';
    window.claude = { use: async n => ({ db, user, room })[n] || null };
    rebuild(); connect();
    const s = document.createElement('script'); s.textContent = $('gameSrc').textContent; document.body.appendChild(s);
    addAccountUi();
    if (isOwner && location.hash === '#import') openImport();
  }

  function addAccountUi() {
    const help = document.querySelector('#help .panel'); if (!help) return;
    const foot = help.querySelector('.pfoot'), left = foot && foot.querySelector('span');
    const info = document.createElement('div'); info.className = 'acct';
    const who = document.createElement('div'); who.textContent = 'Signed in as ' + (sbUserEmail || 'you'); who.style.wordBreak = 'break-all';
    const ver = document.createElement('div'); ver.style.opacity = '.6'; ver.style.marginTop = '2px'; ver.textContent = 'Version __BUILD__';
    info.appendChild(who); info.appendChild(ver);
    const out = document.createElement('button'); out.type = 'button'; out.className = 'btn'; out.textContent = 'Sign out';
    out.onclick = async () => { await sb.auth.signOut(); try { DEVICE_KEYS.concat('garden-uid', 'garden-pending').forEach(k => localStorage.removeItem(k)); } catch (e) {}
      // give the browser a moment to write the cleared storage before the page goes away
      setTimeout(() => location.reload(), 250); };
    const box = left || help; if (left) { left.style.display = 'flex'; left.style.gap = '8px'; left.style.flexWrap = 'wrap'; }
    box.appendChild(out);
    if (isOwner) { const im = document.createElement('button'); im.type = 'button'; im.className = 'btn'; im.textContent = 'Import'; im.onclick = openImport; box.appendChild(im); }
    if (foot) help.insertBefore(info, foot); else help.appendChild(info);
  }

  function openImport() {
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json,application/json';
    inp.onchange = async () => {
      const f = inp.files && inp.files[0]; if (!f) return;
      try {
        const j = JSON.parse(await f.text());
        if (!j || !j.garden || !Array.isArray(j.garden.projects)) throw new Error('This is not a garden file.');
        const g = Object.assign({}, j.garden, { saved: Date.now(), created: true, owner: true });
        await setDoc('data/users/' + uid + '/garden', g);
        await setDoc('gardens/' + uid, g);
        if (j.books) { await setDoc('data/users/' + uid + '/books', j.books); await setDoc('gardens/' + uid + '/x/books', j.books); }
        try { localStorage.removeItem('sisis-garden-v2'); localStorage.removeItem('garden-books'); } catch (e) {}
        alert('Garden imported. The page reloads now.'); location.hash = ''; location.reload();
      } catch (e) { alert('Import failed: ' + (e.message || e)); }
    };
    inp.click();
  }

  // the same small click as in the game, for the login button
  function gateClick() { try { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; const c = gateClick.c || (gateClick.c = new AC()); if (c.state !== 'running' && c.resume) c.resume();
    const t0 = c.currentTime + .005, o = c.createOscillator(), g = c.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(520, t0); o.frequency.exponentialRampToValueAtTime(286, t0 + .045);
    g.gain.setValueAtTime(.0001, t0); g.gain.linearRampToValueAtTime(.16, t0 + .004); g.gain.exponentialRampToValueAtTime(.0001, t0 + .07); o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + .09); } catch (e) {} }
  document.addEventListener('pointerdown', e => { if (e.target && e.target.closest && e.target.closest('#gate button')) gateClick(); }, true);

  /* ---------- login ---------- */
  const KEEPER = 'b813b566-08f0-40c8-b392-6cc38a770940';
  const inviteCode = () => { try { const v = localStorage.getItem('garden-invite') || ''; return /^[\w-]{6,64}$/.test(v) ? v : ''; } catch (e) { return ''; } };
  let sbUserEmail = '';
  gForm.addEventListener('submit', async e => {
    e.preventDefault();
    const email = gEmail.value.trim(); if (!email) return;
    gBtn.disabled = true; gMsg.textContent = 'Sending…';
    // open to everyone: without a friend's invite link you come in as the garden keeper's guest and land in her garden
    const inv = inviteCode() || KEEPER;
    const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + location.pathname, shouldCreateUser: true, data: { invite: inv } } });
    gBtn.disabled = false;
    if (error && (/signups? not allowed|not allowed for otp|user not found|database error|invite/i.test(error.message || '') || error.code === 'otp_disabled' || error.code === 'signup_disabled' || error.code === 'unexpected_failure')) {
      console.warn('[garden] invite only', error);
      gMsg.textContent = 'That did not work. Please try again in a minute.';
      return; }
    if (error && /only request this (once|after)|seconds/i.test(error.message || '')) { setPending(email); askCode(email); gMsg.textContent = 'We just sent you a code. Type it here.'; return; }
    if (error) { console.warn('[garden] login link', error); gMsg.textContent = (/rate|limit|too many/i.test(error.message || '') || error.status === 429) ? 'The garden has sent all its login emails for this hour. Please try again a little later.' : 'Hmm, the login email did not go out. Check the address and try again.'; return; }
    setPending(email); askCode(email);
  });
  /* ---------- code login: type the code where you play, so this device stays signed in ---------- */
  const gCode = $('gCode'), gTok = $('gTok'), gTokBtn = $('gTokBtn'), gBack = $('gBack');
  const PEND = 'garden-pending';
  function setPending(email) { try { localStorage.setItem(PEND, JSON.stringify({ email, t: Date.now() })); } catch (e) {} }
  function getPending() { try { const p = JSON.parse(localStorage.getItem(PEND) || 'null'); return p && p.email && Date.now() - p.t < 3600000 ? p.email : ''; } catch (e) { return ''; } }
  function clearPending() { try { localStorage.removeItem(PEND); } catch (e) {} }
  let codeEmail = '';
  function askCode(email) {
    codeEmail = email; gate.hidden = false; gForm.hidden = true; gCode.hidden = false;
    gMsg.textContent = 'We sent a code to ' + email + '. Type it here.';
    gTok.value = ''; setTimeout(() => { try { gTok.focus(); } catch (e) {} }, 50);
  }
  gBack.addEventListener('click', e => { e.preventDefault(); clearPending(); gCode.hidden = true; showGate('Sign in with your email.', true); });
  gCode.addEventListener('submit', async e => {
    e.preventDefault();
    const token = gTok.value.replace(/\D/g, ''); if (token.length < 6) { gMsg.textContent = 'Type the full code from the email.'; return; }
    gTokBtn.disabled = true; gMsg.textContent = 'Checking…';
    let { data, error } = await sb.auth.verifyOtp({ email: codeEmail, token, type: 'email' });
    // a brand-new account gets the sign-up email, whose code is a signup code
    if (error) { const r2 = await sb.auth.verifyOtp({ email: codeEmail, token, type: 'signup' }); if (!r2.error) { data = r2.data; error = null; } }
    gTokBtn.disabled = false;
    if (error) { console.warn('[garden] code', error); gMsg.textContent = /rate|too many/i.test(error.message || '') || error.status === 429 ? 'Too many tries. Wait a minute and try again.' : 'That code did not work. Check it, or get a new one below.'; return; }
    clearPending();
    if (data && data.session) { sbUserEmail = data.session.user.email || ''; launch(data.session); }
  });
  sb.auth.onAuthStateChange((ev, session) => { if (session) { sbUserEmail = session.user.email || ''; launch(session); } });
  sb.auth.getSession().then(({ data }) => {
    const s = data && data.session;
    if (s) { clearPending(); sbUserEmail = s.user.email || ''; launch(s); }
    else if (!/access_token|error_description/.test(location.hash)) { const pe = getPending(); if (pe) askCode(pe); else showGate('Sign in with your email.', true); }
    else if (/error_description/.test(location.hash)) showGate('That login link has expired. Ask for a new one.', true);
  });
})();
