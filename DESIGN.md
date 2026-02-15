# WordVibe: Design System & UI/UX Specification

**Version:** 3.0
**Last Updated:** 2026-02-14
**Status:** Draft for Review

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Brand Identity](#2-brand-identity)
3. [Color System](#3-color-system)
4. [Typography](#4-typography)
5. [Spacing & Layout](#5-spacing--layout)
6. [Iconography](#6-iconography)
7. [Component Library](#7-component-library)
8. [Screen Specifications](#8-screen-specifications)
9. [Animation & Motion](#9-animation--motion)
10. [Sound Design](#10-sound-design)
11. [Haptic Design](#11-haptic-design)
12. [Accessibility Design](#12-accessibility-design)
13. [Dark Mode Design](#13-dark-mode-design)
14. [Responsive & Adaptive Design](#14-responsive--adaptive-design)
15. [Micro-interactions Catalog](#15-micro-interactions-catalog)
16. [Emotional Design Map](#16-emotional-design-map)

---

## 1. Design Philosophy

### Core Principles

**1. Tactile Physicality**
Every element should feel like it has weight and presence. Tiles are not pixels on a screen -- they are objects you place, flip, and reveal. The keyboard is not a flat grid -- keys have depth, respond to pressure, and give feedback. The goal is to make a touchscreen feel tangible.

**2. Earned Drama**
The game builds tension naturally over 6 guesses. The design should amplify this arc, not flatten it. Early guesses feel exploratory and light. Middle guesses feel focused. The final guess feels weighted. The reveal carries genuine suspense. The result -- whether win or loss -- lands with emotional impact.

**3. Warm Minimalism**
Clean design that still feels alive. No clutter, but also no sterility. Backgrounds breathe with subtle gradients. Colors are vibrant but not garish. White space is generous but not cold. The aesthetic should feel like a well-designed physical board game, not a spreadsheet.

**4. Inclusive by Default**
Accessibility is not a mode -- it is the design. Color is never the sole information channel. Animations have non-motion alternatives. Text scales gracefully. The game is fully playable through VoiceOver without compromise.

**5. Platform Respect**
Follow iOS Human Interface Guidelines and Android Material Design where appropriate. Use native patterns for navigation, gestures, and system integration. The app should feel like it belongs on the platform, not like a website in a wrapper.

### What This Means in Practice

| Instead of... | Do this... |
|---------------|-----------|
| Flat color change on tile reveal | 3D flip with depth shadow, color bloom, sound |
| Generic "You Won!" text | Tiered celebration calibrated to performance |
| Static statistics screen | Animated dashboard that counts up on entry |
| Silent interactions | Purposeful sound on every meaningful action |
| Same animation speed everywhere | Slower reveals on later guesses (building tension) |
| Modal popping in from nowhere | Shared element transition from game board |

---

## 2. Brand Identity

### 2.1 Brand Personality

WordVibe is **confident, playful, and encouraging**. It takes the game seriously but never takes itself too seriously. It celebrates wins with genuine enthusiasm and handles losses with grace. It's the friend who's fun to play games with -- competitive but kind.

### 2.2 Brand Voice

| Context | Tone | Example |
|---------|------|---------|
| Win message | Celebratory, specific | "SPLENDID -- 4 guesses, nice efficiency!" |
| Loss message | Warm, forward-looking | "The word was CRANE. It's a tricky one. Tomorrow's puzzle awaits." |
| Error message | Playful, helpful | "Hmm, that's not in the word list. Try another." |
| Streak milestone | Proud, encouraging | "7 days locked in. You're on fire." |
| Onboarding | Friendly, concise | "Purple means locked in. The letter is exactly right." |
| Settings | Neutral, clear | "Hard Mode: revealed hints must be used in future guesses." |

### 2.3 App Name & Tagline

- **Name:** WordVibe
- **Tagline:** "Feel the word."
- **App Store Subtitle:** "Daily Word Puzzle"

### 2.4 Logo Concept

The WordVibe logo combines the letter "W" constructed from five tile squares (representing the 5-letter word) with a subtle wave/vibe effect on the bottom edge. Colors use the brand gradient (purple to pink).

- **App Icon:** Single "W" tile in gradient on dark background (`#1A1A2E`)
- **In-App Logo:** "WORDVIBE" in Montserrat 800, letter-spaced, with gradient fill
- **Favicon:** Simplified "W" tile, 32x32

---

## 3. Color System

### 3.1 Semantic Colors

Colors in WordVibe carry meaning. The game's three states are the foundation.

#### Game State Colors

```
CORRECT (Locked In)
├── Default:       #7C4DFF  (Deep Purple)
├── Light variant:  #B39DFF  (Soft Lavender)
├── Dark variant:   #5C35CC  (Dark Purple)
└── Glow:          #7C4DFF40 (Purple at 25% opacity)

PRESENT (Close Vibe)
├── Default:       #FF6B9D  (Warm Pink)
├── Light variant:  #FF9DBF  (Soft Pink)
├── Dark variant:   #CC4D7A  (Deep Pink)
└── Glow:          #FF6B9D40 (Pink at 25% opacity)

ABSENT (No Vibe)
├── Default:       #455A64  (Slate)
├── Light variant:  #78909C  (Light Slate)
├── Dark variant:   #263238  (Dark Slate)
└── Glow:          none
```

#### Brand Colors

```
Primary:    #7C4DFF  (Purple - main brand color)
Secondary:  #00BFA5  (Teal - accent, success states)
Accent:     #FF6B9D  (Pink - secondary brand, warmth)
Warning:    #FFB74D  (Amber - streaks, caution)
Error:      #FF5252  (Red - only for destructive actions in settings)
```

#### Neutral Palette

```
White:      #FFFFFF
Gray 50:    #FAFAFE   (lightest background)
Gray 100:   #F0F0F8   (card background, light mode)
Gray 200:   #E8E8F0   (borders, dividers, light mode)
Gray 300:   #B0BEC5   (disabled text, light mode)
Gray 400:   #78909C   (secondary text, light mode)
Gray 500:   #546E7A   (key default)
Gray 600:   #455A64   (absent tile)
Gray 700:   #353560   (tileFilled, keyDefault — dark mode)
Gray 800:   #252542   (surface3 — dark mode)
Gray 900:   #1A1A2E   (surface2 — dark mode)
Gray 950:   #0D0D1A   (surface1 — dark mode)
Black:      #000000   (true black, OLED background)
```

### 3.2 Theme Definitions

#### Light Theme

```typescript
const LightTheme = {
  // Backgrounds
  background:        '#FAFAFE',   // Main screen background
  surface1:          '#FFFFFF',   // Cards, elevated content
  surface2:          '#F0F0F8',   // Secondary surfaces
  surface3:          '#E8E8F0',   // Inset surfaces, input fields

  // Text
  textPrimary:       '#1A1A2E',   // Main text
  textSecondary:     '#546E7A',   // Secondary, descriptive text
  textTertiary:      '#78909C',   // Hints, placeholders
  textInverse:       '#FFFFFF',   // Text on colored backgrounds

  // Game
  correct:           '#7C4DFF',
  present:           '#FF6B9D',
  absent:            '#455A64',
  tileEmpty:         '#E8E8F0',   // Empty tile border/fill
  tileFilled:        '#B0BEC5',   // Filled but unrevealed tile border
  keyDefault:        '#D5D5E0',   // Unplayed keyboard key

  // UI
  primary:           '#7C4DFF',
  border:            '#E8E8F0',
  divider:           '#F0F0F8',
  tabBarBg:          '#FFFFFF',
  tabBarBorder:      '#E8E8F0',
  statusBar:         'dark-content',
};
```

#### Dark Theme

```typescript
const DarkTheme = {
  // Backgrounds (layered for depth)
  background:        '#000000',   // True black (OLED)
  surface1:          '#0D0D1A',   // Slight elevation
  surface2:          '#1A1A2E',   // Cards, modals
  surface3:          '#252542',   // Interactive surfaces

  // Text
  textPrimary:       '#FFFFFF',
  textSecondary:     '#B3B3C0',
  textTertiary:      '#666680',
  textInverse:       '#1A1A2E',

  // Game
  correct:           '#7C4DFF',   // Same purple -- pops on black
  present:           '#FF6B9D',   // Same pink
  absent:            '#37474F',   // Slightly lighter for visibility on black
  tileEmpty:         '#252542',   // Empty tile
  tileFilled:        '#353560',   // Filled unrevealed
  keyDefault:        '#353560',   // Unplayed key

  // UI
  primary:           '#B39DFF',   // Lighter purple for dark backgrounds
  border:            '#252542',
  divider:           '#1A1A2E',
  tabBarBg:          '#0D0D1A',
  tabBarBorder:      '#1A1A2E',
  statusBar:         'light-content',
};
```

### 3.3 Accessibility Color Palettes

#### High Contrast Mode (Current -- Refine)

```
correct:  #FF9100  (Orange)    -- WCAG AAA on both light/dark
present:  #40C4FF  (Cyan)     -- WCAG AAA on both light/dark
absent:   #37474F  (Dark Slate) / #CFD8DC (Light Slate, for light theme)
```

#### Deuteranopia (Red-Green Color Blindness)

```
correct:  #2979FF  (Blue)
present:  #FF9100  (Orange)
absent:   #455A64  (Slate)
```

#### Protanopia (Red Color Blindness)

```
correct:  #2979FF  (Blue)
present:  #FFD600  (Yellow)
absent:   #455A64  (Slate)
```

#### Tritanopia (Blue-Yellow Color Blindness)

```
correct:  #FF1744  (Red)
present:  #00E5FF  (Cyan)
absent:   #455A64  (Slate)
```

### 3.4 Color Usage Rules

1. **Game state colors are sacred.** Purple = correct, Pink = present, Slate = absent. These never change meaning.
2. **Never use color alone** to communicate game state. Always pair with: position in tile, letter symbols, or accessibility markers.
3. **Maintain 4.5:1 contrast ratio** for all text on backgrounds (WCAG AA). Target 7:1 (AAA) where possible.
4. **Glow effects** use the game state color at 25-40% opacity. Never use for critical information.
5. **Error red (#FF5252)** is reserved for destructive actions only (reset stats, delete data). Never for game errors.

---

## 4. Typography

### 4.1 Type Scale

**Font Family:** Montserrat (Google Fonts)
**Weights Used:** 600 (SemiBold), 700 (Bold), 800 (ExtraBold)

```
Display       Montserrat 800    36pt / 40pt line    -0.5 tracking
              Use: App title, win tier text ("GENIUS", "SPLENDID")

Heading 1     Montserrat 700    26pt / 32pt line    -0.3 tracking
              Use: Screen titles ("Statistics", "Settings")

Heading 2     Montserrat 700    20pt / 26pt line    -0.2 tracking
              Use: Section headers, modal titles

Heading 3     Montserrat 700    17pt / 22pt line    0 tracking
              Use: Card titles, stat labels

Body          Montserrat 600    15pt / 22pt line    0 tracking
              Use: Descriptions, help text, definitions

Body Small    Montserrat 600    13pt / 18pt line    0.1 tracking
              Use: Captions, timestamps, secondary info

Tile Letter   Montserrat 800    Responsive (tile size * 0.55)
              Use: Letters on game tiles

Key Label     Montserrat 700    Responsive (see keyboard spec)
              Use: Keyboard key labels

Stat Number   Montserrat 800    32pt / 36pt line    -0.5 tracking
              Use: Large stat values (games played, win %, streak)

Mono          System monospace  13pt / 18pt line    0 tracking
              Use: Share text, debug info (if any)
```

### 4.2 Typography Rules

1. **Maximum 3 sizes per screen.** Each screen should use at most 3 levels of the type scale.
2. **Weight for hierarchy, not size.** Prefer using 700 vs 600 weight before increasing font size.
3. **All text must respect Dynamic Type.** Use `dynamicFontSize()` wrapper. Game tiles and keyboard may cap scaling at 1.5x to preserve layout.
4. **Line height is always > 1.3x font size** for body text. Headings may be tighter (1.1-1.2x).
5. **Letter spacing is negative for large text** (tighter) and slightly positive for small text (opener for readability).
6. **Numbers in statistics** use tabular (monospaced) figures if available. Montserrat supports this via OpenType features.

### 4.3 Text Color Pairing

| Text Type | Light Theme | Dark Theme |
|-----------|------------|------------|
| Primary text | `#1A1A2E` on `#FAFAFE` | `#FFFFFF` on `#000000` |
| Secondary text | `#546E7A` on `#FAFAFE` | `#B3B3C0` on `#000000` |
| Text on correct tile | `#FFFFFF` on `#7C4DFF` | `#FFFFFF` on `#7C4DFF` |
| Text on present tile | `#FFFFFF` on `#FF6B9D` | `#FFFFFF` on `#FF6B9D` |
| Text on absent tile | `#FFFFFF` on `#455A64` | `#FFFFFF` on `#37474F` |
| Disabled text | `#B0BEC5` on `#FAFAFE` | `#666680` on `#000000` |

---

## 5. Spacing & Layout

### 5.1 Spacing Scale (4px Base)

```
space-1:    4px     Tight internal padding (between icon and label)
space-2:    8px     Default internal padding, tight gaps
space-3:   12px     Card internal padding (compact)
space-4:   16px     Standard padding, component gaps
space-5:   20px     Section padding (compact)
space-6:   24px     Section padding (standard)
space-8:   32px     Large section separation
space-10:  40px     Screen-level padding
space-12:  48px     Major section separation
space-16:  64px     Screen-to-screen spacing
```

### 5.2 Layout Constants

```
Screen Padding:
  phone:        16px horizontal, 8px top (below safe area)
  phoneLarge:   20px horizontal
  tablet:       32px horizontal
  desktop:      centered, max-width 600px

Game Board:
  tile-gap:     phone: 5px, tablet: 8px
  tile-size:    calculated: (boardWidth - gap * 6) / 5
  board-width:  min(screenWidth * 0.95, 500px)
  board-margin-top: space-4 (16px) below header

Keyboard:
  key-gap:      phone: 4px, tablet: 6px
  key-height:   phone: 50px, tablet: 60px
  key-width:    calculated: (screenWidth - 60px) / 10
  keyboard-margin-top: auto (push to bottom)
  keyboard-padding-bottom: safe area + 8px

Tab Bar:
  height:       49px + safe area bottom
  icon-size:    24px
  label-size:   10px (hidden on very small screens)
```

### 5.3 Grid System

Game board tiles align to a 5-column grid. The grid has equal gutters (tile-gap) on all sides including outer edges. This creates a balanced, framed appearance.

```
┌─────────────────────────────────────────┐
│  gap  [T] gap [T] gap [T] gap [T] gap [T] gap  │
│  gap  [T] gap [T] gap [T] gap [T] gap [T] gap  │
│  gap  [T] gap [T] gap [T] gap [T] gap [T] gap  │
│  gap  [T] gap [T] gap [T] gap [T] gap [T] gap  │
│  gap  [T] gap [T] gap [T] gap [T] gap [T] gap  │
│  gap  [T] gap [T] gap [T] gap [T] gap [T] gap  │
└─────────────────────────────────────────┘
```

### 5.4 Safe Areas

- **Top:** Status bar height + space-2 (8px)
- **Bottom:** Home indicator height + space-2 (8px)
- **Keyboard avoidance:** Game board scrolls up if software keyboard overlaps (web)
- **Notch/Dynamic Island:** Content insets respect `SafeAreaView` from `react-native-safe-area-context`

---

## 6. Iconography

### 6.1 Icon Set

**Library:** Ionicons (already in use via `@expo/vector-icons`)

**Tab Bar Icons:**

| Tab | Active Icon | Inactive Icon | Label |
|-----|------------|---------------|-------|
| Game | `sparkles` | `sparkles-outline` | Game |
| Stats | `trending-up` | `trending-up-outline` | Stats |
| Help | `bulb` | `bulb-outline` | How to |
| Settings | `settings` | `settings-outline` | Settings |

**In-Game Icons:**

| Action | Icon | Size | Color |
|--------|------|------|-------|
| Backspace key | `backspace-outline` | 20px | Key text color |
| Enter key | Text "ENTER" | 12px | Key text color |
| Hint button | `bulb` | 20px | Teal accent |
| Share | `share-outline` | 22px | Primary |
| Close modal | `close` | 24px | Text secondary |
| New game | `refresh` | 20px | Primary |
| Timer (speed) | `time-outline` | 18px | Warning amber |

**Settings Icons:**

| Setting | Icon | Size |
|---------|------|------|
| Hard Mode | `flame` | 22px |
| High Contrast | `eye` | 22px |
| Haptic Feedback | `phone-portrait` | 22px |
| Sound | `volume-high` | 22px |
| Language | `globe` | 22px |
| Theme | `moon` / `sunny` | 22px |
| Reset Stats | `trash` | 22px |

### 6.2 Icon Rules

1. **Consistent size:** 22-24px for in-content icons, 20px for keyboard, 24px for tab bar.
2. **Consistent weight:** Use outline variant for inactive/default, filled for active/selected.
3. **Color follows context:** Icons match their adjacent text color. Never use a standalone color for decorative icons.
4. **Touch target:** Icon buttons have minimum 44x44px touch area regardless of icon visual size.

---

## 7. Component Library

### 7.1 Tile Component

The tile is WordVibe's most important component. It has five distinct states:

```
States:
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│          │  │    A     │  │    A     │  │    A     │  │    A     │
│  EMPTY   │  │  FILLED  │  │ CORRECT  │  │ PRESENT  │  │  ABSENT  │
│          │  │          │  │          │  │          │  │          │
└──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘
 Border only   Border +      Purple bg    Pink bg       Slate bg
 theme.tile    letter,       white text   white text    white text
 Empty         theme.tile    flush border flush border  flush border
               Filled
```

#### Empty Tile
- **Background:** Transparent
- **Border:** 2px solid `theme.tileEmpty`
- **Border Radius:** 4px
- **Shadow:** None

#### Filled (Unrevealed) Tile
- **Background:** Transparent
- **Border:** 2px solid `theme.tileFilled`
- **Border Radius:** 4px
- **Letter:** `theme.textPrimary`, Montserrat 800
- **Entry Animation:** Scale 1.0 -> 1.15 -> 1.0 (spring: damping 12, stiffness 350, mass 0.8)
- **Shadow:** None

#### Revealed Tile (Correct/Present/Absent)
- **Background:** Game state color (purple/pink/slate)
- **Border:** 2px solid (same as background, creates flush look)
- **Border Radius:** 4px
- **Letter:** `#FFFFFF`, Montserrat 800
- **Shadow (dark mode):** `0 2px 8px rgba(color, 0.3)` -- subtle glow in game state color
- **Shadow (light mode):** `0 1px 3px rgba(0,0,0,0.12)`

#### Tile Sizes (Responsive)

```
Phone (375px width):
  tile: 58px x 58px, letter: 32px, gap: 5px

Phone Large (414px width):
  tile: 64px x 64px, letter: 35px, gap: 5px

Tablet (768px width):
  tile: 72px x 72px, letter: 40px, gap: 8px

Tablet Large (1024px width):
  tile: 80px x 80px, letter: 44px, gap: 10px
```

### 7.2 Keyboard Key Component

```
States:
┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐
│  Q  │  │  Q  │  │  Q  │  │  Q  │  │  Q  │
│ DEF │  │ COR │  │ PRE │  │ ABS │  │PRESS│
└─────┘  └─────┘  └─────┘  └─────┘  └─────┘
Default   Correct  Present  Absent   Pressed
```

#### Default Key
- **Background:** `theme.keyDefault`
- **Border Radius:** 6px
- **Letter:** `theme.textPrimary`, Montserrat 700
- **Shadow:** `0 1px 2px rgba(0,0,0,0.1)` (subtle depth)

#### Revealed Key (after guess)
- **Background:** Game state color
- **Letter:** `#FFFFFF`
- **Transition:** Background color fades in over 300ms (after row reveal completes)
- **Shadow:** Same color at 20% opacity, 2px blur

#### Pressed Key
- **Scale:** 0.92 (spring: damping 15, stiffness 400)
- **Background:** Darkened 10% from current color
- **Duration:** Press down: 80ms. Release: 200ms (spring).
- **Haptic:** `impactLight` on press down

#### Special Keys

```
ENTER Key:
  width: 1.5x standard key
  label: "ENTER" text, Montserrat 700, 11px
  background: theme.primary (purple)
  text: white

BACKSPACE Key:
  width: 1.5x standard key
  icon: backspace-outline, 20px
  background: theme.keyDefault
```

#### Keyboard Layout

```
Row 1:  Q  W  E  R  T  Y  U  I  O  P      (10 keys)
Row 2:    A  S  D  F  G  H  J  K  L        (9 keys, offset 0.5 key)
Row 3: ENTER  Z  X  C  V  B  N  M  ⌫      (7 keys + 2 wide)
```

### 7.3 Vibe Meter Component

#### Visual Design

```
                    ┌─────────────────┐
                    │                 │
         ╭────╮    │   Vibe Meter    │
        ╭┤    ├╮   │                 │
       ╭┤│ 73 │├╮  │  Arc gauge with │
      ╭┤│╰────╯│├╮ │  gradient fill  │
     ╭┤│  ↑▲   │├╮ │  and score      │
    ╔╧╧╧╧╧╧╧╧╧╧╧╧╗ │                 │
    ╚══════════════╝ └─────────────────┘
```

- **Shape:** Semi-circular arc (180 degrees)
- **Size:** 120px diameter (phone), 160px (tablet)
- **Track:** 8px wide, `theme.surface3` color
- **Fill:** 8px wide, gradient based on score:
  - 0-20%: `#40C4FF` (cool blue)
  - 20-40%: `#00BFA5` (teal)
  - 40-60%: `#FFD600` (yellow)
  - 60-80%: `#FF9100` (orange)
  - 80-100%: Gradient from `#7C4DFF` to `#FF6B9D` (brand gradient)
- **Score Text:** Center of arc, Montserrat 800, 28px
- **Trend Arrow:** Below score, `↑` green or `↓` red, 14px
- **Label:** "VIBE" below arc, Montserrat 700, 10px, letter-spaced 2px
- **Animation:** Fill animates with spring physics on score change. Score number counts up/down.
- **Particles:** At 80%+, subtle sparkle particles orbit the arc perimeter.

#### Placement

- **Position:** Below game board, above keyboard
- **Visibility:** Visible after first guess is submitted. Fades in with first reveal.
- **Reduce Motion:** Static fill, no particles, instant transitions.

### 7.4 Button Components

#### Primary Button

```
┌──────────────────────────────┐
│        SHARE RESULT          │
└──────────────────────────────┘
```

- **Background:** `theme.primary` (#7C4DFF)
- **Text:** White, Montserrat 700, 15px, letter-spaced 1px
- **Height:** 48px
- **Border Radius:** 12px
- **Padding:** 0 24px
- **Shadow:** `0 4px 12px rgba(124, 77, 255, 0.3)`
- **Press:** Scale 0.97, shadow reduces, background darkens 8%
- **Disabled:** Opacity 0.4, no shadow

#### Secondary Button

- **Background:** `theme.surface3`
- **Text:** `theme.textPrimary`, Montserrat 600, 15px
- **Border:** 1px solid `theme.border`
- **Height:** 48px
- **Border Radius:** 12px
- **Press:** Background darkens 5%

#### Destructive Button

- **Background:** Transparent
- **Text:** `#FF5252`, Montserrat 600, 15px
- **Border:** 1px solid `#FF5252` at 30% opacity
- **Confirmation:** Requires double-tap or confirmation dialog

### 7.5 Toggle / Switch Component

- **Track (off):** `theme.surface3`, 51x31px, radius 16px
- **Track (on):** `theme.primary` (#7C4DFF)
- **Thumb:** White circle, 27px diameter, centered vertically
- **Animation:** Thumb slides with spring (damping: 20, stiffness: 300). Track color fades 200ms.
- **Haptic:** `impactLight` on toggle
- **Accessibility:** `accessibilityRole="switch"`, `accessibilityState={{ checked: value }}`

### 7.6 Toast Component

```
┌─────────────────────────────────────┐
│  🏆  Achievement Unlocked!          │
│      First Win - Score 100 points   │
└─────────────────────────────────────┘
```

- **Background:** `theme.surface2` with slight blur backdrop
- **Border Left:** 4px solid, color based on category (gold for achievement, purple for milestone)
- **Border Radius:** 12px
- **Shadow:** `0 8px 24px rgba(0,0,0,0.15)`
- **Animation:** Slide in from top with spring. Auto-dismiss after 3s with fade out.
- **Position:** Below status bar, full width minus 32px padding
- **Haptic:** `notificationSuccess`
- **Sound:** Achievement unlock chime

### 7.7 Modal Component

```
┌─────────────────────────────────────┐
│              SPLENDID               │
│           ⭐ 4/6 Guesses            │
│                                     │
│  ┌─────────────────────────────┐    │
│  │   Guess Distribution        │    │
│  │   1 ▓                       │    │
│  │   2 ▓▓▓                     │    │
│  │   3 ▓▓▓▓▓▓                  │    │
│  │   4 ▓▓▓▓▓▓▓▓▓▓▓▓ ← this   │    │
│  │   5 ▓▓▓▓▓                   │    │
│  │   6 ▓▓                      │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌──────────────────────────────┐   │
│  │        SHARE RESULT          │   │
│  └──────────────────────────────┘   │
│                                     │
│  Next WordVibe in 14:23:07          │
│                                     │
│  ┌──────────────────────────────┐   │
│  │        NEW GAME              │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

- **Backdrop:** `rgba(0,0,0,0.6)` with blur (8px)
- **Container:** `theme.surface2`, border radius 20px
- **Max Width:** 400px, centered
- **Padding:** 32px top, 24px sides, 24px bottom
- **Animation:** Scale from 0.9 -> 1.0 with spring + fade from 0 -> 1. Backdrop fades independently.
- **Dismissal:** Tap backdrop or swipe down. Spring-back if swipe doesn't reach threshold.
- **Accessibility:** `accessibilityViewIsModal={true}`, focus trapped inside.

---

## 8. Screen Specifications

### 8.1 Game Screen

The game screen is the heart of the app. Every pixel matters.

#### Layout (Top to Bottom)

```
┌────────────────────────────────────┐
│ ░░░░░░░░░ Status Bar ░░░░░░░░░░░░ │
├────────────────────────────────────┤
│                                    │
│           W O R D V I B E          │  ← App title, centered
│                                    │
│        ┌──┐┌──┐┌──┐┌──┐┌──┐       │
│        │  ││  ││  ││  ││  │       │  ← Row 1 (current guess)
│        └──┘└──┘└──┘└──┘└──┘       │
│        ┌──┐┌──┐┌──┐┌──┐┌──┐       │
│        │  ││  ││  ││  ││  │       │  ← Row 2
│        └──┘└──┘└──┘└──┘└──┘       │
│        ┌──┐┌──┐┌──┐┌──┐┌──┐       │
│        │  ││  ││  ││  ││  │       │  ← Row 3
│        └──┘└──┘└──┘└──┘└──┘       │
│        ┌──┐┌──┐┌──┐┌──┐┌──┐       │
│        │  ││  ││  ││  ││  │       │  ← Row 4
│        └──┘└──┘└──┘└──┘└──┘       │
│        ┌──┐┌──┐┌──┐┌──┐┌──┐       │
│        │  ││  ││  ││  ││  │       │  ← Row 5
│        └──┘└──┘└──┘└──┘└──┘       │
│        ┌──┐┌──┐┌──┐┌──┐┌──┐       │
│        │  ││  ││  ││  ││  │       │  ← Row 6
│        └──┘└──┘└──┘└──┘└──┘       │
│                                    │
│           ╭────────╮               │
│           │ VIBE 73│               │  ← Vibe Meter (after 1st guess)
│           ╰────────╯               │
│                                    │
│  [Q][W][E][R][T][Y][U][I][O][P]   │
│    [A][S][D][F][G][H][J][K][L]    │  ← Keyboard
│  [ENTER][Z][X][C][V][B][N][M][⌫]  │
│                                    │
│ ░░░ Game ░░░ Stats ░░ Help ░ Set ░ │  ← Tab bar
└────────────────────────────────────┘
```

#### Header

- **Title:** "WORDVIBE" in Montserrat 800, 18px, letter-spaced 4px
- **Color:** `theme.primary`
- **Subtitle (daily):** "Daily #247" in Montserrat 600, 12px, `theme.textSecondary`
- **Subtitle (unlimited):** "Unlimited" in Montserrat 600, 12px, `theme.textSecondary`
- **Subtitle (speed):** "Speed Mode" + timer icon in amber
- **Height:** 48px total

#### Game Board

- **Centered** horizontally
- **Vertical position:** Flexible. Board + Vibe Meter + Keyboard should fill available space between header and tab bar. Board starts at a natural position (not crammed to top).
- **Error Message:** Invalid word error appears as a floating pill above the board. Fades in/out. Never shifts board position.

```
Error Pill:
┌─────────────────────────────┐
│  Not in word list            │
└─────────────────────────────┘
  - Background: theme.surface2 (90% opacity) + blur
  - Text: theme.textPrimary, Montserrat 600, 14px
  - Border Radius: 20px (pill shape)
  - Padding: 8px 20px
  - Position: Absolute, centered, 16px above board
  - Animation: Fade in 200ms, hold 1.5s, fade out 300ms
  - Haptic: notificationError
```

#### Hint Button

- **Position:** Top-right corner of game area, aligned with title
- **Appearance:** Circular, 36px diameter, teal background
- **Icon:** Lightbulb, 18px, white
- **Badge:** Remaining hints count (small circle, top-right of button)
- **Press:** Scale 0.9, reveal hint with animation

### 8.2 Statistics Screen

#### Layout

```
┌────────────────────────────────────┐
│           STATISTICS               │
├────────────────────────────────────┤
│                                    │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  │
│  │ 127 │ │ 84% │ │  12 │ │  23 │  │  ← Summary cards
│  │Played│ │ Win │ │Streak│ │ Max │  │
│  └─────┘ └─────┘ └─────┘ └─────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │   GUESS DISTRIBUTION         │  │
│  │                              │  │
│  │  1  ▓▓▓ 4                    │  │
│  │  2  ▓▓▓▓▓▓ 8                 │  │
│  │  3  ▓▓▓▓▓▓▓▓▓▓▓▓ 18         │  │
│  │  4  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ 27   │  │  ← Highlighted if last win
│  │  5  ▓▓▓▓▓▓▓▓▓▓ 15           │  │
│  │  6  ▓▓▓▓▓ 7                  │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │   ACHIEVEMENTS               │  │
│  │                              │  │
│  │  🏆 First Win    ✅          │  │
│  │  🔥 7-Day Streak  ✅         │  │
│  │  ⚡ Speed Demon  ░░░░ 60%    │  │
│  │  🧠 Hard Mode    ░░ 30%     │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │   GAME HISTORY               │  │
│  │                              │  │
│  │  Today   🟪🟪🟪🟪🟪  1/6   │  │
│  │  Feb 13  🟪⬛💜⬛🟪  4/6   │  │
│  │  Feb 12  ⬛⬛💜🟪🟪  5/6   │  │
│  └──────────────────────────────┘  │
│                                    │
└────────────────────────────────────┘
```

#### Summary Cards

- **Layout:** 4 cards in a row, equal width
- **Card Style:** `theme.surface2`, border radius 12px, padding 12px
- **Number:** Montserrat 800, 28px, `theme.textPrimary`
- **Label:** Montserrat 600, 11px, `theme.textSecondary`, uppercase, letter-spaced 1px
- **Animation:** Numbers count up from 0 on screen entry (500ms, ease-out)

#### Guess Distribution

- **Bar Color:** `theme.surface3` (default), `theme.primary` (highlighted row = last win guess)
- **Bar Height:** 28px
- **Bar Border Radius:** 4px
- **Animation:** Bars grow from 0 width on screen entry, staggered 100ms
- **Count Label:** Right-aligned inside or next to bar, Montserrat 700, 13px

#### Achievements Section

- **Layout:** Scrollable list of achievement cards
- **Card:** `theme.surface2`, 64px height, border radius 12px
- **Icon:** 32px, left-aligned
- **Title:** Montserrat 700, 15px
- **Progress Bar (incomplete):** 4px height, `theme.surface3` track, `theme.primary` fill
- **Checkmark (complete):** Green teal circle with white checkmark

#### Game History

- **Layout:** Vertical list, most recent first
- **Row Height:** 48px
- **Date:** Montserrat 600, 14px, `theme.textSecondary`
- **Tile Grid:** Mini tile squares (12px each) showing result colors
- **Result:** "4/6" in Montserrat 700, 14px
- **Tap Action:** Expand to show full board state (animated height)

### 8.3 Help Screen

#### Layout

```
┌────────────────────────────────────┐
│            HOW TO PLAY             │
├────────────────────────────────────┤
│                                    │
│  Guess the word in 6 tries.        │
│  Each guess must be a valid        │
│  5-letter word.                    │
│                                    │
│  After each guess, the tiles       │
│  will show how close you are.      │
│                                    │
│  ─── Examples ────                 │
│                                    │
│  ┌──┐┌──┐┌──┐┌──┐┌──┐             │
│  │W ││E ││A ││R ││Y │             │
│  │🟪││  ││  ││  ││  │             │
│  └──┘└──┘└──┘└──┘└──┘             │
│  W is in the word and in the       │
│  correct spot.                     │
│                                    │
│  ┌──┐┌──┐┌──┐┌──┐┌──┐             │
│  │P ││I ││L ││L ││S │             │
│  │  ││💜││  ││  ││  │             │
│  └──┘└──┘└──┘└──┘└──┘             │
│  I is in the word but in the       │
│  wrong spot.                       │
│                                    │
│  ┌──┐┌──┐┌──┐┌──┐┌──┐             │
│  │V ││A ││G ││U ││E │             │
│  │  ││  ││  ││⬛││  │             │
│  └──┘└──┘└──┘└──┘└──┘             │
│  U is not in the word.             │
│                                    │
│  ─── Game Modes ────               │
│                                    │
│  Daily: A new puzzle every day.    │
│  Unlimited: Play as many as        │
│  you want.                         │
│  Speed: Race against the clock.    │
│                                    │
└────────────────────────────────────┘
```

#### Design Notes

- **ScrollView** with bounce
- **Examples** use actual tile components (not images) for consistency
- **Highlighted tile** in each example has a subtle glow/pulse animation
- **Section Dividers:** Thin line with centered label text
- **Body Text:** Montserrat 600, 15px, line height 22px

### 8.4 Settings Screen

#### Layout

```
┌────────────────────────────────────┐
│            SETTINGS                │
├────────────────────────────────────┤
│                                    │
│  GAMEPLAY                          │
│  ┌──────────────────────────────┐  │
│  │ 🔥 Hard Mode           [  ] │  │
│  │    Revealed hints must be    │  │
│  │    used in later guesses     │  │
│  ├──────────────────────────────┤  │
│  │ ⚡ Speed Mode           [  ] │  │
│  │    Race against the clock    │  │
│  └──────────────────────────────┘  │
│                                    │
│  ACCESSIBILITY                     │
│  ┌──────────────────────────────┐  │
│  │ 👁 High Contrast        [  ] │  │
│  │    Enhanced color scheme     │  │
│  ├──────────────────────────────┤  │
│  │ 🎨 Color Vision         >   │  │
│  │    Deuteranopia / Protanopia │  │
│  └──────────────────────────────┘  │
│                                    │
│  FEEDBACK                          │
│  ┌──────────────────────────────┐  │
│  │ 📱 Haptic Feedback      [✓] │  │
│  ├──────────────────────────────┤  │
│  │ 🔊 Sound Effects        [✓] │  │
│  └──────────────────────────────┘  │
│                                    │
│  APPEARANCE                        │
│  ┌──────────────────────────────┐  │
│  │ 🌙 Dark Mode            [✓] │  │
│  ├──────────────────────────────┤  │
│  │ 🌐 Language           EN  > │  │
│  └──────────────────────────────┘  │
│                                    │
│  DATA                              │
│  ┌──────────────────────────────┐  │
│  │ 🗑 Reset Statistics          │  │
│  │    This cannot be undone     │  │
│  └──────────────────────────────┘  │
│                                    │
│           v3.0.0                   │
│                                    │
└────────────────────────────────────┘
```

#### Design Notes

- **Section Headers:** Montserrat 700, 12px, `theme.textTertiary`, uppercase, letter-spaced 2px
- **Setting Groups:** Grouped in cards with `theme.surface2` background, border radius 12px
- **Row Height:** 64px (with description), 48px (without)
- **Dividers:** 1px `theme.border`, inset 16px from left
- **Toggle:** Custom switch component (Section 7.5)
- **Chevron (>):** For drill-down settings, `theme.textTertiary`
- **Destructive Row:** Red text, no background difference. Requires confirmation alert.
- **Version:** Centered at bottom, Montserrat 600, 12px, `theme.textTertiary`

---

## 9. Animation & Motion

### 9.1 Animation Principles

1. **Purpose:** Every animation must serve a purpose -- inform, guide, or delight. No animation for decoration alone.
2. **Physics-based:** Prefer spring animations over linear/ease curves. Springs feel natural.
3. **Choreographed:** Related animations should be coordinated (staggered, sequenced) not simultaneous.
4. **Interruptible:** All animations should be interruptible by user input. No forced waits.
5. **Performant:** All game animations run on the UI thread via Reanimated worklets. 60fps is mandatory.
6. **Respectful:** All animations respect `reduceMotion`. When enabled, state changes are instant.

### 9.2 Spring Presets

```typescript
const springs = {
  // Quick, snappy feedback (button press, key tap)
  snappy: {
    damping: 15,
    stiffness: 400,
    mass: 0.8,
  },

  // Smooth, natural movement (tile entry, modal)
  gentle: {
    damping: 20,
    stiffness: 200,
    mass: 1,
  },

  // Bouncy, playful (win celebration, achievement)
  bouncy: {
    damping: 8,
    stiffness: 300,
    mass: 0.6,
  },

  // Slow, dramatic (tile reveal, vibe meter)
  dramatic: {
    damping: 25,
    stiffness: 120,
    mass: 1.2,
  },
};
```

### 9.3 Timing Constants

```typescript
const timing = {
  // Tile reveal sequence
  tileFlipDuration:     300,   // ms, single tile flip (half-rotation)
  tileFlipStagger:      150,   // ms, delay between each tile
  tileRevealPause:      200,   // ms, pause before first flip
  postRevealBounce:     200,   // ms, delay before correct tiles bounce
  bounceTileStagger:    80,    // ms, stagger between bouncing tiles

  // Win/loss
  winModalDelay:        800,   // ms, after last tile reveals
  lossRevealDelay:      600,   // ms, before solution appears
  confettiDuration:     3000,  // ms, total confetti lifetime

  // UI transitions
  modalEntryDuration:   350,   // ms, modal scale + fade
  toastEntryDuration:   300,   // ms, toast slide in
  toastDisplayDuration: 3000,  // ms, toast visible time
  toastExitDuration:    250,   // ms, toast fade out
  tabTransitionDuration: 200,  // ms, screen cross-fade

  // Keyboard
  keyPressDuration:     80,    // ms, key scale down
  keyReleaseDuration:   200,   // ms, key scale up (spring)

  // Vibe meter
  vibeScoreCountDuration: 500, // ms, number count animation
};
```

### 9.4 Animation Sequences

#### Tile Entry (Letter Typed)

```
t=0ms     Key pressed, haptic fires
t=0ms     Tile scale: 1.0 → 1.15 (spring.snappy)
t=0ms     Letter appears (fade in 100ms)
t=0ms     Tile border: tileEmpty → tileFilled
t=150ms   Tile settles at 1.0
t=0ms     Key press sound plays
```

#### Tile Backspace (Letter Removed)

```
t=0ms     Letter fades out (80ms)
t=0ms     Tile scale: 1.0 → 0.95 → 1.0 (spring.snappy)
t=0ms     Tile border: tileFilled → tileEmpty
t=80ms    Complete
```

#### Row Reveal (Guess Submitted)

```
t=0ms     Submit haptic (impactMedium)
t=200ms   Pause (anticipation)

For each tile i (0-4):
  t=200 + i*150ms:
    - Tile flips: rotateX 0° → 90° (timing 150ms, ease-in)
    - At 90° (midpoint): background color changes to result
    - Tile flips: rotateX 90° → 0° (timing 150ms, ease-out)
    - Reveal sound plays (correct/present/absent variant)
    - Reveal haptic fires (context-dependent)
    - Vibe meter updates incrementally

t=200 + 5*150ms = 950ms: All tiles revealed

If any tiles correct:
  t=1150ms: Correct tiles bounce (scale 1.0 → 1.08 → 1.0, spring.bouncy, staggered 80ms)

t=1250ms: Keyboard key colors update (fade 300ms)
```

#### Win Sequence (Tier: Guess 4 "Splendid")

```
t=0ms     Row reveal begins (see above)
t=950ms   All tiles revealed
t=1150ms  Correct tiles do wave bounce (all 5, staggered 80ms)
t=1550ms  Win sound plays
t=1550ms  Win haptic pattern (3 ascending impacts)
t=1550ms  Confetti triggers from board center
t=1800ms  "SPLENDID" text fades in above board (scale 0.8→1.0, spring.bouncy)
t=2300ms  Result modal begins entry animation
t=2650ms  Modal fully visible
t=4550ms  Confetti fades out
```

#### Loss Sequence

```
t=0ms     Row reveal begins
t=950ms   All tiles revealed
t=1200ms  Board tiles desaturate slightly (opacity 0.7, 500ms)
t=1400ms  Solution word appears letter by letter (typewriter, 100ms per letter)
t=1900ms  Loss sound plays (gentle)
t=1900ms  Loss haptic (notificationWarning)
t=2400ms  Word definition card fades in below solution
t=3000ms  Result modal entry
```

#### Invalid Word Shake

```
t=0ms     Error haptic (notificationError)
t=0ms     Error sound plays
t=0ms     Current row: translateX oscillation
          0 → 10 → -10 → 8 → -8 → 4 → -4 → 0 (timing 400ms)
t=0ms     Error pill fades in above board
t=1500ms  Error pill fades out
t=400ms   Row returns to rest
```

#### Screen Transitions

```
Tab Switch:
  Outgoing screen: fade out (opacity 1→0, 100ms)
  Incoming screen: fade in (opacity 0→1, 200ms)
  Total: 200ms, no layout shift

Modal Open:
  Backdrop: fade in (opacity 0→0.6, 250ms)
  Content: scale 0.9→1.0 + fade in (spring.gentle, 350ms)

Modal Close:
  Content: scale 1.0→0.95 + fade out (timing 200ms, ease-in)
  Backdrop: fade out (200ms)
```

---

## 10. Sound Design

### 10.1 Audio Principles

1. **Purposeful:** Every sound communicates information or emotion. No decorative sounds.
2. **Subtle:** Sounds are quiet by default. They add texture, not noise.
3. **Harmonious:** All sounds are in the same key/scale. They should sound like they belong together.
4. **Responsive:** Sound latency must be < 50ms from trigger. Pre-load everything.
5. **Respectful:** Sounds respect system silent mode and in-app mute toggle.
6. **Layerable:** Multiple sounds playing simultaneously (tile stagger) should not clip or clash.

### 10.2 Sound Palette

#### Musical Key: C Major / A Minor (warm, approachable)

```
Key Press:
  - Type: Short percussive click
  - Pitch: C5 (letter), D5 (backspace), E5 (enter)
  - Duration: 50ms
  - Volume: 30% of max
  - Character: Soft mechanical, like a premium keyboard

Tile Reveal (Correct):
  - Type: Ascending chime
  - Pitches per position: C5, E5, G5, A5, C6 (ascending arpeggio)
  - Duration: 200ms each
  - Volume: 50%
  - Character: Bright, crystalline, satisfying

Tile Reveal (Present):
  - Type: Neutral bell
  - Pitch: A4 (consistent)
  - Duration: 150ms
  - Volume: 40%
  - Character: Warm, questioning, "getting closer"

Tile Reveal (Absent):
  - Type: Muted thud
  - Pitch: E3 (low)
  - Duration: 100ms
  - Volume: 25%
  - Character: Soft, definitive, not harsh

Invalid Word:
  - Type: Quick double-buzz
  - Pitch: B3, Bb3 (minor second, dissonant)
  - Duration: 200ms total
  - Volume: 40%
  - Character: Playful "nope"

Win (varies by tier):
  - Guess 1: Full C major chord arpeggio → triumphant resolution, 2s
  - Guess 2: Ascending scale run → bright chord, 1.5s
  - Guess 3: Three-note chime → chord, 1.2s
  - Guess 4: Two ascending notes → chord, 1s
  - Guess 5: Gentle resolution chord, 0.8s
  - Guess 6: Single relieved sigh + gentle note, 0.5s
  Volume: 60%
  Character: Calibrated celebration

Loss:
  - Type: Descending two-note phrase resolving to major
  - Duration: 1.2s
  - Volume: 40%
  - Character: Empathetic, "it's okay, tomorrow"

Achievement Unlock:
  - Type: Sparkle → ascending arpeggio
  - Duration: 1s
  - Volume: 55%
  - Character: "Level up" feeling

Streak Milestone:
  - Type: Fanfare (3-5 notes, ascending)
  - Duration: 1.5s
  - Volume: 60%
  - Character: Proud, brass-like
```

### 10.3 Audio Implementation

```typescript
// Sound manager architecture
interface SoundManager {
  // Lifecycle
  preloadAll(): Promise<void>;
  unloadAll(): Promise<void>;

  // Playback
  play(soundId: SoundId, options?: PlayOptions): void;
  playSequence(sounds: { id: SoundId; delay: number }[]): void;

  // Settings
  setMuted(muted: boolean): void;
  setVolume(volume: number): void; // 0.0 - 1.0
  isMuted(): boolean;

  // System integration
  respectsSilentMode: boolean; // true on iOS
}

type SoundId =
  | 'keyPressLetter'
  | 'keyPressBackspace'
  | 'keyPressEnter'
  | 'tileCorrect'
  | 'tilePresent'
  | 'tileAbsent'
  | 'winTier1' | 'winTier2' | 'winTier3'
  | 'winTier4' | 'winTier5' | 'winTier6'
  | 'loss'
  | 'invalidWord'
  | 'achievementUnlock'
  | 'streakMilestone'
  | 'uiToggle';

interface PlayOptions {
  volume?: number;    // Override default volume
  pitch?: number;     // Pitch shift (for tile position variants)
  delay?: number;     // Delay before playing (ms)
}
```

---

## 11. Haptic Design

### 11.1 Haptic Language

Each game event has a distinct haptic signature. Players should be able to distinguish correct from absent tiles by feel alone (useful for visually impaired players).

```
Key Press (letter):        impactLight
Key Press (backspace):     impactLight (softer)
Key Press (enter/submit):  impactMedium

Tile Reveal (correct):     notificationSuccess
                           (distinctive double-tap feel)

Tile Reveal (present):     impactMedium
                           (single moderate tap)

Tile Reveal (absent):      impactLight
                           (barely there, acknowledgment)

Invalid Word:              notificationError
                           (sharp buzz)

Win:                       Custom pattern:
                           impactMedium → 100ms pause →
                           impactMedium → 100ms pause →
                           impactHeavy
                           (ascending build)

Loss:                      notificationWarning
                           (single gentle pulse)

Streak Milestone:          notificationSuccess → 200ms →
                           notificationSuccess
                           (double celebration)

Achievement Unlock:        notificationSuccess
                           (single celebratory)

Toggle Switch:             impactLight
                           (feedback for state change)

Error (general):           notificationError

Vibe Meter Threshold:      impactLight
                           (crossing score boundaries)
```

### 11.2 Haptic Rules

1. **Always pair with visual.** Haptics supplement, never replace visual feedback.
2. **Never double-fire.** If a sound plays at the same moment, the haptic should complement it, not compete.
3. **Respect user preference.** Check haptic feedback toggle before every fire.
4. **Platform-aware.** Use Expo Haptics API which handles iOS/Android differences.
5. **Distinguishable patterns.** A VoiceOver user should be able to tell correct from absent by haptic alone.

---

## 12. Accessibility Design

### 12.1 VoiceOver / TalkBack Flow

The game must be fully playable and enjoyable through screen readers. This is not a reduced experience -- it's an alternative experience with its own design.

#### Navigation Order (Game Screen)

```
1. Header: "WordVibe Daily 247" (heading)
2. Game Board: "Game board, 6 rows of 5 tiles"
   2a. Row 1: "Row 1: [letters and status]"
   ...
3. Vibe Meter: "Vibe score: 73 percent, trending up" (live region)
4. Keyboard Row 1: Q, W, E, R, T, Y, U, I, O, P
5. Keyboard Row 2: A, S, D, F, G, H, J, K, L
6. Keyboard Row 3: Enter, Z, X, C, V, B, N, M, Backspace
7. Hint Button: "Use hint, 2 remaining"
```

#### Announcements

```
On letter typed:
  "[Letter]. [Position] of 5."
  Example: "S. 3 of 5."

On backspace:
  "Deleted [letter]. [Position] of 5."

On guess submitted:
  Wait for reveal animation to complete, then:
  "Row [N] result: [letter] correct, [letter] close, [letter] not in word,
   [letter] correct, [letter] not in word. [X] correct, [Y] close."

On win:
  "You won! The word is [WORD]. Solved in [N] guesses.
   [WIN_TIER] -- [TIER_NAME]."

On loss:
  "Game over. The word was [WORD]."

On invalid word:
  "[WORD] is not in the word list. Try another word."

On hard mode violation:
  "[Specific violation message]."

On keyboard key status:
  "Letter [X], [status]" where status is "correct", "close",
  "not in word", or "not yet used"
```

#### Focus Management

- On game launch: Focus on first empty tile position (or current input position)
- After guess submitted: Focus returns to first tile of next row after reveal
- On modal open: Focus moves to modal title, trapped inside modal
- On modal close: Focus returns to element that triggered modal
- On achievement toast: Announced via live region, does not steal focus

### 12.2 Non-Color Information Channels

For users who cannot perceive color differences, tile status must be communicated through additional channels:

#### Option A: Letter Markers (Default for High Contrast Mode)

```
Correct tile: Letter with subtle checkmark underline
Present tile: Letter with dot below
Absent tile:  Letter only (no marker)
```

Implementation: Small symbol rendered below the letter inside the tile. Size: 6px. Does not interfere with letter readability.

#### Option B: Pattern Fills (Optional Setting)

```
Correct: Solid fill
Present: Diagonal stripe pattern (45°)
Absent:  Crosshatch pattern
```

Implementation: SVG pattern overlay on tile background. Subtle enough to not overwhelm the letter.

### 12.3 Reduce Motion Behavior

When `reduceMotion` is enabled, the following changes apply:

| Normal Behavior | Reduce Motion Behavior |
|----------------|----------------------|
| Tile flip animation (3D rotate) | Instant color change (no rotation) |
| Tile entry bounce | Instant letter appearance |
| Confetti particles | No confetti |
| Vibe meter spring animation | Instant position change |
| Modal scale + fade | Instant appear/disappear |
| Key press spring | Instant visual feedback (opacity change) |
| Error shake | Border flash (red border 200ms) |
| Achievement toast slide | Instant appear, fade out only |
| Screen transitions (fade) | Instant switch |
| Distribution bar growth | Instant width |

**Critical:** All game logic, timing, and functionality remain identical. Only visual presentation changes.

### 12.4 Motor Accessibility

- **Minimum touch target:** 44x44 points for all interactive elements
- **Key press tolerance:** No double-tap required for any game action
- **Timeout accommodation:** Speed mode has an accessibility setting to extend or disable timer
- **Switch Control:** Verified linear navigation through all interactive elements
- **One-hand operation:** All game actions reachable in portrait mode with one hand on standard phone sizes

---

## 13. Dark Mode Design

### 13.1 Design Philosophy

Dark mode is not inverted light mode. It is a carefully designed alternative that:

- Uses true black (`#000000`) for OLED power savings
- Creates depth through layered surfaces (3 elevation levels)
- Makes game state colors more vivid against dark backgrounds
- Reduces eye strain in low-light environments
- Feels cozy, focused, and immersive

### 13.2 Elevation System

```
Layer 0 (Background):     #000000  ← Screen background, true black
Layer 1 (Surface):        #0D0D1A  ← Tab bar, status bar areas
Layer 2 (Card):           #1A1A2E  ← Cards, modals, grouped settings
Layer 3 (Interactive):    #252542  ← Buttons, keyboard keys, inputs
Layer 4 (Hover/Active):   #353560  ← Active states, pressed elements
```

Each layer adds subtle elevation. On OLED screens, Layer 0 pixels are completely off, creating a floating effect for content above.

### 13.3 Dark Mode Specific Adjustments

```
Tile empty border:    #252542 → #353560 (slightly brighter for visibility)
Tile filled border:   #353560 → #454575 (distinguish from empty)
Correct tile glow:    0 0 12px rgba(124, 77, 255, 0.4)  ← subtle purple halo
Present tile glow:    0 0 12px rgba(255, 107, 157, 0.3) ← subtle pink halo
Tab bar:              Layer 1 (#0D0D1A) with 1px top border (#1A1A2E)
Keyboard keys:        Layer 3 (#252542) with 1px shadow below
Primary text:         #FFFFFF at 95% opacity (pure white can be harsh)
Secondary text:       #B3B3C0 (desaturated lavender-gray)
```

### 13.4 Transition Between Themes

When the user toggles dark/light mode:

- All colors transition simultaneously over 300ms (no individual delays)
- Use `LayoutAnimation.configureNext()` or Reanimated `useAnimatedStyle` with color interpolation
- Game state colors (purple, pink, slate) remain stable -- only backgrounds and text change
- No flash of wrong theme on app launch (read persisted theme before first render)

---

## 14. Responsive & Adaptive Design

### 14.1 Breakpoints

```
Phone:           320 - 413px   (iPhone SE to iPhone 14)
Phone Large:     414 - 767px   (iPhone 14 Pro Max, small tablets)
Tablet:          768 - 1023px  (iPad mini, iPad Air portrait)
Tablet Large:    1024 - 1279px (iPad Pro, iPad landscape)
Desktop:         1280px+       (web browser)
```

### 14.2 Phone Layout (Primary)

```
┌──────────────────────┐
│      WORDVIBE        │  Header: centered, compact
│                      │
│    ┌──┐┌──┐┌──┐┌──┐┌──┐  │  Board: full width - 16px padding
│    │  ││  ││  ││  ││  │  │  Tile size: ~58-64px
│    └──┘└──┘└──┘└──┘└──┘  │
│    (6 rows)          │
│                      │
│      ╭──────╮        │  Vibe meter: compact, centered
│      │ 73 ↑ │        │
│      ╰──────╯        │
│                      │
│ [Q][W][E][R][T][Y].. │  Keyboard: edge-to-edge
│   [A][S][D][F][G]..  │
│ [ENT][Z][X]..   [⌫]  │
│                      │
│ Game │Stats│Help│Set │  Tab bar: standard
└──────────────────────┘
```

### 14.3 Tablet Layout

```
┌──────────────────────────────────────────┐
│              WORDVIBE                     │  Header: centered
│                                           │
│         ┌──┐┌──┐┌──┐┌──┐┌──┐             │  Board: centered, max 500px
│         │  ││  ││  ││  ││  │             │  Tile size: ~72px
│         └──┘└──┘└──┘└──┘└──┘             │
│         (6 rows)                          │  More vertical space
│                                           │
│              ╭──────────╮                 │  Vibe meter: larger
│              │   73 ↑   │                 │
│              ╰──────────╯                 │
│                                           │
│    [Q] [W] [E] [R] [T] [Y] [U] [I] [O] [P]    │  Keyboard: centered, max 600px
│      [A] [S] [D] [F] [G] [H] [J] [K] [L]      │  Key size: 50-56px
│   [ENTER] [Z] [X] [C] [V] [B] [N] [M] [⌫]     │
│                                           │
│  Game  │  Stats  │  Help  │  Settings     │  Tab bar: labels visible
└──────────────────────────────────────────┘
```

### 14.4 Desktop/Web Layout

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│                        WORDVIBE                          │
│                                                          │
│              ┌─────────────────────────┐                 │
│              │   Game Board (max 420px) │                 │
│              │   centered in viewport   │                 │
│              └─────────────────────────┘                 │
│                                                          │
│              ┌─────────────────────────┐                 │
│              │   Keyboard (max 520px)   │                 │
│              │   centered below board   │                 │
│              └─────────────────────────┘                 │
│                                                          │
│    ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                  │
│    │ Game │ │Stats │ │ Help │ │ Set  │                   │  Navigation: horizontal
│    └──────┘ └──────┘ └──────┘ └──────┘                  │  or top bar
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 14.5 Adaptive Behaviors

| Element | Phone | Tablet | Desktop |
|---------|-------|--------|---------|
| Title font size | 18px | 22px | 24px |
| Tile size | 58-64px | 72px | 68px |
| Tile gap | 5px | 8px | 6px |
| Key height | 50px | 60px | 54px |
| Key font | 14px | 18px | 16px |
| Screen padding | 16px | 32px | auto (centered) |
| Max content width | 100% | 600px | 520px |
| Vibe meter diameter | 100px | 140px | 120px |
| Stats columns | 1 | 2 | 2 |
| Modal max width | 100% - 32px | 420px | 420px |

---

## 15. Micro-interactions Catalog

A comprehensive list of every interaction point and its designed response.

### 15.1 Game Interactions

| Trigger | Visual | Sound | Haptic |
|---------|--------|-------|--------|
| Type letter | Tile scale bounce, letter appears | Soft click | impactLight |
| Delete letter | Tile scale shrink, letter fades | Softer click | impactLight |
| Submit guess | Row locks, reveal begins | Submit click | impactMedium |
| Tile reveals correct | 3D flip, purple glow bloom | Ascending chime | notificationSuccess |
| Tile reveals present | 3D flip, pink color | Neutral bell | impactMedium |
| Tile reveals absent | 3D flip, slate color | Muted thud | impactLight |
| Invalid word | Row shakes, error pill | Double buzz | notificationError |
| Hard mode violation | Row shakes, specific error pill | Double buzz | notificationError |
| Win | Tile wave, confetti, tier text | Win fanfare | Custom pattern |
| Loss | Board dims, solution typewriter | Gentle loss tone | notificationWarning |
| Hint used | Target tile highlights, letter fills | Sparkle sound | impactMedium |

### 15.2 Navigation Interactions

| Trigger | Visual | Sound | Haptic |
|---------|--------|-------|--------|
| Tab switch | Cross-fade screens | None | None |
| Modal open | Scale + fade, backdrop blur | None | impactLight |
| Modal close | Scale + fade out | None | None |
| Swipe modal down | Interactive dismiss | None | impactLight at threshold |
| Toast appears | Slide from top | Category-specific | notificationSuccess |
| Toast dismissed | Fade out | None | None |

### 15.3 Settings Interactions

| Trigger | Visual | Sound | Haptic |
|---------|--------|-------|--------|
| Toggle on | Thumb slides right, track fills | Toggle click | impactLight |
| Toggle off | Thumb slides left, track empties | Toggle click | impactLight |
| Tap destructive | Confirmation dialog appears | None | notificationWarning |
| Confirm destructive | Executed, brief success indicator | None | notificationSuccess |
| Language select | Picker/sheet appears | None | impactLight |

### 15.4 Stats Interactions

| Trigger | Visual | Sound | Haptic |
|---------|--------|-------|--------|
| Screen entry | Numbers count up, bars animate | None | None |
| Tab switch | Slide content, indicator moves | None | impactLight |
| History row tap | Row expands to show board | None | impactLight |
| Achievement locked | Grayed out, progress bar shown | None | None |
| Achievement unlocked | Full color, checkmark badge | None | None |

---

## 16. Emotional Design Map

### 16.1 Player Emotional Journey

```
Game Start
│
├─ Guess 1: Curiosity, Exploration
│   Mood: Light, Open
│   Design: Neutral tones, gentle animations
│   Sound: Soft, minimal
│
├─ Guess 2-3: Focus, Strategy
│   Mood: Engaged, Analytical
│   Design: Colors emerging, vibe meter active
│   Sound: More presence in reveals
│
├─ Guess 4-5: Tension, Determination
│   Mood: Invested, Stakes rising
│   Design: Reveal animations slightly slower (building suspense)
│   Sound: More dramatic reveals, music undertone
│
├─ Guess 6: Peak Tension
│   Mood: Anxious, Hopeful
│   Design: Slowest reveal, maximum anticipation
│   Sound: Dramatic pause before final reveal
│
├─ Win: Release, Satisfaction
│   Mood: Triumphant to Relieved (based on guess count)
│   Design: Celebration calibrated to difficulty
│   Sound: Fanfare proportional to achievement
│
└─ Loss: Acceptance, Anticipation
    Mood: Brief disappointment → Curiosity about tomorrow
    Design: Gentle, never punishing
    Sound: Empathetic, forward-looking
```

### 16.2 Design Implications

| Emotional Phase | Design Response |
|----------------|-----------------|
| First letter of first guess | Extra-satisfying tile entry (slightly bigger bounce than subsequent letters) |
| All tiles empty | Board feels inviting, tiles have a subtle "ready" glow on first row |
| Getting close (3+ present) | Vibe meter rises visibly, encouraging continued play |
| No matches | Vibe meter dips gently, not punitively |
| Streak at risk (late in day) | Subtle reminder via notification, not in-app pressure |
| Long streak maintained | Background subtly warmer (golden tint), pride without pressure |
| First ever win | Extra celebration + tutorial about sharing/stats |
| Return after absence | Warm welcome back, no guilt about broken streak |

### 16.3 Error States as Design Moments

Errors should feel helpful, never frustrating.

```
"Not in word list"
  → Playful shake, brief message, immediately ready for next input
  → Never: Block input, force dismissal, or make user feel stupid

"Hard mode: 2nd letter must be R"
  → Specific, actionable feedback with the violation highlighted
  → Never: Generic "Invalid guess" with no explanation

"Already completed today's puzzle"
  → Show result with pride, offer unlimited mode
  → Never: Error state, locked screen, or dead end
```

---

## Appendix A: Asset Requirements

### Sounds

| Asset | Format | Duration | Notes |
|-------|--------|----------|-------|
| key_press_letter.wav | WAV 44.1kHz | 50ms | Clean mechanical click |
| key_press_backspace.wav | WAV | 50ms | Slightly softer variant |
| key_press_enter.wav | WAV | 80ms | Slightly more substantial |
| tile_correct.wav | WAV | 200ms | Ascending chime, 5 pitch variants |
| tile_present.wav | WAV | 150ms | Neutral warm bell |
| tile_absent.wav | WAV | 100ms | Soft muted thud |
| win_tier_1.wav | WAV | 2000ms | Triumphant fanfare (genius) |
| win_tier_2.wav | WAV | 1500ms | Bright celebration |
| win_tier_3.wav | WAV | 1200ms | Pleasant chime sequence |
| win_tier_4.wav | WAV | 1000ms | Warm resolution |
| win_tier_5.wav | WAV | 800ms | Gentle satisfaction |
| win_tier_6.wav | WAV | 500ms | Relieved exhale + note |
| loss.wav | WAV | 1200ms | Empathetic descending phrase |
| invalid_word.wav | WAV | 200ms | Quick double buzz |
| achievement.wav | WAV | 1000ms | Sparkle + ascending |
| streak_milestone.wav | WAV | 1500ms | Proud fanfare |
| toggle.wav | WAV | 50ms | UI click |

Total audio assets: ~17 files, estimated ~500KB total

### Images

| Asset | Format | Sizes | Notes |
|-------|--------|-------|-------|
| App icon | PNG | 1024x1024 (source) | "W" tile on gradient |
| Splash screen | PNG | Various per device | Logo centered on #1A1A2E |
| Share card template | SVG/PNG | 1200x630 | Branded result card |
| Achievement icons | SVG | 32x32 @3x | Per-achievement icon set |
| Widget backgrounds | PNG | Per widget size | Daily status widgets |
| Onboarding illustrations | SVG | Responsive | Tutorial step visuals |

### Fonts

| Font | Weights | Format | Subset |
|------|---------|--------|--------|
| Montserrat | 600, 700, 800 | TTF/OTF | Latin Extended (support EN, TR, ES, FR, DE, PT) |

---

## Appendix B: Component API Reference

### Tile Props

```typescript
interface TileProps {
  letter: string;
  status: 'empty' | 'filled' | 'correct' | 'present' | 'absent';
  position: number;       // 0-4, column index
  row: number;            // 0-5, row index
  isCurrentRow: boolean;
  revealDelay: number;    // ms, stagger delay for this tile
  onRevealComplete?: () => void;
}
```

### Keyboard Key Props

```typescript
interface KeyProps {
  letter: string;
  status: 'default' | 'correct' | 'present' | 'absent';
  onPress: (letter: string) => void;
  width: 'standard' | 'wide';
  disabled: boolean;
}
```

### Vibe Meter Props

```typescript
interface VibeMeterProps {
  score: number;          // 0-100
  trend: 'up' | 'down' | 'neutral';
  visible: boolean;
  size: 'compact' | 'standard' | 'large';
}
```

### Modal Props

```typescript
interface GameModalProps {
  visible: boolean;
  result: 'win' | 'loss';
  winTier?: 1 | 2 | 3 | 4 | 5 | 6;
  guessCount: number;
  solution: string;
  guesses: Guess[];
  stats: Statistics;
  onShare: () => void;
  onNewGame: () => void;
  onClose: () => void;
}
```

---

## Appendix C: Quality Checklist

Before shipping any screen or component, verify:

- [ ] Works in light mode
- [ ] Works in dark mode (true black background)
- [ ] Works with high contrast mode enabled
- [ ] Works with Dynamic Type at default, XL, and XXXL sizes
- [ ] Works with reduce motion enabled
- [ ] All interactive elements have accessibility labels
- [ ] VoiceOver navigation order is logical
- [ ] All touch targets are >= 44x44 points
- [ ] Text contrast ratios meet WCAG AA (4.5:1 minimum)
- [ ] Animations run at 60fps (profile with React DevTools)
- [ ] No unnecessary re-renders (profile with React DevTools)
- [ ] Sounds play at correct moment and volume
- [ ] Haptics fire at correct moment and intensity
- [ ] Works on iPhone SE (smallest supported screen)
- [ ] Works on iPad (largest supported screen)
- [ ] Works on web with keyboard input
- [ ] No memory leaks (check with Instruments/Profiler)
