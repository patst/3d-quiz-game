import * as THREE from 'three';
import { starGeometry } from './props';

interface Particle {
  mesh: THREE.Mesh;
  age: number;
  life: number;
  velocity: THREE.Vector3;
}

const RAINBOW = ['#ff595e', '#ff924c', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93'];

/**
 * Little particles behind the walking avatar for "trail" rewards (sparkles, hearts,
 * bubbles, rainbow). Pooled meshes, cheap enough for phones.
 */
export class TrailEmitter {
  private readonly particles: Particle[] = [];
  private readonly geometries: Record<string, THREE.BufferGeometry>;
  private sinceSpawn = 0;
  private colorIndex = 0;

  constructor(
    private readonly scene: THREE.Scene,
    private kind: string | undefined,
  ) {
    const heart = new THREE.Shape();
    heart.moveTo(0, -0.06);
    heart.bezierCurveTo(0.07, -0.01, 0.055, 0.06, 0, 0.027);
    heart.bezierCurveTo(-0.055, 0.06, -0.07, -0.01, 0, -0.06);
    this.geometries = {
      sparkles: starGeometry(0.07, 0.03, 0.01),
      hearts: new THREE.ShapeGeometry(heart),
      bubbles: new THREE.SphereGeometry(0.06, 10, 8),
      rainbow: new THREE.SphereGeometry(0.05, 8, 6),
    };
  }

  setKind(kind: string | undefined): void {
    this.kind = kind;
  }

  update(dt: number, at: THREE.Vector3, moving: boolean): void {
    this.sinceSpawn += dt;
    if (this.kind && moving && this.sinceSpawn > 0.07) {
      this.sinceSpawn = 0;
      this.spawn(this.kind, at);
    }
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]!;
      p.age += dt;
      const t = p.age / p.life;
      if (t >= 1) {
        this.scene.remove(p.mesh);
        (p.mesh.material as THREE.Material).dispose();
        this.particles.splice(i, 1);
        continue;
      }
      p.mesh.position.addScaledVector(p.velocity, dt);
      (p.mesh.material as THREE.MeshBasicMaterial).opacity = 1 - t;
      p.mesh.scale.setScalar(this.kind === 'bubbles' ? 1 + t : 1 - t * 0.5);
      p.mesh.rotation.y += dt * 3;
    }
  }

  dispose(): void {
    for (const p of this.particles) {
      this.scene.remove(p.mesh);
      (p.mesh.material as THREE.Material).dispose();
    }
    this.particles.length = 0;
    for (const g of Object.values(this.geometries)) g.dispose();
  }

  private spawn(kind: string, at: THREE.Vector3): void {
    const geo = this.geometries[kind];
    if (!geo) return;
    const color =
      kind === 'sparkles' ? '#ffe066' : kind === 'hearts' ? '#ff4d8d' : kind === 'bubbles' ? '#bde0fe' : RAINBOW[this.colorIndex++ % RAINBOW.length]!;
    const mesh = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({ color, transparent: true, side: THREE.DoubleSide, depthWrite: false }),
    );
    mesh.position.set(at.x + (Math.random() - 0.5) * 0.3, 0.15 + Math.random() * 0.3, at.z + (Math.random() - 0.5) * 0.3);
    this.scene.add(mesh);
    this.particles.push({
      mesh,
      age: 0,
      life: kind === 'rainbow' ? 0.9 : 1.2,
      velocity: new THREE.Vector3(0, kind === 'rainbow' ? 0.05 : 0.4, 0),
    });
  }
}
