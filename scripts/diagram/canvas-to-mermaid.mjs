// job-A acceptance view: JSON Canvas -> mermaid flowchart (structure only).
// Auto-derived, never hand-edited. Usage: node canvas-to-mermaid.mjs <in.canvas> [out.mmd]
import { writeFileSync } from 'node:fs';
import { parseCanvas } from './canvas-model.mjs';

const mid = (id) => id.replace(/-/g, '_');
const esc = (s) => String(s).replace(/"/g, "'");

// type -> mermaid node shape wrappers
const SHAPE = {
  process: (l) => `("${l}")`,
  store: (l) => `["${l}"]`,
  decision: (l) => `{"${l}"}`,
  gate: (l) => `{{"${l}"}}`,
  note: (l) => `["${l}"]`,
};
// edge kind -> mermaid connector
const LINK = {
  data: (t) => (t ? `-->|${t}|` : '-->'),
  authority: (t) => (t ? `==>|${t}|` : '==>'),
  async: (t) => (t ? `-.->|${t}|` : '-.->'),
  sync: (t) => (t ? `<-->|${t}|` : '<-->'),
  funnel: (t) => (t ? `-->|${t}|` : '-->'),
};

export function canvasToMermaid(input) {
  const m = parseCanvas(input);
  const out = ['flowchart LR'];
  const byLayer = new Map();
  for (const n of m.nodes) {
    const k = n.layer || '_';
    if (!byLayer.has(k)) byLayer.set(k, []);
    byLayer.get(k).push(n);
  }
  for (const g of m.groups) {
    const members = byLayer.get(g.layer) || [];
    out.push(`  subgraph ${mid(g.id)} ["${esc(g.label)}"]`);
    for (const n of members) out.push(`    ${mid(n.id)}${(SHAPE[n.type] || SHAPE.process)(esc(n.title))}`);
    out.push('  end');
  }
  // nodes with no matching layer group
  for (const n of byLayer.get('_') || []) out.push(`  ${mid(n.id)}${(SHAPE[n.type] || SHAPE.process)(esc(n.title))}`);
  out.push('');
  for (const e of m.edges) {
    const link = (LINK[e.kind] || LINK.data)(e.label ? esc(e.label) : '');
    out.push(`  ${mid(e.from)} ${link} ${mid(e.to)}`);
  }
  return out.join('\n') + '\n';
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const inp = process.argv[2];
  if (!inp) { console.error('usage: canvas-to-mermaid.mjs <in.canvas> [out.mmd]'); process.exit(2); }
  const mmd = canvasToMermaid(inp);
  const out = process.argv[3];
  if (out) { writeFileSync(out, mmd); console.error(`wrote ${out}`); } else process.stdout.write(mmd);
}
