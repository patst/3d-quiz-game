import { speech } from '../../audio/speech';
import { de } from '../../content/de/strings';
import { JAR_SIZE } from '../../core/rewards/rewards';

/** HUD star jar: 10 slots that fill up; tapping says how many stars are missing. */
export function StarJar({ jar }: { jar: number }) {
  return (
    <button
      className="star-jar"
      data-testid="star-jar"
      data-jar={jar}
      aria-label={de.rewards.jarLabel(jar)}
      onClick={() => speech().speak(de.rewards.jarHint(JAR_SIZE - jar))}
    >
      <span className="jar-icon" aria-hidden>
        🫙
      </span>
      <span className="jar-slots" aria-hidden>
        {Array.from({ length: JAR_SIZE }, (_, i) => (
          <span key={i} className={`jar-slot ${i < jar ? 'filled' : ''}`}>
            {i < jar ? '★' : ''}
          </span>
        ))}
      </span>
    </button>
  );
}
