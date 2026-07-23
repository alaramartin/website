"use client";
import { motion, useTransform, type MotionValue } from "motion/react";

export type PlantVariant = "rose" | "fern";

interface TimelinePlantProps {
    // 0 -> 1 growth progress, driven by the scroll edge crossing the node
    bloom: MotionValue<number>;
    variant: PlantVariant;
    // horizontal grow direction: 1 leans up-right, -1 leans up-left. always
    // set to point away from the card, so the plant clears the timeline curve.
    lean: 1 | -1;
}

// shrink the whole plant to ~75% of its authored size
const SCALE = 0.75;
const STROKE = "var(--color-accent)";

// gently curved stem, from the node (0,0) up to the tip ~(13,-42). authored
// pointing up-right; `lean` mirrors it via scaleX on the root group. this one
// really is a line "growing", so it stays a stroke draw-on.
const STEM = "M 0 0 C 2 -13, 11 -24, 13 -42";
// the rose gets a shorter stem so its (enlarged) bud carries more of the same
// overall height -- a bigger flower-to-stem ratio.
const ROSE_STEM = "M 0 0 C 1 -8, 5 -16, 8 -24";

// --- morph keyframes -------------------------------------------------------
// every keyframe for a given element shares the exact command skeleton
// (M _ _ C _ _, _ _, _ _ C _ _, _ _, _ _) so motion can interpolate the
// numbers between them: collapsed-at-origin -> round bulb -> final shape.

const LEAF_HIDDEN = "M 0 0 C 0 0, 0 0, 0 0 C 0 0, 0 0, 0 0";
const LEAF_BULB = "M 0 0 C 0 -2.6, 5 -2.6, 5 0 C 5 2.6, 0 2.6, 0 0";
// rounded base at the origin, pointed tip at (13,0) — the two cubics meet at a
// corner there, so it reads as a real leaf point
const LEAF_SHAPE = "M 0 0 C 0 -4, 8 -5, 13 0 C 8 5, 0 4, 0 0";

const BUD_HIDDEN = "M 0 0 C 0 0, 0 0, 0 0 C 0 0, 0 0, 0 0";
const BUD_BULB = "M 0 0 C 0 -3, 6 -3, 6 0 C 6 3, 0 3, 0 0";
// fat, slightly-pointed oval — the sketch's "thick end"
const BUD_SHAPE = "M 0 0 C 0 -5, 9 -6, 12 0 C 9 6, 0 5, 0 0";

// short curves carved through the bud in the background colour to suggest
// petal separations (the "curved line or two" from the sketch)
const PETAL_A = "M 2 -1 C 4 -3, 7 -3, 9 0";
const PETAL_B = "M 3 2 C 5 0, 7 0, 9 -1";

// fern leaves: 3 alternating up the stem + 1 terminal frond. positioned onto
// the stem via a static translate/rotate. the angles splay wide off the stem
// (nearly sideways) so it reads as a frond, not thorns hugging a line.
const LEAVES = [
    { x: 4, y: -13, angle: -22 }, // right, splayed out
    { x: 7, y: -22, angle: -158 }, // left, splayed out
    { x: 10, y: -31, angle: -22 }, // right, splayed out
    { x: 13, y: -42, angle: -90 }, // terminal, straight up
];

export default function TimelinePlant({
    bloom,
    variant,
    lean,
}: TimelinePlantProps) {
    // nothing paints until growth actually begins (kills at-rest stray dots)
    const opacity = useTransform(bloom, [0, 0.03], [0, 1]);

    // stem draws first for both variants
    const stemOffset = useTransform(bloom, [0, 0.35], [1, 0]);

    // fern: each leaf morphs hidden -> bulb -> leaf over its own staggered slice
    const leafPaths = LEAVES.map((_, i) => {
        const start = 0.35 + i * 0.13;
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useTransform(
            bloom,
            [start, start + 0.12, start + 0.22],
            [LEAF_HIDDEN, LEAF_BULB, LEAF_SHAPE],
        );
    });

    // rose: bud morphs in, then the petal lines draw on through it
    const budPath = useTransform(
        bloom,
        [0.4, 0.55, 0.75],
        [BUD_HIDDEN, BUD_BULB, BUD_SHAPE],
    );
    const petalAOffset = useTransform(bloom, [0.7, 0.9], [1, 0]);
    const petalBOffset = useTransform(bloom, [0.78, 1], [1, 0]);

    return (
        <motion.div
            className="hidden md:block pointer-events-none"
            style={{
                position: "absolute",
                left: "50%",
                bottom: "50%",
                transform: "translateX(-50%)",
                opacity,
            }}
            aria-hidden="true"
        >
            <svg
                width={60}
                height={60}
                viewBox="-30 -60 60 60"
                style={{ overflow: "visible" }}
            >
                <g transform={`scale(${lean * SCALE}, ${SCALE})`}>
                    <motion.path
                        d={variant === "rose" ? ROSE_STEM : STEM}
                        fill="none"
                        stroke={STROKE}
                        strokeWidth={2.9}
                        strokeLinecap="round"
                        pathLength={1}
                        strokeDasharray="1"
                        style={{ strokeDashoffset: stemOffset }}
                    />

                    {variant === "fern"
                        ? LEAVES.map((leaf, i) => (
                              <motion.path
                                  key={i}
                                  transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.angle})`}
                                  fill={STROKE}
                                  stroke="none"
                                  d={leafPaths[i]}
                              />
                          ))
                        : (
                              // rose head: tilted like the sketch, at the
                              // (shorter) stem tip, scaled up so the bloom is
                              // roughly 2x the v2 size
                              <g transform="translate(8 -24) rotate(-55) scale(1.9)">
                                  <motion.path
                                      fill={STROKE}
                                      stroke="none"
                                      d={budPath}
                                  />
                                  <motion.path
                                      d={PETAL_A}
                                      fill="none"
                                      stroke="var(--background)"
                                      strokeWidth={0.7}
                                      strokeLinecap="round"
                                      pathLength={1}
                                      strokeDasharray="1"
                                      style={{ strokeDashoffset: petalAOffset }}
                                  />
                                  <motion.path
                                      d={PETAL_B}
                                      fill="none"
                                      stroke="var(--background)"
                                      strokeWidth={0.7}
                                      strokeLinecap="round"
                                      pathLength={1}
                                      strokeDasharray="1"
                                      style={{ strokeDashoffset: petalBOffset }}
                                  />
                              </g>
                          )}
                </g>
            </svg>
        </motion.div>
    );
}
