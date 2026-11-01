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
  }
}
