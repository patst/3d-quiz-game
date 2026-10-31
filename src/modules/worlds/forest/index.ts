import type { WorldTheme } from '../types';

/** v1 world: "Zauberwald" hedge maze (game-design §3). */
export const forestWorld: WorldTheme = {
  id: 'forest',
  maze: { cols: 5, rows: 5, braid: 0.35 },
  chests: {
    count: 3,
    challenges: [
      { typeId: 'math.count', startLevel: 2 }, // 1–10 objects
      { typeId: 'math.find-number', startLevel: 1 }, // 1–10
      { typeId: 'math.compare', startLevel: 1 }, // 1–5, clear difference
      { typeId: 'math.addition', startLevel: 1 }, // sum ≤ 5 with pictures
      { typeId: 'math.subtraction', startLevel: 1 }, // ≤ 5 with pictures
      { typeId: 'math.pattern', startLevel: 1 }, // AB AB
    ],
  },
  colors: {
    sky: '#bfe8ff',
    ground: '#7fcf5f',
    path: '#f3dfa8',
    wall: '#3f9d4a',
    wallTop: '#55b85c',
    decorations: ['#ff6b8b', '#ffd93d', '#ffffff', '#b38cff', '#ff9f43'],
  },
};
