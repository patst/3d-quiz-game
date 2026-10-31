import { useEffect, useRef, useState } from 'react';
import { speech } from '../../audio/speech';
import { de } from '../../content/de/strings';
import { generateMaze } from '../../core/maze/generate';
import { findPath } from '../../core/maze/pathfinding';
import type { Tile } from '../../core/maze/types';
import type { Profile } from '../../core/profile/profile';
import { randomSeed } from '../../core/rng';
import { MazeSession, type Chest } from '../../core/session/mazeSession';
import { getChallengeType } from '../../modules/challenges';
import { getWorld } from '../../modules/worlds';
import { MazeView } from '../../render/MazeView';
import { ChallengeDialog } from '../challenges/ChallengeDialog';

interface Props {
  profile: Profile;
  onHome: () => void;
  onStars: (stars: number) => void;
  onMazeCompleted: () => void;
}

/** Seed can be forced via ?seed=123 (reproducible bug reports / E2E tests). */
function seedFromUrl(): number | null {
  const v = new URLSearchParams(window.location.search).get('seed');
  return v && /^\d+$/.test(v) ? Number(v) : null;
}

/** Arrow-key route as a string of U/R/D/L (test hook only). */
function route(path: Tile[]): string {
  return path
    .slice(1)
    .map((t, i) => {
      const p = path[i]!;
      return t.x > p.x ? 'R' : t.x < p.x ? 'L' : t.y > p.y ? 'D' : 'U';
    })
    .join('');
}

export function GameScreen({ profile, onHome, onStars, onMazeCompleted }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<MazeSession | null>(null);
  const viewRef = useRef<MazeView | null>(null);
  const [round, setRound] = useState(0);
  const [goalStars, setGoalStars] = useState<number | null>(null);
  const [openChest, setOpenChest] = useState<{ chest: Chest; visit: number } | null>(null);
  const callbacks = useRef({ onStars, onMazeCompleted });
  useEffect(() => {
    callbacks.current = { onStars, onMazeCompleted };
  }, [onStars, onMazeCompleted]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const world = getWorld('forest');
    const forced = seedFromUrl();
    const seed = forced !== null ? forced + round : randomSeed();
    const session = new MazeSession(generateMaze({ ...world.maze, seed }), {
      count: world.chests.count,
      stars: world.chests.stars,
      challenges: world.chests.challenges.map((c) => ({ type: getChallengeType(c.typeId), level: c.level })),
    });
    sessionRef.current = session;
    container.dataset.goalTile = `${session.maze.goal.x},${session.maze.goal.y}`;
    if (forced !== null && session.chests.length > 0) {
      // Route to the nearest chest (no other chest can lie on it).
      const paths = session.chests.map((c) => findPath(session.maze, session.maze.start, c.tile) ?? []);
      const nearest = paths.reduce((a, b) => (b.length < a.length ? b : a));
      container.dataset.testRouteChest = route(nearest);
    }
    if (forced !== null) {
      container.dataset.testRouteGoal = route(findPath(session.maze, session.maze.start, session.maze.goal) ?? []);
    }
    let visits = 0;
    const view = new MazeView({
      container,
      session,
      world,
      avatar: profile.avatar,
      onEvent: (ev) => {
        if (ev.type === 'chestReached') {
          view.setPaused(true);
          setOpenChest({ chest: session.chest(ev.chestId), visit: ++visits });
        } else if (ev.type === 'goalReached') {
          setGoalStars(session.starsEarned);
          speech().speak(de.game.speakGoal);
          callbacks.current.onMazeCompleted();
        }
      },
    });
    viewRef.current = view;
    speech().speak(de.game.speakStart);
    return () => {
      view.dispose();
      viewRef.current = null;
      sessionRef.current = null;
      speech().stop();
    };
  }, [profile.avatar, round]);

  const closeChest = () => {
    setOpenChest(null);
    viewRef.current?.setPaused(false);
  };

  return (
    <main className="screen game-screen">
      <div className="game-canvas" ref={containerRef} data-testid="game-canvas" />
      <div className="hud">
        <button className="round-button" aria-label={de.game.home} onClick={onHome}>
          🏠
        </button>
        <button className="guide-bubble" onClick={() => speech().speak(de.game.speakStart)}>
          <span aria-hidden>🦉</span> {de.game.hint}
        </button>
        <div className="star-counter" data-testid="star-counter" aria-label={de.game.starsTotal(profile.stars)}>
          <span aria-hidden>⭐</span> <span key={profile.stars} className="star-count">{profile.stars}</span>
        </div>
      </div>

      {openChest && (
        <ChallengeDialog
          key={`${openChest.chest.id}-${openChest.visit}`}
          chest={openChest.chest}
          onSolved={(stars) => {
            sessionRef.current?.solveChest(openChest.chest.id, stars);
            callbacks.current.onStars(stars);
            closeChest();
          }}
          onSkip={() => {
            sessionRef.current?.skipChest(openChest.chest.id);
            closeChest();
          }}
        />
      )}

      {goalStars !== null && (
        <div className="overlay" role="dialog" aria-modal>
          <div className="dialog">
            <div className="dialog-icon" aria-hidden>
              🐥
            </div>
            <h2>{de.game.goalTitle}</h2>
            <p>{de.game.goalText}</p>
            <p className="stars-won">⭐ {de.game.goalStars(goalStars)}</p>
            <div className="button-row">
              <button className="button secondary" aria-label={de.game.home} onClick={onHome}>
                🏠
              </button>
              <button
                className="button primary"
                onClick={() => {
                  setGoalStars(null);
                  setRound((r) => r + 1);
                }}
              >
                {de.game.nextMaze}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
