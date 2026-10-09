"use client";
import { useRef } from "react";
import { motion, useTransform, type MotionValue } from "motion/react";
import {
    LEAF_HIDDEN,
    LEAF_BULB,
    LEAF_SHAPE,
    BUD_HIDDEN,
    BUD_BULB,
    BUD_SHAPE,
    PETAL_A,
    PETAL_B,
} from "@/app/components/plant/plantPaths";
import type { PlantVariant } from "@/app/projects/components/TimelinePlant";
import useBloom from "@/app/components/plant/useBloom";
import useSprigTrigger from "@/app/components/plant/useSprigTrigger";

const STROKE = "var(--color-accent)";

// leaves along the divider, in px from its top. the line itself is the stem,
// so only the leaves (and the rose's bud / the fern's terminal frond) grow --
// same hidden -> bulb -> shape morph as the timeline plants.
const ROSE_LEAVES = [
    { y: 11, angle: -35, scale: 0.6 },
    { y: 15, angle: -145, scale: 0.6 },
];
const FERN_LEAVES = [
    { y: 18, angle: -30, scale: 0.6 },
    { y: 12, angle: -150, scale: 0.6 },
    { y: 6, angle: -30, scale: 0.6 },
    { y: 0, angle: -90, scale: 0.7 }, // terminal, straight up
];

function useMorph(bloom: MotionValue<number>, start: number, bud = false) {
    return useTransform(
        bloom,
        [start, start + 0.2, start + 0.4],
        bud
            ? [BUD_HIDDEN, BUD_BULB, BUD_SHAPE]
            : [LEAF_HIDDEN, LEAF_BULB, LEAF_SHAPE],
    );
}

// the vertical rule between a contact's icon and its handle, which sprouts
// leaves (and a bud) at its top while the row is hovered / focused
export default function StemDivider({
    variant,
    delay = 0,
}: {
    variant: PlantVariant;
    // stagger for the touch-screen (grow on view) fallback
    delay?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const { grow, byHover } = useSprigTrigger(ref, "hover");
    // the stagger is only for the touch fallback (rows growing in sequence on
    // view); on hover every row should respond immediately
    const bloom = useBloom(grow, {
        duration: 0.6,
        delay: byHover ? 0 : delay,
    });

    const leaves = variant === "rose" ? ROSE_LEAVES : FERN_LEAVES;
    // stagger bottom -> top, each over its own slice of the bloom
    const slot = 0.6 / leaves.length;
    const leafPaths = leaves.map((_, i) =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useMorph(bloom, i * slot),
    );
    const budPath = useMorph(bloom, 0.4, true);
    const petalAOffset = useTransform(bloom, [0.75, 0.9], [1, 0]);
    const petalBOffset = useTransform(bloom, [0.82, 1], [1, 0]);

    return (
        <div ref={ref} className="relative h-12 mx-4">
            <div className="h-full border-r border-lighthighlight opacity-80" />
            <svg
                aria-hidden="true"
                width={1}
                height={1}
                className="pointer-events-none absolute left-0 top-0"
                style={{ overflow: "visible" }}
            >
                <g transform="translate(0.5 0)">
                    {leaves.map((leaf, i) => (
                        <motion.path
                            key={i}
                            transform={`translate(0 ${leaf.y}) rotate(${leaf.angle}) scale(${leaf.scale})`}
                            fill={STROKE}
                            d={leafPaths[i]}
                        />
                    ))}
                    {variant === "rose" && (
                        <g transform="rotate(-90) scale(0.85)">
                            <motion.path fill={STROKE} d={budPath} />
                            <motion.path
                                d={PETAL_A}
                                fill="none"
                                stroke="var(--background)"
                                strokeWidth={0.8}
                                strokeLinecap="round"
                                pathLength={1}
                                strokeDasharray="1"
                                style={{ strokeDashoffset: petalAOffset }}
                            />
                            <motion.path
                                d={PETAL_B}
                                fill="none"
                                stroke="var(--background)"
                                strokeWidth={0.8}
                                strokeLinecap="round"
                                pathLength={1}
                                strokeDasharray="1"
                                style={{ strokeDashoffset: petalBOffset }}
                            />
                        </g>
                    )}
                </g>
            </svg>
        </div>
    );
}
