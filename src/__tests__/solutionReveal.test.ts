import { LETTER_STAGGER_MS } from '../components/SolutionReveal';
import { GAME_BOARD } from '../utils/strings';

describe('SolutionReveal', () => {
  describe('LETTER_STAGGER_MS', () => {
    it('should be 100ms between each letter', () => {
      expect(LETTER_STAGGER_MS).toBe(100);
    });

    it('should produce a total reveal under 1 second for a 5-letter word', () => {
      const wordLength = 5;
      const totalRevealMs = wordLength * LETTER_STAGGER_MS + 200; // stagger + fade duration
      expect(totalRevealMs).toBeLessThanOrEqual(1000);
    });

    it('should produce staggered delays for each letter position', () => {
      const word = 'HELLO';
      const delays = word.split('').map((_letter, index) => index * LETTER_STAGGER_MS);
      expect(delays).toEqual([0, 100, 200, 300, 400]);
    });
  });

  describe('loss flow strings', () => {
    it('should have a compassionate "the word was" label', () => {
      expect(GAME_BOARD.theWordWas).toBe('The word was');
    });

    it('should have a "tough one" encouragement instead of "better luck"', () => {
      expect(GAME_BOARD.toughOne).toBe('That was a tough one');
    });

    it('should have a daily mode message for next puzzle', () => {
      expect(GAME_BOARD.tomorrowAwaits).toBe("Tomorrow's puzzle awaits");
    });

    it('should have an unlimited mode message to try again', () => {
      expect(GAME_BOARD.tryAnother).toBe('Try another?');
    });

    it('should not contain any negative/failure language', () => {
      const lossStrings = [
        GAME_BOARD.toughOne,
        GAME_BOARD.tomorrowAwaits,
        GAME_BOARD.tryAnother,
      ];
      const negativeWords = ['fail', 'lose', 'lost', 'bad', 'wrong'];
      for (const str of lossStrings) {
        for (const word of negativeWords) {
          expect(str.toLowerCase()).not.toContain(word);
        }
      }
    });
  });
});
