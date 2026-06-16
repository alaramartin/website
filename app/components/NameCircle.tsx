"use client";
import {
    motion,
    useMotionValueEvent,
    useScroll,
    useTransform,
} from "motion/react";
import {
    type CSSProperties,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import LinksBar from "./LinksBar";

// Scroll timeline (fractions of page scrollYProgress):
//   [0, MORPH_END]        -> name morph: the "A" of ALARA flies to the circle center to
//                            become the pivot and "LARA MARTIN" slides into its ray slot
//                            (MARTIN recolors pink -> white). Pieces are measured (FLIP)
//                            and ride a shared baseline, landing exactly on the circle.
//   [MORPH_END, ADJ_END]  -> the adjectives extend out from the middle (quick burst),
//                            now that the A is at center.
//   [ADJ_END, ROTATE_END] -> the circle rotates a full 360deg
const MORPH_END = 0.13; // name morph done — A at center, LARA MARTIN in ray slot
const ADJ_END = 0.18; // adjectives finish extending (quick)
const ROTATE_END = 0.53; // keep — aligns with bg color change + About section

const TITLES = [
    "LARA MARTIN",
    "programmer",
    "rock climber",
    "girl who codes",
    "cat petter",
    "procrastinator",
    "sweet treat lover",
    "photographer",
];
const PIVOT = "A";
const NAME = "LARA MARTIN";

// MARTIN recolors from the resting pink to the circle's white-ish nav color.
const MARTIN_START = "#ed8c91"; // --color-lightpink
const MARTIN_END = "#fff8f6"; // ≈ --scroll-nav at this point in the scroll

// Constant outline so the name stays thin/elegant when huge (landing) but reads
// clearly when small (circle). Negligible on 8rem text, meaningful on ~1.3rem text.
const STROKE = "0.75px"; // tune in browser

const normalizeDeg = (deg: number) => ((deg % 360) + 360) % 360;
const angularDistance = (a: number, b: number) => {
    const d = Math.abs(normalizeDeg(a) - normalizeDeg(b));
    return Math.min(d, 360 - d);
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const hexToRgb = (hex: string) => {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return m
        ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]
        : [0, 0, 0];
};
const lerpColor = (from: string, to: string, t: number) => {
    const a = hexToRgb(from);
    const b = hexToRgb(to);
    return `rgb(${Math.round(lerp(a[0], b[0], t))}, ${Math.round(
        lerp(a[1], b[1], t),
    )}, ${Math.round(lerp(a[2], b[2], t))})`;
};

type Rects = {
    a: { sX: number; eX: number; sFs: number; eFs: number };
    l: { sX: number; eX: number; sFs: number; eFs: number };
    m: { sX: number; eX: number; sFs: number; eFs: number };
    startBL: number; // shared resting baseline (stage-relative)
    endCenter: number; // circle box vertical center (rays + pivot share it)
    ar: number; // font ascent ratio: (baseline - top) / fontSize
};

export default function NameCircle() {
    const { scrollYProgress } = useScroll();
    const rotate = useTransform(
        scrollYProgress,
        [ADJ_END, ROTATE_END],
        [0, 360],
    );
    const mp = useTransform(scrollYProgress, [0, MORPH_END], [0, 1]);
    const adjMv = useTransform(scrollYProgress, [MORPH_END, ADJ_END], [0, 1]);
    // LinksBar fades out over the front portion of the morph.
    const linksOpacity = useTransform(
        scrollYProgress,
        [0, MORPH_END * 0.7],
        [1, 0],
    );

    const [rotationDeg, setRotationDeg] = useState(0);
    useMotionValueEvent(rotate, "change", (v) =>
        setRotationDeg(normalizeDeg(v)),
    );

    const [morph, setMorph] = useState(0);
    useMotionValueEvent(mp, "change", (v) => setMorph(v));

    const [adj, setAdj] = useState(0);
    useMotionValueEvent(adjMv, "change", (v) => setAdj(v));

    const rays = useMemo(() => {
        const step = 360 / TITLES.length;
        return TITLES.map((title, i) => ({ title, angle: i * step }));
    }, []);

    const activeWindow = 180 / TITLES.length;

    // FLIP measurement: rest positions (big bottom name) -> end positions (circle).
    const stageRef = useRef<HTMLDivElement>(null);
    const restARef = useRef<HTMLSpanElement>(null);
    const restLaraRef = useRef<HTMLSpanElement>(null);
    const restMartinRef = useRef<HTMLSpanElement>(null);
    const restBLRef = useRef<HTMLSpanElement>(null);
    const pivotRef = useRef<HTMLSpanElement>(null);
    const rayLaraRef = useRef<HTMLSpanElement>(null);
    const rayMartinRef = useRef<HTMLSpanElement>(null);
    const [rects, setRects] = useState<Rects | null>(null);

    useLayoutEffect(() => {
        const measure = () => {
            const stage = stageRef.current;
            const els = [
                restARef,
                restLaraRef,
                restMartinRef,
                restBLRef,
                pivotRef,
                rayLaraRef,
                rayMartinRef,
            ];
            if (!stage || els.some((r) => !r.current)) return;
            const origin = stage.getBoundingClientRect();
            const left = (el: Element) =>
                el.getBoundingClientRect().left - origin.left;
            const top = (el: Element) =>
                el.getBoundingClientRect().top - origin.top;
            const fontPx = (el: Element) =>
                parseFloat(getComputedStyle(el).fontSize);

            const startBL = top(restBLRef.current!); // shared resting baseline
            const aFs = fontPx(restARef.current!);
            // Ascent ratio (constant for Italiana across sizes).
            const ar = (startBL - top(restARef.current!)) / aFs;
            const pivotFs = fontPx(pivotRef.current!);
            const rayFs = fontPx(rayLaraRef.current!);
            // Pivot + ray + adjectives are all center-anchored at the box center.
            const endCenter = top(pivotRef.current!) + 0.5 * pivotFs;

            setRects({
                a: {
                    sX: left(restARef.current!),
                    eX: left(pivotRef.current!),
                    sFs: aFs,
                    eFs: pivotFs,
                },
                l: {
                    sX: left(restLaraRef.current!),
                    eX: left(rayLaraRef.current!),
                    sFs: fontPx(restLaraRef.current!),
                    eFs: rayFs,
                },
                m: {
                    sX: left(restMartinRef.current!),
                    eX: left(rayMartinRef.current!),
                    sFs: fontPx(restMartinRef.current!),
                    eFs: fontPx(rayMartinRef.current!),
                },
                startBL,
                endCenter,
                ar,
            });
        };

        measure();
        window.addEventListener("resize", measure);
        // Web font (Italiana) load shifts glyph metrics — re-measure when ready.
        document.fonts?.ready.then(measure).catch(() => {});
        return () => window.removeEventListener("resize", measure);
    }, []);

    // Style for one morphing piece. Vertically it interpolates from the resting
    // baseline to the circle's box center (so it lands exactly on the center-anchored
    // pivot/ray). Crisp: real font-size + translate (no scale). Weight 400 + outline.
    const moverStyle = (
        p: { sX: number; eX: number; sFs: number; eFs: number },
        color: string,
        endTracking: string,
    ): CSSProperties => {
        if (!rects) return { display: "none" };
        const x = lerp(p.sX, p.eX, morph);
        const fs = lerp(p.sFs, p.eFs, morph);
        // Rest end: baseline sits on the resting line. Circle end: center sits on the
        // box center (matching the center-anchored pivot/ray). Interpolate between them.
        const topRest = rects.startBL - rects.ar * p.sFs;
        const topCircle = rects.endCenter - 0.5 * p.eFs;
        return {
            position: "absolute",
            left: x,
            top: lerp(topRest, topCircle, morph),
            fontSize: `${fs}px`,
            color,
            fontWeight: 400,
            WebkitTextStrokeWidth: STROKE,
            WebkitTextStrokeColor: "currentColor",
            lineHeight: 1,
            whiteSpace: "nowrap",
            letterSpacing: `calc(${endTracking} * ${morph})`,
            opacity: morph >= 1 ? 0 : 1,
            zIndex: 2,
            pointerEvents: "none",
        };
    };

    const handedOff = morph >= 1; // circle's real pivot/ray take over

    return (
        <div ref={stageRef} className="relative h-screen w-full">
            {/* Rest anchor: invisible, only used to measure the resting name layout. */}
            <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 pb-4 flex items-baseline pointer-events-none"
                style={{ opacity: 0 }}
                aria-hidden
            >
                <p className="text-9xl whitespace-nowrap pr-5 leading-none">
                    <span ref={restARef}>A</span>
                    <span ref={restLaraRef}>LARA</span>
                    <span
                        ref={restBLRef}
                        style={{ display: "inline-block", width: 0 }}
                    />
                </p>
                <p className="text-7xl whitespace-nowrap leading-none">
                    <span ref={restMartinRef}>MARTIN</span>
                </p>
            </div>

            {/* Movers: the visible, morphing name pieces (crisp — font-size + translate). */}
            {rects && (
                <>
                    <span
                        style={moverStyle(
                            rects.a,
                            "var(--scroll-nav)",
                            "0.05em",
                        )}
                    >
                        A
                    </span>
                    <span
                        style={moverStyle(
                            rects.l,
                            "var(--scroll-nav)",
                            "0.02em",
                        )}
                    >
                        LARA
                    </span>
                    <span
                        style={moverStyle(
                            rects.m,
                            lerpColor(MARTIN_START, MARTIN_END, morph),
                            "0.02em",
                        )}
                    >
                        MARTIN
                    </span>
                </>
            )}

            {/* Social links: centered on screen, clickable only at the very top (scroll 0),
          then fade out as the morph begins. */}
            <motion.div
                style={{
                    opacity: linksOpacity,
                    pointerEvents: morph > 0 ? "none" : "auto",
                    color: "var(--scroll-nav)",
                }}
                className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
            >
                <LinksBar />
            </motion.div>

            {/* The circle: centered, nudged left so the name reads centered. Decorative —
          must not capture clicks meant for the LinksBar underneath it. */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="md:-translate-x-1/24 sm:-translate-x-1/7 -translate-x-2/5">
                    <div
                        style={{
                            position: "relative",
                            width: 320,
                            height: 320,
                            margin: "0 auto",
                        }}
                    >
                        <span
                            ref={pivotRef}
                            style={{
                                position: "absolute",
                                left: "50%",
                                top: "50%",
                                transform: "translate(-50%, -50%)",
                                lineHeight: 1,
                                zIndex: 1,
                                fontSize: "3.6rem",
                                fontWeight: 400,
                                WebkitTextStrokeWidth: STROKE,
                                WebkitTextStrokeColor: "currentColor",
                                color: "var(--scroll-nav)",
                                letterSpacing: "0.05em",
                                opacity: handedOff ? 1 : 0,
                            }}
                        >
                            {PIVOT}
                        </span>

                        <motion.div
                            style={{
                                position: "absolute",
                                inset: 0,
                                rotate,
                                transformOrigin: "center",
                                willChange: "transform",
                            }}
                        >
                            {rays.map(({ title, angle }) => {
                                const isName = title === NAME;
                                const worldAngle = normalizeDeg(
                                    angle + rotationDeg,
                                );
                                const distance = angularDistance(worldAngle, 0);
                                const isActive = distance <= activeWindow;

                                const minRadius = isName ? 20 : 45;
                                const fullRadius =
                                    minRadius +
                                    (Math.min(distance, activeWindow) /
                                        activeWindow) *
                                        (70 - minRadius);
                                // Adjectives stay at center until the name morph finishes, then
                                // extend out from the middle during the `adj` burst. The name ray
                                // stays at its final radius (the mover represents it until handoff).
                                const currentRadius = isName
                                    ? fullRadius
                                    : fullRadius * adj;

                                const baseOpacity =
                                    distance <= activeWindow ? 1 : 0.7;
                                const opacity = isName
                                    ? handedOff
                                        ? baseOpacity
                                        : 0
                                    : baseOpacity * adj;

                                const fontSize =
                                    isName && isActive
                                        ? "3.2rem"
                                        : isActive
                                          ? "1.7rem"
                                          : "1.3rem";
                                const color = isActive
                                    ? "var(--scroll-nav)"
                                    : "var(--color-verylightpink)";

                                return (
                                    <span
                                        key={title}
                                        style={{
                                            position: "absolute",
                                            left: "50%",
                                            top: "50%",
                                            width: 0,
                                            height: 0,
                                            transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(${currentRadius}px)`,
                                            transformOrigin: "center",
                                        }}
                                    >
                                        <span
                                            style={{
                                                position: "absolute",
                                                left: 0,
                                                top: 0,
                                                transform: "translateY(-50%)",
                                                transformOrigin: "left center",
                                                display: "inline-block",
                                                whiteSpace: "nowrap",
                                                lineHeight: 1,
                                                letterSpacing: "0.02em",
                                                fontSize,
                                                fontWeight: 400,
                                                WebkitTextStrokeWidth: STROKE,
                                                WebkitTextStrokeColor:
                                                    "currentColor",
                                                color,
                                                opacity,
                                                transition:
                                                    "font-size 120ms ease-out, opacity 120ms ease-out",
                                            }}
                                        >
                                            {isName ? (
                                                <>
                                                    <span ref={rayLaraRef}>
                                                        LARA&nbsp;
                                                    </span>
                                                    <span ref={rayMartinRef}>
                                                        MARTIN
                                                    </span>
                                                </>
                                            ) : (
                                                title
                                            )}
                                        </span>
                                    </span>
                                );
                            })}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
