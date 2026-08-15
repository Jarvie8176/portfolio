// Diagram DATA doc: JSON Canvas -> human-readable markdown (layers, nodes,
// edges, two-level structure, embedded acceptance graph). Auto-derived from the
// SoT so it cannot drift. Usage: node canvas-to-doc.mjs <in.canvas> [out.md]
import { writeFileSync } from 'node:fs';
import { basename } from 'node:path';
import { parseCanvas } from './canvas-model.mjs';
import { canvasToMermaid } from './canvas-to-mermaid.mjs';

const KIND_STYLE = {
  data: 'solid + arrow (deterministic data / control)',
  authority: 'thick (authority transition)',
  async: 'dashed (trace / background)',
  sync: 'double arrow (negotiated state)',
  funnel: 'converging (write constrained before a gate)',
};

export function canvasToDoc(input, name) {
  const m = parseCanvas(input);
  const title = name || 'diagram';
  const byLayer = new Map();
  for (const n of m.nodes) {
    const k = n.layer || '(none)';
    if (!byLayer.has(k)) byLayer.set(k, []);
    byLayer.get(k).push(n);
  }
  const groupLabel = new Map(m.groups.map((g) => [g.layer, g.label]));
  const out = [];
  out.push(`# ${title} - architecture diagram (data)`, '');
  out.push(`Auto-generated from the canvas source of truth. Do not edit by hand;`);
  out.push(`edit the \`.canvas\` and regenerate (\`npm run diagram:doc\`).`, '');
  out.push(`- layers: ${m.groups.length} - nodes: ${m.nodes.length} `
    + `(high-level ${m.nodes.filter((n) => n.lod === 0).length} / detail ${m.nodes.filter((n) => n.lod === 1).length})`
    + ` - edges: ${m.edges.length}`, '');

  out.push('## Layers', '');
  out.push('| layer | label | nodes |', '|---|---|---|');
  for (const g of m.groups) {
    const members = (byLayer.get(g.layer) || []).map((n) => n.id).join(', ');
    out.push(`| ${g.layer} | ${g.label} | ${members} |`);
  }
  out.push('');

  out.push('## Nodes', '');
  out.push('| id | layer | lod | block | type | title | detail |', '|---|---|---|---|---|---|---|');
  for (const n of m.nodes) {
    out.push(`| \`${n.id}\` | ${n.layer || '-'} | ${n.lod === 0 ? 'high-level' : 'detail'} | ${n.block || '-'} | ${n.type} | ${n.title} | ${n.sub || ''} |`);
  }
  out.push('');

  out.push('## Edges', '');
  out.push('| from | to | kind | shown at |', '|---|---|---|---|');
  for (const e of m.edges) {
    const a = m.nodes.find((n) => n.id === e.from), b = m.nodes.find((n) => n.id === e.to);
    const lod = a && b && a.lod === 0 && b.lod === 0 ? 'high-level' : 'detail';
    out.push(`| \`${e.from}\` | \`${e.to}\` | ${e.kind}${e.label ? ' (' + e.label + ')' : ''} | ${lod} |`);
  }
  out.push('');

  out.push('## Reading levels', '');
  const hasIoQuadrants = ['passive-input', 'proactive-input', 'passive-output', 'proactive-output']
    .every((id) => m.nodes.some((n) => n.id === id && n.lod === 0));
  const highLevelShape = hasIoQuadrants ? 'the four IO quadrants and hourglass' : 'the authored composition';
  out.push(`**High-level (level 0):** summary nodes plus cross-layer edges - ${highLevelShape}.`, '');
  const summaries = m.nodes.filter((n) => n.lod === 0);
  out.push(...summaries.map((n) => `- ${n.layer} \`${n.id}\` - ${n.title}`), '');
  out.push('**Per-layer detail (level 1):** drilling into a layer reveals its internal nodes.', '');
  for (const g of m.groups) {
    const layerNodes = byLayer.get(g.layer) || [];
    const det = layerNodes.filter((n) => n.lod === 1);
    if (!det.length) continue;
    const nodeLayer = new Map(layerNodes.map((n) => [n.id, n.layer]));
    const layerEdges = m.edges.filter((e) =>
      nodeLayer.get(e.from) === g.layer
      && nodeLayer.get(e.to) === g.layer
      && (det.some((n) => n.id === e.from) || det.some((n) => n.id === e.to)));
    const detail = layerEdges.length
      ? layerEdges.map((e) => `${e.from} -> ${e.to}`).join('; ')
      : det.map((n) => n.id).join(', ');
    out.push(`- **${g.layer}** ${groupLabel.get(g.layer) || ''}: ${detail}`);
  }
  out.push('');

  out.push('## Edge kinds', '');
  out.push('| kind | meaning |', '|---|---|');
  const usedKinds = [...new Set(m.edges.map((e) => e.kind))];
  for (const k of usedKinds) out.push(`| ${k} | ${KIND_STYLE[k] || ''} |`);
  out.push('');

  out.push('## Acceptance graph (derived)', '');
  out.push('Structure only (auto-layout); the presentation figure composes these', 'nodes deliberately.', '');
  out.push('```mermaid', canvasToMermaid(input).trimEnd(), '```', '');
  return out.join('\n');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const inp = process.argv[2];
  if (!inp) { console.error('usage: canvas-to-doc.mjs <in.canvas> [out.md]'); process.exit(2); }
  const name = basename(inp).replace(/\.canvas$/, '');
  const md = canvasToDoc(inp, name.charAt(0).toUpperCase() + name.slice(1));
  const out = process.argv[3];
  if (out) { writeFileSync(out, md); console.error(`wrote ${out}`); } else process.stdout.write(md);
}
