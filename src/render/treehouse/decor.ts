import * as THREE from 'three';
import { buildAnimal } from '../avatars/animals';
import { addOutlines, toonMaterial } from '../toon';

type Part = [geo: THREE.BufferGeometry, color: string, pos: [number, number, number], rot?: [number, number, number], scale?: [number, number, number]];

function assemble(parts: Part[]): THREE.Group {
  const g = new THREE.Group();
  for (const [geo, color, pos, rot, scale] of parts) {
    const m = new THREE.Mesh(geo, toonMaterial(color));
    m.position.set(...pos);
    if (rot) m.rotation.set(...rot);
    if (scale) m.scale.set(...scale);
    m.castShadow = true;
    g.add(m);
  }
  addOutlines(g, 0.025);
  return g;
}

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const ball = (r: number) => new THREE.SphereGeometry(r, 16, 12);
const cyl = (rt: number, rb: number, h: number, seg = 16) => new THREE.CylinderGeometry(rt, rb, h, seg);

const builders: Record<string, () => THREE.Group> = {
  lantern: () =>
    assemble([
      [cyl(0.12, 0.14, 0.04), '#5c3d2e', [0, 0.02, 0]],
      [cyl(0.1, 0.1, 0.28), '#ffd166', [0, 0.18, 0]],
      [cyl(0.0, 0.15, 0.12, 6), '#e63946', [0, 0.38, 0]],
      [ball(0.03), '#5c3d2e', [0, 0.46, 0]],
    ]),
  plant: () =>
    assemble([
      [cyl(0.14, 0.11, 0.2), '#c1693c', [0, 0.1, 0]],
      [ball(0.12), '#4caf50', [0, 0.3, 0]],
      [ball(0.09), '#66bb6a', [-0.09, 0.38, 0.03]],
      [ball(0.09), '#43a047', [0.08, 0.4, -0.02]],
      [ball(0.08), '#81c784', [0, 0.47, 0.04]],
    ]),
  picture: () =>
    assemble([
      [box(0.5, 0.4, 0.04), '#8d5a2b', [0, 0.45, 0]],
      [box(0.42, 0.32, 0.02), '#9fd8ff', [0, 0.45, 0.025]],
      [box(0.42, 0.12, 0.022), '#7ccf6b', [0, 0.35, 0.026]],
      [ball(0.05), '#ffd60a', [0.12, 0.53, 0.04]],
      [box(0.04, 0.25, 0.04), '#8d5a2b', [0, 0.12, -0.08], [0.3, 0, 0]],
    ]),
  teddy: () => {
    const g = buildAnimal({ animal: 'bear', color: '#c68b59' as never });
    g.scale.setScalar(0.5);
    return g;
  },
  balloons: () =>
    assemble([
      [ball(0.03), '#5c3d2e', [0, 0.03, 0]],
      [cyl(0.004, 0.004, 0.6, 4), '#2b2233', [0, 0.32, 0]],
      [ball(0.13), '#ff4d6d', [0, 0.72, 0], undefined, [1, 1.15, 1]],
      [cyl(0.004, 0.004, 0.55, 4), '#2b2233', [0.08, 0.3, 0], [0, 0, -0.3]],
      [ball(0.12), '#ffd60a', [0.2, 0.64, 0.02], undefined, [1, 1.15, 1]],
      [cyl(0.004, 0.004, 0.55, 4), '#2b2233', [-0.08, 0.3, 0], [0, 0, 0.3]],
      [ball(0.12), '#3a86ff', [-0.2, 0.62, -0.02], undefined, [1, 1.15, 1]],
    ]),
  books: () =>
    assemble([
      [box(0.36, 0.08, 0.26), '#e63946', [0, 0.04, 0]],
      [box(0.32, 0.08, 0.24), '#3a86ff', [0.02, 0.12, 0], [0, 0.2, 0]],
      [box(0.3, 0.08, 0.22), '#8ac926', [-0.01, 0.2, 0], [0, -0.15, 0]],
    ]),
  telescope: () =>
    assemble([
      [cyl(0.015, 0.015, 0.4, 6), '#5c3d2e', [-0.1, 0.18, 0], [0, 0, 0.35]],
      [cyl(0.015, 0.015, 0.4, 6), '#5c3d2e', [0.1, 0.18, 0], [0, 0, -0.35]],
      [cyl(0.015, 0.015, 0.4, 6), '#5c3d2e', [0, 0.18, -0.1], [-0.35, 0, 0]],
      [cyl(0.05, 0.07, 0.42), '#3a3a6a', [0, 0.42, 0.05], [1.1, 0, 0]],
      [cyl(0.075, 0.075, 0.03), '#ffd60a', [0, 0.5, 0.25], [1.1, 0, 0]],
    ]),
  pennants: () => {
    const parts: Part[] = [
      [cyl(0.015, 0.015, 0.7, 6), '#5c3d2e', [-0.3, 0.35, 0]],
      [cyl(0.015, 0.015, 0.7, 6), '#5c3d2e', [0.3, 0.35, 0]],
      [cyl(0.006, 0.006, 0.6, 4), '#2b2233', [0, 0.66, 0], [0, 0, Math.PI / 2]],
    ];
    const colors = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'];
    colors.forEach((c, i) => parts.push([new THREE.ConeGeometry(0.05, 0.12, 3), c, [-0.24 + i * 0.12, 0.58, 0], [Math.PI, 0, 0]]));
    return assemble(parts);
  },
  globe: () =>
    assemble([
      [cyl(0.1, 0.12, 0.04), '#5c3d2e', [0, 0.02, 0]],
      [cyl(0.015, 0.015, 0.15, 6), '#5c3d2e', [0, 0.1, 0]],
      [ball(0.16), '#3a86ff', [0, 0.32, 0]],
      [ball(0.07), '#8ac926', [0.08, 0.36, 0.1], undefined, [1.3, 1, 0.6]],
      [ball(0.06), '#8ac926', [-0.1, 0.28, 0.09], undefined, [1, 1.3, 0.6]],
    ]),
  guitar: () =>
    assemble([
      [ball(0.14), '#e07a2f', [0, 0.16, 0], undefined, [1, 1, 0.35]],
      [ball(0.11), '#e07a2f', [0, 0.36, 0], undefined, [1, 1, 0.35]],
      [ball(0.04), '#2b2233', [0, 0.22, 0.05], undefined, [1, 1, 0.3]],
      [box(0.05, 0.36, 0.03), '#5c3d2e', [0, 0.62, 0]],
      [box(0.08, 0.08, 0.03), '#5c3d2e', [0, 0.82, 0]],
    ]),
};

/** 3D model of a tree house decoration (stands on y = 0). */
export function buildDecor(id: string): THREE.Group {
  return builders[id]?.() ?? new THREE.Group();
}

export const decorIds = Object.keys(builders);
