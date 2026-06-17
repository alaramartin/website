"use client";
import {
    motion,
    type MotionValue,
    useMotionTemplate,
    useMotionValueEvent,
    useScroll,
    useTransform,
} from "motion/react";
import {
    type CSSProperties,
    type ReactNode,
    memo,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import LinksBar from "./LinksBar";
import { setScrollColors } from "@/app/ui/scrollColors";
import { italiana } from "@/app/ui/fonts";

// Scroll timeline (fractions of page scrollYProgress):
//   [0, MORPH_END]        -> name morph: the "A" of ALARA flies to the circle center to
//                            become the pivot and "LARA MARTIN" slides into its ray slot
//                            (MARTIN recolors pink -> white). Pieces are measured (FLIP)
//                            and ride a shared baseline, landing exactly on the circle.
//   [MORPH_END, ADJ_END]  -> the adjectives extend out from the middle (quick burst),
//                            now that the A is at center.
//   [ADJ_END, ROTATE_END] -> the circle rotates a full 360deg (one pass through every
//                            adjective), and each adjective's "proof" rises into focus on
//                            the right exactly as that adjective snaps to focus in the circle.
// The MORPH_END / ADJ_END / ROTATE_END fractions are DERIVED from a per-phase vh budget below
// (after TITLES), so the rotation length auto-scales with however many adjectives you list.

// Order around the circle == order each adjective passes through focus (rotation is negative,
// so array order matches focus order). LARA MARTIN leads (about-me proof), then programmer.
// To add / remove / reorder: just edit this list (and the matching `proofs` map in page.tsx).
// Keep "LARA MARTIN" FIRST — the morph lands it in focus at the start.
const TITLES = [
    "LARA MARTIN",
    "programmer",
    "learner",
    "girl who codes",
    "photographer",
    "reader",
    "cat lover",
    // "sweet treat lover",
];

// Proof stage tuning: a proof is visible within +/- PROOF_W degrees of its adjective's focus,
// travelling TRAVEL_VH up the right half of the screen as it passes (bottom -> center -> top).
const PROOF_W = 30; // a touch wider than the 22.5deg half-gap, so adjacent proofs crossfade
const TRAVEL_VH = 48; // vertical travel (vh) from center at the edge of the window
// Fraction of the window kept fully opaque before the fade starts — a plateau in the middle
// with a steeper (smoothstep) fade toward the edges, instead of a linear fade.
const PLATEAU = 0.55;
const PIVOT = "A";
const NAME = "LARA MARTIN";

// Hero geometry, fully derived from the adjective count so adding/removing/reordering TITLES
// "just works": every adjective gets the SAME scroll budget (VH_PER_STOP) as it passes through
// focus, and the hero grows/shrinks to fit. Tune pacing with the per-phase budgets below.
const STICKY_VH = 100; // the sticky viewport height inside the hero
const MORPH_VH = 54; // scroll spent on the name morph
const ADJ_VH = 27; // scroll spent on the adjectives bursting out
const VH_PER_STOP = 95; // scroll per adjective passing through focus (rotation pacing)
const LINGER_VH = 72; // scroll the final ALARA MARTIN lingers before the footer
// One full 360° rotation passes every title through focus exactly once → one stop per title.
const ROTATE_VH = TITLES.length * VH_PER_STOP;
const SCROLL_VH = MORPH_VH + ADJ_VH + ROTATE_VH + LINGER_VH;
const HERO_VH = SCROLL_VH + STICKY_VH;
// Phase boundaries as fractions of the hero's own scroll progress (what useScroll reports).
const MORPH_END = MORPH_VH / SCROLL_VH;
const ADJ_END = (MORPH_VH + ADJ_VH) / SCROLL_VH;
const ROTATE_END = (MORPH_VH + ADJ_VH + ROTATE_VH) / SCROLL_VH;

// MARTIN recolors from the resting pink straight to the final nav color (red in light, pink in
// dark) — no white in the middle, so it never blends into the lightening background, and it
// matches the handed-off ray's var(--scroll-nav) exactly.
const MARTIN_START = "#ed8c91"; // --color-lightpink
const MARTIN_END_LIGHT = "#a3002c"; // nav.end (light) in app/ui/scrollColors.ts
const MARTIN_END_DARK = "#ed8c91"; // nav.end (dark) — stays pink, no white

// Constant outline so the name stays thin/elegant when huge (landing) but reads
// clearly when small (circle). Negligible on 8rem text, meaningful on ~1.3rem text.
const STROKE = "0.75px"; // tune in browser

const normalizeDeg = (deg: number) => ((deg % 360) + 360) % 360;
const angularDistance = (a: number, b: number) => {
    const d = Math.abs(normalizeDeg(a) - normalizeDeg(b));
    return Math.min(d, 360 - d);
};
// Signed offset from focus (0), in (-180, 180]. Positive = approaching focus (proof below
// center, rising), negative = past focus (proof above center, exiting top).
const signedFromFocus = (deg: number) => {
    const d = normalizeDeg(deg);
    return d > 180 ? d - 360 : d;
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

export default function NameCircle({
    proofs = {},
    outro,
}: {
    proofs?: Record<string, ReactNode>;
    outro?: ReactNode;
}) {
    // Scroll is measured against the hero itself (not the whole document), so progress is
    // scrollY / SCROLL_VH regardless of how much content sits below — robust pacing + clean
    // vh offsets for the snap markers.
    const heroRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end end"],
    });
    // Negative so the circle's array order matches the focus order (LARA MARTIN -> programmer
    // -> learner -> ...). normalizeDeg/angularDistance already handle negative rotation.
    const rotate = useTransform(
        scrollYProgress,
        [ADJ_END, ROTATE_END],
        [0, -360],
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
    // The hero owns the red -> light/dark background transition: it completes within the morph
    // window, so the background is fully transformed by the time the circle is "ready".
    // (ScrollAnimation bails on pages that have a [data-scroll-hero], leaving this in charge.)
    const morphRef = useRef(0);
    useMotionValueEvent(mp, "change", (v) => {
        setMorph(v);
        morphRef.current = v;
        setScrollColors(v, document.documentElement.classList.contains("dark"));
    });

    // Apply the initial color (morph 0 == red) on mount, and re-apply on theme toggle so the
    // partially-scrolled background recomputes for the new light/dark target. isDark also feeds
    // the MARTIN mover's end color.
    const [isDark, setIsDark] = useState(false);
    useEffect(() => {
        const root = document.documentElement;
        const apply = () => {
            const dark = root.classList.contains("dark");
            setIsDark(dark);
            setScrollColors(morphRef.current, dark);
        };
        apply();
        const observer = new MutationObserver(apply);
        observer.observe(root, {
            attributes: true,
            attributeFilter: ["class"],
        });
        return () => observer.disconnect();
    }, []);

    // Turn on scroll-snapping only while this hero is mounted (i.e. only on the home page).
    useEffect(() => {
        const el = document.documentElement;
        const prev = el.style.scrollSnapType;
        el.style.scrollSnapType = "y proximity";
        return () => {
            el.style.scrollSnapType = prev;
        };
    }, []);

    const [adj, setAdj] = useState(0);
    useMotionValueEvent(adjMv, "change", (v) => setAdj(v));

    const rays = useMemo(() => {
        const step = 360 / TITLES.length;
        return TITLES.map((title, i) => ({ title, angle: i * step }));
    }, []);

    const activeWindow = 180 / TITLES.length;

    // Snap-marker progress positions: the landing (0), then each focus point — name-intro,
    // the adjectives, and name-outro — at p = ADJ_END + (ROTATE_END - ADJ_END) * (i / n).
    const snapStops = useMemo(() => {
        const stops = [0];
        for (let i = 0; i <= TITLES.length; i++) {
            stops.push(ADJ_END + (ROTATE_END - ADJ_END) * (i / TITLES.length));
        }
        return stops;
    }, []);

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

        // Measure once the web font (Italiana) is ready so the movers appear already
        // positioned for the final glyph metrics — measuring in the fallback font first
        // would make the name visibly jump a couple px when the font swaps in. The
        // SSR rest anchor holds the visible name until then (rects stays null).
        if (document.fonts?.ready) {
            document.fonts.ready.then(measure).catch(measure);
        } else {
            measure();
        }
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, []);

    // Style for one morphing piece. Vertically it interpolates from the resting
    // baseline to the circle's box center (so it lands exactly on the center-anchored
    // pivot/ray). Crisp: real font-size + translate (no scale). Weight 400 + outline.
    const moverStyle = (
        p: { sX: number; eX: number; sFs: number; eFs: number } | undefined,
        color: string,
        endTracking: string,
    ): CSSProperties => {
        if (!rects || !p) return { display: "none" };
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
            // At rest (morph 0) the CSS rest-anchor is the visible name, so the movers stay
            // hidden — that avoids a static couple-px jump from the measured mover positions
            // not landing pixel-exact on the rest-anchor glyphs. The movers only show once the
            // morph is underway (everything's in motion, so the handoff is imperceptible), and
            // hide again at handoff to the circle (morph 1).
            opacity: morph > 0 && morph < 1 ? 1 : 0,
            zIndex: 2,
            pointerEvents: "none",
        };
    };

    const handedOff = morph >= 1; // circle's real pivot/ray take over

    return (
        <div
            ref={heroRef}
            data-scroll-hero={String(HERO_VH)}
            className={`relative ${italiana.className} antialiased`}
            style={{ height: `${HERO_VH}vh` }}
        >
            {/* Scroll-snap anchors: thin, decorative markers placed at each focus offset so the
          page settles with an adjective/proof centered. Driven by the same constants as the
          rotation, so they track any retune. */}
            {snapStops.map((p, i) => (
                <div
                    key={i}
                    aria-hidden
                    style={{
                        position: "absolute",
                        top: `${p * SCROLL_VH}vh`,
                        left: 0,
                        width: 1,
                        height: 1,
                        scrollSnapAlign: "start",
                        pointerEvents: "none",
                    }}
                />
            ))}

            <div
                className="sticky top-0 h-svh"
                style={{ background: "var(--scroll-bg)" }}
            >
                <div ref={stageRef} className="relative h-svh w-full">
                    {/* Rest anchor: invisible, only used to measure the resting name layout.
                Sized in vw (clamped) so it scales with the window and never overflows;
                the movers read these measured sizes, so the visible name scales too. */}
                    {/* This anchor IS the visible name at rest (morph 0): the server-rendered
                HTML paints "ALARA MARTIN" instantly (white-on-red), and it stays the visible
                name — laid out by real CSS, pixel-exact — until the morph starts. Only then do
                the measured movers take over (in motion, so any sub-pixel handoff is unseen),
                which avoids a static jump from the movers not landing exactly on these glyphs.
                It's also still used for FLIP measurement (getBoundingClientRect ignores opacity). */}
                    <div
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 pb-4 flex items-baseline pointer-events-none"
                        style={{
                            opacity: morph > 0 ? 0 : 1,
                            fontSize: "clamp(2.25rem, 12vw, 8rem)",
                            fontWeight: 400,
                            WebkitTextStrokeWidth: STROKE,
                            WebkitTextStrokeColor: "currentColor",
                        }}
                        aria-hidden
                    >
                        <p
                            className="whitespace-nowrap leading-none"
                            style={{
                                fontSize: "1em",
                                paddingRight: "0.16em",
                                color: "var(--scroll-nav)",
                            }}
                        >
                            <span ref={restARef}>A</span>
                            <span ref={restLaraRef}>LARA</span>
                            <span
                                ref={restBLRef}
                                style={{ display: "inline-block", width: 0 }}
                            />
                        </p>
                        <p
                            className="whitespace-nowrap leading-none"
                            style={{ fontSize: "0.5625em", color: MARTIN_START }}
                        >
                            <span ref={restMartinRef}>MARTIN</span>
                        </p>
                    </div>

                    {/* Movers: the visible, morphing name pieces (crisp — font-size + translate).
          Always mounted (moverStyle self-hides via display:none until measured) so the
          rendered children set never changes while scrolling. */}
                    <span
                        style={moverStyle(
                            rects?.a,
                            "var(--scroll-nav)",
                            "0.05em",
                        )}
                    >
                        A
                    </span>
                    <span
                        style={moverStyle(
                            rects?.l,
                            "var(--scroll-nav)",
                            "0.02em",
                        )}
                    >
                        LARA
                    </span>
                    <span
                        style={moverStyle(
                            rects?.m,
                            lerpColor(
                                MARTIN_START,
                                isDark ? MARTIN_END_DARK : MARTIN_END_LIGHT,
                                morph,
                            ),
                            "0.02em",
                        )}
                    >
                        MARTIN
                    </span>

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

                    {/* The circle: centered on mobile (graceful fallback, no proof stage there), moved
          to the left half on md+ so the proofs have room on the right. The morph retargets
          automatically because the movers read the live pivot/ray positions. Decorative —
          must not capture clicks meant for the LinksBar underneath it. */}
                    <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:left-[12%] md:translate-x-0 lg:left-[16%]">
                        <div>
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
                                        const distance = angularDistance(
                                            worldAngle,
                                            0,
                                        );
                                        const isActive =
                                            distance <= activeWindow;

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
                                                        transform:
                                                            "translateY(-50%)",
                                                        transformOrigin:
                                                            "left center",
                                                        display: "inline-block",
                                                        whiteSpace: "nowrap",
                                                        lineHeight: 1,
                                                        letterSpacing: "0.02em",
                                                        fontSize,
                                                        fontWeight: 400,
                                                        WebkitTextStrokeWidth:
                                                            STROKE,
                                                        WebkitTextStrokeColor:
                                                            "currentColor",
                                                        color,
                                                        opacity,
                                                        // The name ray must appear instantly at
                                                        // handoff (the mover hides the same frame);
                                                        // a fade here leaves a 1-frame gap/flash.
                                                        // Keep the smooth font-size "bounce" (so LARA MARTIN grows
                                                        // like every other adjective), but no opacity transition on the
                                                        // name ray so the handoff doesn't flash.
                                                        transition: isName
                                                            ? "font-size 120ms ease-out"
                                                            : "font-size 120ms ease-out, opacity 120ms ease-out",
                                                    }}
                                                >
                                                    {isName ? (
                                                        <>
                                                            <span
                                                                ref={rayLaraRef}
                                                            >
                                                                LARA&nbsp;
                                                            </span>
                                                            <span
                                                                ref={
                                                                    rayMartinRef
                                                                }
                                                            >
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

                    {/* Proof stage: isolated + memoized so it is NOT re-rendered on every scroll
              frame (the circle above is). It drives opacity/position with motion values, so the
              deep server-rendered proof trees mount once and never reconcile during scroll —
              which also fixes the React-DevTools "children should not have changed" assertion. */}
                    <ProofStage
                        proofs={proofs}
                        outro={outro}
                        scrollYProgress={scrollYProgress}
                    />
                </div>
            </div>
        </div>
    );
}

// One animated panel per focus point. The name has two (intro about-blurb + outro), every
// adjective has one. Built at module scope so the hook count is constant.
type Panel = {
    key: string;
    angle: number;
    phase: "intro" | "outro" | "normal";
    title: string;
};
const PANELS: Panel[] = (() => {
    const step = 360 / TITLES.length;
    const arr: Panel[] = [];
    TITLES.forEach((title, i) => {
        const angle = i * step;
        if (title === NAME) {
            arr.push({ key: "name-intro", angle, phase: "intro", title });
            arr.push({ key: "name-outro", angle, phase: "outro", title });
        } else {
            arr.push({ key: title, angle, phase: "normal", title });
        }
    });
    return arr;
})();

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
// Rotation (0 -> -360) as a function of hero scroll progress.
const rotationAt = (p: number) =>
    clamp01((p - ADJ_END) / (ROTATE_END - ADJ_END)) * -360;
// Adjective burst gate (0 before the morph ends, 1 after).
const adjGateAt = (p: number) =>
    clamp01((p - MORPH_END) / (ADJ_END - MORPH_END));
const signedAt = (p: number, angle: number) =>
    signedFromFocus(normalizeDeg(angle + normalizeDeg(rotationAt(p))));

// Plateau-then-smoothstep opacity for a panel at scroll progress p.
const panelOpacity = (p: number, angle: number, phase: Panel["phase"]) => {
    const rot = rotationAt(p);
    // The name focuses twice (rot ≈ 0 and rot ≈ -360). Gate intro/outro by rotation half; the
    // boundary sits where the name is out of focus (opacity 0), so the switch is invisible.
    if (phase === "intro" && rot < -180) return 0;
    if (phase === "outro" && rot >= -180) return 0;
    const signed = signedAt(p, angle);
    if (Math.abs(signed) >= PROOF_W) return 0;
    const a = Math.min(1, Math.abs(signed) / PROOF_W);
    const x = a <= PLATEAU ? 0 : (a - PLATEAU) / (1 - PLATEAU);
    const ease = x * x * (3 - 2 * x);
    return (1 - ease) * adjGateAt(p);
};
const panelY = (p: number, angle: number) => {
    const t = Math.max(-1, Math.min(1, signedAt(p, angle) / PROOF_W));
    return t * TRAVEL_VH; // vh offset from center
};

const ProofStage = memo(function ProofStage({
    proofs,
    outro,
    scrollYProgress,
}: {
    proofs: Record<string, ReactNode>;
    outro?: ReactNode;
    scrollYProgress: MotionValue<number>;
}) {
    return (
        <div className="hidden md:block absolute inset-y-0 right-0 left-1/2 overflow-hidden">
            <div className="relative h-full w-full">
                {PANELS.map((panel) => (
                    <ProofPanel
                        key={panel.key}
                        panel={panel}
                        scrollYProgress={scrollYProgress}
                        node={
                            panel.phase === "intro"
                                ? proofs[NAME]
                                : panel.phase === "outro"
                                  ? outro
                                  : proofs[panel.title]
                        }
                    />
                ))}
            </div>
        </div>
    );
});

function ProofPanel({
    panel,
    scrollYProgress,
    node,
}: {
    panel: Panel;
    scrollYProgress: MotionValue<number>;
    node: ReactNode;
}) {
    const opacity = useTransform(scrollYProgress, (p) =>
        panelOpacity(p, panel.angle, panel.phase),
    );
    const yvh = useTransform(scrollYProgress, (p) => panelY(p, panel.angle));
    const transform = useMotionTemplate`translateY(calc(-50% + ${yvh}vh))`;
    const visibility = useTransform(opacity, (o) =>
        o > 0.01 ? "visible" : "hidden",
    );
    const pointerEvents = useTransform(opacity, (o) =>
        o > 0.5 ? "auto" : "none",
    );
    return (
        <motion.div
            style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: "50%",
                transform,
                opacity,
                visibility,
                pointerEvents,
                willChange: "transform, opacity",
            }}
            className="flex justify-center px-8"
        >
            <div className="w-full max-w-xl">{node}</div>
        </motion.div>
    );
}
