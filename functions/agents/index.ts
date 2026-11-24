// Sisi's Garden: the office agents' daily AI round, and quiz questions on any topic.
// Hard limits so the bill stays tiny: 1 agent round and 15 quizzes per person per day, 150 calls a day for everyone,
// 3000 calls a month in total (worst case about 2 USD with Claude Haiku 5.5).
import { createClient } from 'npm:@supabase/supabase-js@2';

const KEY = Deno.env.get('ANTHROPIC_API_KEY');
// free alternative: a Google AI Studio key (Gemini free tier). Used when no Anthropic key is set.
const GKEY = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('gemini');
const GMODEL = Deno.env.get('GEMINI_MODEL') || 'gemini-flash-latest';
const URL = Deno.env.get('SUPABASE_URL')!;
const SRV = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const MODEL = 'claude-haiku-5-5';
const OWNER = 'b813b566-08f0-40c8-b392-6cc38a770940';
const PER_USER_PER_DAY = 1;
const QUIZ_PER_USER_PER_DAY = 15;
const TOPICS_PER_USER_PER_DAY = 30;
const ALL_PER_DAY = 150;
const ALL_PER_MONTH = 3000;

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const out = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'Content-Type': 'application/json' } });
const s = (v: unknown, n: number) => (typeof v === 'string' ? v : '').slice(0, n);
const num = (v: unknown) => (typeof v === 'number' && isFinite(v) ? Math.round(v) : 0);

const SYSTEM = `You are the team of small agents in a cozy pixel-art office game called Sisi's Garden.
Each project of the player has one agent at a desk. If a project's code is a philosopher's name, that agent talks a little like that philosopher (light, playful, never preachy).
You get the projects as JSON: name, what it is about, progress (0-100), water (0-100, low means neglected), hours since last watered, the owner's note, and recent log entries of what the owner did.
For every project return:
- "line": what this agent did or noticed while the owner was away. First person, playful, max 110 characters. Ground it in the data. Do not invent real-world facts.
- "next": one concrete next step for the owner, imperative, max 55 characters, doable in under 30 minutes, specific to that project.
Answer only with JSON like {"agents":[{"id":"...","line":"...","next":"..."}]}. Write in English.`;

const LEVELS: Record<string, string> = {
  leicht: 'leicht. Fragen, die die meisten Erwachsenen ohne Spezialwissen beantworten können.',
  mittel: 'mittel. Für Leute mit gutem Allgemeinwissen. Man soll kurz nachdenken müssen.',
  schwer: 'schwer. Für Leute, die sich mit dem Thema gut auskennen. Frag nach konkreten Details: Jahreszahlen, Namen, Zahlen, Orten und weniger bekannten Fakten. Wenn du dir bei einem Fakt nicht sicher bist, nimm einen anderen.',
};
const AREAS = ['Geschichte', 'Natur und Tiere', 'Popkultur', 'Essen und Trinken', 'Geografie', 'Wissenschaft', 'Sprache und Wörter', 'Kunst und Design', 'Sport', 'Technik und Internet', 'Musik', 'Filme und Serien', 'Bücher', 'Erfindungen', 'Weltraum', 'Mythen und Legenden', 'China', 'Japan', 'Deutschland', 'Mode', 'Architektur', 'Philosophie', 'Psychologie', 'Wirtschaft und Marken', 'Kurioses'];
const pickAreas = () => [...AREAS].sort(() => Math.random() - 0.5).slice(0, 4).join(', ');
const QUIZ = (topic: string, level: string, n: number, avoid: string[]) => `Du schreibst Fragen für eine Quiz-Show unter Freunden. Sprache: Deutsch.
Thema: ${topic ? '"' + topic + '"' + (topic.includes(',') ? ' (mehrere Themen: verteile die Fragen gleichmäßig darauf)' : '') : 'gemischtes Allgemeinwissen, diesmal vor allem aus: ' + pickAreas()}
Schwierigkeit: ${LEVELS[level] || LEVELS.mittel}
Regeln:
- Genau ${n} Fragen, jede mit genau 3 kurzen Antwortmöglichkeiten. Genau eine ist richtig.
- Die falschen Antworten sind plausibel und aus derselben Kategorie wie die richtige. Keine Scherzantworten.
- Die Frage verrät die Antwort nicht. Decke verschiedene Seiten des Themas ab.
- Nur gesicherte, eindeutige Fakten. Nichts, was sich laufend ändert.
- Fragen höchstens 140 Zeichen, Antworten höchstens 40 Zeichen.
- Wenn das Thema anstößig ist oder kein Quiz-Thema, nimm stattdessen gemischtes Allgemeinwissen.
${avoid.length ? '- Diese Fragen gab es schon, stelle andere: ' + avoid.join(' / ') + '\n' : ''}Antworte nur mit JSON: [{"q":"Frage","o":["A","B","C"],"a":0}]. "a" ist der Index der richtigen Antwort.`;

// ask the model; returns its text or null
async function ask(prompt: string, maxTokens: number, system?: string): Promise<string | null> {
  if (KEY) {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, temperature: 1, ...(system ? { system } : {}), messages: [{ role: 'user', content: prompt }] }),
    });
    if (!r.ok) { console.error('anthropic', r.status, (await r.text()).slice(0, 300)); return null; }
    const j: any = await r.json();
    return (j?.content || []).map((c: any) => c?.text || '').join('');
  }
  // Free Gemini models get overloaded (503) or hit their daily quota (429) often, and a model name can disappear (404).
  // So: try a few models in turn, with thinking off (thinking can use up the whole output budget and leave no answer).
  const models = [...new Set([GMODEL, 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-flash-lite-latest'])];
  for (const model of models) {
    for (const think of [false, true]) {
      const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent', {
        method: 'POST',
        headers: { 'x-goog-api-key': GKEY!, 'content-type': 'application/json' },
        body: JSON.stringify({
          ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          // newer Gemini models no longer accept temperature, so it is left out here
          generationConfig: {
            maxOutputTokens: Math.max(4096, maxTokens * 4), responseMimeType: 'application/json',
            ...(think ? {} : { thinkingConfig: { thinkingBudget: 0 } }),
          },
        }),
      });
      if (!r.ok) {
        const t = (await r.text()).slice(0, 300);
        console.error('gemini', model, think ? 'thinking' : 'no-thinking', r.status, t);
        if (r.status === 400 && !think) continue;   // this model may not accept thinkingBudget 0: try again without it
        break;                                      // 429, 503, 404 ...: next model
      }
      const j: any = await r.json();
      const text = (j?.candidates?.[0]?.content?.parts || []).filter((p: any) => !p?.thought).map((p: any) => p?.text || '').join('');
      if (text.trim()) return text;
      console.error('gemini', model, 'empty answer', j?.candidates?.[0]?.finishReason, JSON.stringify(j?.promptFeedback || {}).slice(0, 200));
      break;
    }
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return out({ error: 'method' }, 405);
  if (!KEY && !GKEY) return out({ error: 'off' });

  const admin = createClient(URL, SRV, { auth: { persistSession: false } });
  const jwt = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  const { data: au } = await admin.auth.getUser(jwt);
  const user = au?.user;
  if (!user) return out({ error: 'auth' }, 401);

  let body: any; try { body = await req.json(); } catch { return out({ error: 'bad' }, 400); }
  const isQuiz = body?.kind === 'quiz';
const isTopics = body?.kind === 'topics';
  const projects = (Array.isArray(body?.projects) ? body.projects : []).slice(0, 8).map((p: any) => ({
    id: s(p?.id, 24), code: s(p?.code, 14), name: s(p?.name, 40), about: s(p?.about, 200),
    progress: num(p?.progress), water: num(p?.water), lastWatered: num(p?.lastWatered),
    note: s(p?.note, 90), log: (Array.isArray(p?.log) ? p.log : []).slice(-5).map((e: unknown) => s(e, 100)),
  })).filter((p: any) => p.id);
  if (!isQuiz && !isTopics && !projects.length) return out({ agents: [] });
  // project notes are personal: they only go to Anthropic, never to the free Gemini tier
  if (!isQuiz && !isTopics && !KEY) return out({ error: 'off' });

  // limits, counted before the AI call so a burst of requests cannot slip past them
  const day = new Date().toISOString().slice(0, 10), month = day.slice(0, 7), path = 'app/ai-usage/' + month;
  const { data: row } = await admin.from('docs').select('data').eq('path', path).maybeSingle();
  const u: any = row?.data || { total: 0, days: {}, users: {} };
  const uk = (isQuiz ? 'q|' : isTopics ? 't|' : '') + user.id + '|' + day;
  if ((u.total || 0) >= ALL_PER_MONTH || ((u.days || {})[day] || 0) >= ALL_PER_DAY || ((u.users || {})[uk] || 0) >= (isQuiz ? QUIZ_PER_USER_PER_DAY : isTopics ? TOPICS_PER_USER_PER_DAY : PER_USER_PER_DAY)) return out({ error: 'limit' });
  const users: Record<string, number> = {};
  for (const k in (u.users || {})) if (k.endsWith('|' + day)) users[k] = u.users[k];
  users[uk] = (users[uk] || 0) + 1;
  const next = { total: (u.total || 0) + 1, days: { ...(u.days || {}), [day]: ((u.days || {})[day] || 0) + 1 }, users };
  const { error: we } = await admin.from('docs').upsert({ path, owner: OWNER, data: next, updated_at: new Date().toISOString() });
  if (we) return out({ error: 'count' });

  if (isTopics) {
const avoidT = (Array.isArray(body?.avoid) ? body.avoid : []).slice(-24).map((x: unknown) => s(x, 28)).filter(Boolean);
const prompt = `Schlag 6 Themen für eine Quiz-Show unter Freunden vor. Sprache: Deutsch.
- Konkret und überraschend statt allgemein (also eher "Erfindungen aus China" als "Geschichte"), quer durch verschiedene Bereiche, mindestens eins aus Popkultur und eins aus Natur oder Wissenschaft.
- Jedes Thema höchstens 3 Wörter, ohne Emojis.
${avoidT.length ? '- Nicht wiederholen: ' + avoidT.join(', ') + '\n' : ''}Antworte nur mit JSON: ["Thema 1","Thema 2","Thema 3","Thema 4","Thema 5","Thema 6"]`;
const tt = await ask(prompt, 200);
if (tt === null) return out({ error: 'ai' });
const mt = tt.match(/\[[\s\S]*\]/);
let ta: any; try { ta = JSON.parse(mt ? mt[0] : ''); } catch { return out({ error: 'parse' }); }
return out({ topics: (Array.isArray(ta) ? ta : []).filter((x: unknown) => typeof x === 'string').slice(0, 6).map((x: string) => x.slice(0, 28)) });
}

if (isQuiz) {
    const n = Math.min(10, Math.max(4, num(body?.n) || 8));
    const avoid = (Array.isArray(body?.avoid) ? body.avoid : []).slice(-30).map((x: unknown) => s(x, 140)).filter(Boolean);
    const level = ['leicht', 'mittel', 'schwer'].includes(body?.level) ? body.level : 'mittel';
    const tq = await ask(QUIZ(s(body?.topic, 80).trim(), level, n, avoid), 1600);
    if (tq === null) return out({ error: 'ai' });
    const mq = tq.match(/\[[\s\S]*\]/);
    let arr: any; try { arr = JSON.parse(mq ? mq[0] : ''); } catch {
      // a cut-off answer: keep every question that arrived complete
      arr = (tq.match(/\{[^{}]*\}/g) || []).map((x) => { try { return JSON.parse(x); } catch { return null; } }).filter(Boolean);
      if (!arr.length) { console.error('quiz parse', tq.slice(0, 300)); return out({ error: 'parse' }); }
    }
    const qs = (Array.isArray(arr) ? arr : []).filter((x: any) => x && typeof x.q === 'string' && Array.isArray(x.o) && x.o.length === 3 && Number.isInteger(x.a) && x.a >= 0 && x.a < 3)
      .slice(0, n).map((x: any) => ({ q: s(x.q, 200), o: x.o.map((v: unknown) => String(v).slice(0, 60)), a: x.a }));
    return out({ qs });
  }

  const txt = await ask(JSON.stringify({ projects }), 900, SYSTEM);
  if (txt === null) return out({ error: 'ai' });
  const m = txt.match(/\{[\s\S]*\}/);
  let parsed: any; try { parsed = JSON.parse(m ? m[0] : ''); } catch { return out({ error: 'parse' }); }
  const ids = new Set(projects.map((p: any) => p.id));
  const agents = (Array.isArray(parsed?.agents) ? parsed.agents : []).filter((a: any) => a && ids.has(a.id))
    .map((a: any) => ({ id: a.id, line: s(a.line, 140), next: s(a.next, 60) }));
  return out({ agents });
});
