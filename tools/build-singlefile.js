// Builds one self-contained .html file that can be emailed and opened by
// double-clicking, with no server and no asset folder alongside it.
//
// The seal and favicon are inlined as data URIs. Fonts stay as a Google Fonts
// link: inlining the variable faces would add roughly 400 KB, and the page
// already declares real fallbacks (Georgia, system sans) if opened offline.
//
// Run: node tools/build-singlefile.js
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
fs.mkdirSync(dist, { recursive: true });

let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const dataUri = (file, mime) =>
  'data:' + mime + ';base64,' +
  fs.readFileSync(path.join(root, 'assets', file)).toString('base64');

const sealWebp = dataUri('seal.webp', 'image/webp');
const favicon = dataUri('favicon-64.png', 'image/png');

// Each <picture> would inline the payload twice (once in <source srcset>, once
// in the <img> fallback), so collapse them to the <img> first. WebP needs no
// fallback in any browser still in use.
html = html.replace(/<picture>\s*<source[^>]*>\s*(<img[^>]*>)\s*<\/picture>/g, '$1');

// The hero renders at 310px and needs the full seal. The header (34px) and
// footer (52px) do not: pointing them at the 64px favicon saves ~160 KB.
html = html.replace(/<img([^>]*?)src="assets\/seal-320\.png"([^>]*?)>/g, (m, a, b) => {
  const needsFullSize = /width="310"/.test(m);
  return '<img' + a + 'src="' + (needsFullSize ? sealWebp : favicon) + '"' + b + '>';
});
html = html.split('assets/favicon-64.png').join(favicon);
html = html.replace(/\n\s*<link rel="apple-touch-icon"[^>]*>/, '');

const outFile = path.join(dist, 'lejeune-land-management-preview.html');
fs.writeFileSync(outFile, html);

// verify: nothing may still point at a file on disk, and nothing private ships
const externalFileRefs = [...new Set(
  html.match(/(?:src|href|srcset)="(?!data:|https:|mailto:|tel:|#)[^"]*"/g) || [])];
const deny = denyList();
const leaks = (deny || []).filter(p => contains(html, p));

console.log(JSON.stringify({
  out: path.relative(root, outFile),
  kb: +(fs.statSync(outFile).size / 1024).toFixed(1),
  inlinedImages: (html.match(/data:image\//g) || []).length,
  denyPatternsChecked: deny ? deny.length : 0,
  externalFileRefs,
  leaks
}, null, 1));
console.log(externalFileRefs.length || leaks.length
  ? 'CHECK FAILED'
  : 'clean: single file, opens with no assets folder');
