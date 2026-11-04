// Fails if any colour code (#abc / #aabbcc / rgb() / rgba()) is written in src/ outside src/theme/tokens.ts.
// Keeps every button, chip, text and background on the same Amcolink design rules.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', 'src');
const allowed = path.join(root, 'theme', 'tokens.ts');
const bad = [];
(function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) { walk(p); continue; }
    if (!/\.(ts|tsx|js|jsx)$/.test(f) || p === allowed) continue;
    fs.readFileSync(p, 'utf8').split('\n').forEach((line, i) => {
      if (/#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(line) && !/^\s*\/\//.test(line)) bad.push(`${path.relative(root, p)}:${i + 1}: ${line.trim()}`);
    });
  }
})(root);
if (bad.length) { console.error('Colour codes outside src/theme/tokens.ts:\n' + bad.join('\n')); process.exit(1); }
console.log('design check ok: all colours come from src/theme/tokens.ts');
