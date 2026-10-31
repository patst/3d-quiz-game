import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { addOutlines, toonMaterial } from './toon';

/** A comic treasure chest. Children: `lid` (pivot at the back edge) and `beacon` (floating star). */
export function buildChest(): THREE.Group {
  const root = new THREE.Group();
  const wood = toonMaterial('#b5651d');
  const gold = toonMaterial('#ffd93d');
  const W = 0.62;
  const D = 0.44;
  const H = 0.32;

  const base = new THREE.Mesh(new RoundedBoxGeometry(W, H, D, 2, 0.04), wood);
  base.position.y = H / 2;
  root.add(base);
  // Gold corner straps on the front.
  for (const side of [-1, 1]) {
    const strap = new THREE.Mesh(new THREE.BoxGeometry(0.07, H + 0.02, 0.03), gold);
    strap.position.set(side * (W / 2 - 0.06), H / 2, D / 2);
    root.add(strap);
  }
  // Treasure inside (visible when the lid is open).
  const treasure = new THREE.Mesh(new THREE.BoxGeometry(W - 0.1, 0.04, D - 0.1), gold);
  treasure.position.y = H + 0.005;
  treasure.userData.noOutline = true;
  root.add(treasure);

  // Lid hinges at the back top edge.
  const lid = new THREE.Group();
  lid.name = 'lid';
  lid.position.set(0, H, -D / 2);
  const lidMesh = new THREE.Mesh(new RoundedBoxGeometry(W + 0.02, 0.16, D + 0.02, 2, 0.06), wood);
  lidMesh.position.set(0, 0.08, D / 2);
  lid.add(lidMesh);
  const lock = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.04), gold);
  lock.position.set(0, 0.02, D + 0.02);
  lid.add(lock);
  root.add(lid);

  addOutlines(root, 0.03);

  const beacon = new THREE.Mesh(starGeometry(0.16, 0.07, 0.06), toonMaterial('#ffd93d'));
  beacon.name = 'beacon';
  beacon.position.y = 1.0;
  addOutlines(beacon, 0.02);
  root.add(beacon);

  root.traverse((o) => {
    o.castShadow = true;
  });
  return root;
}

function starGeometry(outer: number, inner: number, depth: number): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
  geo.center();
  return geo;
}
