"use client";
import {
    useEffect,
    useEffectEvent,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import { ArrowSquareOutIcon } from "@phosphor-icons/react";

// The name, then the adjectives from alaramartin.com's NameCircle. Each one is split into its
// leading letter ("A" or "a", which only flips when the case changes) and the rest, which spins.
const NAME = "Alara Martin.";
const ADJECTIVES = ["programmer", "hacker", "photographer", "student"];
const WORDS = [NAME, ...ADJECTIVES];

// Adjectives that link out on hover (the name doesn't).
const LINKS: Record<string, string> = {
    programmer: "https://github.com/alaramartin",
    hacker: "https://x.com/alara_martin_",
    photographer: "https://instagram.com/alara.martin",
    student: "https://linkedin.com/in/alara-martin",
};

const REST_MS = 2600; // how long each adjective sits
const NAME_REST_MS = 4800; // the name lingers longer
const FLIP_MS = 800;
const EASE = "cubic-bezier(0.65, 0, 0.35, 1)";

// The headline shrinks on short screens so the fan has room...
const HEAD_SIZE = "clamp(2rem, min(8vh, 10vw), 4.5rem)"; // and on narrow ones, so it fits across

// The fan: like a hand of cards turned on its side, swinging out from behind the pivot word. Every
// word is a card pivoting about a point to the left of the line, each dealt the same angle further
// round than the last. When there's room that's FAN_DEG about a point PIVOT_EM out; when there
// isn't, the angle tightens and the pivot moves further out to keep cards SEP_EM apart where
// they start.
const LINE_EM = 1.15;
const PIVOT_EM = 10;
const FAN_DEG = 6;
const SEP_EM = LINE_EM; // a full line, so fanned cards never cover each other
const FAN_MARGIN_PX = 16; // breathing room left at the screen's edges
const FAN_MARGIN_TOP_NARROW_PX = 72; // phones: keep "Hi, I'm" well clear of the top

// The fan opens and closes on a spring, so it can turn around mid-swing from wherever it is.
const SPRING_K = 230; // stiffness, 1/s^2
const SPRING_ZETA_OPEN = 0.72; // a little overshoot as the cards land
const SPRING_ZETA_CLOSE = 1; // straight back in

const rest = (i: number) => (i === 0 ? NAME.slice(1) : WORDS[i]);

type Fan = { deg: number; pivot: number; below: number };
const DEFAULT_FAN: Fan = { deg: FAN_DEG, pivot: PIVOT_EM, below: 2 };

// The hand swings as one rigid piece, so neighboring cards always stay a full slot apart and never
// overlap. At open = 1 each card sits `slot` slots round; as open falls the whole side turns back
// towards the pivot word and the cards disappear behind it one at a time, nearest first.
const cardDeg = (slot: number, open: number, { deg, below }: Fan) => {
    if (slot === 0) return 0;
    const side = slot > 0 ? below : WORDS.length - 1 - below;
    const a = Math.max(0, Math.abs(slot) * deg - (1 - open) * side * deg);
    return Math.sign(slot) * a;
};

// How far (in em) a card of width w turned by aDeg reaches past the pivot word's top or bottom
// edge, past its left edge to the right, and back past that same edge to the left (turning about
// a point out to the left swings a card's start a little further left).
const reach = (w: number, aDeg: number, pivot: number) => {
    const a = (Math.abs(aDeg) * Math.PI) / 180;
    const half = LINE_EM / 2;
    return {
        out: (w + pivot) * Math.sin(a) + half * (Math.cos(a) - 1),
        right: (w + pivot) * Math.cos(a) - pivot + half * Math.sin(a),
        left: pivot * (1 - Math.cos(a)) + half * Math.sin(a),
    };
};

type Room = { up: number; down: number; left: number; right: number };

// The fan, top to bottom, when `below` cards go under the pivot word `current`. The adjectives
// keep their cyclic order around the pivot (wrapping), and "Alara Martin." always sits on top
// unless it is the pivot itself.
function fanOrder(current: number, below: number): number[] {
    const n = ADJECTIVES.length;
    const adj = (k: number) => (((k % n) + n) % n) + 1; // word index of the k-th adjective
    const range = (len: number) => Array.from({ length: len }, (_, k) => k);
    if (current === 0) {
        const above = n - below;
        return [
            ...range(above).map((k) => adj(k - above)),
            0,
            ...range(below).map(adj),
        ];
    }
    const p = current - 1;
    const above = n - 1 - below;
    return [
        0,
        ...range(above).map((k) => adj(p - above + k)),
        current,
        ...range(below).map((k) => adj(p + 1 + k)),
    ];
}

// The widest fan that fits in the space above and below the pivot word. Every way of splitting
// the cards between up and down is tried, preferring the one closest to how the room itself is
// split, at the widest angle that fits, tightening the angle until something does.
function fitFan(
    current: number,
    widthOf: (word: number) => number,
    { up, down, left, right }: Room,
): Fan {
    const others = WORDS.length - 1;
    // With an adjective pivot the name is always above it, so at most others - 1 go down.
    const maxBelow = current === 0 ? others : others - 1;
    const share = down / Math.max(up + down, 1e-6);
    const splits = Array.from({ length: maxBelow + 1 }, (_, b) => b).sort(
        (x, y) => Math.abs(x / others - share) - Math.abs(y / others - share),
    );
    const fits = (fan: Fan) => {
        const order = fanOrder(current, fan.below);
        const at = order.indexOf(current);
        let over = -Infinity;
        order.forEach((word, pos) => {
            const slot = pos - at;
            if (slot === 0) return;
            const r = reach(widthOf(word), Math.abs(slot) * fan.deg, fan.pivot);
            over = Math.max(
                over,
                r.out - (slot > 0 ? down : up),
                r.left - left,
                r.right - right,
            );
        });
        return over;
    };
    let best = { ...DEFAULT_FAN, below: splits[0] };
    let bestOver = Infinity;
    for (let deg = FAN_DEG; deg >= 1; deg -= 0.25) {
        const pivot = Math.max(PIVOT_EM, SEP_EM / ((deg * Math.PI) / 180));
        for (const below of splits) {
            const fan = { deg, pivot, below };
            const over = fits(fan);
            if (over <= 0) return fan;
            if (over < bestOver) [best, bestOver] = [fan, over];
        }
    }
    return best;
}

// The leading letter changes case twice per cycle: entering the adjectives and returning to the name.
const caseFlips = (step: number) =>
    2 * Math.floor(step / WORDS.length) + (step % WORDS.length >= 1 ? 1 : 0);

// A square prism spinning about its horizontal axis: face k sits at -k * 90deg, so turning the
// prism by +90deg flips the front face up and over and brings the face below to the front.
function Prism({
    turns,
    left,
    hidden,
    children,
}: {
    turns: number;
    left?: string;
    // hides the whole prism from screen readers and crawlers' accessible text
    hidden?: boolean;
    children: (k: number, front: boolean) => React.ReactNode;
}) {
    return (
        <div
            aria-hidden={hidden || undefined}
            className="absolute inset-y-0 right-0"
            style={{
                left: left ?? 0,
                transformStyle: "preserve-3d",
                transform: `translateZ(-0.575em) rotateX(${turns * 90}deg)`,
                transition: `transform ${FLIP_MS}ms ${EASE}, left ${FLIP_MS}ms ${EASE}`,
            }}
        >
            {[0, 1, 2, 3].map((k) => {
                const front = k === turns % 4;
                return (
                    <div
                        key={k}
                        // only the face showing counts; the rest are turned away
                        aria-hidden={!front || undefined}
                        className="absolute inset-0 whitespace-nowrap"
                        style={{
                            pointerEvents: front ? "auto" : "none",
                            lineHeight: "1.15em",
                            backfaceVisibility: "hidden",
                            opacity: front ? 1 : 0,
                            transition: `opacity ${FLIP_MS}ms ease-in-out`,
                            transform: `rotateX(${-k * 90}deg) translateZ(0.575em)`,
                        }}
                    >
                        {children(k, front)}
                    </div>
                );
            })}
        </div>
    );
}

function AdjLink({
    word,
    focusable,
    onHold,
}: {
    word: string;
    focusable: boolean;
    onHold?: (held: boolean) => void;
}) {
    return (
        <a
            href={LINKS[word]}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={focusable ? 0 : -1}
            className="adj-link"
            data-fan-trigger
            onPointerEnter={() => onHold?.(true)}
            onPointerLeave={() => onHold?.(false)}
        >
            {word}
            <ArrowSquareOutIcon size="0.27em" className="adj-icon" />
        </a>
    );
}

export default function Headline() {
    const [step, setStep] = useState(0);
    const [paused, setPaused] = useState(false);
    const [fanned, setFanned] = useState(false);
    const [fitted, setFan] = useState<Fan>(DEFAULT_FAN);
    const [faces, setFaces] = useState<(number | null)[]>([0, 1, null, null]);
    // Where the spinning part starts: just after "A", or after "a" plus the gap that stands in
    // for a space (--a-gap, a touch tighter on phones). Georgia's advances as a fallback until
    // the real glyphs are measured; kept in em so they follow the headline's size.
    const [glyphs, setGlyphs] = useState({ upper: 0.672, lower: 0.501 });
    const offsets = {
        upper: `${glyphs.upper}em`,
        lower: `calc(${glyphs.lower}em + var(--a-gap))`,
    };
    // Each card's untransformed width in em, for sizing the box the fan sweeps out.
    const [cardWidths, setCardWidths] = useState<Record<number, number>>({});
    const upperRef = useRef<HTMLSpanElement>(null);
    const lowerRef = useRef<HTMLSpanElement>(null);
    const cardRefs = useRef<Record<number, HTMLLIElement | null>>({});
    const hiRef = useRef<HTMLParagraphElement>(null);
    const boxRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const measure = () => {
            const upper = upperRef.current;
            const lower = lowerRef.current;
            if (upper && lower) {
                const em = parseFloat(getComputedStyle(upper).fontSize);
                setGlyphs({
                    upper: upper.getBoundingClientRect().width / em,
                    lower: lower.getBoundingClientRect().width / em,
                });
            }
            const widths: Record<number, number> = {};
            for (const [i, el] of Object.entries(cardRefs.current)) {
                if (!el) continue;
                const em = parseFloat(getComputedStyle(el).fontSize);
                widths[Number(i)] = el.offsetWidth / em;
            }
            setCardWidths(widths);
        };
        measure();
        document.fonts?.ready.then(measure);
    }, []);

    // Background tabs still fire (throttled) timers but don't paint, so the steps would pile up
    // and the prism would then race through all of them in one transition on return. Hold the
    // word while the page is hidden instead.
    const [hidden, setHidden] = useState(false);
    useEffect(() => {
        const update = () => setHidden(document.hidden);
        update();
        document.addEventListener("visibilitychange", update);
        return () => document.removeEventListener("visibilitychange", update);
    }, []);

    // Hovering a linked adjective, or fanning them all out, holds the current word; the wait
    // starts over once that ends.
    useEffect(() => {
        if (paused || fanned || hidden) return;
        const wait = step % WORDS.length === 0 ? NAME_REST_MS : REST_MS;
        const id = setTimeout(() => setStep((s) => s + 1), wait);
        return () => clearTimeout(id);
    }, [step, paused, fanned, hidden]);

    // Once a flip lands, load the word for the face now waiting below.
    useEffect(() => {
        if (step === 0) return;
        const id = setTimeout(
            () =>
                setFaces((f) => {
                    const next = [...f];
                    next[(step + 1) % 4] = (step + 1) % WORDS.length;
                    return next;
                }),
            FLIP_MS + 50,
        );
        return () => clearTimeout(id);
    }, [step]);

    const current = step % WORDS.length;
    // The fan keeps the current word where it is as the pivot card and deals the rest out above
    // and below it in the order fanOrder gives. slot(i) is a word's signed distance from the
    // pivot; fan.below of them go down.
    // (The last fitted split, kept within what this pivot allows: only the name can have every
    // adjective below it.)
    const fan = {
        ...fitted,
        below: Math.min(
            fitted.below,
            current === 0 ? ADJECTIVES.length : ADJECTIVES.length - 1,
        ),
    };
    const order = fanOrder(current, fan.below);
    const slot = (i: number) => order.indexOf(i) - order.indexOf(current);
    const widest = Math.max(4, ...Object.values(cardWidths));

    // How open the fan is: 0 tucked away, 1 fully fanned (a little past while it overshoots).
    const [open, setOpen] = useState(0);
    const openRef = useRef(0);
    const velocityRef = useRef(0);

    useEffect(() => {
        const target = fanned ? 1 : 0;
        // Reduced motion: no swing, the fan just appears or goes on the next frame.
        const jump = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches;
        const zeta = fanned ? SPRING_ZETA_OPEN : SPRING_ZETA_CLOSE;
        const damping = 2 * zeta * Math.sqrt(SPRING_K);
        let raf = 0;
        let last = performance.now();
        const tick = (now: number) => {
            const dt = Math.min((now - last) / 1000, 1 / 30);
            last = now;
            const x = openRef.current;
            const v = velocityRef.current;
            const accel = -SPRING_K * (x - target) - damping * v;
            velocityRef.current = v + accel * dt;
            openRef.current = x + velocityRef.current * dt;
            const settled =
                jump ||
                (Math.abs(openRef.current - target) < 0.001 &&
                    Math.abs(velocityRef.current) < 0.01);
            if (settled) {
                openRef.current = target;
                velocityRef.current = 0;
            }
            setOpen(openRef.current);
            if (!settled) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [fanned]);

    // Sizes the fan to the room between the screen's edges and "Hi, I'm" above / the blurb below.
    // Only from fully closed: reopening mid-swing keeps the shape the cards are already in.
    const openFan = () => {
        const box = boxRef.current;
        if (box && openRef.current < 0.001) {
            const em = parseFloat(getComputedStyle(box).fontSize);
            const { top, left } = box.getBoundingClientRect();
            const hi = hiRef.current?.offsetHeight ?? 0;
            const blurb = box.nextElementSibling;
            const below = blurb
                ? blurb.getBoundingClientRect().bottom - (top + LINE_EM * em)
                : 0;
            const narrow = !window.matchMedia("(min-width: 48rem)").matches;
            const marginTop = narrow ? FAN_MARGIN_TOP_NARROW_PX : FAN_MARGIN_PX;
            // Sideways the cards may use part of the page's side margin, but on phones keep
            // the same breathing room as everywhere else.
            const marginSide = narrow ? FAN_MARGIN_PX : FAN_MARGIN_PX / 4;
            const up = (top - hi - marginTop) / em;
            const down =
                (window.innerHeight - FAN_MARGIN_PX - top) / em -
                LINE_EM -
                below / em;
            setFan(
                fitFan(current, (i) => cardWidths[i] ?? widest, {
                    up,
                    down,
                    left: (left - marginSide) / em,
                    right: (window.innerWidth - marginSide - left) / em,
                }),
            );
        }
        setFanned(true);
    };

    // Touch screens have no hover, so there the fan starts out open (once the cards are measured,
    // so it's sized right) and tapping the "a" folds it away and back.
    const autoOpened = useRef(false);
    const autoOpen = useEffectEvent(() => {
        if (autoOpened.current) return;
        autoOpened.current = true;
        openFan();
    });
    useEffect(() => {
        if (!Object.keys(cardWidths).length) return;
        if (!window.matchMedia("(hover: none)").matches) return;
        const id = requestAnimationFrame(autoOpen);
        return () => cancelAnimationFrame(id);
    }, [cardWidths]);

    // The box the cards sweep out right now, so "Hi, I'm" and the blurb move with them, the whale
    // steers round them, and the hover area covers the gaps between them.
    let width = widest;
    let above = 0;
    let height = LINE_EM;
    WORDS.forEach((_, i) => {
        const a = cardDeg(slot(i), open, fan);
        if (a === 0) return;
        const r = reach(cardWidths[i] ?? widest, a, fan.pivot);
        if (a > 0) height = Math.max(height, LINE_EM + r.out);
        else above = Math.max(above, r.out);
        width = Math.max(width, r.right);
    });

    return (
        <>
            <p
                ref={hiRef}
                data-whale-avoid
                className="text-sm"
                style={{ translate: `0 calc(${-above} * ${HEAD_SIZE})` }}
            >
                Hi, I&apos;m
            </p>
            <div
                ref={boxRef}
                className={`relative ${fanned ? "fanned" : ""}`}
                style={{
                    fontSize: HEAD_SIZE,
                    width: `${width}em`,
                    height: `${height}em`,
                }}
                onPointerLeave={(e) => {
                    if (e.pointerType === "mouse") setFanned(false);
                }}
            >
                {/* Covers the cards fanned upward, for the hover area and the whale. */}
                <div
                    aria-hidden
                    data-whale-avoid
                    className="absolute left-0"
                    style={{
                        top: `${-above}em`,
                        height: `${above}em`,
                        width: "100%",
                    }}
                />
                {/* Solid, so the cards tuck away behind it. */}
                <h1
                    className="relative z-20"
                    style={{
                        background: "var(--background)",
                        // Reaches a little past the sides too: serifs (the A's especially) hang
                        // out beyond a card's edge and would peek round a background that stopped
                        // at it.
                        boxShadow:
                            "-0.25em 0 0 var(--background), 0.25em 0 0 var(--background)",
                        height: "1.15em",
                        perspective: "1000px",
                    }}
                    // Hovering any of the word itself opens the fan, not the blank space after it.
                    onPointerOver={(e) => {
                        if (
                            e.pointerType === "mouse" &&
                            !fanned &&
                            (e.target as Element).closest("[data-fan-trigger]")
                        )
                            openFan();
                    }}
                >
                    {/* The name as plain text, for screen readers and search engines. The
                        animated letters below are hidden from them. */}
                    <span className="sr-only">Alara Martin</span>
                    <span
                        ref={upperRef}
                        aria-hidden
                        className="invisible absolute whitespace-pre"
                    >
                        A
                    </span>
                    <span
                        ref={lowerRef}
                        aria-hidden
                        className="invisible absolute whitespace-pre"
                    >
                        a
                    </span>

                    {/* One dotted underline (and glow) under the whole name while it's the anchor,
                        so the dots run unbroken across the "A" and the rest. The glow stops once
                        the fan is out. */}
                    <span
                        aria-hidden
                        className={`dotted absolute inset-y-0 left-0 ${fanned ? "" : "fan-hint"}`}
                        style={{
                            width: `${cardWidths[0] ?? widest}em`,
                            opacity: current === 0 ? 1 : 0,
                            transition: `opacity ${FLIP_MS}ms ease-in-out`,
                        }}
                    />
                    <Prism turns={caseFlips(step)} hidden>
                        {(k) => (k % 2 === 0 ? "A" : "a")}
                    </Prism>
                    <Prism
                        turns={step}
                        left={current === 0 ? offsets.upper : offsets.lower}
                    >
                        {(k, front) => {
                            const i = faces[k];
                            if (i === null) return null;
                            return i === 0 ? (
                                <span aria-hidden data-fan-trigger>
                                    {rest(i)}
                                </span>
                            ) : (
                                <AdjLink
                                    word={WORDS[i]}
                                    focusable={front}
                                    onHold={setPaused}
                                />
                            );
                        }}
                    </Prism>

                    {/* On touch screens tapping this opens and folds the fan. It covers the whole
                        name while that's the anchor, but only the "a" before an adjective, so the
                        adjective itself stays a link. */}
                    <span
                        aria-hidden
                        data-fan-trigger
                        className="absolute inset-y-0 left-0 cursor-default"
                        style={{
                            width:
                                current === 0
                                    ? `${cardWidths[0] ?? widest}em`
                                    : offsets.lower,
                        }}
                        onPointerDown={(e) => {
                            if (e.pointerType !== "mouse") {
                                if (fanned) setFanned(false);
                                else openFan();
                            }
                        }}
                    />
                </h1>

                <ul aria-hidden={!fanned}>
                    {WORDS.map((word, i) => {
                        const d = slot(i);
                        const shown = fanned && d !== 0;
                        return (
                            <li
                                key={i}
                                ref={(el) => {
                                    cardRefs.current[i] = el;
                                }}
                                className="absolute left-0 top-0 whitespace-nowrap"
                                style={{
                                    lineHeight: `${LINE_EM}em`,
                                    pointerEvents: shown ? "auto" : "none",
                                    transformOrigin: `-${fan.pivot}em ${LINE_EM / 2}em`,
                                    transform: `rotate(${cardDeg(d, open, fan)}deg)`,
                                    // Fully tucked away, nothing of it should show at all.
                                    visibility:
                                        cardDeg(d, open, fan) === 0
                                            ? "hidden"
                                            : "visible",
                                }}
                            >
                                {i === 0 ? (
                                    <span className="dotted">{word}</span>
                                ) : (
                                    <>
                                        a<span className="a-gap" />
                                        <AdjLink
                                            word={word}
                                            focusable={shown}
                                        />
                                    </>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </>
    );
}
