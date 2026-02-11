/**
 * Named animation timing constants.
 * Shared across gameBoard.tsx and letterSquare.tsx.
 */

/** Delay between each tile flip in a row (ms) */
export const TILE_FLIP_STAGGER_MS = 250;

/** Duration of a single tile flip half-rotation (ms) */
export const TILE_FLIP_DURATION_MS = 250;

/** Number of letter tiles per row */
export const TILES_PER_ROW = 5;

/** Total time for all tile flips in a row to complete (ms) */
export const ROW_FLIP_TOTAL_MS = TILE_FLIP_STAGGER_MS * TILES_PER_ROW;

/** Delay after row flip before showing the win modal (ms) */
export const WIN_MODAL_EXTRA_DELAY_MS = 800;

/** Delay before showing the loss modal (ms) */
export const LOSS_MODAL_DELAY_MS = 1500;

/** Gap between last flip and start of bounce animation (ms) */
export const BOUNCE_POST_FLIP_GAP_MS = 200;

/** Stagger between each tile's bounce in the winning row (ms) */
export const BOUNCE_TILE_STAGGER_MS = 100;
