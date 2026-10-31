import type { ReadWordData } from '../../modules/challenges/german-read-word';
import { getWord } from './germanParts';
import type { ChallengeViewProps } from './types';

/** A written word and picture choices. Hint splits the word into syllables. */
export function ReadWordView({ data, hint, solved, answers }: ChallengeViewProps<ReadWordData>) {
  const word = getWord(data.wordId);
  const text = (s: string) => (data.mixedCase ? s : s.toUpperCase());
  return (
    <div className="rhyme-wrap" data-testid="task-area">
      <div className="task-area read-word">
        {hint || solved ? word.syllables.map(text).join('·') : text(word.word)}
      </div>
      <div className="picture-choices">
        {data.options.map((id, i) => {
          const option = getWord(id);
          const choiceId = `c${i}`;
          const wrong = answers?.wrongChoiceIds.includes(choiceId);
          const correct = solved && answers?.correctChoiceId === choiceId;
          return (
            <div key={id} className={`picture-choice ${wrong ? 'wrong' : ''} ${correct ? 'correct' : ''}`}>
              <button
                className="picture-button"
                disabled={solved || wrong}
                aria-label={`Bild ${i + 1}`}
                onClick={() => answers?.onChoose(choiceId)}
              >
                <span aria-hidden>{option.emoji}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
