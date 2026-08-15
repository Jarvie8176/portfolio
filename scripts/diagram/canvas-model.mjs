// Shared JSON Canvas -> normalized diagram model. Used by mermaid derive,
// SVG render, and the parity gate so all three agree on the SoT.
import { readFileSync } from 'node:fs';

const MARKER = /^<!--\s*(.*?)\s*-->$/;

function parseMarker(line) {
  const m = line && line.match(MARKER);
  const out = {};
  if (!m) return out;
  for (const pair of m[1].split(',')) {
    const [k, v] = pair.split(':').map((s) => s.trim());
    if (k) out[k] = v;
  }
  return out;
}

// edge label form "kind: visible text" -> {kind, text}
function parseEdgeLabel(label) {
  if (!label) return { kind: 'data', text: '' };
  const i = label.indexOf(':');
  if (i === -1) return { kind: 'data', text: label.trim() };
  const kind = label.slice(0, i).trim() || 'data';
  return { kind, text: label.slice(i + 1).trim() };
}

function defaultBlock(type) {
  if (type === 'store') return 'entity';
  if (type === 'decision' || type === 'gate') return 'control';
  return 'workflow';
}

export function parseCanvas(pathOrJson) {
  const raw =
    typeof pathOrJson === 'string' && pathOrJson.trim().startsWith('{')
      ? pathOrJson
      : readFileSync(pathOrJson, 'utf8');
  const doc = JSON.parse(raw);

  const groups = [];
  const nodes = [];
  for (const n of doc.nodes || []) {
    if (n.type === 'group') {
      const layer = (n.label || '').split(/\s|-/)[0].trim() || n.id;
      groups.push({ id: n.id, label: n.label || n.id, layer, x: n.x, y: n.y, w: n.width, h: n.height });
      continue;
    }
    const lines = String(n.text || '').split('\n');
    const marker = parseMarker(lines[0]);
    const body = marker.type !== undefined || lines[0].match(MARKER) ? lines.slice(1) : lines;
    const type = marker.type || 'process';
    nodes.push({
      id: n.id,
      type,
      block: marker.block || defaultBlock(type),
      layer: marker.layer || null,
      lod: marker.lod != null ? Number(marker.lod) : 0,
      title: (body[0] || n.id).trim(),
      sub: (body[1] || '').trim(),
      x: n.x, y: n.y, w: n.width, h: n.height,
    });
  }

  const edges = (doc.edges || []).map((e) => {
    const { kind, text } = parseEdgeLabel(e.label);
    return { id: e.id, from: e.fromNode, to: e.toNode, kind, label: text };
  });

  return { groups, nodes, edges };
}

// canonical sets for parity (order-independent, case/space-normalized)
export function modelSets(model) {
  const norm = (s) => String(s).trim().toLowerCase();
  return {
    nodes: new Set(model.nodes.map((n) => norm(n.id))),
    edges: new Set(model.edges.map((e) => `${norm(e.from)}->${norm(e.to)}`)),
    layerOf: new Map(model.nodes.map((n) => [norm(n.id), n.layer])),
    blockOf: new Map(model.nodes.map((n) => [norm(n.id), n.block])),
  };
}

export const kebab = (s) => String(s).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
