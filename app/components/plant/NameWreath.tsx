"use client";
import {
    motion,
    useReducedMotion,
    useTransform,
    type MotionValue,
} from "motion/react";
import {
    LEAF_HIDDEN,
    LEAF_BULB,
    LEAF_SHAPE,
    BUD_HIDDEN,
    BUD_BULB,
    BUD_SHAPE,
    PETAL_A,
    PETAL_B,
} from "./plantPaths";

// A vine that grows around the hero's pivot "A" as the adjective circle rotates, trailing
// LARA MARTIN: one leaf sprouts as each adjective takes focus, and it ends in a rose just
// before the name comes back around. Scroll-driven (it reads the circle's own rotation), so
// it retracts on scroll-up like the projects timeline.
//
// Angles here are screen-counterclockwise degrees from "focus" (pointing right), which is
// the direction the name travels: the circle's rotation goes 0 -> -360 (CSS rotate is
// clockwise-positive), so the name sits at ccw angle -rotation.

interface NameWreathProps {
    // the circle's rotation motion value, 0 -> -360
    rotate: MotionValue<number>;
    // adjective count; one leaf per adjective that passes focus
    count: number;
    isMobile: boolean;
}

// the ring sits in the free band between the A's edge and where the adjectives start
// (their min radius is 45px; on mobile everything is ~0.75x)
const RADIUS = 36;
const RADIUS_MOBILE = 27;
// the vine stays clear of the focused name's text band on the right, like an open laurel:
// it starts GAP degrees past focus and stops a little further short of closing, so the
// rose at its end sits below the name's baseline instead of under the L
const GAP = 30;
// on mobile the name is large relative to the ring, so a 30deg start lands on the L's
// top-left corner; start higher up instead
const GAP_MOBILE = 45;
const END = 315;

const toRad = (deg: number) => (deg * Math.PI) / 180;
// point on the ring at ccw angle `deg` (svg y points down)
const at = (r: number, deg: number) => ({
    x: r * Math.cos(toRad(deg)),
    y: -r * Math.sin(toRad(deg)),
});
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export default function NameWreath({
    rotate,
    count,
    isMobile,
}: NameWreathProps) {
    const reduceMotion = useReducedMotion();
    const r = isMobile ? RADIUS_MOBILE : RADIUS;
    const leafScale = isMobile ? 0.4 : 0.5;
    const step = 360 / count;
    const start = isMobile ? GAP_MOBILE : GAP;

    // how far round the name has travelled, in ccw degrees (0 -> 360)
    const travelled = useTransform(rotate, (v) => -v);

    // the vine's head trails the name, clamped to the open arc
    const vineOffset = useTransform(
        travelled,
        (t) => 1 - clamp01((t - start) / (END - start)),
    );

    // one leaf at each adjective's focus point (k = 1 .. count-1; the name's own focus is
    // the gap). each morphs hidden -> bulb -> leaf over the first half-step after the vine
    // reaches it. alternately splayed outward and along the vine, so it reads as a frond.
    const leaves = Array.from({ length: count - 1 }, (_, i) => {
        const deg = (i + 1) * step;
        return { deg, ...at(r, deg), outward: i % 2 === 0 };
    });
    const leafPaths = leaves.map(({ deg }) =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useTransform(
            travelled,
            [deg, deg + step * 0.2, deg + step * 0.45],
            [LEAF_HIDDEN, LEAF_BULB, LEAF_SHAPE],
        ),
    );

    // the rose at the vine's end, opening over the last stretch as the name comes home
    const rose = at(r, END);
    const budPath = useTransform(
        travelled,
        [END - step * 0.5, END - step * 0.25, END],
        [BUD_HIDDEN, BUD_BULB, BUD_SHAPE],
    );
    const petalAOffset = useTransform(
        travelled,
        [END - step * 0.1, END + step * 0.1],
        [1, 0],
    );
    const petalBOffset = useTransform(
        travelled,
        [END, END + step * 0.2],
        [1, 0],
    );

    // nothing paints until the vine starts (no stray round caps at rest)
    const opacity = useTransform(travelled, [start, start + 2], [0, 1]);

    if (reduceMotion) return null;

    // the open arc, ccw from start to END, as two sub-180deg arcs (sweep-flag 0 = ccw on
    // screen) so no large-arc flag juggling is needed
    const a = at(r, start);
    const mid = at(r, 180);
    const b = at(r, END);
    const arc = `M ${a.x} ${a.y} A ${r} ${r} 0 0 0 ${mid.x} ${mid.y} A ${r} ${r} 0 0 0 ${b.x} ${b.y}`;

    return (
        <motion.svg
            aria-hidden="true"
            width={1}
            height={1}
            className="pointer-events-none"
            style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                overflow: "visible",
                opacity,
            }}
        >
            <motion.path
                d={arc}
                fill="none"
                stroke="var(--color-verylightpink)"
                strokeWidth={1.25}
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray="1"
                style={{ strokeDashoffset: vineOffset }}
            />
            {leaves.map((leaf, i) => (
                <motion.path
                    key={leaf.deg}
                    // svg rotate is clockwise, so the outward radial is -deg and the vine's
                    // direction of travel is -deg - 90; tilt each leaf between the two
                    transform={`translate(${leaf.x} ${leaf.y}) rotate(${-leaf.deg - (leaf.outward ? 35 : 70)}) scale(${leafScale})`}
                    fill="var(--color-lighthighlight)"
                    d={leafPaths[i]}
                />
            ))}
            {/* the rose, in the name's own colour, pointing outward (down-right) and away
                from the name */}
            <g
                transform={`translate(${rose.x} ${rose.y}) rotate(${-END + 20}) scale(${isMobile ? 0.7 : 0.85})`}
            >
                <motion.path fill="var(--scroll-nav)" d={budPath} />
                <motion.path
                    d={PETAL_A}
                    fill="none"
                    stroke="var(--scroll-bg)"
                    strokeWidth={0.8}
                    strokeLinecap="round"
                    pathLength={1}
                    strokeDasharray="1"
                    style={{ strokeDashoffset: petalAOffset }}
                />
                <motion.path
                    d={PETAL_B}
                    fill="none"
                    stroke="var(--scroll-bg)"
                    strokeWidth={0.8}
                    strokeLinecap="round"
                    pathLength={1}
                    strokeDasharray="1"
                    style={{ strokeDashoffset: petalBOffset }}
                />
            </g>
        </motion.svg>
    );
}
