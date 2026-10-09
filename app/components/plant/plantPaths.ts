// shared plant geometry: the rose + fern drawn by the projects timeline
// (TimelinePlant) and reused by the smaller sprigs elsewhere (Sprig).
// all paths are authored at the timeline's size, pointing up-right.

// gently curved stem, from the node (0,0) up to the tip ~(13,-42). authored
// pointing up-right; `lean` mirrors it via scaleX on the root group. this one
// really is a line "growing", so it stays a stroke draw-on.
export const STEM = "M 0 0 C 2 -13, 11 -24, 13 -42";
// the rose gets a shorter stem so its (enlarged) bud carries more of the same
// overall height -- a bigger flower-to-stem ratio. every point is the base
// curve scaled 1.15x along its length (15% longer), tip now ~(9.2,-27.6).
export const ROSE_STEM = "M 0 0 C 1.15 -9.2, 5.75 -18.4, 9.2 -27.6";
// tip of ROSE_STEM — the rose head sits here.
export const ROSE_TIP = { x: 9.2, y: -27.6 };

// --- morph keyframes -------------------------------------------------------
// every keyframe for a given element shares the exact command skeleton
// (M _ _ C _ _, _ _, _ _ C _ _, _ _, _ _) so motion can interpolate the
// numbers between them: collapsed-at-origin -> round bulb -> final shape.

export const LEAF_HIDDEN = "M 0 0 C 0 0, 0 0, 0 0 C 0 0, 0 0, 0 0";
export const LEAF_BULB = "M 0 0 C 0 -2.6, 5 -2.6, 5 0 C 5 2.6, 0 2.6, 0 0";
// rounded base at the origin, pointed tip at (13,0) — the two cubics meet at a
// corner there, so it reads as a real leaf point
export const LEAF_SHAPE = "M 0 0 C 0 -4, 8 -5, 13 0 C 8 5, 0 4, 0 0";

export const BUD_HIDDEN = "M 0 0 C 0 0, 0 0, 0 0 C 0 0, 0 0, 0 0";
export const BUD_BULB = "M 0 0 C 0 -3, 6 -3, 6 0 C 6 3, 0 3, 0 0";
// fat, slightly-pointed oval — the sketch's "thick end"
export const BUD_SHAPE = "M 0 0 C 0 -5, 9 -6, 12 0 C 9 6, 0 5, 0 0";

// short curves carved through the bud in the background colour to suggest
// petal separations (the "curved line or two" from the sketch)
export const PETAL_A = "M 2 -1 C 4 -3, 7 -3, 9 0";
export const PETAL_B = "M 3 2 C 5 0, 7 0, 9 -1";

// fern leaves: 3 alternating up the stem + 1 terminal frond. positioned onto
// the stem via a static translate/rotate. the angles splay wide off the stem
// (nearly sideways) so it reads as a frond, not thorns hugging a line.
export const LEAVES = [
    { x: 4, y: -13, angle: -22 }, // right, splayed out
    { x: 7, y: -22, angle: -158 }, // left, splayed out
    { x: 10, y: -31, angle: -22 }, // right, splayed out
    { x: 13, y: -42, angle: -90 }, // terminal, straight up
];

// rose gets a pair of fern-style leaves near the bud: sampled at 75% and 80%
// up the ROSE_STEM curve, splayed onto opposite sides, and scaled to 85% of
// the fern leaf size (15% smaller). they morph in the same hidden->bulb->leaf
// way as the fern.
export const ROSE_LEAF_SCALE = 0.85;
export const ROSE_LEAVES = [
    { x: 6.47, y: -20.7, angle: -22 }, // ~75% up, right side
    { x: 7.03, y: -22.08, angle: -158 }, // ~80% up, left side
];
