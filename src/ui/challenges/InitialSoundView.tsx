import type { InitialSoundData } from '../../modules/challenges/german-initial-sound';
import { getWord, SayWord } from './germanParts';
import type { ChallengeViewProps } from './types';

/** Picture of the word; hint shows the word with a gap for the first letter. */
export function InitialSoundView({ data, hint, solved }: ChallengeViewProps<InitialSoundData>) {
  const word = getWord(data.wordId);
  return (
    <div className="task-area word-area" data-testid="task-area">
      <div className="word-picture" aria-hidden>
        {word.emoji}
      </div>
      <SayWord word={word} />
      {(hint || solved) && (
        <div className="word-text">
          <span className={solved ? 'letter-solved' : 'letter-gap'}>{solved ? word.word[0] : '_'}</span>
          {word.word.slice(1)}
        </div>
      )}
    </div>
  );
}
