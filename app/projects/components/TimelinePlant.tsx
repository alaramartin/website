"use client";
import { motion, useTransform, type MotionValue } from "motion/react";
import {
    STEM,
    ROSE_STEM,
    ROSE_TIP,
    LEAF_HIDDEN,
    LEAF_BULB,
    LEAF_SHAPE,
    BUD_HIDDEN,
    BUD_BULB,
    BUD_SHAPE,
    PETAL_A,
    PETAL_B,
    LEAVES,
    ROSE_LEAF_SCALE,
    ROSE_LEAVES,
} from "@/app/components/plant/plantPaths";

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
// tilt the whole plant ~10deg further outward (away from the vertical timeline)
// so the near-vertical base of the stem stops overlapping the timeline curve.
// applied after the lean scaleX, so it mirrors correctly on both sides.
const TILT = 10;
const STROKE = "var(--color-accent)";

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

    // rose: the two stem leaves morph in on staggered slices, just before the
    // petals draw, same hidden -> bulb -> leaf morph as the fern
    const roseLeafPaths = ROSE_LEAVES.map((_, i) => {
        const start = 0.5 + i * 0.1;
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
                <g transform={`scale(${lean * SCALE}, ${SCALE}) rotate(${TILT})`}>
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
                          <>
                              {ROSE_LEAVES.map((leaf, i) => (
                                  <motion.path
                                      key={i}
                                      transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.angle}) scale(${ROSE_LEAF_SCALE})`}
                                      fill={STROKE}
                                      stroke="none"
                                      d={roseLeafPaths[i]}
                                  />
                              ))}
                              {/* rose head: tilted like the sketch, at the
                                  (lengthened) stem tip, scaled up so the bloom
                                  is roughly 2x the v2 size */}
                              <g transform={`translate(${ROSE_TIP.x} ${ROSE_TIP.y}) rotate(-55) scale(1.9)`}>
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
                          </>
                          )}
                </g>
            </svg>
        </motion.div>
    );
}
