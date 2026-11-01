import { useState } from 'react';

const COLORS = ['#ff595e', '#ffca3a', '#8ac926', '#1982c4', '#6a4c93', '#ff7ab6'];
const SHAPES = ['★', '●', '■', '♥'];

/** A short confetti burst (pure CSS animation), shown when a challenge is solved. */
export function Confetti({ count = 36 }: { count?: number }) {
  const [pieces] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.25,
      duration: 1.1 + Math.random() * 0.8,
      drift: (Math.random() - 0.5) * 160,
      rotate: (Math.random() - 0.5) * 720,
      color: COLORS[i % COLORS.length]!,
      shape: SHAPES[i % SHAPES.length]!,
      size: 14 + Math.random() * 14,
    })),
  );
  return (
    <div className="confetti" aria-hidden data-testid="confetti">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={
            {
              left: `${p.left}%`,
              color: p.color,
              fontSize: p.size,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              '--drift': `${p.drift}px`,
              '--rotate': `${p.rotate}deg`,
            } as React.CSSProperties
          }
        >
          {p.shape}
        </span>
      ))}
    </div>
  );
}
