# WordVibe: Product Requirements Document (PRD)

**Version:** 3.0
**Last Updated:** 2026-02-14
**Status:** Draft for Review
**Target:** Apple Design Award Candidacy + Featured on App Store

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Vision & Strategic Goals](#2-vision--strategic-goals)
3. [Current State Assessment](#3-current-state-assessment)
4. [Target User Personas](#4-target-user-personas)
5. [Apple Design Award Criteria Gap Analysis](#5-apple-design-award-criteria-gap-analysis)
6. [Feature Requirements: Phase 1 - Foundation](#6-feature-requirements-phase-1---foundation)
7. [Feature Requirements: Phase 2 - Delight](#7-feature-requirements-phase-2---delight)
8. [Feature Requirements: Phase 3 - Social & Growth](#8-feature-requirements-phase-3---social--growth)
9. [Technical Architecture Requirements](#9-technical-architecture-requirements)
10. [Platform-Specific Requirements](#10-platform-specific-requirements)
11. [Performance Requirements](#11-performance-requirements)
12. [Accessibility Requirements](#12-accessibility-requirements)
13. [Monetization Strategy](#13-monetization-strategy)
14. [Analytics & Metrics](#14-analytics--metrics)
15. [Release Strategy](#15-release-strategy)
16. [Risk Assessment](#16-risk-assessment)

---

## 1. Executive Summary

WordVibe is a cross-platform word-guessing game built with React Native/Expo. The current v2.0 is a functional Wordle clone with solid architecture, good accessibility foundations, and basic animations. However, it falls short of the premium, delightful experience that characterizes Apple Design Award winners.

This PRD defines the transformation from a "well-built clone" into a **distinctive, emotionally engaging word game** that stands on its own. The core thesis: word games don't need to look utilitarian. WordVibe should feel like opening a beautifully designed music app -- the interaction itself should be pleasurable, not just the outcome.

### Key Outcomes

- **Design Award candidacy** across Delight & Fun, Interaction, Inclusivity categories
- **4.8+ star rating** on App Store through obsessive polish
- **App Store featuring** through platform-native integration (widgets, Live Activities, Dynamic Island)
- **Organic growth** through shareability and social mechanics

---

## 2. Vision & Strategic Goals

### Product Vision

> WordVibe transforms the daily word puzzle from a solitary habit into a sensory experience. Every letter typed has weight. Every guess reveals itself with intention. The game doesn't just tell you the answer -- it makes you *feel* the discovery.

### Strategic Goals

| Goal | Metric | Target |
|------|--------|--------|
| Premium feel | App Store rating | 4.8+ stars |
| Daily retention | D7 retention | 65%+ |
| Engagement depth | Session duration (daily) | 4-8 min |
| Shareability | Share rate per win | 30%+ |
| Accessibility | VoiceOver task completion | 100% |
| Performance | Cold launch to interactive | < 1.2s |
| Platform integration | Widget install rate | 25%+ of daily players |

### Non-Goals

- Multiplayer real-time gameplay (v3.0+ consideration)
- User-generated word lists (moderation complexity)
- Cross-word or different puzzle types (stay focused)
- Social feed / timeline features (not a social app)

---

## 3. Current State Assessment

### What Works Well (Keep & Polish)

| Area | Current State | Quality |
|------|--------------|---------|
| Core game logic | Match algorithm handles duplicates correctly | Excellent |
| Daily word seeding | Mulberry32 PRNG, UTC-based, deterministic | Excellent |
| Accessibility utilities | 471 lines, screen reader, reduce motion, dynamic type | Strong |
| Redux architecture | 4 clean slices, typed hooks | Good |
| Responsive layout | Device breakpoints, iPad support scaffolded | Good |
| Keyboard component | Spring physics, dynamic coloring | Good |
| Tile flip animation | 3D rotateY with stagger | Good |

### Critical Issues (Status as of v2.0)

| Issue | Location | Status |
|-------|----------|--------|
| ~~Duplicate game-end UI~~ | `gameBoard.tsx` - inline container + modal both render | ✅ Resolved — single modal renders |
| Mixed animation APIs | Reanimated + RN Animated used inconsistently | ⚠️ In progress — migrating to Reanimated |
| ~~setTimeout without cleanup~~ | `letterSquare.tsx`, `gameBoard.tsx` | ✅ Resolved — cleanup in useEffect |
| ~~Stale closure~~ | `handleFoundKeysOnKeyboard` captures old `usedKeys` | ✅ Resolved — uses ref for current state |
| ~~No React.memo on hot paths~~ | `LetterSquare`, `AnimatedKey` | ✅ Resolved — components memoized |
| ~~Modal focus trap missing~~ | Game-end modal | ✅ Resolved — accessibilityViewIsModal set |

### What's Missing (Gaps to Award-Quality)

| Gap | Severity | Notes |
|-----|----------|-------|
| No sound design | High | Sound system stubbed but no real audio |
| No gesture interactions | High | No swipe, long-press, or force-touch |
| Flat visual design | High | Functional but not distinctive or delightful |
| No platform features | High | No widgets, Live Activities, Dynamic Island |
| No onboarding delight | Medium | Tutorial works but isn't memorable |
| No emotional arc | Medium | Win/loss feels the same every time |
| No daily variation | Medium | Same experience, no surprise element |
| Limited share virality | Medium | Text-only sharing, no visual card |
| No cloud sync | Low | Device-locked data |

---

## 4. Target User Personas

### Primary: "The Daily Ritualist" (60% of users)

- **Demographics:** 25-55, all genders, smartphone-native
- **Behavior:** Opens app once daily, usually morning with coffee or commute
- **Motivation:** Satisfying daily micro-accomplishment, brain warm-up
- **Pain Points:** Boring UX, lack of reward feeling, can't share visually
- **Delight Triggers:** Streak pride, efficient solves, beautiful moments

### Secondary: "The Competitive Player" (25% of users)

- **Demographics:** 18-40, gaming-inclined
- **Behavior:** Plays daily + unlimited mode, checks stats frequently
- **Motivation:** Self-improvement, bragging rights, optimization
- **Pain Points:** Lack of leaderboards, no skill progression system
- **Delight Triggers:** Personal records, achievement unlocks, comparison with friends

### Tertiary: "The Casual Explorer" (15% of users)

- **Demographics:** 35-65, less tech-savvy
- **Behavior:** Plays a few times per week, explores settings
- **Motivation:** Relaxation, vocabulary building, recommended by friend
- **Pain Points:** Complexity, unclear rules, inaccessible design
- **Delight Triggers:** Learning new words, accessibility features that "just work"

---

## 5. Apple Design Award Criteria Gap Analysis

Apple evaluates across six categories. Here's where WordVibe stands and what's needed:

### 5.1 Delight and Fun

**Current Score: 4/10** -- Functional but not delightful.

| What Award Winners Do | WordVibe Today | Gap |
|----------------------|----------------|-----|
| Moments that make users smile | Confetti on win | Confetti is generic; needs personality |
| Emotional range throughout experience | Same tone regardless of performance | No emotional arc |
| Playful details in unexpected places | None | Loading, transitions, errors all utilitarian |
| Sound design that enhances mood | Stubbed/silent | No audio experience at all |
| Micro-interactions on every touch | Key press spring only | Tiles, navigation, toggles all static |

**Required Work:**
- P0: Complete sound design system (key clicks, tile reveals, win/loss compositions)
- P0: Redesign win/loss sequences with dramatic reveals and emotional variation
- P1: Add personality to error states (invalid word, hard mode violations)
- P1: Streak milestone celebrations (7-day, 30-day, 100-day)
- P2: Easter eggs and seasonal surprises (holiday themes, special words)

### 5.2 Interaction

**Current Score: 5/10** -- Basic touch targets, no gesture vocabulary.

| What Award Winners Do | WordVibe Today | Gap |
|----------------------|----------------|-----|
| Gesture-driven interactions | Tap only | No swipe, long-press, force-touch |
| Platform-native patterns | Custom keyboard only | No system integration |
| Haptic language | Single haptic pattern | No differentiation by context |
| Direct manipulation feel | Keyboard -> board is indirect | Letters should feel "placed" |
| Responsive to pressure/speed | None | Same interaction always |

**Required Work:**
- P0: Rich haptic vocabulary (different patterns for correct, present, absent, error, win)
- P0: Long-press on played tile to see definition
- P1: Swipe gestures (swipe to delete letter, swipe up to submit)
- P1: Dynamic Island / Live Activity for daily puzzle status
- P2: 3D Touch / Haptic Touch for quick actions on home screen

### 5.3 Social Impact

**Current Score: 3/10** -- No meaningful social contribution.

| What Award Winners Do | WordVibe Today | Gap |
|----------------------|----------------|-----|
| Educational value | Incidental vocabulary exposure | Not leveraged or highlighted |
| Community building | Share emoji grid | No visual sharing, no community |
| Inclusive by default | High contrast mode available | Not showcased or prominent |
| Positive daily habit | Daily challenge | No mindfulness or wellness framing |

**Required Work:**
- P1: "Word of the Day" post-game learning (etymology, usage, fun facts)
- P1: Beautiful share cards (image-based, not just emoji text)
- P2: Vocabulary tracker showing words learned over time
- P2: Mindful moment integration (brief breathing before first game)

### 5.4 Inclusivity

**Current Score: 7/10** -- Strong foundations, needs final polish.

| What Award Winners Do | WordVibe Today | Gap |
|----------------------|----------------|-----|
| VoiceOver is a first-class experience | Labels exist, some gaps | Missing focus trap, announcement timing |
| Multiple accessibility modes | High contrast + reduce motion | No colorblind-specific palettes |
| Switch Control support | Not tested | Unknown state |
| Dynamic Type at all sizes | Scaling exists | Not tested at extreme sizes |
| Cognitive accessibility | Standard UI | No simplified mode |

**Required Work:**
- P0: Fix modal focus trap (`accessibilityViewIsModal`)
- P0: Test and fix VoiceOver end-to-end flow
- P1: Add deuteranopia, protanopia, tritanopia color palettes
- P1: Validate Switch Control navigation
- P2: "Relaxed Mode" with no pressure (no streaks, no timer)

### 5.5 Visuals and Graphics

**Current Score: 5/10** -- Clean but unremarkable.

| What Award Winners Do | WordVibe Today | Gap |
|----------------------|----------------|-----|
| Distinctive art direction | Purple/pink theme is nice but not memorable | Needs signature visual identity |
| Attention to typography | Montserrat used well | No typographic hierarchy or drama |
| Dynamic, alive interface | Static between interactions | No ambient motion or breathing |
| Beautiful dark mode | Functional dark mode | Not optimized for OLED, lacks depth |
| Transition choreography | fade between screens | No meaningful transitions |

**Required Work:**
- P0: Complete visual redesign with signature art direction (see DESIGN.md)
- P0: OLED-optimized dark mode with true black and depth layers
- P1: Screen transition choreography (shared element transitions)
- P1: Ambient background effects (subtle gradients, particle systems)
- P2: Seasonal visual themes

### 5.6 Innovation

**Current Score: 3/10** -- Standard Wordle clone mechanics.

| What Award Winners Do | WordVibe Today | Gap |
|----------------------|----------------|-----|
| Novel mechanic or approach | Standard Wordle | Vibe Meter is unique but underused |
| Pushes platform capabilities | Basic Expo app | No platform-native features |
| Reimagines the genre | Copy of NYT Wordle | Same game, different paint |
| Technical achievement | Standard RN app | Nothing technically impressive |

**Required Work:**
- P0: Elevate the Vibe Meter into a signature mechanic (see Section 7.2)
- P1: iOS widgets (daily puzzle status, streak counter)
- P1: Live Activities for in-progress daily puzzle
- P1: Apple Watch companion (daily word notification + quick guess)
- P2: Spatial Audio integration on supported devices

---

## 6. Feature Requirements: Phase 1 - Foundation

**Goal:** Fix critical issues, establish premium quality baseline.

### 6.1 Critical Bug Fixes

#### F1.1: Game-End UI Deduplication
- **What:** Remove duplicate game-end UI. Gate the inline result container behind `!showModal` or remove it entirely. Only the modal should show results.
- **Acceptance:** Game end shows exactly one UI treatment. No flicker or dual-render.

#### F1.2: Animation API Standardization
- **What:** Migrate all animations to React Native Reanimated 3. Remove all usage of RN Animated API.
- **Scope:** `gameBoard.tsx` modal animation, `statistics/index.tsx` tab indicator and distribution bars, `AchievementToast.tsx` slide animation.
- **Acceptance:** Zero imports from `react-native` Animated. All animations run on UI thread.

#### F1.3: Memory Leak Prevention
- **What:** Add cleanup for all `setTimeout` calls in components. Use `useRef` to store timeout IDs and clear in `useEffect` cleanup.
- **Scope:** `letterSquare.tsx` sound timeout, `gameBoard.tsx` modal delay timeout.
- **Acceptance:** No warnings about state updates on unmounted components.

#### F1.4: Stale Closure Fix
- **What:** Fix `handleFoundKeysOnKeyboard` to read current state instead of captured closure value.
- **Approach:** Use `useRef` for `usedKeys` or dispatch a thunk that reads current store state.
- **Acceptance:** Keyboard colors always reflect latest game state.

#### F1.5: Performance Optimization
- **What:** Add `React.memo` to `LetterSquare` and `AnimatedKey` components. Memoize `wordList()` concatenation with `useMemo`.
- **Acceptance:** React DevTools profiler shows no unnecessary re-renders on key press.

### 6.2 Sound Design System

#### F1.6: Audio Engine
- **What:** Implement a complete audio system replacing the current stub.
- **Requirements:**
  - Pre-load all sounds on app launch
  - Support simultaneous playback (letter reveal stagger)
  - Respect system silent mode
  - Respect in-app sound toggle
  - Low-latency playback (< 50ms from trigger to audio)
- **Sound Categories:**
  - **Key Press:** Soft, tactile click. Different pitch for letter vs. backspace vs. enter.
  - **Tile Reveal - Correct:** Ascending chime, warm tone. Higher pitch for later positions (building excitement).
  - **Tile Reveal - Present:** Neutral tone, slightly questioning. Mid-range.
  - **Tile Reveal - Absent:** Muted thud, not punishing but definitive.
  - **Win:** Celebratory composition. 1-2 seconds. Varies by guess count (guess 1 = epic, guess 6 = relieved).
  - **Loss:** Gentle, empathetic tone. Not a failure sound -- a "tomorrow" sound.
  - **Error (Invalid Word):** Quick double-buzz, playful not harsh.
  - **Streak Milestone:** Distinctive fanfare. Escalates with streak length.
  - **Achievement Unlock:** Satisfying "level up" sound.
- **Technical:** Use expo-av with pre-loaded Audio.Sound instances. Cache in module-level Map.

#### F1.7: Haptic Vocabulary
- **What:** Replace single-pattern haptics with contextual feedback.
- **Patterns:**
  - Key press: `impactLight`
  - Submit guess: `impactMedium`
  - Tile reveal (correct): `notificationSuccess`
  - Tile reveal (present): `impactLight`
  - Tile reveal (absent): `impactHeavy` (brief)
  - Invalid word: `notificationError`
  - Win: Custom pattern -- three ascending impacts
  - Loss: `notificationWarning`
  - Streak milestone: `notificationSuccess` repeated
- **Technical:** Use Expo Haptics API with platform-specific tuning.

### 6.3 Visual Foundation

#### F1.8: Typography System
- **What:** Establish typographic hierarchy using Montserrat weights.
- **Scale:**
  - Display (game title): Montserrat 800, 32-40pt
  - Heading 1 (screen titles): Montserrat 700, 24-28pt
  - Heading 2 (section headers): Montserrat 700, 18-20pt
  - Body (descriptions): Montserrat 600, 15-16pt
  - Caption (secondary info): Montserrat 600, 12-13pt
  - Tile Letter: Montserrat 800, responsive to tile size
  - Keyboard Key: Montserrat 700, responsive
- **Requirements:** All sizes must respect Dynamic Type scaling. Maximum scale factor: 2.0x for game elements, unlimited for settings/help text.

#### F1.9: Dark Mode Enhancement
- **What:** Redesign dark mode for OLED displays and visual depth.
- **Changes:**
  - Background: `#000000` (true black for OLED power savings)
  - Surface 1: `#0D0D1A` (subtle elevation)
  - Surface 2: `#1A1A2E` (cards, modals)
  - Surface 3: `#252542` (interactive elements)
  - Add subtle gradient overlays for depth perception
  - Correct tile colors must pop against true black
- **Acceptance:** Side-by-side with Apple's own dark mode apps looks cohesive.

#### F1.10: Spacing & Layout System
- **What:** Implement consistent 4px grid spacing system.
- **Values:** 4, 8, 12, 16, 20, 24, 32, 40, 48, 64
- **Apply to:** All padding, margins, gaps across every screen.
- **Requirements:** Export as named constants. Use `responsive()` for device-adaptive values.

---

## 7. Feature Requirements: Phase 2 - Delight

**Goal:** Add the emotional depth and polish that separates good from great.

### 7.1 Game Feel Overhaul

#### F2.1: Tile Entry Animation
- **What:** When a letter is typed, the tile should "receive" it with physicality.
- **Animation:** Scale from 1.0 -> 1.15 -> 1.0 (spring, damping: 12, stiffness: 350). Tile border brightens momentarily.
- **Duration:** 150ms total.
- **Paired with:** Key press haptic and sound.

#### F2.2: Tile Reveal Choreography
- **What:** Redesign the tile reveal sequence to build dramatic tension.
- **Sequence per row:**
  1. Brief pause (200ms) -- anticipation
  2. Tiles flip one by one (300ms each, 150ms stagger)
  3. Each tile reveals its color with a light bloom effect
  4. After all revealed, correct tiles pulse once (scale 1.0 -> 1.08 -> 1.0)
  5. Sound and haptic fire precisely with each flip
- **On final guess (win):** Tiles do a wave bounce after reveal. Confetti triggers from the winning row's position.
- **On final guess (loss):** Tiles briefly dim. Solution word fades in above the board with a gentle glow.

#### F2.3: Win Experience Tiers
- **What:** Different celebration intensity based on guess count.
- **Tiers:**
  - **Guess 1 (Genius):** Full-screen golden confetti explosion, screen shake, triumphant fanfare, "GENIUS" text with particle trail
  - **Guess 2 (Magnificent):** Large confetti burst, energetic sound, "MAGNIFICENT" text with glow
  - **Guess 3 (Impressive):** Standard confetti, upbeat sound, "IMPRESSIVE" text
  - **Guess 4 (Splendid):** Moderate confetti, pleasant sound, "SPLENDID" text
  - **Guess 5 (Great):** Light confetti, warm sound, "GREAT" text
  - **Guess 6 (Phew):** Subtle sparkle effect, relieved sound, "PHEW" text
- **Shared:** All tiers show solution word, stats summary, share button. Transition into result modal.

#### F2.4: Loss Experience
- **What:** Compassionate, not punishing. Encourage return.
- **Sequence:**
  1. Board tiles gently desaturate
  2. Solution word appears letter-by-letter (typewriter effect) with subtle sound
  3. Brief word definition or fun fact appears below
  4. "See you tomorrow" message for daily mode
  5. Gentle sound (piano note resolving)
- **No:** Red colors, harsh sounds, shaking, or anything that feels like punishment.

#### F2.5: Streak Milestones
- **What:** Celebrate streak achievements with escalating fanfare.
- **Milestones:** 3, 7, 14, 30, 50, 100, 200, 365 days
- **Celebration:** Special achievement toast with unique icon per milestone. Screen briefly takes on a warm golden tint. Share prompt with streak badge graphic.

### 7.2 Vibe Meter Evolution

The Vibe Meter is WordVibe's most distinctive feature. It needs to become the signature mechanic.

#### F2.6: Vibe Meter Visual Redesign
- **What:** Transform from a simple progress bar into a living, responsive indicator.
- **Design:**
  - Circular gauge (arc meter) instead of horizontal bar
  - Animated gradient fill that shifts color as score changes
  - Particle effects around the meter at high vibe scores
  - Pulse animation synchronized with score changes
  - Numerical score displayed in center with trend arrow
- **States:**
  - 0-20%: Cool blue, slow pulse, subtle
  - 20-40%: Teal, moderate pulse
  - 40-60%: Yellow-green, steady pulse
  - 60-80%: Orange-gold, energetic pulse
  - 80-100%: Purple-pink (brand colors), rapid pulse, particle aura

#### F2.7: Post-Guess Vibe Feedback
- **What:** After each guess is revealed, the Vibe Meter responds in real-time.
- **Behavior:** As each tile flips, the meter adjusts incrementally (not all at once). Green letters cause a jump, yellow a small bump, gray a slight dip.
- **Audio:** Subtle rising/falling tone paired with meter movement.
- **Haptic:** Gentle pulse when meter crosses threshold boundaries.

### 7.3 Post-Game Experience

#### F2.8: Word Discovery
- **What:** After each game, present the solution word with educational content.
- **Content:**
  - Word definition (primary meaning)
  - Part of speech
  - Example sentence
  - Fun fact or etymology (when available)
  - Difficulty rating (based on letter frequency analysis)
- **Source:** Bundle a curated dictionary of definitions for all answer words.
- **Display:** Elegant card that slides up after win/loss animation completes.

#### F2.9: Visual Share Cards
- **What:** Replace text-only emoji grid with a beautiful shareable image.
- **Design:**
  - WordVibe branded card with date and puzzle number
  - Colored tile grid matching game result
  - Guess count and Vibe score
  - Streak badge (if applicable)
  - Dark/light variant based on user's theme
  - QR code or deep link to app
- **Export:** Share as image to Instagram Stories, iMessage, Twitter, etc.
- **Technical:** Use `react-native-view-shot` or `expo-sharing` with captured view.

#### F2.10: Stats Redesign
- **What:** Transform statistics screen from data table into an engaging dashboard.
- **Components:**
  - **Header Card:** Games played, win %, current/max streak with visual badges
  - **Guess Distribution:** Animated bar chart with the winning row highlighted
  - **Calendar Heatmap:** GitHub-style contribution grid showing play history
  - **Personal Bests:** Best streak, fastest solve (speed mode), most efficient month
  - **Achievements Gallery:** Grid of earned/locked achievements with progress indicators
- **Animation:** Numbers count up when screen loads. Bars animate in with stagger.

### 7.4 Onboarding Redesign

#### F2.11: Interactive Tutorial
- **What:** Replace static tutorial with a playful guided experience.
- **Flow:**
  1. Welcome screen with WordVibe logo animation (morphing letters)
  2. "Let's try a practice word" -- user types a real guess on a 3-letter simplified board
  3. Tiles flip and reveal with full animation -- explain each color as it appears
  4. "Now you try the real thing" -- transition to first game with a carefully selected easy word
  5. Vibe Meter introduction during first game (tooltip overlay)
- **Duration:** 60-90 seconds, skippable at any point.
- **Technical:** Separate tutorial game state, not persisted to statistics.

---

## 8. Feature Requirements: Phase 3 - Social & Growth

**Goal:** Drive organic growth through social features and platform integration.

### 8.1 Platform Integration

#### F3.1: iOS Home Screen Widgets
- **Types:**
  - **Small (2x2):** Daily puzzle status (solved/unsolved), streak count
  - **Medium (4x2):** Tile grid of today's result + streak + next puzzle countdown
  - **Large (4x4):** Full week history with results + stats summary
- **Dynamic:** Updates after game completion. Countdown timer to next daily word.
- **Deep Link:** Tap widget opens directly to game screen.
- **Technical:** WidgetKit via Expo's custom native module or bare workflow integration.

#### F3.2: Live Activities & Dynamic Island
- **When Active:** While a daily puzzle is in progress (started but not finished).
- **Display:**
  - Compact: Tile emoji showing current progress (e.g., "3/6")
  - Expanded: Current guess count, Vibe score, time since started
- **Updates:** After each guess submission (via ActivityKit push or local update).
- **Dismissal:** Auto-dismisses when game is completed or abandoned.

#### F3.3: Notifications
- **Daily Reminder:** Configurable time (default: 9 AM local). "Your daily WordVibe is ready."
- **Streak At Risk:** Sent at 8 PM if daily puzzle not yet played. "Don't break your [N]-day streak!"
- **Smart Frequency:** Don't notify if user has been inactive > 7 days (respect churn).
- **Rich Notification:** Include compact tile grid preview of yesterday's result.

#### F3.4: Spotlight & Siri Integration
- **Spotlight:** Index daily puzzle as searchable item. "WordVibe daily puzzle."
- **Siri Shortcuts:** "Hey Siri, open my WordVibe" -> launches directly to game.
- **App Intents:** Donate "Play WordVibe" intent for Shortcuts app.

### 8.2 Social Features

#### F3.5: Challenge a Friend
- **What:** Send a specific word to a friend to guess.
- **Flow:**
  1. Select "Challenge" from menu
  2. Choose a word from the answer list (or get a random one)
  3. Generate a share link (universal link / deep link)
  4. Friend opens link, plays that specific word
  5. Results compared side-by-side after both complete
- **Privacy:** Word is encoded in the link (not stored server-side). Client-side only.

#### F3.6: Group Streaks
- **What:** Create a group of friends who track streaks together.
- **Implementation:** CloudKit shared zone (Apple ecosystem) or simple backend.
- **Display:** Group leaderboard widget showing each member's streak.
- **Motivation:** "Your group has a combined 47-day streak!"

### 8.3 Content & Variety

#### F3.7: Themed Word Packs
- **What:** Optional word list expansions with themes.
- **Themes:** Science, Food, Music, Sports, Geography, Animals
- **Mechanic:** Weekly rotating theme for unlimited mode. Daily always uses standard list.
- **Display:** Theme icon in header. Themed background accent.

#### F3.8: Weekly Challenge
- **What:** Special weekly puzzle with modified rules.
- **Variants:**
  - **Blitz:** 3 minutes, 6 words, most correct wins
  - **Marathon:** 10 words, unlimited time, fewest total guesses
  - **Hard Only:** Hard mode enforced, bonus points
- **Leaderboard:** Anonymous weekly leaderboard (no account required, device-based).

#### F3.9: Language Expansion
- **Priority Languages:** Spanish, French, German, Portuguese, Italian, Japanese
- **Requirements per Language:**
  - 3000+ answer words, 6000+ valid guesses
  - Keyboard layout adaptation
  - Localized UI strings (i18n framework required)
  - Native speaker validation of word lists
- **Technical:** Implement i18n with `i18next` + `react-i18next`. Lazy-load word lists.

---

## 9. Technical Architecture Requirements

### 9.1 Animation Architecture

**Mandate:** Standardize on React Native Reanimated 3 for ALL animations.

- All animations must run on the UI thread (worklets)
- Use `useAnimatedStyle`, `withSpring`, `withTiming`, `withSequence`
- Shared values for cross-component animation coordination
- Layout animations with `LayoutAnimationConfig` for list changes
- Gesture handler integration via `react-native-gesture-handler`

### 9.2 State Architecture

**Current:** Redux Toolkit (keep).

**Additions:**
- Add `uiSlice` for transient UI state (modals, toasts, animations in progress)
- Add middleware for analytics event dispatching
- Add persistence migration system for schema changes
- Consider RTK Query if backend API added in Phase 3

### 9.3 Navigation Architecture

**Current:** Bottom tabs with 4 screens.

**Evolution:**
- Keep bottom tabs as primary navigation
- Add stack navigator for modal flows (word detail, challenge setup, settings sub-screens)
- Implement shared element transitions between game board and result modal
- Use `@react-navigation/native-stack` for native-quality transitions

### 9.4 Audio Architecture

```
AudioManager (singleton)
├── SoundPool (pre-loaded Audio.Sound instances)
│   ├── keyPress: Sound[]  (pitch variants)
│   ├── tileCorrect: Sound[]  (position variants)
│   ├── tilePresent: Sound
│   ├── tileAbsent: Sound
│   ├── winFanfare: Sound[]  (tier variants)
│   ├── lossGentle: Sound
│   ├── error: Sound
│   ├── achievementUnlock: Sound
│   └── streakMilestone: Sound[]
├── play(soundId, options?)
├── preloadAll()
├── setMuted(boolean)
└── setVolume(number)
```

### 9.5 Data Architecture

**Local Storage (AsyncStorage):**
- Game state (daily only)
- Statistics
- Settings
- Theme
- Achievement progress
- Game history
- Onboarding completion

**Cloud Sync (Phase 3):**
- CloudKit (iOS) for cross-device sync
- Statistics, achievements, settings
- Conflict resolution: latest-write-wins with merge for statistics

---

## 10. Platform-Specific Requirements

### 10.1 iOS

- **Minimum:** iOS 16.0 (for Live Activities, WidgetKit improvements)
- **Required Frameworks:** WidgetKit, ActivityKit, AppIntents, StoreKit 2
- **App Clips:** Consider for challenge links (open without install)
- **Privacy:** App Tracking Transparency compliance, Privacy Nutrition Labels

### 10.2 Android

- **Minimum:** Android 10 (API 29)
- **Material You:** Adapt theme colors to system dynamic color palette
- **Widgets:** Glance widgets (Jetpack Glance)
- **Notifications:** Notification channels for daily reminders vs. achievements

### 10.3 Web

- **Progressive Web App:** Installable, offline-capable
- **Keyboard:** Full physical keyboard support (already exists, enhance)
- **Responsive:** Desktop layout with centered game board, max-width container
- **SEO:** Meta tags, Open Graph for share links

### 10.4 iPad

- **Multitasking:** Support Split View and Slide Over
- **Pointer:** Hover effects on tiles and keyboard with trackpad/mouse
- **Layout:** Use `getIPadLayout()` for optimal spacing
- **Stage Manager:** Resizable window support

---

## 11. Performance Requirements

### 11.1 Launch Performance

| Metric | Target | Current (est.) |
|--------|--------|----------------|
| Cold start to splash | < 200ms | ~300ms |
| Splash to interactive | < 1.0s | ~1.5s |
| Font load complete | < 500ms | ~800ms |
| Total launch | < 1.2s | ~2.0s |

**Optimizations:**
- Inline critical fonts (subset Montserrat to game characters)
- Lazy load non-critical screens (Stats, Help, Settings)
- Reduce initial Redux hydration payload
- Use Hermes engine optimizations (already on Expo 54)

### 11.2 Runtime Performance

| Metric | Target |
|--------|--------|
| Frame rate during animation | 60fps constant |
| Key press to tile update | < 16ms (1 frame) |
| Tile reveal animation jank | 0 dropped frames |
| Memory usage (gameplay) | < 100MB |
| Memory usage (peak, confetti) | < 150MB |
| JS thread utilization | < 50% during idle |

### 11.3 Bundle Size

| Metric | Target |
|--------|--------|
| iOS App Store size | < 25MB |
| Android Play Store size | < 20MB |
| JS bundle (Hermes bytecode) | < 2MB |
| Assets (fonts, sounds, images) | < 5MB |

---

## 12. Accessibility Requirements

### 12.1 VoiceOver (iOS) / TalkBack (Android)

- Every interactive element has a meaningful `accessibilityLabel`
- Game state changes announced via `AccessibilityInfo.announceForAccessibility()`
- Modal dialogs trap focus with `accessibilityViewIsModal={true}`
- Tile reveal results announced after animation completes (not during)
- Keyboard keys announce their letter and current match status
- Game result announced: "You won in [N] guesses" or "The word was [WORD]"
- Custom rotor actions for game navigation (next row, clear row)

### 12.2 Color & Vision

- **Default mode:** Purple/Pink/Slate (current)
- **High contrast mode:** Orange/Cyan/Dark Gray (current, needs WCAG AAA verification)
- **Deuteranopia mode:** Blue/Orange scheme
- **Protanopia mode:** Blue/Yellow scheme
- **Tritanopia mode:** Red/Cyan scheme
- All text meets WCAG 2.1 AA contrast ratios (4.5:1 normal, 3:1 large)
- Critical game information never conveyed by color alone (add letter markers: checkmark, dash, X)

### 12.3 Motor Accessibility

- All touch targets minimum 44x44 points
- Switch Control navigation path tested and functional
- No time-critical interactions in standard mode (Speed mode is optional)
- Keyboard navigation fully functional (web)
- Voice Control compatible (iOS)

### 12.4 Cognitive Accessibility

- "Relaxed Mode" setting: disables streaks, timers, and competitive elements
- Clear, simple language in all UI text
- Consistent layout across screens
- Undo last letter always available (backspace)
- Error messages explain what to do, not just what went wrong

### 12.5 Reduce Motion

- All animations respect `AccessibilityInfo.isReduceMotionEnabled()`
- When enabled: instant color changes (no flip), no confetti, no bounce
- Functionality remains identical -- only presentation changes
- Test with reduce motion enabled as part of QA process

---

## 13. Monetization Strategy

### 13.1 Core Principle

The daily game is **always free, forever**. Monetization comes from premium enhancements that don't gate core gameplay.

### 13.2 WordVibe Pro (Subscription)

- **Price:** $2.99/month or $19.99/year
- **Features:**
  - Unlimited hints (free users: 1 hint per game)
  - Themed word packs
  - Advanced statistics (calendar heatmap, trends, personal bests)
  - Custom color themes
  - Remove ads (if ads are added to free tier)
  - Cloud sync across devices
  - Weekly challenge leaderboard participation

### 13.3 One-Time Purchases

- **Theme Packs:** $0.99 each (seasonal, aesthetic themes)
- **Icon Packs:** $0.99 each (custom app icons)

### 13.4 What Stays Free

- Daily puzzle
- Unlimited mode (standard)
- Core statistics
- Basic sharing
- All accessibility features
- Dark/light mode

---

## 14. Analytics & Metrics

### 14.1 Key Events to Track

| Event | Properties |
|-------|-----------|
| `app_open` | source (widget, notification, organic), session_number |
| `game_start` | mode (daily, unlimited, speed), language |
| `guess_submit` | guess_number, matches_count, hard_mode |
| `game_end` | result (win/loss), guesses_used, duration_seconds, vibe_score |
| `share_tap` | format (text, image), destination |
| `achievement_unlock` | achievement_id, category |
| `setting_change` | setting_name, old_value, new_value |
| `widget_tap` | widget_type, widget_size |
| `streak_milestone` | streak_length |
| `word_detail_view` | word, source (post-game, history) |

### 14.2 North Star Metrics

| Metric | Definition | Target |
|--------|-----------|--------|
| DAU/MAU ratio | Daily active / monthly active | > 0.4 |
| D1 retention | % returning next day after first play | > 70% |
| D7 retention | % returning 7 days after first play | > 55% |
| D30 retention | % returning 30 days after first play | > 35% |
| Share rate | % of wins that result in share action | > 30% |
| Widget adoption | % of D7+ users with widget installed | > 25% |
| Streak length (median) | Median active streak among daily players | > 5 days |

### 14.3 Technical Implementation

- Use **Expo Analytics** or **PostHog** (privacy-first, self-hostable)
- Implement consent flow (GDPR/CCPA compliant)
- No PII collection -- all analytics are anonymous
- Batch events, send on background/app close
- Respect "Ask App Not to Track" (ATT) on iOS

---

## 15. Release Strategy

### 15.1 Phase 1: Foundation (v3.0)

**Focus:** Bug fixes, sound design, visual polish, performance.

- Fix all critical bugs (Section 6.1)
- Complete sound system (F1.6)
- Implement haptic vocabulary (F1.7)
- Typography and spacing systems (F1.8, F1.10)
- Dark mode enhancement (F1.9)
- Performance optimization to meet targets (Section 11)
- Accessibility fixes (Section 12)

**Release Type:** App Store update. Request App Store review team attention.

### 15.2 Phase 2: Delight (v3.5)

**Focus:** Emotional design, signature features, content.

- Tile animations overhaul (F2.1, F2.2)
- Win/loss experience redesign (F2.3, F2.4)
- Vibe Meter evolution (F2.6, F2.7)
- Word discovery feature (F2.8)
- Visual share cards (F2.9)
- Stats redesign (F2.10)
- Onboarding redesign (F2.11)
- Streak milestones (F2.5)

**Release Type:** Major update with App Store feature pitch to Apple editorial.

### 15.3 Phase 3: Growth (v4.0)

**Focus:** Platform integration, social features, content expansion.

- iOS widgets (F3.1)
- Live Activities (F3.2)
- Notifications (F3.3)
- Challenge a Friend (F3.5)
- Weekly challenges (F3.8)
- Language expansion (F3.9)
- Monetization launch (Section 13)
- Analytics implementation (Section 14)

**Release Type:** Major version bump. Apple Design Award submission package preparation.

---

## 16. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Expo limitations for native features (widgets, Live Activities) | High | High | Plan bare workflow ejection for iOS-specific features. Keep core game in Expo. |
| Sound asset licensing | Medium | Medium | Commission original sounds or use royalty-free from reputable source. Budget $500-2000. |
| Performance regression from added animations | Medium | High | Benchmark every PR. Automated perf tests on CI. Frame rate monitoring in dev. |
| Word list quality for new languages | Medium | Medium | Partner with native speakers for validation. Community review process. |
| Apple rejecting Live Activity usage | Low | Medium | Ensure Live Activity adds genuine value (not just marketing). Follow HIG precisely. |
| React Native Reanimated breaking changes | Low | High | Pin versions. Test on Expo SDK upgrades before adopting. |
| Scope creep delaying Phase 1 | High | High | Strict phase gates. Phase 1 ships before Phase 2 work begins. |

---

## Appendix A: Competitive Landscape

| App | Strengths | WordVibe Differentiator |
|-----|-----------|------------------------|
| NYT Wordle | Brand recognition, simplicity | Richer feedback (Vibe Meter), better animations, more modes |
| Wordscapes | Beautiful visuals, relaxing | Different genre (guess vs. find), daily ritual focus |
| Quordle | More challenge (4 boards) | Single-board polish > multi-board complexity |
| Absurdle | Adversarial twist | Cooperative feel, encouragement > adversarial |

## Appendix B: Apple Design Award Submission Checklist

- [ ] App Store screenshots showcasing accessibility features
- [ ] App Preview video showing animation quality and sound design
- [ ] Accessibility statement in App Store description
- [ ] Privacy Nutrition Labels completed accurately
- [ ] TestFlight build with all features functional
- [ ] Written narrative: "Why WordVibe deserves a Design Award"
- [ ] Demo device prepped with streak data and achievements for live review
