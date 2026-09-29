// Data integrity check for the question bank. Run: node check.js
global.window = {};
const fs = require('fs');
fs.readdirSync(__dirname + '/data').filter(f => f.endsWith('.js')).sort().forEach(f => require('./data/' + f));
const Q = window.QUESTIONS, ids = new Set(), errs = [];
const WORD = { 2: 'TWO', 3: 'THREE' };
for (const q of Q) {
  const e = m => errs.push(`${q.id}: ${m}`);
  if (ids.has(q.id)) e('duplicate id'); ids.add(q.id);
  if (![1, 2, 3, 4].includes(q.d) || !q.id.startsWith('d' + q.d)) e('bad domain');
  if (!q.q || !q.x || q.o.length < 4 || q.o.length > 6) e('missing text or bad option count');
  if (!q.a.length || new Set(q.a).size !== q.a.length || q.a.some(i => !(i in q.o))) e('bad answer index');
  if (new Set(q.o).size !== q.o.length) e('duplicate options');
  const tag = q.q.match(/\(Select (\w+)\.\)/);
  if (q.a.length > 1 ? tag?.[1] !== WORD[q.a.length] : tag) e('Select-N tag does not match answer count');
  if (/\b(option|answer|choice) [A-F]\b/i.test(q.x)) e('explanation refers to an option letter (options are shuffled)');
  if (/[–—]/.test(q.q + q.x + q.o.join(''))) e('contains an en or em dash; use commas, colons or parentheses');
}
const by = [1, 2, 3, 4].map(d => Q.filter(q => q.d === d).length);
console.log(`${Q.length} questions · by domain ${by.join(' / ')} · multi-select ${Q.filter(q => q.a.length > 1).length}`);
if (errs.length) { console.error(errs.join('\n')); process.exit(1); }
console.log('OK');
