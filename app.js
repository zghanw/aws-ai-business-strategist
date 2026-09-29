'use strict';
const DOMAINS = {
  1: { name: 'AI Fundamentals and Literacy', weight: 24 },
  2: { name: 'AI Strategy and Business Value Creation', weight: 28 },
  3: { name: 'AI Governance and Responsible AI Leadership', weight: 24 },
  4: { name: 'Business Readiness, Leadership, and AI Transformation', weight: 24 },
};
// Beta format (the standard exam's question count is not yet published).
const MOCK = { count: 85, minutes: 170 };
// Verified against the official AIB-C01 exam guide and certification page, 2026-09-28.
const FACTS = `
  <strong>Exam at a glance</strong>
  <ul>
    <li><b>Beta:</b> 85 questions, 170 minutes, USD 50. Delivery starts 29 Sep 2026. You can sit the beta only once.</li>
    <li><b>Standard:</b> 130 minutes, USD 100. The question count isn't published yet.</li>
    <li>Question types: multiple choice (1 correct) and multiple response (2+ correct; you must pick all of them to get credit).</li>
    <li>Scaled score 100 to 1,000; <b>700 to pass</b>. Scoring is compensatory, so you don't need to pass each domain. There's no penalty for guessing, so answer every question.</li>
    <li>AWS services appear only at a strategic level: Amazon Bedrock (pricing tiers, Guardrails, Knowledge Bases), Amazon SageMaker AI, Amazon Quick, AWS CAF, the shared responsibility model, Pricing Calculator, Cost Explorer, Marketplace, Savings Plans, and the Well-Architected Responsible AI Lens.</li>
  </ul>
  <a href="https://docs.aws.amazon.com/aws-certification/latest/ai-business-strategist-01/ai-business-strategist-01.html" target="_blank" rel="noopener">Official exam guide ↗</a>`;
const Q = window.QUESTIONS || [];
const app = document.getElementById('app');
const timerEl = document.getElementById('timer');

const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem('aib:' + k)) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('aib:' + k, JSON.stringify(v)); } catch {} },
};
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const same = (a, b) => a.length === b.length && a.every(x => b.includes(x));
const pct = (n, d) => (d ? Math.round((100 * n) / d) : 0);
const inDomain = d => Q.filter(q => q.d == d);

let S = null; // active session
let tick = null;

function home() {
  stopTimer();
  S = null;
  const missed = store.get('missed', []).filter(id => Q.some(q => q.id === id));
  const best = store.get('best', {});
  app.innerHTML = `
    <h1>AWS Certified AI Business Strategist</h1>
    <p class="muted">Exam-style scenario questions for AIB-C01, grouped by the four exam domains. Every answer comes with an explanation. Progress is saved in this browser.</p>
    <div class="grid">${Object.entries(DOMAINS).map(([d, m]) => `
      <button class="card" data-go="domain" data-d="${d}">
        <span class="tag">Domain ${d} · ${m.weight}%</span>
        <strong>${m.name}</strong>
        <span class="muted">${inDomain(d).length} questions${best[d] != null ? ` · best ${best[d]}%` : ''}</span>
      </button>`).join('')}
    </div>
    <div class="actions">
      <button class="btn primary" data-go="mock">Mock exam (beta format) · ${Math.min(MOCK.count, Q.length)} Q · ${MOCK.minutes} min</button>
      <button class="btn" data-go="all">Practice all (${Q.length}, shuffled)</button>
      <button class="btn" data-go="missed" ${missed.length ? '' : 'disabled'}>Review missed (${missed.length})</button>
    </div>
    <div class="facts">${FACTS}</div>
    <p class="muted" style="font-size:14px">Keys: <kbd>1</kbd> to <kbd>5</kbd> or <kbd>A</kbd> to <kbd>E</kbd> select · <kbd>Enter</kbd> check / next.</p>`;
}

// Largest-remainder split so the mock mirrors domain weights exactly.
function mockPool(n) {
  const ds = Object.keys(DOMAINS);
  const raw = ds.map(d => (n * DOMAINS[d].weight) / 100);
  const cnt = raw.map(Math.floor);
  ds.map((_, i) => i).sort((a, b) => (raw[b] % 1) - (raw[a] % 1)).slice(0, n - cnt.reduce((s, c) => s + c, 0)).forEach(i => cnt[i]++);
  return ds.flatMap((d, i) => shuffle(inDomain(d)).slice(0, cnt[i]));
}

function start(mode, d) {
  const missed = new Set(store.get('missed', []));
  const pool = mode === 'domain' ? inDomain(d)
    : mode === 'missed' ? Q.filter(q => missed.has(q.id))
    : mode === 'mock' ? mockPool(Math.min(MOCK.count, Q.length))
    : Q;
  S = { mode, d, view: 'quiz', i: 0,
    qs: shuffle(pool).map(q => ({ q, order: shuffle(q.o.map((_, i) => i)), pick: [], done: false, flag: false })) };
  if (mode === 'mock') startTimer(MOCK.minutes * 60);
  show();
}

function show() {
  const it = S.qs[S.i], q = it.q, mock = S.mode === 'mock';
  const reveal = !mock && it.done, ok = same(it.pick, q.a), last = S.i === S.qs.length - 1;
  const main = !mock && !it.done
    ? `<button class="btn primary" data-act="check" ${it.pick.length === q.a.length ? '' : 'disabled'}>Check</button>`
    : last ? `<button class="btn primary" data-act="finish">Finish</button>`
    : `<button class="btn primary" data-act="next">Next</button>`;
  app.innerHTML = `
    <div class="bar">
      <strong>${S.i + 1} / ${S.qs.length}</strong>
      <span class="tag">D${q.d} · ${DOMAINS[q.d].name}</span>
      <span class="muted qid">#${q.id}</span>
      ${mock ? `<button class="link" data-act="flag">${it.flag ? '★ Flagged' : '☆ Flag for review'}</button>` : ''}
    </div>
    <div class="progress"><i style="width:${pct(S.i + 1, S.qs.length)}%"></i></div>
    <h2>${esc(q.q)}</h2>
    <div class="opts">${it.order.map((oi, k) => {
      const picked = it.pick.includes(oi);
      const cls = [picked && 'picked', reveal && q.a.includes(oi) && 'right', reveal && picked && !q.a.includes(oi) && 'wrong'].filter(Boolean).join(' ');
      return `<button class="opt ${cls}" data-act="pick" data-o="${oi}" ${reveal ? 'disabled' : ''}><span class="key">${'ABCDE'[k]}</span><span>${esc(q.o[oi])}</span></button>`;
    }).join('')}</div>
    ${reveal ? `<div class="explain ${ok ? 'ok' : 'bad'}"><strong>${ok ? 'Correct' : 'Incorrect'}</strong>${esc(q.x)}</div>` : ''}
    <div class="nav">
      <button class="btn" data-act="prev" ${S.i ? '' : 'disabled'}>Back</button>
      ${main}
      <button class="btn" data-act="finish" style="margin-left:auto">${mock ? 'Submit exam' : 'End & see results'}</button>
    </div>
    ${mock ? `<div class="palette">${S.qs.map((x, i) => `<button data-act="jump" data-i="${i}" class="${[x.pick.length && 'ans', x.flag && 'flag', i === S.i && 'cur'].filter(Boolean).join(' ')}">${i + 1}</button>`).join('')}</div>` : ''}`;
}

function pick(oi) {
  const it = S.qs[S.i], need = it.q.a.length;
  if (it.done && S.mode !== 'mock') return;
  if (need === 1) it.pick = [oi];
  else if (it.pick.includes(oi)) it.pick = it.pick.filter(x => x !== oi);
  else if (it.pick.length < need) it.pick = [...it.pick, oi];
  show();
}

function track(it) {
  const m = new Set(store.get('missed', []));
  same(it.pick, it.q.a) ? m.delete(it.q.id) : m.add(it.q.id);
  store.set('missed', [...m]);
}

function check() {
  const it = S.qs[S.i];
  if (it.pick.length !== it.q.a.length) return;
  it.done = true;
  track(it);
  show();
}

function finish() {
  const mock = S.mode === 'mock';
  if (mock) {
    const blank = S.qs.filter(x => !x.pick.length).length;
    if (blank && !confirm(`${blank} unanswered question(s) will be marked wrong. Submit?`)) return;
    S.qs.forEach(track);
  }
  results();
}

function results() {
  stopTimer();
  S.view = 'results';
  const graded = S.mode === 'mock' ? S.qs : S.qs.filter(x => x.done);
  const ok = x => same(x.pick, x.q.a);
  const right = graded.filter(ok).length, score = pct(right, graded.length);
  if (S.mode === 'domain' && graded.length) {
    const best = store.get('best', {});
    best[S.d] = Math.max(best[S.d] ?? 0, score);
    store.set('best', best);
  }
  const rows = Object.entries(DOMAINS).map(([d, m]) => {
    const g = graded.filter(x => x.q.d == d);
    return g.length ? `<div class="row"><span>D${d} · ${m.name}</span><strong>${g.filter(ok).length}/${g.length}</strong><div class="meter"><i style="width:${pct(g.filter(ok).length, g.length)}%"></i></div></div>` : '';
  }).join('');
  const review = graded.map(x => `
    <details class="${ok(x) ? 'ok' : 'bad'}" ${ok(x) ? '' : 'open'}>
      <summary>${ok(x) ? '<span class="yes">✓</span>' : '<span class="no">✗</span>'} ${esc(x.q.q)}</summary>
      <ul>${x.order.map(oi => `<li class="${x.q.a.includes(oi) ? 'right' : x.pick.includes(oi) ? 'wrong' : ''}">${esc(x.q.o[oi])}</li>`).join('')}</ul>
      <p>${esc(x.q.x)}</p>
    </details>`).join('');
  app.innerHTML = `
    <h1>Results</h1>
    ${graded.length ? `
      <div class="score">${score}%</div>
      <p class="muted">${right} of ${graded.length} correct.${S.mode === 'mock' ? ' The real exam reports a scaled score (100 to 1,000, pass 700) that is not a simple percentage, so treat this raw % as a rough guide and aim for 80%+.' : ''}</p>
      <div class="rows">${rows}</div>
      <div class="actions"><button class="btn primary" data-go="home">Home</button><button class="btn" data-go="missed">Review missed</button></div>
      <h2>Review</h2>${review}` : '<p class="muted">No questions answered.</p><div class="actions"><button class="btn primary" data-go="home">Home</button></div>'}`;
  scrollTo(0, 0);
}

function startTimer(sec) {
  const end = Date.now() + sec * 1000;
  const draw = () => {
    const left = Math.max(0, Math.round((end - Date.now()) / 1000));
    timerEl.textContent = `${Math.floor(left / 3600)}:${String(Math.floor(left / 60) % 60).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`;
    timerEl.classList.toggle('low', left < 600);
    if (!left) { S.qs.forEach(track); results(); }
  };
  draw();
  tick = setInterval(draw, 1000);
}
function stopTimer() { clearInterval(tick); timerEl.textContent = ''; }

app.addEventListener('click', e => {
  const go = e.target.closest('[data-go]');
  if (go) return go.dataset.go === 'home' ? home() : start(go.dataset.go, go.dataset.d);
  const act = e.target.closest('[data-act]');
  if (!act || !S) return;
  const a = act.dataset.act;
  if (a === 'pick') pick(+act.dataset.o);
  else if (a === 'check') check();
  else if (a === 'next' || a === 'prev' || a === 'jump') { S.i = a === 'jump' ? +act.dataset.i : S.i + (a === 'next' ? 1 : -1); show(); scrollTo(0, 0); }
  else if (a === 'flag') { S.qs[S.i].flag = !S.qs[S.i].flag; show(); }
  else if (a === 'finish') finish();
});

document.getElementById('home-link').addEventListener('click', e => {
  e.preventDefault();
  if (S && S.view === 'quiz' && !confirm('Leave this session? Progress in it will be lost.')) return;
  home();
});

document.addEventListener('keydown', e => {
  if (!S || S.view !== 'quiz' || e.ctrlKey || e.metaKey || e.altKey) return;
  const it = S.qs[S.i];
  const k = e.key.toLowerCase(), idx = /^[1-5]$/.test(k) ? +k - 1 : /^[a-e]$/.test(k) ? k.charCodeAt(0) - 97 : -1;
  if (idx >= 0 && idx < it.order.length) pick(it.order[idx]);
  else if (e.key === 'Enter') {
    e.preventDefault();
    if (S.mode !== 'mock' && !it.done) check();
    else if (S.i < S.qs.length - 1) { S.i++; show(); scrollTo(0, 0); }
  }
});

home();
