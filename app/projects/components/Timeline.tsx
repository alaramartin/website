"use client";
import { useLayoutEffect, useRef } from "react";
import TimelineNode from "./TimelineNode";
import type { ProjectInfo } from "@/app/data/info";
import {
    motion,
    useMotionValue,
    useMotionValueEvent,
    useSpring,
    useScroll,
} from "motion/react";

// horizontal amplitude of the S-curve's bulges on desktop. also exposed to
// TimelineNode via the --tl-amp css var so the dots sit exactly on the curve
const AMPLITUDE = 80;
// bezier control-point reach (fraction of the vertical gap between points).
// tangents are vertical at every point, so each dot is a true horizontal
// extreme of the curve and y stays monotonic along the path
const CURVE_TENSION = 0.45;
// samples for the y -> arc-length lookup table (rebuilt every frame while a
// card expands, so keep this cheap; linear interp makes up the difference)
const LOOKUP_SAMPLES = 120;
// exponent < 1 front-loads the edge's sweep down the viewport so the fill
// keeps pace with reading position through the first projects instead of
// hugging the viewport top (1 = linear, lower = faster start)
const EDGE_BIAS = 0.8;

export default function Timeline({ projects }: { projects: ProjectInfo[] }) {
    const { scrollYProgress } = useScroll();
    const scaleY = useSpring(scrollYProgress, {
        stiffness: 600,
        damping: 40,
        restDelta: 0.001,
    });

    const sectionRef = useRef<HTMLElement>(null);
    // desktop curved timeline (svg) + mobile straight bar
    const svgRef = useRef<SVGSVGElement>(null);
    const trackPath = useRef<SVGPathElement>(null);
    const fillPath = useRef<SVGPathElement>(null);
    const mobileFill = useRef<HTMLDivElement>(null);

    // y -> arc-length lookup for the curve, rebuilt whenever layout changes
    const lookup = useRef<{ ys: number[]; lens: number[]; total: number }>({
        ys: [],
        lens: [],
        total: 0,
    });

    // viewport-Y of the progress edge, shared to each node for the dot fill
    const edgeY = useMotionValue(0);

    // arc length along the curve at section-local height y (linear interp over
    // the sampled table; ys is monotonically increasing)
    function lengthAtY(y: number) {
        const { ys, lens, total } = lookup.current;
        if (ys.length === 0) return 0;
        if (y <= ys[0]) return 0;
        if (y >= ys[ys.length - 1]) return total;
        let lo = 0;
        let hi = ys.length - 1;
        while (hi - lo > 1) {
            const mid = (lo + hi) >> 1;
            if (ys[mid] <= y) lo = mid;
            else hi = mid;
        }
        const t = (y - ys[lo]) / (ys[hi] - ys[lo] || 1);
        return lens[lo] + t * (lens[hi] - lens[lo]);
    }

    // a `hidden` svg is display:none -> zero-size rect
    function isDesktop() {
        const svg = svgRef.current;
        return !!svg && svg.getBoundingClientRect().width > 0;
    }

    function updateEdge(progress: number) {
        if (isDesktop()) {
            const section = sectionRef.current;
            const fill = fillPath.current;
            const { total } = lookup.current;
            if (!section || !fill || !total) return;
            const rect = section.getBoundingClientRect();
            // the leading edge sweeps from the curve's top (its document
            // offset, i.e. where it sits at page load -- so the fill starts
            // moving with the very first scrolled pixel instead of waiting to
            // catch up to the section) down to the viewport bottom, front-
            // loaded by EDGE_BIAS (clamp before pow: the spring can briefly
            // overshoot below 0)
            const p = Math.max(0, Math.min(1, progress));
            const vh = window.innerHeight;
            const start = Math.min(rect.top + window.scrollY, vh);
            const edge = start + Math.pow(p, EDGE_BIAS) * (vh - start);
            edgeY.set(edge);
            // advance the stroke to the arc length at that vertical position,
            // so the fill rate stays locked to scroll even where the curve
            // bends (more arc length per pixel of height there). offset is in
            // pathLength-normalized units and written synchronously so it can
            // never pair with a newer path for a frame (which briefly painted
            // a phantom fill at the top of the curve while a card expanded)
            const yLocal = Math.max(0, Math.min(rect.height, edge - rect.top));
            fill.style.strokeDashoffset = `${1 - lengthAtY(yLocal) / total}`;
        } else {
            // mobile bar's fill is a fixed element; read its rendered edge
            const fill = mobileFill.current;
            if (!fill) return;
            edgeY.set(fill.getBoundingClientRect().bottom);
        }
    }

    // the edge moves whenever scaleY changes (i.e. whenever we scroll)
    useMotionValueEvent(scaleY, "change", updateEdge);

    // (re)build the curve through the measured dot centers. runs on mount and
    // whenever the section resizes (window resize, breakpoint changes, "see
    // more" notes expanding, etc.)
    function buildPath() {
        const section = sectionRef.current;
        const track = trackPath.current;
        const fill = fillPath.current;
        if (!section || !track || !fill) return;
        // display:none paths can't be measured; on mobile just keep the edge
        // in sync and rebuild when we next cross into the md breakpoint
        if (!isDesktop()) {
            updateEdge(scaleY.get());
            return;
        }

        const rect = section.getBoundingClientRect();
        const cx = rect.width / 2;
        const dots = section.querySelectorAll<HTMLElement>(
            "[data-timeline-dot]",
        );
        // start at top center, through every dot, end at bottom center
        const points: { x: number; y: number }[] = [{ x: cx, y: 0 }];
        dots.forEach((dot) => {
            const r = dot.getBoundingClientRect();
            points.push({
                x: r.left + r.width / 2 - rect.left,
                y: r.top + r.height / 2 - rect.top,
            });
        });
        points.push({ x: cx, y: rect.height });

        let d = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            const p0 = points[i - 1];
            const p1 = points[i];
            const reach = CURVE_TENSION * (p1.y - p0.y);
            d += ` C ${p0.x} ${p0.y + reach}, ${p1.x} ${p1.y - reach}, ${p1.x} ${p1.y}`;
        }
        track.setAttribute("d", d);
        fill.setAttribute("d", d);

        // sample the finished path into a y -> arc-length table
        const total = fill.getTotalLength();
        const ys: number[] = [];
        const lens: number[] = [];
        for (let i = 0; i <= LOOKUP_SAMPLES; i++) {
            const len = (total * i) / LOOKUP_SAMPLES;
            ys.push(fill.getPointAtLength(len).y);
            lens.push(len);
        }
        lookup.current = { ys, lens, total };

        updateEdge(scaleY.get());
    }

    useLayoutEffect(() => {
        buildPath();
        const observer = new ResizeObserver(buildPath);
        if (sectionRef.current) observer.observe(sectionRef.current);
        window.addEventListener("resize", buildPath);
        return () => {
            observer.disconnect();
            window.removeEventListener("resize", buildPath);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <section
            ref={sectionRef}
            className="relative mx-auto max-w-6xl px-4 py-12 mt-6"
            style={{ "--tl-amp": `${AMPLITUDE}px` } as React.CSSProperties}
        >
            {/* desktop timeline: an S-curve whose extremes sit at each
                project's dot, with the card on the inside of each bulge */}
            <svg
                ref={svgRef}
                className="hidden md:block absolute inset-0 h-full w-full pointer-events-none"
                style={{ overflow: "visible" }}
                aria-hidden="true"
            >
                <path
                    ref={trackPath}
                    fill="none"
                    className="stroke-lighthighlight/30"
                    strokeWidth={3}
                    strokeLinecap="round"
                />
                {/* pathLength=1 normalizes dash units, so the dasharray never
                    needs rewriting when the geometry changes -- only the
                    offset moves (1 = empty, 0 = fully filled) */}
                <path
                    ref={fillPath}
                    fill="none"
                    stroke="#a3002c"
                    strokeWidth={3}
                    strokeLinecap="round"
                    pathLength={1}
                    strokeDasharray="1"
                    strokeDashoffset={1}
                />
            </svg>
            {/* mobile */}
            <div className="md:hidden absolute left-4 top-0 h-full w-[3px] rounded-full -translate-x-1/2 bg-lighthighlight/30">
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
