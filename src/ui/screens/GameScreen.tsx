import { useEffect, useMemo, useRef, useState } from 'react';
import { speech } from '../../audio/speech';
import { de } from '../../content/de/strings';
import { generateMaze } from '../../core/maze/generate';
import { findPath } from '../../core/maze/pathfinding';
import type { Tile } from '../../core/maze/types';
import type { Profile } from '../../core/profile/profile';
import { createRng, randomSeed } from '../../core/rng';
import { rewardOffer } from '../../core/rewards/rewards';
import { isLostAnimal, nextLostAnimal, type LostAnimal } from '../../core/profile/lostAnimals';
import { lostAnimalIcons } from '../lostAnimalIcons';
import { rewardCatalog } from '../../modules/rewards/catalog';
import { RewardPicker } from '../rewards/RewardPicker';
import { StarJar } from '../rewards/StarJar';
import { Wardrobe } from '../rewards/Wardrobe';
import { MazeSession, type Chest } from '../../core/session/mazeSession';
import { planChests, type ChallengeOutcome } from '../../core/skills/skillModel';
import { getChallengeType } from '../../modules/challenges';
import { getWorld } from '../../modules/worlds';
import { MazeView } from '../../render/MazeView';
import { ChallengeDialog } from '../challenges/ChallengeDialog';

interface Props {
  profile: Profile;
  onHome: () => void;
  onStars: (stars: number) => void;
  onMazeCompleted: () => void;
  onChooseReward: (itemId: string | null) => void;
  onToggleEquip: (itemId: string) => void;
  onRescue: (animal: LostAnimal) => void;
  onChallengeResult: (typeId: string, level: number, outcome: ChallengeOutcome) => void;
  onSetPet: (animal: LostAnimal | null) => void;
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

export function GameScreen({
  profile,
  onHome,
  onStars,
  onMazeCompleted,
  onChooseReward,
  onToggleEquip,
  onRescue,
  onSetPet,
  onChallengeResult,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<MazeSession | null>(null);
  const viewRef = useRef<MazeView | null>(null);
  const [round, setRound] = useState(0);
  const [goalStars, setGoalStars] = useState<number | null>(null);
  const [openChest, setOpenChest] = useState<{ chest: Chest; visit: number } | null>(null);
  const [wardrobeOpen, setWardrobeOpen] = useState(false);
  const equippedRef = useRef(profile.equipped);
  const rescuedRef = useRef(profile.rescued);
  const skillsRef = useRef(profile.skills);
  const disabledRef = useRef(profile.disabledChallenges);
  useEffect(() => {
    disabledRef.current = profile.disabledChallenges;
  }, [profile.disabledChallenges]);
  useEffect(() => {
    skillsRef.current = profile.skills;
  }, [profile.skills]);
  const pet = profile.pet && isLostAnimal(profile.pet) ? profile.pet : null;
  const petRef = useRef(pet);
  const [lostAnimal, setLostAnimal] = useState<LostAnimal>('chick');
  const callbacks = useRef({ onStars, onMazeCompleted, onRescue });
  useEffect(() => {
    callbacks.current = { onStars, onMazeCompleted, onRescue };
  }, [onStars, onMazeCompleted, onRescue]);
  useEffect(() => {
    rescuedRef.current = profile.rescued;
  }, [profile.rescued]);
  useEffect(() => {
    petRef.current = pet;
    viewRef.current?.setPet(pet);
  }, [pet]);

  // Outfit changes are applied to the running maze (no rebuild).
  useEffect(() => {
    equippedRef.current = profile.equipped;
    viewRef.current?.setEquipped(profile.equipped);
  }, [profile.equipped]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const world = getWorld('forest');
    const forced = seedFromUrl();
    const seed = forced !== null ? forced + round : randomSeed();
    const animal = nextLostAnimal(rescuedRef.current, createRng(seed));
    setLostAnimal(animal);
    // ?challenge=<typeId> puts only that type into the chests (review / E2E tests).
    const only = new URLSearchParams(window.location.search).get('challenge');
    const enabled = world.chests.challenges.filter((c) => !disabledRef.current.includes(c.typeId));
    const allowed = (enabled.length > 0 ? enabled : world.chests.challenges).filter((c) => !only || c.typeId === only);
    const chests = planChests(
      createRng(seed ^ 0x2545f491),
      (allowed.length > 0 ? allowed : world.chests.challenges).map((c) => ({
        type: getChallengeType(c.typeId),
        startLevel: c.startLevel,
      })),
      skillsRef.current,
      world.chests.count,
    );
    const session = new MazeSession(generateMaze({ ...world.maze, seed }), { chests });
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
      equipped: equippedRef.current,
      lostAnimal: animal,
      pet: petRef.current,
      onEvent: (ev) => {
        if (ev.type === 'chestReached') {
          view.setPaused(true);
          setOpenChest({ chest: session.chest(ev.chestId), visit: ++visits });
        } else if (ev.type === 'goalReached') {
          setGoalStars(session.starsEarned);
          speech().speak(de.lostAnimals[animal].speakGoal);
          callbacks.current.onRescue(animal);
          callbacks.current.onMazeCompleted();
        }
      },
    });
    viewRef.current = view;
    speech().speak(de.lostAnimals[animal].speakStart);
    return () => {
      view.dispose();
      viewRef.current = null;
      sessionRef.current = null;
      speech().stop();
    };
  }, [profile.avatar, round]);

  const closeChest = () => setOpenChest(null);

  // A full star jar waits until no other dialog is open.
  const showPicker = profile.pendingRewards > 0 && !openChest && goalStars === null && !wardrobeOpen;
  const offer = useMemo(
    () => rewardOffer(rewardCatalog, profile.inventory, createRng(profile.inventory.length * 7919 + profile.stars)),
    [profile.inventory, profile.stars],
  );

  const blocked = Boolean(openChest) || showPicker || wardrobeOpen || goalStars !== null;
  useEffect(() => {
    viewRef.current?.setPaused(blocked);
  }, [blocked]);

  return (
    <main className="screen game-screen">
      <div className="game-canvas" ref={containerRef} data-testid="game-canvas" />
      <div className="hud">
        <button className="round-button" aria-label={de.game.home} onClick={onHome}>
          🏠
        </button>
        <button className="guide-bubble" onClick={() => speech().speak(de.lostAnimals[lostAnimal].speakStart)}>
          <span aria-hidden>🦉</span> {de.lostAnimals[lostAnimal].hint}
        </button>
        <div className="hud-right">
          <StarJar jar={profile.jar} />
          <button className="round-button" aria-label={de.rewards.wardrobe} data-testid="wardrobe-button" onClick={() => setWardrobeOpen(true)}>
            🎒
          </button>
        </div>
      </div>

      {openChest && (
        <ChallengeDialog
          key={`${openChest.chest.id}-${openChest.visit}`}
          chest={openChest.chest}
          onSolved={(stars, outcome) => {
            const { challenge } = openChest.chest;
            sessionRef.current?.solveChest(openChest.chest.id, stars);
            onChallengeResult(challenge.typeId, challenge.level, outcome);
            callbacks.current.onStars(stars);
            closeChest();
          }}
          onSkip={() => {
            const { challenge } = openChest.chest;
            sessionRef.current?.skipChest(openChest.chest.id);
            onChallengeResult(challenge.typeId, challenge.level, { kind: 'skipped' });
            closeChest();
          }}
        />
      )}

      {showPicker && <RewardPicker offer={offer} onChoose={onChooseReward} />}

      {wardrobeOpen && (
        <Wardrobe profile={profile} onToggle={onToggleEquip} onSetPet={onSetPet} onClose={() => setWardrobeOpen(false)} />
      )}

      {goalStars !== null && (
        <div className="overlay" role="dialog" aria-modal>
          <div className="dialog">
            <div className="dialog-icon" aria-hidden>
              {lostAnimalIcons[lostAnimal]}
            </div>
            <h2>{de.game.goalTitle}</h2>
            <p>{de.lostAnimals[lostAnimal].goalText}</p>
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
