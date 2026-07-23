"use client";
import { useEffect, useRef, useState } from "react";
import {
    motion,
    useMotionValue,
    useMotionValueEvent,
    useReducedMotion,
    useSpring,
    type MotionValue,
} from "motion/react";
import Project from "./Project";
import TimelinePlant, { type PlantVariant } from "./TimelinePlant";
import type { ProjectInfo } from "@/app/data/info";

interface TimelineNodeProps {
    project: ProjectInfo;
    index: number;
    // viewport-Y of the progress bar's leading (bottom) edge
    edgeY: MotionValue<number>;
    // bumped by Timeline whenever the curve is rebuilt (layout changed)
    layoutTick: MotionValue<number>;
}

export default function TimelineNode({
    project,
    index,
    edgeY,
    layoutTick,
}: TimelineNodeProps) {
    const isLeft = index % 2 === 0;
    const dotRef = useRef<HTMLSpanElement>(null);
    const fill = useMotionValue(0);
    // render through a spring so a discontinuous target change -- a card
    // expansion teleporting the dot out from under the edge -- animates the
    // fill in/out just like a scroll crossing does, instead of snapping
    const fillScale = useSpring(fill, { stiffness: 400, damping: 35 });

    // wider-band growth progress for the blooming plant, so it grows gradually
    // as you scroll past instead of snapping over the dot's 14px band. shares
    // the same edge, so it retracts on scroll-up in lockstep with the dot.
    const bloom = useMotionValue(0);

    // rose vs fern is a genuine 50/50, decided once on the client (in an
    // effect) to avoid a hydration mismatch. the plant is invisible at bloom=0,
    // so choosing after mount causes no visible flash. lean is deterministic:
    // always away from the card (outward), so it clears the timeline curve.
    const reduceMotion = useReducedMotion();
    const lean: 1 | -1 = isLeft ? 1 : -1;
    const [variant, setVariant] = useState<PlantVariant | null>(null);
    useEffect(() => {
        setVariant(Math.random() < 0.5 ? "rose" : "fern");
    }, []);

    // fill the dot exactly as the bar's rendered edge crosses its center, so the
    // two are locked together (and reverse together on scroll-up).
    function update(edge: number) {
        const el = dotRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const dotY = rect.top + rect.height / 2;
        const band = 14; // px window over which the dot fills as the edge passes
        const t = (edge - dotY) / band + 0.5;
        fill.set(Math.max(0, Math.min(1, t)));
        // growth starts just before the edge reaches the node and finishes just
        // after passing it -- a shorter, tighter window (~70% of the old
        // distance) centered near the node rather than trailing past it.
        const bloomLead = 22; // px before the node that growth begins
        const bloomBand = 63; // total scroll distance the bloom spans
        const b = (edge - dotY + bloomLead) / bloomBand;
        bloom.set(Math.max(0, Math.min(1, b)));
    }

    useMotionValueEvent(edgeY, "change", update);
    // re-check against the (possibly moved) dot after every curve rebuild,
    // even if the edge value itself is unchanged
    useMotionValueEvent(layoutTick, "change", () => update(edgeY.get()));
    useEffect(() => {
        update(edgeY.get());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="relative grid grid-cols-1 md:grid-cols-2 items-center">
            {/* timeline dot: ring + center fill. on desktop it sits at the
                extreme of the curve's bulge (opposite side of the card, so the
                card is on the inside of the curve); amplitude comes from the
                --tl-amp var set on the timeline section */}
            <span
                ref={dotRef}
                data-timeline-dot
                className={`absolute -left-2 ${
                    isLeft
                        ? "md:left-[calc(50%+var(--tl-amp))]"
                        : "md:left-[calc(50%-var(--tl-amp))]"
                } top-1/2 z-10 flex h-4 w-4 -translate-y-1/2 md:-translate-x-1/2 items-center justify-center rounded-full border-2 border-accent/80 bg-background`}
            >
                <motion.span
                    style={{ scale: fillScale }}
                    className="h-2 w-2 rounded-full bg-accent"
                />
                {variant && !reduceMotion && (
                    <TimelinePlant
                        bloom={bloom}
                        variant={variant}
                        lean={lean}
                    />
                )}
            </span>{" "}
            <motion.div
                initial={{ opacity: 0, x: isLeft ? -24 : 24, y: 12 }}
                whileInView={{ opacity: 1, x: 0, y: 0 }}
                viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`pl-8 md:pl-0 w-full ${
                    isLeft
                        ? "md:col-start-1 md:pr-10 md:justify-self-end"
                        : "md:col-start-2 md:pl-10 md:justify-self-start"
                } md:self-center flex flex-row items-center`}
            >
                <Project {...project} />
            </motion.div>
        </div>
    );
}
