/**
 * Named animation timing constants.
 * Shared across gameBoard.tsx and letterSquare.tsx.
 */

/** Initial anticipation pause before the first tile starts flipping (ms) */
export const TILE_FLIP_INITIAL_DELAY_MS = 200;

/** Delay between each tile flip in a row (ms) */
export const TILE_FLIP_STAGGER_MS = 200;

/** Duration of a single tile flip half-rotation (ms) */
export const TILE_FLIP_DURATION_MS = 200;

/** Scale peak during the flip midpoint pulse */
export const TILE_FLIP_MIDPOINT_SCALE = 1.05;

/** Scale peak for correct-tile celebration pulse after row reveal */
export const TILE_CORRECT_PULSE_SCALE = 1.08;

/** Spring config for the correct-tile celebration pulse */
export const TILE_CORRECT_PULSE_SPRING = {
  damping: 8,
  stiffness: 300,
} as const;

/** Number of letter tiles per row */
export const TILES_PER_ROW = 5;

/** Total time for all tile flips in a row to complete (ms) */
export const ROW_FLIP_TOTAL_MS = TILE_FLIP_INITIAL_DELAY_MS + TILE_FLIP_STAGGER_MS * (TILES_PER_ROW - 1) + TILE_FLIP_DURATION_MS;

/** Delay after row flip before showing the win modal (ms) */
export const WIN_MODAL_EXTRA_DELAY_MS = 800;

/** Delay before showing the loss modal (ms) */
export const LOSS_MODAL_DELAY_MS = 1500;

/** Gap between last flip and start of bounce animation (ms) */
export const BOUNCE_POST_FLIP_GAP_MS = 200;

/** Stagger between each tile's bounce in the winning row (ms) */
export const BOUNCE_TILE_STAGGER_MS = 100;

/** Spring config for tile entry "pop" when a letter is typed */
export const TILE_ENTRY_SPRING = {
  damping: 12,
  stiffness: 350,
  mass: 0.8,
} as const;

/** Target scale for tile entry pop */
export const TILE_ENTRY_SCALE = 1.15;

/** Duration the border stays highlighted during tile entry (ms) */
export const TILE_ENTRY_BORDER_FLASH_MS = 150;
