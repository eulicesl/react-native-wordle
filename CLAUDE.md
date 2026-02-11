# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React Native Wordle clone built with Expo. Players guess a 5-letter word in 6 attempts with colored feedback (green=correct position, yellow=wrong position, gray=not in word). Supports daily challenges and unlimited practice mode.

## Development Commands

```bash
npm install              # Install dependencies
npm start                # Start Expo dev server
npm run ios              # Run on iOS simulator
npm run android          # Run on Android emulator
npm run web              # Run in web browser
npm run lint             # Run ESLint (zero warnings allowed)
npm run lint:fix         # Auto-fix lint issues
npm test                 # Run Jest tests
npm test:coverage        # Run tests with coverage
```

## Architecture

### State Management (Redux Toolkit)
The app uses Redux with four slices in [src/store/slices/](src/store/slices/):

- **gameStateSlice** - Current game: solution, guesses, usedKeys, gameEnded/Won flags
- **statisticsSlice** - Persistent stats: gamesPlayed, streaks, guessDistribution
- **settingsSlice** - User preferences: hardMode, highContrastMode, hapticFeedback
- **themeSlice** - Dark/light theme toggle

Access state with typed hooks from [src/hooks/storeHooks.ts](src/hooks/storeHooks.ts): `useAppSelector`, `useAppDispatch`.

### Game Logic
- **Daily word selection**: [src/utils/dailyWord.ts](src/utils/dailyWord.ts) uses seeded RNG (Mulberry32) based on UTC date to ensure same word globally
- **Word validation**: Guesses checked against word lists in [src/words/](src/words/) (English `en.ts`, Turkish `tr.ts`)
- **Match algorithm**: In [src/screens/game/index.tsx](src/screens/game/index.tsx) `checkGuess()` - handles duplicate letter edge cases

### Persistence (AsyncStorage)
All persistence logic in [src/utils/localStorageFuncs.ts](src/utils/localStorageFuncs.ts):
- Statistics auto-save on Redux state change via central `useEffect` in Game screen
- Game state persisted only for daily mode, restored on app reopen
- Storage keys: `statistics`, `settings`, `gameState`, `theme`, `language`

### Navigation
Bottom tab navigator in [src/navigation/mainNavigator.tsx](src/navigation/mainNavigator.tsx) with 4 screens:
- Game, Stats, Help, Settings

### Key Types
From [src/types/index.ts](src/types/index.ts):
- `guess` - Single row: letters[], matches[], isComplete, isCorrect
- `matchStatus` - 'correct' | 'present' | 'absent' | ''

## Project Structure

```
src/
├── screens/game/          # Main game logic and components
│   ├── index.tsx          # Game orchestration, guess validation
│   └── components/        # GameBoard, Keyboard, LetterSquare
├── store/slices/          # Redux state slices
├── utils/
│   ├── dailyWord.ts       # Word selection algorithms
│   ├── localStorageFuncs.ts # Persistence layer
│   └── shareResults.ts    # Share game results
└── words/                 # Word lists by language
```

## Game Features

- **Hard Mode**: Must use revealed hints in subsequent guesses
- **High Contrast Mode**: Enhanced color scheme for accessibility
- **Multi-language**: English (default) and Turkish word lists
- **Daily vs Unlimited**: Daily uses date-seeded word, unlimited uses random
