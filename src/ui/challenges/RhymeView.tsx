import type { RhymeData } from '../../modules/challenges/german-rhyme';
import { getWord, SayWord } from './germanParts';
import type { ChallengeViewProps } from './types';

/** Target picture and option pictures; each picture has a speaker. Hint shows the words. */
export function RhymeView({ data, hint, solved, answers }: ChallengeViewProps<RhymeData>) {
  const target = getWord(data.targetId);
  const showWords = hint || solved;
  return (
    <div className="rhyme-wrap" data-testid="task-area">
      <div className="task-area rhyme-target">
        <span className="word-picture" aria-hidden>
          {target.emoji}
        </span>
        <SayWord word={target} />
        {showWords && <span className="word-caption">{target.word}</span>}
      </div>
      <div className="picture-choices">
        {data.options.map((id, i) => {
          const word = getWord(id);
          const choiceId = `c${i}`;
          const wrong = answers?.wrongChoiceIds.includes(choiceId);
          const correct = solved && answers?.correctChoiceId === choiceId;
          return (
            <div key={id} className={`picture-choice ${wrong ? 'wrong' : ''} ${correct ? 'correct' : ''}`}>
              <button
                className="picture-button"
                disabled={solved || wrong}
                aria-label={word.word}
                onClick={() => answers?.onChoose(choiceId)}
              >
                <span aria-hidden>{word.emoji}</span>
              </button>
              <SayWord word={word} />
              {showWords && <span className="word-caption">{word.word}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
