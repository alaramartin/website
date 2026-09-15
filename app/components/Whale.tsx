"use client";
import { useEffect, useRef, type CSSProperties } from "react";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "motion/react";
import WhaleSvg, { resolveWhaleEls, useWhaleSvgRefs } from "./whale/WhaleSvg";
import {
    BODY_LENGTHS_PER_STROKE,
    HEAVE,
    PATH_FRAME_MS,
    applyWhaleArt,
    createWhaleRig,
    loadWhaleInk,
    type WhaleRig,
} from "./whale/whaleInk";

// Footer whale: swims across the full page width under the footer divider, rests offscreen,
// then comes back the other way. The drawing and swim cycle live in ./whale/whaleInk.ts.

const DESKTOP = { speed: 50 }; // px per second
const MOBILE = { speed: 40 };
const REST_MIN_MS = 3000;
const REST_MAX_MS = 5000;

export default function Whale() {
    const reduceMotion = useReducedMotion();
    const containerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const svgRefs = useWhaleSvgRefs();

    useEffect(() => {
        const container = containerRef.current;
        const wrapper = wrapperRef.current;
        const els = resolveWhaleEls(svgRefs);
        if (!container || !wrapper || !els) return;

        let rig: WhaleRig | null = null;
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

        const place = () => {
            const bob = rig ? rig.heaveAt(phase) * HEAVE * whaleW : 0;
            wrapper.style.transform = `translate3d(${x.toFixed(2)}px, ${bob.toFixed(2)}px, 0) scaleX(${dir})`;
        };

        const measure = () => {
            containerW = container.clientWidth;
            whaleW = els.svg.getBoundingClientRect().width;
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
            if (!swimming || !visible || document.hidden || !rig) return;
            const dt = lastTime ? Math.min(time - lastTime, 100) / 1000 : 0;
            lastTime = time;

            x += dir * speed * dt;
            // Tail beat tied to travel speed so the whale doesn't look like it's sliding.
            const strokeSeconds = (BODY_LENGTHS_PER_STROKE * whaleW) / speed;
            phase = (phase + dt / strokeSeconds) % 1;
            place();
            if (time - lastPathTime >= PATH_FRAME_MS) {
                lastPathTime = time;
                rig.draw(els, phase, { undulation: 1 });
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
            if (reduceMotion || rafId || !swimming || !visible || document.hidden || !rig) return;
            lastTime = 0;
            rafId = requestAnimationFrame(tick);
        }

        // Only fetch the drawing once the footer is getting close.
        const loadObserver = new IntersectionObserver(
            (entries) => {
                if (!entries.some((e) => e.isIntersecting)) return;
                loadObserver.disconnect();
                loadWhaleInk().then((data) => {
                    if (disposed) return;
                    rig = createWhaleRig(data);
                    applyWhaleArt(els.svg, data);
                    measure();
                    rig.draw(els, 0);
                    if (reduceMotion) {
                        wrapper.style.visibility = "visible";
                    } else {
                        dir = 1;
                        startSwim();
                    }
                });
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
            if (rig) measure();
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
        // svgRefs holds stable ref objects; the effect only needs to rerun for reduced motion.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reduceMotion]);

    return (
        <div
            ref={containerRef}
            aria-hidden="true"
            className="relative w-full h-[46px] md:h-[70px] mt-6 overflow-hidden pointer-events-none"
        >
            {/* Same colours as the smaller contact-page whale (--whale-accent-*). */}
            <div
                ref={wrapperRef}
                className="absolute left-0 top-[2px] will-change-transform"
                style={{ visibility: "hidden", "--whale-ink": "var(--whale-accent-ink)", "--whale-pleat": "var(--whale-accent-pleat)" } as CSSProperties}
            >
                <WhaleSvg refs={svgRefs} className="block w-[100px] md:w-[159px] h-auto" />
            </div>
        </div>
    );
}

/**
 * The footer's whale, on every page except /contact (which has its own pair of whales). Mounting
 * <Whale /> per page means it starts fresh when navigating away from /contact.
 */
export function FooterWhale() {
    const pathname = usePathname();
    // Without the whale, keep the footer's original spacing below the divider.
    return pathname === "/contact" ? <div aria-hidden="true" className="h-14" /> : <Whale />;
}
