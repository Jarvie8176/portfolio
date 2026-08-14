// Drift gate: assert CONTENT parity (nodes/edges/layer), not layout, between
// the canvas SoT and a rendered SVG. Fails closed. Read the model dynamically
// from the canvas - never a hard-coded expected list.
// Usage: node parity-gate.mjs <canvas> <svg-file-or-inline>
import { readFileSync } from 'node:fs';
import { parseCanvas, modelSets } from './canvas-model.mjs';

const norm = (s) => String(s).trim().toLowerCase();

function svgSets(svg) {
  const nodes = new Set();
  const layerOf = new Map();
  for (const m of svg.matchAll(/data-node="([^"]+)"(?:[^>]*?data-layer="([^"]*)")?/g)) {
    nodes.add(norm(m[1]));
    if (m[2]) layerOf.set(norm(m[1]), m[2]);
  }
  const edges = new Set();
  for (const m of svg.matchAll(/data-edge="([^"]+?)-&gt;([^"]+?)"/g)) edges.add(`${norm(m[1])}->${norm(m[2])}`);
  // also accept literal '->' if not entity-encoded
  for (const m of svg.matchAll(/data-edge="([^"]+?)->([^"]+?)"/g)) edges.add(`${norm(m[1])}->${norm(m[2])}`);
  return { nodes, edges, layerOf };
}

export function checkParity(canvasPath, svg) {
  const model = modelSets(parseCanvas(canvasPath));
  const got = svgSets(svg);
  const fails = [];

  // fail closed: an un-annotated SVG cannot be verified
  if (got.nodes.size === 0) fails.push('FAIL-CLOSED: SVG has zero data-node annotations (cannot verify)');

  for (const id of model.nodes) if (!got.nodes.has(id)) fails.push(`node missing in SVG: ${id}`);
  for (const id of got.nodes) if (!model.nodes.has(id)) fails.push(`node in SVG not in SoT: ${id}`);
  for (const e of model.edges) if (!got.edges.has(e)) fails.push(`edge missing in SVG: ${e}`);
  for (const e of got.edges) if (!model.edges.has(e)) fails.push(`edge in SVG not in SoT: ${e}`);
  for (const [id, layer] of got.layerOf) {
    const want = model.layerOf.get(id);
    if (want && layer && norm(want) !== norm(layer)) fails.push(`layer mismatch ${id}: SoT=${want} SVG=${layer}`);
  }
  return { ok: fails.length === 0, fails, counts: { nodes: model.nodes.size, edges: model.edges.size } };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [canvas, svgArg] = process.argv.slice(2);
  if (!canvas || !svgArg) { console.error('usage: parity-gate.mjs <canvas> <svg-file>'); process.exit(2); }
  const svg = svgArg.trim().startsWith('<') ? svgArg : readFileSync(svgArg, 'utf8');
  const r = checkParity(canvas, svg);
  if (r.ok) { console.error(`parity OK (${r.counts.nodes} nodes, ${r.counts.edges} edges)`); process.exit(0); }
  console.error(`parity FAILED (${r.fails.length}):`); for (const f of r.fails) console.error('  - ' + f); process.exit(1);
}
