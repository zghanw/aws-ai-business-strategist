// Data integrity check for the question bank. Run: node check.js
global.window = {};
const fs = require('fs');
fs.readdirSync(__dirname + '/data').filter(f => f.endsWith('.js')).sort().forEach(f => require('./data/' + f));
const Q = window.QUESTIONS, ids = new Set(), errs = [];
const WORD = { 2: 'TWO', 3: 'THREE' };
const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
let single = 0, longest = 0, ratios = [];
for (const q of Q) {
  const e = m => errs.push(`${q.id}: ${m}`);
  if (ids.has(q.id)) e('duplicate id'); ids.add(q.id);
  if (![1, 2, 3, 4].includes(q.d) || !q.id.startsWith('d' + q.d)) e('bad domain');
  if (!q.q || q.o.length < 4 || q.o.length > 6) e('missing text or bad option count');
  if (!q.a.length || new Set(q.a).size !== q.a.length || q.a.some(i => !(i in q.o))) e('bad answer index');
  if (new Set(q.o).size !== q.o.length) e('duplicate options');
  if (!Array.isArray(q.r) || q.r.length !== q.o.length || q.r.some(s => !s || !s.trim())) { e('needs one rationale per option in r'); continue; }
  const parts = q.q.split('\n\n');
  if (parts.length !== 2 || !parts[1].includes('?')) e('stem must be "scenario\\n\\nquestion?"');
  const tag = q.q.match(/\(Select (\w+)\.\)/);
  if (q.a.length > 1 ? tag?.[1] !== WORD[q.a.length] : tag) e('Select-N tag does not match answer count');
  if (q.r.some(s => /\b(option|answer|choice) [A-F]\b/i.test(s))) e('rationale refers to an option letter (options are shuffled)');
  if (/[–—]/.test(q.q + q.o.join('') + q.r.join(''))) e('contains an en or em dash; use commas, colons or parentheses');
  // Length tell: the right answer must not stand out by being longer.
  const L = q.o.map(s => s.length), right = mean(q.a.map(i => L[i])), wrong = mean(L.filter((_, i) => !q.a.includes(i)));
  ratios.push(right / wrong);
  // Short labels ("Scale" vs "Experiment") can't signal much, so only flag gaps a reader would notice.
  if (right / wrong > 1.4 && right - wrong > 12) e(`correct option is ${(right / wrong).toFixed(2)}x the length of the distractors (max 1.4x)`);
  if (q.a.length === 1) { single++; if (L.filter(x => x === Math.max(...L)).length === 1 && L[q.a[0]] === Math.max(...L)) longest++; }
}
const by = [1, 2, 3, 4].map(d => Q.filter(q => q.d === d).length);
const share = longest / single, ratio = mean(ratios);
console.log(`${Q.length} questions · by domain ${by.join(' / ')} · multi-select ${Q.filter(q => q.a.length > 1).length}`);
console.log(`correct option is the longest in ${Math.round(100 * share)}% of single-answer questions · average length ratio ${ratio.toFixed(2)}x`);
// ponytail: with 4 options the longest is right 25% of the time by chance. Too high or too low is a tell.
if (share > 0.32 || share < 0.15) errs.push(`bias: correct option is the longest in ${Math.round(100 * share)}% of single-answer questions (keep it between 15% and 32%)`);
if (ratio > 1.12) errs.push(`bias: correct options average ${ratio.toFixed(2)}x the length of distractors (max 1.12x)`);
if (errs.length) { console.error(errs.join('\n')); process.exit(1); }
console.log('OK');
