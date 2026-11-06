#!/usr/bin/env node
/**
 * Lists app files in src/core/ whose website source (lib/...) changed since it was copied.
 *
 * Each copied file starts with a line naming the website file(s) and the commit it was copied from, e.g.
 *   // Copied from the website: lib/distance.ts (commit 13076bf7). Keep in step with the website.
 * This script asks the website's git history whether those lib files changed between that commit and the
 * website's main branch. It only reads; it changes nothing.
 *
 * Run by hand (the website repo is private, so this can't run on GitHub without extra setup):
 *   node scripts/compare-website.js ../african-market
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const site = path.resolve(process.argv[2] || '../african-market');
if (!fs.existsSync(path.join(site, '.git'))) {
  console.error(`Website repo not found at ${site}. Usage: node scripts/compare-website.js <path to website repo>`);
  process.exit(2);
}
const git = (...args) => execFileSync('git', ['-C', site, ...args], { encoding: 'utf8' }).trim();
try { git('fetch', '-q', 'origin', 'main'); } catch { console.warn('(could not fetch the website; comparing with the local copy of origin/main)'); }

const core = path.join(__dirname, '..', 'src', 'core');
let changed = 0;
let unknown = 0;
for (const file of fs.readdirSync(core).filter((f) => /\.tsx?$/.test(f)).sort()) {
  const first = fs.readFileSync(path.join(core, file), 'utf8').split('\n')[0];
  const sources = [...new Set(first.match(/lib\/[\w/.-]+\.tsx?/g) || [])];
  const commit = (first.match(/commit ([0-9a-f]{7,40})/) || [])[1];
  if (!sources.length || !commit) { unknown++; console.log(`?  ${file}: no "copied from lib/… (commit …)" line — check by hand`); continue; }
  for (const src of sources) {
    let diff = '';
    try { diff = git('diff', '--stat', `${commit}`, 'origin/main', '--', src); } catch (e) { diff = `error: ${e.message.split('\n')[0]}`; }
    if (diff) { changed++; console.log(`✗  ${file} ← ${src} changed on the website since ${commit}:\n   ${diff.split('\n').join('\n   ')}`); }
    else console.log(`✓  ${file} ← ${src}`);
  }
}
console.log(`\n${changed ? `${changed} website file(s) changed since they were copied: update the app copies.` : 'All copied files match the website.'}${unknown ? ` ${unknown} file(s) without a source line.` : ''}`);
process.exit(changed ? 1 : 0);
