import { findPath, nearestFloor } from '../maze/pathfinding';
import { isFloor, sameTile, type Maze, type Tile } from '../maze/types';

export type SessionEvent = { type: 'goalReached' };

/**
 * Rules of one maze run, independent of rendering.
 * The renderer asks for paths and reports when the avatar arrives on a tile.
 */
export class MazeSession {
  private current: Tile;
  private finished = false;

  constructor(readonly maze: Maze) {
    this.current = maze.start;
  }

  get position(): Tile {
    return this.current;
  }

  get isFinished(): boolean {
    return this.finished;
  }

  /** Path for a tap/click on any tile (walls snap to the nearest floor). */
  pathTo(target: Tile, from: Tile = this.current): Tile[] | null {
    if (this.finished) return null;
    const goal = isFloor(this.maze, target) ? target : nearestFloor(this.maze, target);
    return goal ? findPath(this.maze, from, goal) : null;
  }

  /** One step in a direction (keyboard), or null if blocked. */
  step(dir: Tile, from: Tile = this.current): Tile | null {
    if (this.finished) return null;
    const next = { x: from.x + dir.x, y: from.y + dir.y };
    return isFloor(this.maze, next) ? next : null;
  }

  /** Called by the renderer whenever the avatar is centred on a tile. */
  arrive(tile: Tile): SessionEvent[] {
    if (this.finished) return [];
    this.current = tile;
    if (sameTile(tile, this.maze.goal)) {
      this.finished = true;
      return [{ type: 'goalReached' }];
    }
    return [];
  }
}
