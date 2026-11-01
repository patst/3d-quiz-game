import { SEA_ANIMALS } from '../../../core/profile/lostAnimals';
import { forestWorld } from '../forest';
import type { WorldTheme } from '../types';

/** World 2: "Unterwasserwelt" coral maze with guide Ida (roadmap M9). */
export const underwaterWorld: WorldTheme = {
  id: 'underwater',
  guide: 'ida',
  lostAnimals: SEA_ANIMALS,
  unlock: { world: 'forest', mazes: 3 },
  style: 'coral',
  maze: { braid: 0.4 },
  // Same challenges; the child's skill levels carry over between worlds.
  chests: forestWorld.chests,
  colors: {
    card: '#1d7fb8',
    sky: '#2a8cc4',
    ground: '#d8c99a',
    path: '#f6e6bd',
    wall: '#ff7f6e',
    wallVariants: ['#ff7f6e', '#ff9fc4', '#b58cff', '#ffb347', '#5fd3c6', '#ff6f91'],
    wallTop: '#ffb3a7',
    decorations: ['#2bb673', '#4fd18b', '#1e9e62'],
  },
};
