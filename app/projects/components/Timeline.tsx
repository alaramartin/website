"use client";
import { useEffect, useRef } from "react";
import TimelineNode from "./TimelineNode";
import type { ProjectInfo } from "@/app/data/info";
import {
    motion,
    useMotionValue,
    useMotionValueEvent,
    useSpring,
    useScroll,
} from "motion/react";

export default function Timeline({ projects }: { projects: ProjectInfo[] }) {
    const { scrollYProgress } = useScroll();
    const scaleY = useSpring(scrollYProgress, {
        stiffness: 600,
        damping: 40,
        restDelta: 0.001,
    });

    // refs to the two responsive progress bars + their tracks so we can read the
    // *actual* rendered bottom edge of whichever bar is visible.
    const desktopTrack = useRef<HTMLDivElement>(null);
    const mobileTrack = useRef<HTMLDivElement>(null);
    const desktopFill = useRef<HTMLDivElement>(null);
    const mobileFill = useRef<HTMLDivElement>(null);

    // viewport-Y of the progress bar's leading (bottom) edge, shared to each node
    const edgeY = useMotionValue(0);

    function measureEdge() {
        // a `hidden` track is display:none -> offsetParent is null
        const useDesktop =
            !!desktopTrack.current && desktopTrack.current.offsetParent !== null;
        const fill = useDesktop ? desktopFill.current : mobileFill.current;
        if (!fill) return;
        edgeY.set(fill.getBoundingClientRect().bottom);
    }

    // the bar moves whenever scaleY changes (i.e. whenever we scroll)
    useMotionValueEvent(scaleY, "change", measureEdge);

    useEffect(() => {
        measureEdge();
        window.addEventListener("resize", measureEdge);
        return () => window.removeEventListener("resize", measureEdge);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <section className="relative mx-auto max-w-6xl px-4 py-12 mt-6">
            {/* desktop timeline */}
            <div
                ref={desktopTrack}
                className="hidden md:block absolute left-1/2 top-0 h-full w-[3px] rounded-full -translate-x-1/2 bg-lighthighlight/30"
            >
                <motion.div
                    ref={desktopFill}
                    style={{
                        scaleY,
                        position: "fixed",
                        width: 3,
                        height: "100%",
                        originY: 0,
                        backgroundColor: "#a3002c",
                        zIndex: 20,
                    }}
                />
            </div>
            {/* mobile */}
            <div
                ref={mobileTrack}
                className="md:hidden absolute left-4 top-0 h-full w-[3px] rounded-full -translate-x-1/2 bg-lighthighlight/30"
            >
                <motion.div
                    ref={mobileFill}
                    style={{
                        scaleY,
                        position: "fixed",
                        width: 3,
                        height: "100%",
                        originY: 0,
                        backgroundColor: "#a3002c",
                        zIndex: 20,
                    }}
                />
            </div>

            <div className="space-y-12 md:space-y-20">
                {projects.map((project, index) => (
                    <TimelineNode
                        key={project.name ?? index}
                        project={project}
                        index={index}
                        edgeY={edgeY}
                    />
                ))}
            </div>
        </section>
    );
}
