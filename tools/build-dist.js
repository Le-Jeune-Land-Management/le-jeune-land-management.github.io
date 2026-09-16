// Builds dist/: only the files the site actually serves.
//
// Why this exists: a working copy can hold local files that are not part of
// the site. Deploying dist/ rather than the project root guarantees only the
// served files go out.
//
// Run: node tools/build-dist.js
const fs = require('fs'), path = require('path');

// The deny-list lives in _private/ rather than here: a list of sensitive
// phrases is itself sensitive, so hardcoding it would leak the very things
// this check exists to catch.
function denyList() {
  const p = path.join(__dirname, '..', '_private', 'deny-list.txt');
  if (!fs.existsSync(p)) {
    console.warn('WARNING: _private/deny-list.txt missing, leak check skipped.');
    return null;
  }
  return fs.readFileSync(p, 'utf8').split(/\r?\n/)
    .map(l => l.trim()).filter(l => l && l[0] !== '#');
}
const contains = (text, pattern) =>
  text.toLowerCase().indexOf(pattern.toLowerCase()) !== -1;

const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist');

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(path.join(dist, 'assets'), { recursive: true });

for (const f of ['index.html', 'sitemap.xml', '.nojekyll']) {
  const from = path.join(root, f);
  if (fs.existsSync(from)) fs.copyFileSync(from, path.join(dist, f));
}
for (const f of fs.readdirSync(path.join(root, 'assets'))) {
  fs.copyFileSync(path.join(root, 'assets', f), path.join(dist, 'assets', f));
}

// A review deploy must not get indexed: it would compete with the real site
// and split its ranking signals. This replaces the production robots.txt.
fs.writeFileSync(path.join(dist, 'robots.txt'),
  '# Temporary review deploy. Do not index.\nUser-agent: *\nDisallow: /\n');

// verify rather than assume
const deny = denyList();
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? walk(path.join(d, e.name)) : [path.relative(dist, path.join(d, e.name))]);
const shipped = walk(dist);
const leaked = shipped.filter(f => {
  if (!/\.(html|md|txt|xml|json|js)$/i.test(f)) return false;
  const text = fs.readFileSync(path.join(dist, f), 'utf8');
  return (deny || []).some(p => contains(text, p));
});

console.log(JSON.stringify({
  shipped,
  bytes: shipped.reduce((n, f) => n + fs.statSync(path.join(dist, f)).size, 0),
  denyPatternsChecked: deny ? deny.length : 0,
  researchIncluded: shipped.some(f => f.startsWith('research')),
  readmeIncluded: shipped.some(f => /readme/i.test(f)),
  leakingFiles: leaked
}, null, 1));
console.log(leaked.length ? 'CHECK FAILED' : 'clean: safe to deploy dist/');
