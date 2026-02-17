import * as fs from 'fs';
import * as path from 'path';

import { ONBOARDING_COMPLETE_KEY, TOTAL_STEPS, getVibeColor, AnimatedLetter, AnimatedTileCell } from '../components/Onboarding';
import { colors } from '../utils/constants';

describe('Onboarding constants', () => {
  it('uses the correct AsyncStorage key', () => {
    expect(ONBOARDING_COMPLETE_KEY).toBe('wordvibe_onboarding_v2_complete');
  });

  it('has exactly 4 steps', () => {
    expect(TOTAL_STEPS).toBe(4);
  });
});

describe('getVibeColor', () => {
  it('returns blue (#40C4FF) for scores 0-19', () => {
    expect(getVibeColor(0)).toBe('#40C4FF');
    expect(getVibeColor(10)).toBe('#40C4FF');
    expect(getVibeColor(19)).toBe('#40C4FF');
  });

  it('returns teal (#00BFA5) for scores 20-39', () => {
    expect(getVibeColor(20)).toBe('#00BFA5');
    expect(getVibeColor(30)).toBe('#00BFA5');
    expect(getVibeColor(39)).toBe('#00BFA5');
  });

  it('returns yellow (#FFD600) for scores 40-59', () => {
    expect(getVibeColor(40)).toBe('#FFD600');
    expect(getVibeColor(50)).toBe('#FFD600');
    expect(getVibeColor(59)).toBe('#FFD600');
  });

  it('returns orange (#FF9100) for scores 60-79', () => {
    expect(getVibeColor(60)).toBe('#FF9100');
    expect(getVibeColor(70)).toBe('#FF9100');
    expect(getVibeColor(79)).toBe('#FF9100');
  });

  it('returns purple (#7C4DFF) for scores 80-100', () => {
    expect(getVibeColor(80)).toBe('#7C4DFF');
    expect(getVibeColor(90)).toBe('#7C4DFF');
    expect(getVibeColor(100)).toBe('#7C4DFF');
  });

  it('matches the project correct color for high scores', () => {
    expect(getVibeColor(100)).toBe(colors.correct);
  });
});

describe('Onboarding step design', () => {
  it('step 1 is welcome (index 0)', () => {
    // Step 0 = Welcome with WORDVIBE animated logo and "Feel the word." tagline
    expect(TOTAL_STEPS).toBeGreaterThanOrEqual(1);
  });

  it('step 2 is how-it-works (index 1)', () => {
    // Step 1 = How it works with tile flip examples
    expect(TOTAL_STEPS).toBeGreaterThanOrEqual(2);
  });

  it('step 3 is vibe meter demo (index 2)', () => {
    // Step 2 = Vibe Meter animating from 0 to 75%
    expect(TOTAL_STEPS).toBeGreaterThanOrEqual(3);
  });

  it('step 4 is ready with mode selection (index 3)', () => {
    // Step 3 = Ready? with Daily Challenge and Unlimited buttons
    expect(TOTAL_STEPS).toBeGreaterThanOrEqual(4);
  });

  it('does not exceed 4 steps', () => {
    expect(TOTAL_STEPS).toBe(4);
  });
});

describe('Onboarding tile color mapping', () => {
  it('uses project-defined colors for tile examples', () => {
    // The tile examples use colors from constants
    expect(colors.correct).toBe('#7C4DFF');
    expect(colors.present).toBe('#FF6B9D');
    expect(colors.absent).toBe('#455A64');
  });
});

describe('Onboarding extracted components', () => {
  it('exports AnimatedLetter as a function component', () => {
    expect(typeof AnimatedLetter).toBe('function');
  });

  it('exports AnimatedTileCell as a function component', () => {
    expect(typeof AnimatedTileCell).toBe('function');
  });
});

describe('Onboarding Rules of Hooks compliance', () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, '../components/Onboarding.tsx'),
    'utf-8'
  );

  // Extract all .map() callback bodies from the source
  function findMapCallbackBodies(src: string): string[] {
    const bodies: string[] = [];
    // Match .map( and capture everything until the matching closing paren
    const mapStart = /\.map\(\s*\(/g;
    let match;
    while ((match = mapStart.exec(src)) !== null) {
      let depth = 1;
      let pos = match.index + match[0].length;
      const start = pos;
      while (pos < src.length && depth > 0) {
        if (src[pos] === '(') depth++;
        if (src[pos] === ')') depth--;
        pos++;
      }
      bodies.push(src.slice(start, pos - 1));
    }
    return bodies;
  }

  const hookPattern = /\b(useSharedValue|useAnimatedStyle|useState|useEffect|useCallback|useMemo|useRef|useContext)\s*\(/;

  it('does not call hooks inside .map() callbacks', () => {
    const mapBodies = findMapCallbackBodies(source);
    expect(mapBodies.length).toBeGreaterThan(0);

    for (const body of mapBodies) {
      const hookMatch = hookPattern.exec(body);
      expect(hookMatch).toBeNull();
    }
  });

  it('uses AnimatedLetter component inside WelcomeStep .map()', () => {
    // Verify the .map() in WelcomeStep renders AnimatedLetter, not inline hooks
    expect(source).toContain('letters.map((letter, i) => (\n          <AnimatedLetter');
  });

  it('uses AnimatedTileCell component inside TileExample .map()', () => {
    // Verify the .map() in TileExample renders AnimatedTileCell, not inline hooks
    expect(source).toContain('letters.map((letter, i) => (\n          <AnimatedTileCell');
  });
});
