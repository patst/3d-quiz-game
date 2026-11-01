import { speech } from '../../audio/speech';
import { de } from '../../content/de/strings';
import { getWord, type Word } from '../../content/de/words';

/** Small speaker button that says a single word (clip from the word bank). */
export function SayWord({ word }: { word: Word }) {
  return (
    <button
      className="say-word"
      aria-label={`${de.challenge.listen}: ${word.word}`}
      onClick={(e) => {
        e.stopPropagation();
        speech().speak(word.word);
      }}
    >
      🔊
    </button>
  );
}

export { getWord };
