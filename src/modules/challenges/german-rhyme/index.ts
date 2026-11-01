import { type ChallengeType, lv } from '../../../core/challenges/types';
import { WORDS } from '../../../content/de/words';

/** "Was reimt sich auf Haus?" — tap the rhyming picture. Choice value = index in `options`. */
export interface RhymeData {
  targetId: string;
  options: string[];
}

const LEVELS = [{ choices: 3 }, { choices: 3 }, { choices: 4 }] as const;

export const germanRhyme: ChallengeType<RhymeData> = {
  id: 'german.rhyme',
  subject: 'german',
  skills: ['german.rhymes'],
  levels: LEVELS.length,
  levelInfo: [
    lv('kita', 'preschool', 'ni.a2.reime'),
    lv('preschool', 'grade1', 'ni.a2.reime'),
    lv('preschool', 'grade1', 'ni.a2.reime'),
  ],
  generate({ rng, level }) {
    const cfg = LEVELS[Math.min(Math.max(level, 1), LEVELS.length) - 1]!;
    const target = rng.pick(WORDS.filter((w) => w.rhyme));
    const match = rng.pick(WORDS.filter((w) => w.rhyme === target.rhyme && w.id !== target.id));
    // Level 2+: a distractor that starts like the target (Haus → Hund) is tempting.
    const sameStart = WORDS.filter((w) => w.rhyme !== target.rhyme && w.word[0] === target.word[0] && w.id !== target.id);
    const others = rng.shuffle(WORDS.filter((w) => w.rhyme !== target.rhyme));
    const distractors = [...(level >= 2 ? rng.shuffle(sameStart).slice(0, 1) : []), ...others]
      .filter((w, i, all) => all.findIndex((x) => x.id === w.id) === i)
      .slice(0, cfg.choices - 1);
    const options = rng.shuffle([match, ...distractors]).map((w) => w.id);
    const choices = options.map((_, i) => ({ id: `c${i}`, value: i }));
    return {
      typeId: 'german.rhyme',
      level,
      data: { targetId: target.id, options },
      choices,
      correctChoiceId: `c${options.indexOf(match.id)}`,
      prompt: { key: 'german.rhyme.prompt', params: { word: target.word } },
      explanation: { key: 'german.rhyme.explain', params: { word: target.word, match: match.word } },
    };
  },
};
