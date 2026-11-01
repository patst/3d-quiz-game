import * as THREE from 'three';
import type { LostAnimal } from '../../core/profile/lostAnimals';
import type { Avatar } from '../../core/profile/profile';
import { addOutlines, toonMaterial } from '../toon';
import { buildAnimal, buildChick } from './animals';

type Part = [geo: THREE.BufferGeometry, color: string, pos: [number, number, number], scale?: [number, number, number]];

function assemble(parts: Part[]): THREE.Group {
  const root = new THREE.Group();
  for (const [geo, color, pos, scale] of parts) {
    const m = new THREE.Mesh(geo, toonMaterial(color));
    m.position.set(...pos);
    if (scale) m.scale.set(...scale);
    root.add(m);
  }
  addOutlines(root, 0.03);
  return root;
}

const ball = (r: number) => new THREE.SphereGeometry(r, 16, 12);

function eyes(y: number, z: number, dx = 0.06): Part[] {
  return [
    [ball(0.03), '#2b2233', [-dx, y, z]],
    [ball(0.03), '#2b2233', [dx, y, z]],
  ];
}

function piglet(): THREE.Group {
  const pink = '#ffa6c1';
  const g = assemble([
    [ball(0.22), pink, [0, 0.22, 0], [1, 0.95, 1.2]],
    [ball(0.16), pink, [0, 0.45, 0.14]],
    [new THREE.CylinderGeometry(0.06, 0.07, 0.06, 16), '#ff8fb1', [0, 0.43, 0.3], undefined],
    [new THREE.ConeGeometry(0.05, 0.1, 4), pink, [-0.09, 0.6, 0.12]],
    [new THREE.ConeGeometry(0.05, 0.1, 4), pink, [0.09, 0.6, 0.12]],
    [new THREE.TorusGeometry(0.05, 0.015, 6, 12), pink, [0, 0.3, -0.27]],
    ...eyes(0.5, 0.27),
  ]);
  const snout = g.children[2]!;
  snout.rotation.x = Math.PI / 2;
  return g;
}

function puppy(): THREE.Group {
  const fur = '#c68b59';
  const g = assemble([
    [ball(0.2), fur, [0, 0.22, 0], [1, 0.95, 1.2]],
    [ball(0.16), fur, [0, 0.47, 0.12]],
    [ball(0.08), '#f1d3b3', [0, 0.43, 0.25], [1.1, 0.8, 1]],
    [ball(0.035), '#2b2233', [0, 0.46, 0.33]],
    [ball(0.07), '#8a5a35', [-0.15, 0.42, 0.1], [0.6, 1.5, 0.8]],
    [ball(0.07), '#8a5a35', [0.15, 0.42, 0.1], [0.6, 1.5, 0.8]],
    [new THREE.ConeGeometry(0.03, 0.15, 6), fur, [0, 0.33, -0.27]],
    ...eyes(0.52, 0.25),
  ]);
  g.children[6]!.rotation.x = -0.8;
  return g;
}

function lamb(): THREE.Group {
  const wool = '#fbfbf2';
  const parts: Part[] = [];
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    parts.push([ball(0.1), wool, [Math.cos(a) * 0.14, 0.24 + (i % 2) * 0.06, Math.sin(a) * 0.16]]);
  }
  parts.push(
    [ball(0.16), wool, [0, 0.27, 0]],
    [ball(0.11), '#5c5470', [0, 0.45, 0.18], [0.9, 1.05, 1]],
    [ball(0.05), '#5c5470', [-0.12, 0.47, 0.15], [1.4, 0.6, 0.7]],
    [ball(0.05), '#5c5470', [0.12, 0.47, 0.15], [1.4, 0.6, 0.7]],
    [ball(0.09), wool, [0, 0.55, 0.15]],
    [ball(0.025), '#ffffff', [-0.045, 0.47, 0.28]],
    [ball(0.025), '#ffffff', [0.045, 0.47, 0.28]],
  );
  return assemble(parts);
}

function baby(animal: Avatar['animal'], color: string): THREE.Group {
  const g = buildAnimal({ animal, color: color as Avatar['color'] });
  g.scale.setScalar(0.55);
  return g;
}

function turtle(): THREE.Group {
  const g = assemble([
    [new THREE.SphereGeometry(0.24, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), '#4c9a5b', [0, 0.1, 0], [1, 0.9, 1.15]],
    [new THREE.CylinderGeometry(0.25, 0.25, 0.05, 18), '#d9c27a', [0, 0.1, 0], [1, 1, 1.15]],
    [ball(0.1), '#8fd16a', [0, 0.2, 0.3]],
    [ball(0.06), '#8fd16a', [-0.2, 0.08, 0.18], [1.6, 0.5, 1]],
    [ball(0.06), '#8fd16a', [0.2, 0.08, 0.18], [1.6, 0.5, 1]],
    [ball(0.06), '#8fd16a', [-0.18, 0.08, -0.18], [1.4, 0.5, 1]],
    [ball(0.06), '#8fd16a', [0.18, 0.08, -0.18], [1.4, 0.5, 1]],
    [ball(0.07), '#3f7d4a', [0, 0.3, 0.02]],
    ...eyes(0.24, 0.38, 0.045),
  ]);
  return g;
}

function octopus(): THREE.Group {
  const purple = '#b58cff';
  const parts: Part[] = [[ball(0.2), purple, [0, 0.42, 0], [1, 1.15, 1]]];
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    parts.push([new THREE.CapsuleGeometry(0.035, 0.18, 4, 8), purple, [Math.cos(a) * 0.15, 0.14, Math.sin(a) * 0.15]]);
  }
  parts.push(...eyes(0.45, 0.18, 0.07), [ball(0.03), '#ff8fb1', [0, 0.37, 0.19]]);
  const g = assemble(parts);
  g.children.slice(1, 9).forEach((leg, i) => {
    const a = (i / 8) * Math.PI * 2;
    leg.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5);
  });
  g.position.y = 0;
  return g;
}

function crab(): THREE.Group {
  const red = '#ff5a4e';
  const g = assemble([
    [ball(0.2), red, [0, 0.18, 0], [1.3, 0.6, 1]],
    [new THREE.CylinderGeometry(0.015, 0.015, 0.14, 6), red, [-0.07, 0.32, 0.1]],
    [new THREE.CylinderGeometry(0.015, 0.015, 0.14, 6), red, [0.07, 0.32, 0.1]],
    [ball(0.045), '#ffffff', [-0.07, 0.4, 0.1]],
    [ball(0.045), '#ffffff', [0.07, 0.4, 0.1]],
    [ball(0.022), '#2b2233', [-0.07, 0.4, 0.14]],
    [ball(0.022), '#2b2233', [0.07, 0.4, 0.14]],
    [ball(0.08), red, [-0.3, 0.22, 0.12], [1, 0.8, 0.7]],
    [ball(0.08), red, [0.3, 0.22, 0.12], [1, 0.8, 0.7]],
    [ball(0.04), red, [-0.22, 0.06, -0.05], [2, 0.5, 0.6]],
    [ball(0.04), red, [0.22, 0.06, -0.05], [2, 0.5, 0.6]],
  ]);
  return g;
}

function fish(body: string, fin: string, stripes: boolean, round: boolean): THREE.Group {
  const parts: Part[] = [
    [ball(0.2), body, [0, 0.35, 0], round ? [1, 1, 1] : [0.7, 0.85, 1.3]],
    [new THREE.ConeGeometry(0.12, 0.18, 4), fin, [0, 0.35, -0.3]],
    [new THREE.ConeGeometry(0.06, 0.12, 4), fin, [0, 0.56, -0.02]],
    ...eyes(0.4, round ? 0.17 : 0.2, round ? 0.08 : 0.07),
  ];
  if (stripes) {
    parts.push([new THREE.TorusGeometry(0.15, 0.03, 6, 20), '#ffffff', [0, 0.35, 0.1]]);
    parts.push([new THREE.TorusGeometry(0.15, 0.03, 6, 20), '#ffffff', [0, 0.35, -0.1]]);
  }
  if (round) {
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const b = ((i % 3) - 1) * 0.6;
      parts.push([new THREE.ConeGeometry(0.025, 0.08, 4), '#e8d48c', [Math.cos(a) * 0.2 * Math.cos(b), 0.35 + Math.sin(b) * 0.2, Math.sin(a) * 0.2 * Math.cos(b)]]);
    }
  }
  const g = assemble(parts);
  const tail = g.children[1]!;
  tail.rotation.x = -Math.PI / 2;
  return g;
}

function whaleBaby(): THREE.Group {
  const blue = '#5aa9e6';
  const g = assemble([
    [ball(0.22), blue, [0, 0.3, 0], [1, 0.85, 1.35]],
    [ball(0.17), '#dff1ff', [0, 0.22, 0.08], [0.9, 0.5, 1.1]],
    [new THREE.ConeGeometry(0.12, 0.2, 4), blue, [0, 0.36, -0.36]],
    [ball(0.05), blue, [-0.2, 0.22, 0.05], [1.8, 0.4, 1]],
    [ball(0.05), blue, [0.2, 0.22, 0.05], [1.8, 0.4, 1]],
    ...eyes(0.36, 0.27, 0.11),
  ]);
  g.children[2]!.rotation.x = -Math.PI / 2;
  return g;
}

/** 3D model of a lost animal friend (standing on y=0, facing +z, ~0.6 tall). */
export function buildLostAnimal(id: LostAnimal): THREE.Group {
  switch (id) {
    case 'chick':
      return buildChick();
    case 'piglet':
      return piglet();
    case 'puppy':
      return puppy();
    case 'lamb':
      return lamb();
    case 'bunny-baby':
      return baby('bunny', '#f4f1ea');
    case 'kitten':
      return baby('cat', '#b8b8c8');
    case 'turtle':
      return turtle();
    case 'octopus':
      return octopus();
    case 'crab':
      return crab();
    case 'pufferfish':
      return fish('#f6d55c', '#f0a64a', false, true);
    case 'whale-baby':
      return whaleBaby();
    case 'clownfish':
      return fish('#ff8c2b', '#2b2233', true, false);
  }
}
