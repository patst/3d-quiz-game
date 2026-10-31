import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { Tile } from '../core/maze/types';
import { DIRECTIONS, sameTile } from '../core/maze/types';
import type { Avatar } from '../core/profile/profile';
import { createRng } from '../core/rng';
import type { MazeSession, SessionEvent } from '../core/session/mazeSession';
import type { WorldTheme } from '../modules/worlds/types';
import { buildAnimal, buildChick } from './avatars/animals';
import { buildChest } from './props';
import { disposeObject, OUTLINE_COLOR, toonMaterial } from './toon';

export interface MazeViewOptions {
  container: HTMLElement;
  session: MazeSession;
  avatar: Avatar;
  world: WorldTheme;
  onEvent: (event: SessionEvent) => void;
}

const WALK_SPEED = 3.2; // tiles per second
/** Hedge height: low enough that the camera always sees the avatar. */
const HEDGE_HEIGHT = 0.7;
const KEY_DIRS: Record<string, Tile> = {
  ArrowUp: DIRECTIONS[0]!,
  KeyW: DIRECTIONS[0]!,
  ArrowRight: DIRECTIONS[1]!,
  KeyD: DIRECTIONS[1]!,
  ArrowDown: DIRECTIONS[2]!,
  KeyS: DIRECTIONS[2]!,
  ArrowLeft: DIRECTIONS[3]!,
  KeyA: DIRECTIONS[3]!,
};

/**
 * Three.js presentation of one maze run: builds the scene, handles tap/keyboard input,
 * animates the avatar and reports tile arrivals to the (pure) MazeSession.
 * Tile (x, y) maps to world (x, 0, y).
 */
export class MazeView {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
  private readonly avatar: THREE.Group;
  private readonly chick: THREE.Group;
  private readonly marker: THREE.Mesh;
  private readonly clock = new THREE.Clock();
  private readonly raycaster = new THREE.Raycaster();
  private readonly groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private readonly resizeObserver: ResizeObserver;
  private readonly heldKeys: string[] = [];
  private path: Tile[] = [];
  private tile: Tile;
  private pointerDown: { x: number; y: number } | null = null;
  private elapsed = 0;
  private markerAge = Infinity;
  private disposed = false;
  private paused = false;
  private readonly chestViews = new Map<string, { root: THREE.Group; lid: THREE.Object3D; beacon: THREE.Object3D }>();

  constructor(private readonly opts: MazeViewOptions) {
    const { container, session, world } = opts;
    this.tile = session.position;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.style.touchAction = 'none';
    this.renderer.domElement.style.display = 'block';
    container.appendChild(this.renderer.domElement);

    this.scene.background = new THREE.Color(world.colors.sky);
    this.scene.fog = new THREE.Fog(world.colors.sky, 18, 40);
    this.buildLights();
    this.buildMaze();

    this.avatar = buildAnimal(opts.avatar);
    this.avatar.position.set(this.tile.x, 0, this.tile.y);
    this.scene.add(this.avatar);

    this.chick = buildChick();
    this.chick.position.set(session.maze.goal.x, 0, session.maze.goal.y);
    this.scene.add(this.chick);

    for (const chest of session.chests) {
      const root = buildChest();
      root.position.set(chest.tile.x, 0, chest.tile.y);
      root.rotation.y = this.chestFacing(chest.tile);
      this.scene.add(root);
      this.chestViews.set(chest.id, {
        root,
        lid: root.getObjectByName('lid')!,
        beacon: root.getObjectByName('beacon')!,
      });
    }

    this.marker = new THREE.Mesh(
      new THREE.RingGeometry(0.25, 0.38, 32),
      new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0 }),
    );
    this.marker.rotation.x = -Math.PI / 2;
    this.marker.position.y = 0.03;
    this.scene.add(this.marker);

    this.updateCamera(1);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.resize();

    const canvas = this.renderer.domElement;
    canvas.addEventListener('pointerdown', this.onPointerDown);
    canvas.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);

    this.publishTile();
    this.renderer.setAnimationLoop(() => this.frame());
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.renderer.setAnimationLoop(null);
    this.resizeObserver.disconnect();
    const canvas = this.renderer.domElement;
    canvas.removeEventListener('pointerdown', this.onPointerDown);
    canvas.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
    disposeObject(this.scene);
    this.renderer.dispose();
    canvas.remove();
  }

  /** Stops movement and input while a challenge dialog is open. */
  setPaused(paused: boolean): void {
    this.paused = paused;
    this.path = [];
    this.heldKeys.length = 0;
  }

  // ---------- scene ----------

  /** Chests face the open side of their (dead-end) tile. */
  private chestFacing(tile: Tile): number {
    const dir = DIRECTIONS.find((d) => this.opts.session.step(d, tile));
    return dir ? Math.atan2(dir.x, dir.y) : 0;
  }

  private buildLights(): void {
    this.scene.add(new THREE.HemisphereLight('#ffffff', '#6b8f4e', 1.6));
    const sun = new THREE.DirectionalLight('#ffffff', 2.2);
    const { width, height } = this.opts.session.maze;
    sun.position.set(width / 2 + 6, 14, height / 2 + 8);
    sun.target.position.set(width / 2, 0, height / 2);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    const half = Math.max(width, height) * 0.75;
    Object.assign(sun.shadow.camera, { left: -half, right: half, top: half, bottom: -half, near: 1, far: 50 });
    sun.shadow.bias = -0.002;
    this.scene.add(sun, sun.target);
  }

  private buildMaze(): void {
    const { maze } = this.opts.session;
    const { colors } = this.opts.world;
    const rng = createRng(maze.seed ^ 0x9e3779b9);

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), toonMaterial(colors.ground));
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(maze.width / 2, -0.01, maze.height / 2);
    ground.receiveShadow = true;
    this.scene.add(ground);

    const walls: Tile[] = [];
    const floors: Tile[] = [];
    for (let y = 0; y < maze.height; y++) {
      for (let x = 0; x < maze.width; x++) {
        (maze.tiles[y * maze.width + x] === 'wall' ? walls : floors).push({ x, y });
      }
    }

    // Path tiles.
    const pathMesh = new THREE.InstancedMesh(
      new RoundedBoxGeometry(0.96, 0.06, 0.96, 2, 0.03),
      toonMaterial(colors.path),
      floors.length,
    );
    pathMesh.receiveShadow = true;
    const m = new THREE.Matrix4();
    floors.forEach((t, i) => pathMesh.setMatrixAt(i, m.makeTranslation(t.x, 0.0, t.y)));
    this.scene.add(pathMesh);

    // Hedges with outline hull.
    const hedgeGeo = new RoundedBoxGeometry(1, HEDGE_HEIGHT, 1, 3, 0.16);
    const hedges = new THREE.InstancedMesh(hedgeGeo, toonMaterial(colors.wall), walls.length);
    const hedgeOutline = new THREE.InstancedMesh(
      hedgeGeo,
      new THREE.MeshBasicMaterial({ color: OUTLINE_COLOR, side: THREE.BackSide }),
      walls.length,
    );
    hedgeOutline.userData.isOutline = true;
    hedges.castShadow = true;
    hedges.receiveShadow = true;
    const scale = new THREE.Matrix4();
    walls.forEach((t, i) => {
      const h = 0.92 + rng.next() * 0.16;
      m.makeTranslation(t.x, (HEDGE_HEIGHT * h) / 2, t.y).multiply(scale.makeScale(1, h, 1));
      hedges.setMatrixAt(i, m);
      m.makeTranslation(t.x, (HEDGE_HEIGHT * h) / 2, t.y).multiply(scale.makeScale(1.04, h * 1.03, 1.04));
      hedgeOutline.setMatrixAt(i, m);
    });
    this.scene.add(hedges, hedgeOutline);

    // Flowers on hedges.
    const flowerTiles = walls.filter(() => rng.next() < 0.3);
    const flowers = new THREE.InstancedMesh(new THREE.SphereGeometry(0.09, 10, 8), toonMaterial('#ffffff'), flowerTiles.length);
    flowerTiles.forEach((t, i) => {
      m.makeTranslation(t.x + (rng.next() - 0.5) * 0.6, HEDGE_HEIGHT + 0.08, t.y + (rng.next() - 0.5) * 0.6);
      flowers.setMatrixAt(i, m);
      flowers.setColorAt(i, new THREE.Color(rng.pick(colors.decorations)));
    });
    this.scene.add(flowers);

    // Goal glow ring.
    const ring = new THREE.Mesh(
      new THREE.CircleGeometry(0.45, 32),
      new THREE.MeshBasicMaterial({ color: '#fff3a0', transparent: true, opacity: 0.8 }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(maze.goal.x, 0.04, maze.goal.y);
    this.scene.add(ring);
  }

  // ---------- input ----------

  private onPointerDown = (e: PointerEvent) => {
    this.pointerDown = { x: e.clientX, y: e.clientY };
  };

  private onPointerUp = (e: PointerEvent) => {
    const down = this.pointerDown;
    this.pointerDown = null;
    if (this.paused || !down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 20) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );
    this.raycaster.setFromCamera(ndc, this.camera);
    const hit = new THREE.Vector3();
    if (!this.raycaster.ray.intersectPlane(this.groundPlane, hit)) return;
    const target = { x: Math.round(hit.x), y: Math.round(hit.z) };
    const from = this.path[0] ?? this.tile;
    const path = this.opts.session.pathTo(target, from);
    if (!path) return;
    // Keep moving to the tile we are heading to, then follow the new path.
    this.path = this.path.length > 0 ? [from, ...path.slice(1)] : path.slice(1);
    const end = path[path.length - 1]!;
    this.marker.position.x = end.x;
    this.marker.position.z = end.y;
    this.markerAge = 0;
  };

  private onKeyDown = (e: KeyboardEvent) => {
    if (!(e.code in KEY_DIRS)) return;
    e.preventDefault();
    if (this.paused) return;
    if (!this.heldKeys.includes(e.code)) this.heldKeys.push(e.code);
    // Keyboard overrides a tap path once the current step is done.
    if (this.path.length > 1) this.path = this.path.slice(0, 1);
    // A short key tap always moves one tile, even if released before the next frame.
    if (this.path.length === 0 && !e.repeat) {
      const next = this.opts.session.step(KEY_DIRS[e.code]!, this.tile);
      if (next) this.path = [next];
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    const i = this.heldKeys.indexOf(e.code);
    if (i >= 0) this.heldKeys.splice(i, 1);
  };

  private onBlur = () => {
    this.heldKeys.length = 0;
  };

  // ---------- loop ----------

  private frame(): void {
    const dt = Math.min(this.clock.getDelta(), 0.1);
    this.elapsed += dt;
    this.updateMovement(dt);
    this.updateCamera(dt);

    this.chick.position.y = Math.abs(Math.sin(this.elapsed * 4)) * 0.12;
    this.chick.rotation.y = Math.sin(this.elapsed * 1.5) * 0.6;
    this.animateChests(dt);

    this.markerAge += dt;
    const markerMat = this.marker.material as THREE.MeshBasicMaterial;
    markerMat.opacity = Math.max(0, 0.9 - this.markerAge * 1.2);
    this.marker.scale.setScalar(1 + this.markerAge * 0.6);

    this.renderer.render(this.scene, this.camera);
  }

  private updateMovement(dt: number): void {
    if (this.path.length === 0) {
      const key = this.heldKeys[this.heldKeys.length - 1];
      const dir = key ? KEY_DIRS[key] : undefined;
      const next = dir ? this.opts.session.step(dir, this.tile) : null;
      if (next) this.path = [next];
    }

    const next = this.path[0];
    if (!next) {
      this.avatar.position.y = 0;
      return;
    }
    const target = new THREE.Vector3(next.x, 0, next.y);
    const pos = this.avatar.position;
    const flat = new THREE.Vector3(pos.x, 0, pos.z);
    const delta = target.clone().sub(flat);
    const dist = delta.length();
    const stepLen = WALK_SPEED * dt;

    if (dist > 0.001) {
      const targetYaw = Math.atan2(delta.x, delta.z);
      this.avatar.rotation.y = lerpAngle(this.avatar.rotation.y, targetYaw, Math.min(1, dt * 14));
    }
    if (dist <= stepLen) {
      pos.set(target.x, 0, target.z);
      this.path.shift();
      if (!sameTile(next, this.tile)) {
        this.tile = next;
        this.publishTile();
        for (const ev of this.opts.session.arrive(next)) {
          if (ev.type === 'goalReached' || ev.type === 'chestReached') {
            this.path = [];
            this.heldKeys.length = 0;
          }
          this.opts.onEvent(ev);
        }
      }
    } else {
      flat.addScaledVector(delta.normalize(), stepLen);
      pos.set(flat.x, Math.abs(Math.sin(this.elapsed * 14)) * 0.08, flat.z);
    }
  }

  private animateChests(dt: number): void {
    for (const chest of this.opts.session.chests) {
      const view = this.chestViews.get(chest.id);
      if (!view) continue;
      const solved = chest.state === 'solved';
      const targetLid = solved ? -1.8 : 0;
      view.lid.rotation.x += (targetLid - view.lid.rotation.x) * Math.min(1, dt * 5);
      view.beacon.visible = !solved;
      view.beacon.position.y = 1.0 + Math.sin(this.elapsed * 3 + view.root.position.x) * 0.08;
      view.beacon.rotation.y += dt * 1.5;
    }
  }

  private updateCamera(dt: number): void {
    const aspect = this.camera.aspect;
    // Steep, diorama-like view; portrait screens need more distance to show enough maze.
    const zoom = aspect < 0.8 ? 1.45 : aspect < 1.2 ? 1.2 : 1;
    const offset = new THREE.Vector3(0, 9 * zoom, 4.2 * zoom);
    const desired = this.avatar.position.clone().setY(0).add(offset);
    this.camera.position.lerp(desired, Math.min(1, dt * 4));
    const look = this.avatar.position.clone().setY(0.4);
    this.camera.lookAt(look);
  }

  private resize(): void {
    const { clientWidth: w, clientHeight: h } = this.opts.container;
    if (w === 0 || h === 0) return;
    this.renderer.setSize(w, h, false);
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  /** Exposes the avatar tile on the container (used by E2E tests and debugging). */
  private publishTile(): void {
    this.opts.container.dataset.avatarTile = `${this.tile.x},${this.tile.y}`;
  }
}

function lerpAngle(a: number, b: number, t: number): number {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return a + d * t;
}
