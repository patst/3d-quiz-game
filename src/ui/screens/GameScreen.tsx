import { useEffect, useRef, useState } from 'react';
import { speech } from '../../audio/speech';
import { de } from '../../content/de/strings';
import { generateMaze } from '../../core/maze/generate';
import type { Profile } from '../../core/profile/profile';
import { randomSeed } from '../../core/rng';
import { MazeSession } from '../../core/session/mazeSession';
import { getWorld } from '../../modules/worlds';
import { MazeView } from '../../render/MazeView';

interface Props {
  profile: Profile;
  onHome: () => void;
  onMazeCompleted: () => void;
}

/** Seed can be forced via ?seed=123 (reproducible bug reports / E2E tests). */
function seedFromUrl(): number | null {
  const v = new URLSearchParams(window.location.search).get('seed');
  return v && /^\d+$/.test(v) ? Number(v) : null;
}

export function GameScreen({ profile, onHome, onMazeCompleted }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [round, setRound] = useState(0);
  const [won, setWon] = useState(false);
  const onCompletedRef = useRef(onMazeCompleted);
  useEffect(() => {
    onCompletedRef.current = onMazeCompleted;
  }, [onMazeCompleted]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const world = getWorld('forest');
    const forced = seedFromUrl();
    const seed = forced !== null ? forced + round : randomSeed();
    const session = new MazeSession(generateMaze({ ...world.maze, seed }));
    container.dataset.goalTile = `${session.maze.goal.x},${session.maze.goal.y}`;
    const view = new MazeView({
      container,
      session,
      world,
      avatar: profile.avatar,
      onEvent: (ev) => {
        if (ev.type === 'goalReached') {
          setWon(true);
          speech().speak(de.game.speakGoal);
          onCompletedRef.current();
        }
      },
    });
    speech().speak(de.game.speakStart);
    return () => {
      view.dispose();
      speech().stop();
    };
  }, [profile.avatar, round]);

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
      </div>
      {won && (
        <div className="overlay" role="dialog" aria-modal>
          <div className="dialog">
            <div className="dialog-icon" aria-hidden>
              🐥
            </div>
            <h2>{de.game.goalTitle}</h2>
            <p>{de.game.goalText}</p>
            <div className="button-row">
              <button className="button secondary" onClick={onHome}>
                🏠
              </button>
              <button
                className="button primary"
                onClick={() => {
                  setWon(false);
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
