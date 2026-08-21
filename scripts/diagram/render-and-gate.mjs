// CI check: render each project canvas and assert content parity vs its SoT.
// Fails the build on drift. Add projects to LIST as their canvases land.
import { renderSvg } from '../../src/components/diagram/render.mjs';
import { checkParity } from './parity-gate.mjs';

const LIST = [
  { canvas: 'src/diagrams/yaaa.canvas', title: 'Yaaa - authority map' },
  { canvas: 'src/diagrams/amanuensis-example.canvas', title: 'Amanuensis - one flyer, two routes' },
];

let bad = 0;
for (const { canvas, title } of LIST) {
  const { svg } = renderSvg(canvas, { title });
  const r = checkParity(canvas, svg);
  if (r.ok) console.error(`OK   ${canvas}  (${r.counts.nodes} nodes, ${r.counts.edges} edges)`);
  else { bad++; console.error(`FAIL ${canvas} (${r.fails.length}):`); for (const f of r.fails) console.error('  - ' + f); }
}
process.exit(bad ? 1 : 0);
