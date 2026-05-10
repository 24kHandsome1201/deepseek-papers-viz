#!/usr/bin/env -S node --experimental-strip-types
/**
 * Build-time validator for src/data/papers.ts.
 *
 * Catches common content bugs before they ship:
 *   - duplicate paper ids
 *   - dangling buildsOn / lineage references
 *   - unparseable dates
 *   - team ids missing from teams.ts
 *   - demo registry entries that point to non-existent paper ids
 *   - papers tagged tier:flagship lacking metrics / contributions
 *
 * Usage: npm run validate:papers
 * Exits 1 on any error so CI / `next build` fails loudly.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// Import TS sources directly via Node's experimental TS strip.
const { PAPERS } = await import(resolve(root, "src/data/papers.ts"));
const { TEAMS } = await import(resolve(root, "src/data/teams.ts"));

// demoRegistry.ts depends on `next/dynamic` which only resolves inside the Next
// runtime, so parse it as text instead of importing it.
const demoSrc = readFileSync(
  resolve(root, "src/components/papers/demoRegistry.ts"),
  "utf8"
);
const demoIds = new Set<string>();
for (const m of demoSrc.matchAll(/"([a-z0-9-]+)":\s*dynamic/g)) {
  demoIds.add(m[1]);
}

type Issue = { level: "error" | "warn"; msg: string };
const issues: Issue[] = [];
const error = (msg: string) => issues.push({ level: "error", msg });
const warn = (msg: string) => issues.push({ level: "warn", msg });

const ids = new Set<string>();
for (const p of PAPERS) {
  if (ids.has(p.id)) error(`duplicate paper id: ${p.id}`);
  ids.add(p.id);
}

const ISO = /^\d{4}-\d{2}-\d{2}$/;
for (const p of PAPERS) {
  if (!ISO.test(p.date)) error(`[${p.id}] bad date format: ${p.date}`);
  else if (Number.isNaN(+new Date(p.date)))
    error(`[${p.id}] unparseable date: ${p.date}`);

  if (!TEAMS[p.team]) error(`[${p.id}] unknown team: ${p.team}`);

  for (const ref of p.buildsOn ?? []) {
    if (!ids.has(ref))
      error(`[${p.id}] buildsOn references unknown paper: ${ref}`);
  }

  for (const item of p.lineage ?? []) {
    if (!ids.has(item.id))
      error(`[${p.id}] lineage references unknown paper: ${item.id}`);
  }

  if (p.tier === "flagship") {
    if (!p.metrics || p.metrics.length === 0)
      warn(`[${p.id}] flagship without metrics`);
    if (!p.contributions || p.contributions.length < 3)
      warn(`[${p.id}] flagship with <3 contributions`);
  }

  if (p.summary && p.summary.length < 60)
    warn(`[${p.id}] very short summary (${p.summary.length} chars)`);
}

for (const id of demoIds) {
  if (!ids.has(id))
    error(`demoRegistry has demo for unknown paper id: ${id}`);
}

// Surface counts so flat lists of papers tell us at a glance whether the
// content extension work is regressing.
const richCount = PAPERS.filter(
  (p: any) => p.pipeline || p.keyTechniques || p.benchmarks || p.insights
).length;

const errs = issues.filter((i) => i.level === "error");
const warns = issues.filter((i) => i.level === "warn");

console.log(
  `validate-papers: ${PAPERS.length} papers, ${richCount} with rich sections, ` +
    `${demoIds.size} demos registered`
);

for (const w of warns) console.warn(`  warn: ${w.msg}`);
for (const e of errs) console.error(`  error: ${e.msg}`);

if (errs.length > 0) {
  console.error(`\n✗ ${errs.length} error(s)`);
  process.exit(1);
}
console.log(`✓ ok${warns.length ? ` (${warns.length} warning(s))` : ""}`);
