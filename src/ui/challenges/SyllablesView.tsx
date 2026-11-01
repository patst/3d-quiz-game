import type { SyllablesData } from '../../modules/challenges/german-syllables';
import { getWord, SayWord } from './germanParts';
import type { ChallengeViewProps } from './types';

/** Picture + word; hint/solution splits the word into syllables with a clap each. */
export function SyllablesView({ data, hint, solved }: ChallengeViewProps<SyllablesData>) {
  const word = getWord(data.wordId);
  const split = hint || solved;
  return (
    <div className="task-area word-area" data-testid="task-area">
      <div className="word-picture" aria-hidden>
        {word.emoji}
      </div>
      <SayWord word={word} />
      <div className="word-text syllables">
        {split
          ? word.syllables.map((s, i) => (
              <span key={i} className="syllable" style={{ animationDelay: `${i * 0.5}s` }}>
                <span className="clap" aria-hidden>
                  👏
                </span>
                {s}
              </span>
            ))
          : word.word}
      </div>
    </div>
  );
}
