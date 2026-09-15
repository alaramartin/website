"use client";
import { useEffect, useId, useRef } from "react";
import { useReducedMotion } from "motion/react";

// Humpback whale swim cycle from the whale kit (CC BY 4.0, see /THIRD_PARTY_NOTICES.txt).
// whaleCruise.json holds 30 keyframes of a 2D mesh (periodic cubic B-spline) plus its
// triangle list. The mesh swims in place; this component moves it across the page and
// draws it in the kit's ink style: dark body, pale pleated throat, pale fin and fluke.

type WhaleData = {
    duration: number;
    bbox: number[];
    samples: number[][];
    triangles: number[];
};

// Must match bbox in whaleCruise.json — hardcoded so the container has its final size
// before the (lazy-loaded) data arrives.
const VIEW_W = 904;
const VIEW_H = 338;

const DESKTOP = { speed: 50 }; // px per second
const MOBILE = { speed: 40 };
const BODY_LENGTHS_PER_STROKE = 1.2; // how far one tail beat carries the whale
const PATH_FRAME_MS = 33; // mesh redraws capped at ~30fps; translation stays per-frame
const REST_MIN_MS = 3000;
const REST_MAX_MS = 5000;
const BOB_PX = 2;

// Ink-style regions, in mesh coordinates of the rest frame. The head and throat barely
// deform, so the throat is a fixed smooth shape clipped to the live silhouette; the fin
// and fluke move a lot, so they're picked out as triangle subsets that deform with the mesh.
const THROAT_SHAPE = "M500 262L535 212C650 168 790 146 912 150L912 262Z";
const PLEAT_TOP = [[560, 203], [690, 166], [800, 152], [900, 153]];
const PLEAT_BOTTOM = [[590, 227], [700, 208], [800, 191], [895, 177]];
const PLEATS = [0.16, 0.3, 0.44, 0.58, 0.72, 0.86]
    .map((f) => {
        const p = PLEAT_TOP.map(([x, y], i) =>
            `${(x + (PLEAT_BOTTOM[i][0] - x) * f).toFixed(1)} ${(y + (PLEAT_BOTTOM[i][1] - y) * f).toFixed(1)}`,
        );
        return `M${p[0]}C${p[1]} ${p[2]} ${p[3]}`;
    })
    .join("");
const isAccent = (cx: number, cy: number) =>
    (cy > 224 && cx > 520 && cx < 670) || // pectoral fin
    cx < 48; // fluke

export default function Whale() {
    const reduceMotion = useReducedMotion();
    const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
    const containerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const bodyRef = useRef<SVGPathElement>(null);
    const accentRef = useRef<SVGPathElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        const wrapper = wrapperRef.current;
        const svg = svgRef.current;
        const body = bodyRef.current;
        const accentPath = accentRef.current;
        if (!container || !wrapper || !svg || !body || !accentPath) return;

        let data: WhaleData | null = null;
        let frames: Float32Array[] = [];
        let positions = new Float32Array(0);
        let commands: string[] = [];
        let accentTris: number[] = [];
        let accentCommands: string[] = [];
        let disposed = false;

        let containerW = 0;
        let whaleW = 0;
        let speed = DESKTOP.speed;

        let x = 0;
        let dir = 1;
        let phase = 0; // 0..1 through the swim cycle
        let swimming = true;
        let visible = false;
        let rafId = 0;
        let lastTime = 0;
        let lastPathTime = 0;
        let restTimer: ReturnType<typeof setTimeout> | undefined;

        const drawMesh = (cyclePhase: number) => {
            if (!data) return;
            const count = frames.length;
            const samplePosition = cyclePhase * count;
            const center = Math.floor(samplePosition);
            const t = samplePosition - center;
            const t2 = t * t;
            const t3 = t2 * t;
            const w0 = (1 - 3 * t + 3 * t2 - t3) / 6;
            const w1 = (4 - 6 * t2 + 3 * t3) / 6;
            const w2 = (1 + 3 * t + 3 * t2 - 3 * t3) / 6;
            const w3 = t3 / 6;
            const f0 = frames[(center - 1 + count) % count];
            const f1 = frames[center % count];
            const f2 = frames[(center + 1) % count];
            const f3 = frames[(center + 2) % count];
            for (let i = 0; i < positions.length; i++) {
                positions[i] = f0[i] * w0 + f1[i] * w1 + f2[i] * w2 + f3[i] * w3;
            }

            const tris = data.triangles;
            for (let i = 0, n = 0; i < tris.length; i += 3, n++) {
                const a = tris[i] * 2;
                let b = tris[i + 1] * 2;
                let c = tris[i + 2] * 2;
                // Keep every triangle wound the same way, otherwise overlapping triangles
                // cancel out under the nonzero fill rule and punch holes in the whale.
                const area =
                    (positions[b] - positions[a]) * (positions[c + 1] - positions[a + 1]) -
                    (positions[b + 1] - positions[a + 1]) * (positions[c] - positions[a]);
                if (area < 0) {
                    const swap = b;
                    b = c;
                    c = swap;
                }
                commands[n] =
                    `M${positions[a].toFixed(1)} ${positions[a + 1].toFixed(1)}` +
                    `L${positions[b].toFixed(1)} ${positions[b + 1].toFixed(1)}` +
                    `L${positions[c].toFixed(1)} ${positions[c + 1].toFixed(1)}Z`;
            }
            for (let i = 0; i < accentTris.length; i++) {
                accentCommands[i] = commands[accentTris[i]];
            }
            body.setAttribute("d", commands.join(""));
            accentPath.setAttribute("d", accentCommands.join(""));
        };

        const place = () => {
            const bob = Math.sin(phase * Math.PI * 2) * BOB_PX;
            wrapper.style.transform = `translate3d(${x.toFixed(2)}px, ${bob.toFixed(2)}px, 0) scaleX(${dir})`;
        };

        const measure = () => {
            containerW = container.clientWidth;
            whaleW = svg.getBoundingClientRect().width;
            speed = window.matchMedia("(min-width: 48rem)").matches ? DESKTOP.speed : MOBILE.speed;
            if (reduceMotion) {
                x = (containerW - whaleW) / 2;
                place();
            }
        };

        const startSwim = () => {
            x = dir === 1 ? -whaleW : containerW;
            swimming = true;
            place();
            wrapper.style.visibility = "visible";
            maybeRun();
        };

        const tick = (time: number) => {
            rafId = 0;
            if (!swimming || !visible || document.hidden || !data) return;
            const dt = lastTime ? Math.min(time - lastTime, 100) / 1000 : 0;
            lastTime = time;

            x += dir * speed * dt;
            // Tail beat tied to travel speed so the whale doesn't look like it's sliding.
            const strokeSeconds = (BODY_LENGTHS_PER_STROKE * whaleW) / speed;
            phase = (phase + dt / strokeSeconds) % 1;
            place();
            if (time - lastPathTime >= PATH_FRAME_MS) {
                lastPathTime = time;
                drawMesh(phase);
            }

            const offscreen = dir === 1 ? x >= containerW : x <= -whaleW;
            if (offscreen) {
                swimming = false;
                wrapper.style.visibility = "hidden";
                restTimer = setTimeout(() => {
                    dir = -dir;
                    startSwim();
                }, REST_MIN_MS + Math.random() * (REST_MAX_MS - REST_MIN_MS));
                return;
            }
            rafId = requestAnimationFrame(tick);
        };

        function maybeRun() {
            if (reduceMotion || rafId || !swimming || !visible || document.hidden || !data) return;
            lastTime = 0;
            rafId = requestAnimationFrame(tick);
        }

        const onData = (loaded: WhaleData) => {
            if (disposed) return;
            data = loaded;
            frames = loaded.samples.map((frame) => Float32Array.from(frame));
            positions = new Float32Array(frames[0].length);
            commands = new Array(loaded.triangles.length / 3);

            // Classify fin/fluke triangles once, by their centroid in the rest frame.
            const rest = frames[0];
            const tris = loaded.triangles;
            accentTris = [];
            for (let i = 0; i < tris.length; i += 3) {
                const cx = (rest[tris[i] * 2] + rest[tris[i + 1] * 2] + rest[tris[i + 2] * 2]) / 3;
                const cy = (rest[tris[i] * 2 + 1] + rest[tris[i + 1] * 2 + 1] + rest[tris[i + 2] * 2 + 1]) / 3;
                if (isAccent(cx, cy)) accentTris.push(i / 3);
            }
            accentCommands = new Array(accentTris.length);

            measure();
            drawMesh(0);
            if (reduceMotion) {
                wrapper.style.visibility = "visible";
            } else {
                dir = 1;
                startSwim();
            }
        };

        // Only fetch the mesh once the footer is getting close.
        const loadObserver = new IntersectionObserver(
            (entries) => {
                if (!entries.some((e) => e.isIntersecting)) return;
                loadObserver.disconnect();
                import("@/app/data/whaleCruise.json").then((m) => onData(m.default as WhaleData));
            },
            { rootMargin: "400px" },
        );
        loadObserver.observe(container);

        // Only animate while the footer is actually on screen.
        const visibleObserver = new IntersectionObserver((entries) => {
            visible = entries.some((e) => e.isIntersecting);
            if (visible) maybeRun();
        });
        visibleObserver.observe(container);

        const onVisibilityChange = () => {
            if (!document.hidden) maybeRun();
        };
        document.addEventListener("visibilitychange", onVisibilityChange);

        const resizeObserver = new ResizeObserver(() => {
            if (data) measure();
        });
        resizeObserver.observe(container);

        return () => {
            disposed = true;
            if (rafId) cancelAnimationFrame(rafId);
            clearTimeout(restTimer);
            loadObserver.disconnect();
            visibleObserver.disconnect();
            resizeObserver.disconnect();
            document.removeEventListener("visibilitychange", onVisibilityChange);
        };
    }, [reduceMotion]);

    const outline = {
        stroke: "var(--whale-ink)",
        strokeWidth: 1.5,
        strokeLinejoin: "round" as const,
        vectorEffect: "non-scaling-stroke" as const,
    };

    return (
        <div
            ref={containerRef}
            aria-hidden="true"
            className="relative w-full h-11 md:h-17 -mt-10 mb-8 overflow-hidden pointer-events-none"
        >
            <div
                ref={wrapperRef}
                className="absolute left-0 top-[2px] will-change-transform"
                style={{ visibility: "hidden" }}
            >
                <svg
                    ref={svgRef}
                    viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
                    overflow="visible"
                    className="block w-[100px] md:w-[160px] h-auto"
                >
                    <defs>
                        <path id={`${id}-body`} ref={bodyRef} d="" />
                        <path id={`${id}-accent`} ref={accentRef} d="" />
                        <clipPath id={`${id}-clip`}>
                            <use href={`#${id}-body`} />
                        </clipPath>
                    </defs>
                    {/* Dark body; the stroke leaves a thin ink edge around the silhouette. */}
                    <use href={`#${id}-body`} fill="var(--whale-ink)" {...outline} />
                    {/* Pale throat with pleats, trimmed to the live silhouette. */}
                    <g clipPath={`url(#${id}-clip)`}>
                        <path d={THROAT_SHAPE} fill="var(--whale-paper)" />
                        <path
                            d={PLEATS}
                            fill="none"
                            stroke="var(--whale-ink)"
                            strokeWidth={0.7}
                            vectorEffect="non-scaling-stroke"
                            opacity={0.7}
                        />
                    </g>
                    {/* Fin and fluke: ink outline pass, then pale fill on top. */}
                    <use href={`#${id}-accent`} fill="var(--whale-ink)" {...outline} />
                    <use href={`#${id}-accent`} fill="var(--whale-paper)" />
                </svg>
            </div>
        </div>
    );
}
