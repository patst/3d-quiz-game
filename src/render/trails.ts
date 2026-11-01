import * as THREE from 'three';
import { starGeometry } from './props';

interface Particle {
  mesh: THREE.Object3D;
  materials: THREE.MeshBasicMaterial[];
  age: number;
  life: number;
  velocity: THREE.Vector3;
  flat: boolean;
  baseScale: number;
}

const RAINBOW = ['#ff595e', '#ff924c', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'];

function heartShape(size: number): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(0, -size);
  s.bezierCurveTo(size * 1.25, -size * 0.15, size * 0.95, size * 1.05, 0, size * 0.45);
  s.bezierCurveTo(-size * 0.95, size * 1.05, -size * 1.25, -size * 0.15, 0, -size);
  return s;
}

/**
 * Little particles behind the walking avatar for "trail" rewards (sparkles, hearts,
 * bubbles, rainbow). Flat shapes always face the camera and get a white border so they
 * stay visible on grass and path (owner feedback: hearts were hard to see).
 */
export class TrailEmitter {
  private readonly particles: Particle[] = [];
  private readonly geometries: Record<string, { fill: THREE.BufferGeometry; border?: THREE.BufferGeometry }>;
  private sinceSpawn = 0;
  private colorIndex = 0;

  constructor(
    private readonly scene: THREE.Scene,
    private kind: string | undefined,
    private readonly camera: THREE.Camera,
  ) {
    this.geometries = {
      sparkles: { fill: starGeometry(0.13, 0.055, 0.01), border: starGeometry(0.17, 0.08, 0.005) },
      hearts: { fill: new THREE.ShapeGeometry(heartShape(0.12)), border: new THREE.ShapeGeometry(heartShape(0.16)) },
      bubbles: { fill: new THREE.SphereGeometry(0.08, 12, 10) },
      rainbow: { fill: new THREE.SphereGeometry(0.07, 10, 8) },
    };
    // Shape geometries are centred around the origin for nicer billboarding.
    for (const g of Object.values(this.geometries)) {
      g.fill.center();
      g.border?.center();
    }
  }

  setKind(kind: string | undefined): void {
    this.kind = kind;
  }

  update(dt: number, at: THREE.Vector3, moving: boolean): void {
    this.sinceSpawn += dt;
    const interval = moving ? 0.08 : 0.45;
    if (this.kind && this.sinceSpawn > interval) {
      this.sinceSpawn = 0;
      this.spawn(this.kind, at);
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]!;
      p.age += dt;
      const t = p.age / p.life;
      if (t >= 1) {
        this.remove(p);
        this.particles.splice(i, 1);
        continue;
      }
      p.mesh.position.addScaledVector(p.velocity, dt);
      // Fade out only in the last third, so the trail stays clearly visible.
      const opacity = t < 0.66 ? 1 : 1 - (t - 0.66) / 0.34;
      for (const m of p.materials) m.opacity = opacity;
      const grow = this.kind === 'bubbles' ? 1 + t * 0.8 : 1 + Math.sin(t * Math.PI) * 0.25;
      p.mesh.scale.setScalar(p.baseScale * grow);
      if (p.flat) p.mesh.quaternion.copy(this.camera.quaternion);
    }
  }

  dispose(): void {
    for (const p of this.particles) this.remove(p);
    this.particles.length = 0;
    for (const g of Object.values(this.geometries)) {
      g.fill.dispose();
      g.border?.dispose();
    }
  }

  private remove(p: Particle): void {
    this.scene.remove(p.mesh);
    for (const m of p.materials) m.dispose();
  }

  private spawn(kind: string, at: THREE.Vector3): void {
    const geo = this.geometries[kind];
    if (!geo) return;
    const color =
      kind === 'sparkles' ? '#ffd60a' : kind === 'hearts' ? '#ff2d6f' : kind === 'bubbles' ? '#a8dcff' : RAINBOW[this.colorIndex++ % RAINBOW.length]!;
    const material = (c: string, order: number) => {
      const m = new THREE.MeshBasicMaterial({
        color: c,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        opacity: kind === 'bubbles' ? 0.85 : 1,
      });
      m.userData.order = order;
      return m;
    };
    const group = new THREE.Group();
    const materials: THREE.MeshBasicMaterial[] = [];
    if (geo.border) {
      const borderMat = material('#ffffff', 0);
      const border = new THREE.Mesh(geo.border, borderMat);
      border.renderOrder = 10;
      group.add(border);
      materials.push(borderMat);
    }
    const fillMat = material(color, 1);
    const fill = new THREE.Mesh(geo.fill, fillMat);
    fill.renderOrder = 11;
    fill.position.z = 0.002;
    group.add(fill);
    materials.push(fillMat);

    group.position.set(at.x + (Math.random() - 0.5) * 0.35, 0.25 + Math.random() * 0.35, at.z + (Math.random() - 0.5) * 0.35);
    group.quaternion.copy(this.camera.quaternion);
    this.scene.add(group);
    const flat = kind === 'sparkles' || kind === 'hearts';
    this.particles.push({
      mesh: group,
      materials,
      age: 0,
      life: kind === 'rainbow' ? 1.2 : 1.7,
      velocity: new THREE.Vector3((Math.random() - 0.5) * 0.15, kind === 'rainbow' ? 0.08 : 0.45, 0),
      flat,
      baseScale: 1,
    });
  }
}
