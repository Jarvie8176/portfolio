// Deterministic JSON Canvas -> annotated, styled inline SVG.
// Shared by the Astro build-time base render and the runtime island (which
// attaches to this SVG; it never re-renders geometry). d3 is NOT used here:
// positions are the canvas's manual coordinates (no auto-layout, ever).
import { parseCanvas } from '../../../scripts/diagram/canvas-model.mjs';

const LAYER_COLOR = { L0: '#2f855a', L1: '#0e7490', L2: '#334155', L3: '#7c3aed', L4: '#d97706', L5: '#334155' };
const TINT = { L0: '#ecf8f0', L1: '#e7f8fb', L2: '#eef2f7', L3: '#f4ecff', L4: '#fff4e6', L5: '#eef2f7' };
const INK = '#1b1d1f', SOFT = '#5a5e63', FAINT = '#8a8f92', PAPER = '#f6f7f5';
const BLOCK_LABEL = { entity: 'ENTITY', workflow: 'FLOW', action: 'ACTION', control: 'CTRL' };
const EDGE = {
  data: { w: 2, dash: '', end: 1, start: 0 },
  authority: { w: 3.4, dash: '', end: 1, start: 0 },
  async: { w: 2, dash: '8 6', end: 1, start: 0 },
  sync: { w: 2.4, dash: '', end: 1, start: 1 },
  funnel: { w: 2.2, dash: '', end: 1, start: 0 },
};
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const layerColor = (l) => LAYER_COLOR[l] || SOFT;

function nodeCenter(n) { return { cx: n.x + n.w / 2, cy: n.y + n.h / 2 }; }

// point where the ray from a box center toward (tx,ty) crosses the box edge
function edgePoint(box, tx, ty) {
  const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
  const dx = tx - cx, dy = ty - cy;
  if (dx === 0 && dy === 0) return [cx, cy];
  const sx = dx !== 0 ? box.w / 2 / Math.abs(dx) : Infinity;
  const sy = dy !== 0 ? box.h / 2 / Math.abs(dy) : Infinity;
  const s = Math.min(sx, sy);
  return [cx + dx * s, cy + dy * s];
}

// boundary anchor at the midpoint of a box side
function anchor(box, side) {
  const { x, y, w, h } = box;
  if (side === 'r') return [x + w, y + h / 2];
  if (side === 'l') return [x, y + h / 2];
  if (side === 't') return [x + w / 2, y];
  return [x + w / 2, y + h]; // 'b'
}

// explicit side-to-side orthogonal route (honors JSON Canvas fromSide/toSide).
// Lets us hand-route the few edges whose auto-route would cross a stacked node.
const SIDE = { top: 't', bottom: 'b', left: 'l', right: 'r', t: 't', b: 'b', l: 'l', r: 'r' };
const SIDE_DIR = { r: [1, 0], l: [-1, 0], t: [0, -1], b: [0, 1] };
function routeSided(a, b, fs, ts) {
  const A = anchor(a, fs), B = anchor(b, ts);
  const aH = SIDE_DIR[fs][0] !== 0, bH = SIDE_DIR[ts][0] !== 0;
  if (aH && bH) { const mx = (A[0] + B[0]) / 2; return A[1] === B[1] ? [A, B] : [A, [mx, A[1]], [mx, B[1]], B]; }
  if (!aH && !bH) { const my = (A[1] + B[1]) / 2; return A[0] === B[0] ? [A, B] : [A, [A[0], my], [B[0], my], B]; }
  return aH ? [A, [B[0], A[1]], B] : [A, [A[0], B[1]], B]; // mixed -> single elbow
}

// orthogonal route with the FEWEST bends: straight (0) when the boxes share a
// band, else a single elbow (1). Always lands on a box-edge midpoint, never
// the center.
function routeOrthogonal(a, b) {
  const TOL = 4, PAD = 12;
  const aL = a.x, aR = a.x + a.w, aT = a.y, aB = a.y + a.h, aCx = a.x + a.w / 2, aCy = a.y + a.h / 2;
  const bL = b.x, bR = b.x + b.w, bT = b.y, bB = b.y + b.h, bCx = b.x + b.w / 2, bCy = b.y + b.h / 2;
  const xLo = Math.max(aL, bL), xHi = Math.min(aR, bR);
  const yLo = Math.max(aT, bT), yHi = Math.min(aB, bB);
  const below = bT >= aB - TOL, above = bB <= aT + TOL;
  const right = bL >= aR - TOL, left = bR <= aL + TOL;
  // straight vertical (shared x-band, clearly above/below) -> 0 bends
  if (xHi - xLo > 2 * PAD && (below || above)) {
    const sx = Math.min(xHi - PAD, Math.max(xLo + PAD, (aCx + bCx) / 2));
    return below ? [[sx, aB], [sx, bT]] : [[sx, aT], [sx, bB]];
  }
  // straight horizontal (shared y-band, clearly left/right) -> 0 bends
  if (yHi - yLo > 2 * PAD && (right || left)) {
    const sy = Math.min(yHi - PAD, Math.max(yLo + PAD, (aCy + bCy) / 2));
    return right ? [[aR, sy], [bL, sy]] : [[aL, sy], [bR, sy]];
  }
  // single elbow -> 1 bend
  const dx = bCx - aCx, dy = bCy - aCy;
  if (Math.abs(dx) >= Math.abs(dy)) {
    const p0 = [dx >= 0 ? aR : aL, aCy];
    const p1 = [bCx, dy >= 0 ? bT : bB];
    return [p0, [p1[0], p0[1]], p1];
  }
  const p0 = [aCx, dy >= 0 ? aB : aT];
  const p1 = [dx >= 0 ? bL : bR, bCy];
  return [p0, [p0[0], p1[1]], p1];
}

// IO-boundary edges are explanatory rails. Passive intake may fall straight
// into SENSE, but operator turns and output surfaces should route around the
// runtime blocks so they do not read as internal authority edges.
function routeIoBoundary(a, b) {
  const touchesIo = a.layer === 'L0' || b.layer === 'L0';
  const ambientSense = a.layer === 'L0' && b.layer === 'L1';
  if (!touchesIo || ambientSense || a.layer === b.layer) return null;

  const ioNode = a.layer === 'L0' ? a : b;
  const internal = a.layer === 'L0' ? b : a;

  if (a.layer === 'L0') {
    const railX = internal.x < ioNode.x ? internal.x + internal.w + 40 : internal.x - 40;
    const fromRight = internal.x >= ioNode.x;
    const p0 = anchor(a, fromRight ? 'r' : 'l');
    const p1 = [railX, p0[1]];
    const p2 = [railX, internal.y + internal.h / 2];
    const p3 = anchor(internal, fromRight ? 'l' : 'r');
    return [p0, p1, p2, p3];
  }

  const internalToRight = ioNode.x >= internal.x;
  const internalEdge = internalToRight ? internal.x + internal.w : internal.x;
  const ioEdge = internalToRight ? ioNode.x : ioNode.x + ioNode.w;
  const gap = Math.abs(ioEdge - internalEdge);
  const railX = gap > 24
    ? (internalEdge + ioEdge) / 2
    : internalEdge + (internalToRight ? 40 : -40);
  const p0 = anchor(internal, internalToRight ? 'r' : 'l');
  const p1 = [railX, p0[1]];
  const p2 = [railX, ioNode.y + ioNode.h / 2];
  const p3 = anchor(ioNode, internalToRight ? 'l' : 'r');
  return [p0, p1, p2, p3];
}

// path with short rounded elbows for legibility
function orthPath(pts, r = 8) {
  if (pts.length === 2) return `M ${pts[0][0]} ${pts[0][1]} L ${pts[1][0]} ${pts[1][1]}`;
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i], prev = pts[i - 1], next = pts[i + 1];
    const inDir = [Math.sign(p[0] - prev[0]), Math.sign(p[1] - prev[1])];
    const outDir = [Math.sign(next[0] - p[0]), Math.sign(next[1] - p[1])];
    const rr = Math.min(r, Math.abs(p[0] - prev[0]) / 2 || r, Math.abs(p[1] - prev[1]) / 2 || r,
      Math.abs(next[0] - p[0]) / 2 || r, Math.abs(next[1] - p[1]) / 2 || r);
    d += ` L ${p[0] - inDir[0] * rr} ${p[1] - inDir[1] * rr}`;
    d += ` Q ${p[0]} ${p[1]} ${p[0] + outDir[0] * rr} ${p[1] + outDir[1] * rr}`;
  }
  const last = pts[pts.length - 1];
  d += ` L ${last[0]} ${last[1]}`;
  return d;
}

function shape(n) {
  const c = layerColor(n.layer);
  const { x, y, w, h } = n;
  if (n.type === 'gate') {
    const ly = y + h / 2;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="#ffffff" stroke="${c}" stroke-width="1.5"/>`
      + `<line x1="${x + 40}" y1="${y + 10}" x2="${x + 40}" y2="${y + h - 10}" stroke="${c}" stroke-opacity="0.28" stroke-width="1.2"/>`
      + `<rect x="${x + 14}" y="${ly - 2}" width="18" height="15" rx="4" fill="none" stroke="${c}" stroke-width="2"/>`
      + `<path d="M ${x + 18} ${ly - 2} v-6 a5 5 0 0 1 10 0 v6" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`
      + `<circle cx="${x + 23}" cy="${ly + 5}" r="1.8" fill="${c}"/>`;
  }
  if (n.type === 'decision') {
    const pts = [[x + w / 2, y], [x + w, y + h / 2], [x + w / 2, y + h], [x, y + h / 2]].map((p) => p.join(',')).join(' ');
    return `<polygon points="${pts}" fill="#ffffff" stroke="${c}" stroke-width="1.6"/>`;
  }
  if (n.type === 'store') {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="#ffffff" stroke="${c}" stroke-width="1.6"/>`
      + `<rect x="${x}" y="${y}" width="6" height="${h}" rx="0" fill="${c}"/>`;
  }
  // process (default)
  const actionMark = n.block === 'action'
    ? `<path d="M ${x + w - 20} ${y + 10} l 8 5 l -8 5 z" fill="${c}" fill-opacity="0.82"/>`
    : '';
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="#ffffff" stroke="${c}" stroke-width="1.5"/>${actionMark}`;
}

function blockChip(n) {
  const label = BLOCK_LABEL[n.block];
  if (!label) return '';
  const c = layerColor(n.layer);
  const x = n.x + (n.type === 'gate' ? 50 : 10);
  const y = n.y + 13;
  return `<text x="${x}" y="${y}" text-anchor="start" font-size="7.5" font-weight="800" letter-spacing="0.7" fill="${c}" fill-opacity="0.62" style="text-transform:uppercase">${label}</text>`;
}

function nodeLabel(n) {
  const { cx } = nodeCenter(n);
  const labelX = n.type === 'gate' ? cx + 18 : cx;
  const ty = n.sub ? n.y + n.h / 2 + 2 : n.y + n.h / 2 + 7;
  let s = `<text x="${labelX}" y="${ty}" text-anchor="middle" font-size="13" font-weight="600" fill="${INK}">${esc(n.title)}</text>`;
  if (n.sub) s += `<text x="${labelX}" y="${n.y + n.h / 2 + 20}" text-anchor="middle" font-size="11" fill="${FAINT}">${esc(n.sub)}</text>`;
  return s;
}

export function renderSvg(canvasInput, opts = {}) {
  const model = parseCanvas(canvasInput);
  const byId = new Map(model.nodes.map((n) => [n.id, n]));
  const all = [...model.nodes, ...model.groups.map((g) => ({ x: g.x, y: g.y, w: g.w, h: g.h }))];
  const minX = Math.min(...all.map((n) => n.x)) - 40;
  const minY = Math.min(...all.map((n) => n.y)) - 40;
  const maxX = Math.max(...all.map((n) => n.x + n.w)) + 40;
  const maxY = Math.max(...all.map((n) => n.y + n.h)) + 40;
  const W = maxX - minX, H = maxY - minY;

  // one arrowhead marker per edge color so heads match their line (not a
  // neutral gray that reads as a different element).
  const ckey = (c) => c.replace('#', '');
  const edgeColorOf = (e) => layerColor((byId.get(e.from) || {}).layer);
  const colors = [...new Set(model.edges.map(edgeColorOf))];
  const markers = colors.map((c) =>
    `<marker id="arw-${ckey(c)}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${c}"/></marker>`
  ).join('');

  // groups (back, dashed containers) + layer labels
  const groups = model.groups.map((g) => {
    const c = layerColor(g.layer);
    return `<g data-layer="${esc(g.layer)}" class="yd-layer">`
      + `<rect x="${g.x}" y="${g.y}" width="${g.w}" height="${g.h}" rx="16" fill="${TINT[g.layer] || '#f3f3f2'}" fill-opacity="0.4" stroke="${c}" stroke-width="1.2" stroke-dasharray="7 5"/>`
      + `<text x="${g.x + 14}" y="${g.y + 22}" font-size="11" font-weight="800" letter-spacing="0.8" fill="${c}" style="text-transform:uppercase">${esc(g.label)}</text>`
      + `</g>`;
  }).join('');

  // edges (behind nodes): orthogonal routes landing on box boundaries
  const edges = model.edges.map((e) => {
    const a = byId.get(e.from), b = byId.get(e.to);
    if (!a || !b) return '';
    const spec = EDGE[e.kind] || EDGE.data;
    const col = layerColor(a.layer);
    // funnel-hybrid: funnel edges converge as straight boundary-to-boundary
    // lines (orthogonalizing them flattens the "narrow to one gate" reading);
    // every other kind stays orthogonal with minimal bends.
    let d;
    if (opts.funnelStraight && e.kind === 'funnel') {
      const p0 = edgePoint(a, b.x + b.w / 2, b.y + b.h / 2);
      const p1 = edgePoint(b, a.x + a.w / 2, a.y + a.h / 2);
      d = `M ${p0[0]} ${p0[1]} L ${p1[0]} ${p1[1]}`;
    } else if (e.fromSide && e.toSide && SIDE[e.fromSide] && SIDE[e.toSide]) {
      d = orthPath(routeSided(a, b, SIDE[e.fromSide], SIDE[e.toSide]));
    } else {
      d = orthPath(routeIoBoundary(a, b) || routeOrthogonal(a, b));
    }
    const mk = `url(#arw-${ckey(col)})`;
    const attrs = `fill="none" stroke="${col}" stroke-width="${spec.w}"${spec.dash ? ` stroke-dasharray="${spec.dash}"` : ''}`
      + ` marker-end="${mk}"${spec.start ? ` marker-start="${mk}"` : ''}`;
    const lod = a.lod === 0 && b.lod === 0 ? 0 : 1;
    const detailLayer = lod === 1 ? (a.lod === 1 ? a.layer : b.layer) || '' : '';
    return `<g data-edge="${esc(e.from)}-&gt;${esc(e.to)}" data-kind="${esc(e.kind)}" data-lod="${lod}" data-detail-layer="${esc(detailLayer)}" class="yd-edge"><path d="${d}" ${attrs}/></g>`;
  }).join('');

  // nodes (front)
  const nodes = model.nodes.map((n) =>
    `<g data-node="${esc(n.id)}" data-type="${esc(n.type)}" data-block="${esc(n.block || '')}" data-layer="${esc(n.layer || '')}" data-lod="${n.lod}" class="yd-node" tabindex="0">`
    + `<title>${esc(n.title)}</title>${shape(n)}${blockChip(n)}${nodeLabel(n)}</g>`).join('');

  const title = opts.title || 'architecture diagram';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${W} ${H}" role="img" aria-label="${esc(title)}" class="yd-svg" font-family="var(--sans, system-ui, sans-serif)">`
    + `<defs>${markers}</defs>`
    + `<g class="yd-groups">${groups}</g><g class="yd-edges">${edges}</g><g class="yd-nodes">${nodes}</g>`
    + `</svg>`;
  return { svg, model, viewBox: [minX, minY, W, H] };
}
