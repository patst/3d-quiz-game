import { directWalkPath, type DirectWalkOptions } from '../maze/pathfinding';
import { isFloor, sameTile, type Maze, type Tile } from '../maze/types';

export type SessionEvent = { type: 'goalReached' };

/**
 * Tap-to-walk limits (game-design §5): roughly what is visible around the avatar, and
 * no walking around hedges — the child has to find the way through the maze.
 */
export const TAP_WALK: DirectWalkOptions = { maxSteps: 6, maxDetour: 0 };

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

  /**
   * Path for a tap/click on any tile. The avatar walks only a short, direct way towards
   * the tapped spot (see TAP_WALK) — it never solves the maze on its own.
   */
  pathTo(target: Tile, from: Tile = this.current): Tile[] | null {
    if (this.finished) return null;
    return directWalkPath(this.maze, from, target, TAP_WALK);
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
