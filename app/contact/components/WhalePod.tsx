"use client";
import { useEffect, useRef, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import WhaleSvg, { resolveWhaleEls, useWhaleSvgRefs } from "@/app/components/whale/WhaleSvg";
import {
    HEAVE,
    PATH_FRAME_MS,
    applyWhaleArt,
    createWhaleRig,
    loadWhaleInk,
    type WhaleEls,
    type WhaleRig,
} from "@/app/components/whale/whaleInk";
import { createWhalePod, type Rect } from "./whalePodSim";

// Two ink humpbacks roaming the contact page's first screen together, steering around the text.
// The swimming itself lives in whalePodSim.ts; this component measures the page, advances the
// simulation each frame, and poses the drawings. It pauses while the section is off screen or
// the tab is hidden, and only measures layout on resize.

const SPEED = { desktop: 55, mobile: 60 }; // px per second before size scaling (mobile whales are 2/3 size → ~40 px/s)
// Distance covered per tail beat. Real cetaceans cover roughly 0.6–0.8 body lengths per stroke;
// much more and the whale looks like it's gliding faster than its tail could push it.
const STRIDE_BODY_LENGTHS = 0.7;

export default function WhalePod() {
    const reduceMotion = useReducedMotion();
    const overlayRef = useRef<HTMLDivElement>(null);
    const wrapperA = useRef<HTMLDivElement>(null);
    const wrapperB = useRef<HTMLDivElement>(null);
    const svgA = useWhaleSvgRefs();
    const svgB = useWhaleSvgRefs();

    useEffect(() => {
        const overlay = overlayRef.current;
        const wrapA = wrapperA.current;
        const wrapB = wrapperB.current;
        const elsA = resolveWhaleEls(svgA);
        const elsB = resolveWhaleEls(svgB);
        if (!overlay || !wrapA || !wrapB || !elsA || !elsB) return;
        const section = overlay.parentElement ?? overlay;

        const pod = createWhalePod({ bodyLengthsPerStroke: STRIDE_BODY_LENGTHS });
        const views: { wrapper: HTMLDivElement; els: WhaleEls; w: number; h: number; lastDraw: number }[] = [
            { wrapper: wrapA, els: elsA, w: 0, h: 0, lastDraw: 0 },
            { wrapper: wrapB, els: elsB, w: 0, h: 0, lastDraw: PATH_FRAME_MS / 2 }, // stagger redraws
        ];

        let rig: WhaleRig | null = null;
        let disposed = false;
        let visible = false;
        let rafId = 0;
        let lastTime = 0;

        const measure = () => {
            const box = overlay.getBoundingClientRect();
            for (const view of views) {
                // offsetWidth ignores the wrapper's own rotate/scale transform.
                view.w = view.wrapper.offsetWidth;
                view.h = view.wrapper.offsetHeight;
            }
            const obstacles: Rect[] = Array.from(section.querySelectorAll<HTMLElement>("[data-whale-avoid]"), (el) => {
                const r = el.getBoundingClientRect();
                return { l: r.left - box.left, t: r.top - box.top, r: r.right - box.left, b: r.bottom - box.top };
            });
            const nav = document.querySelector<HTMLElement>("[data-site-nav]");
            pod.setLayout({
                width: box.width,
                height: box.height,
                obstacles,
                navBottom: nav ? nav.getBoundingClientRect().bottom - box.top : 0,
                lengths: [views[0].w, views[1].w],
                heights: [views[0].h, views[1].h],
                speed: window.matchMedia("(min-width: 48rem)").matches ? SPEED.desktop : SPEED.mobile,
                // Smaller whales on narrow screens, as a scale (eased on resize) rather than a CSS size jump.
                sizeScale: window.matchMedia("(min-width: 48rem)").matches ? 1 : 2 / 3,
            });
        };

        const place = (i: number) => {
            const whale = pod.whales[i];
            const view = views[i];
            // The drawing faces right; swimming left mirrors it horizontally (never vertically).
            // rotate(pitch) tilts it along the path either way, and translateY (the tail-beat heave)
            // is applied in the whale's own frame.
            // Heave scales with tail effort: bigger when powering ahead, subtle while gliding.
            const bob = rig ? rig.heaveAt(whale.phase) * HEAVE * whale.effort * view.w : 0;
            view.wrapper.style.transform =
                `translate3d(${(whale.x - view.w / 2).toFixed(1)}px, ${(whale.y - view.h / 2).toFixed(1)}px, 0) ` +
                `rotate(${whale.pitch.toFixed(4)}rad) scale(${(whale.dir * whale.scale).toFixed(3)}, ${whale.scale.toFixed(3)}) ` +
                `translateY(${bob.toFixed(2)}px)`;
        };

        const drawAll = () => {
            if (!rig) return;
            views.forEach((view, i) => {
                rig!.draw(view.els, pod.whales[i].phase, { undulation: pod.whales[i].effort, bend: pod.whales[i].bend });
                place(i);
            });
        };

        const tick = (time: number) => {
            rafId = 0;
            if (!visible || document.hidden || !rig) return;
            const dt = lastTime ? Math.min(time - lastTime, 100) / 1000 : 0;
            lastTime = time;
            pod.step(dt);
            views.forEach((view, i) => {
                if (!pod.whales[i].visible) return; // off screen between/around crossings: nothing to draw
                place(i);
                if (time - view.lastDraw >= PATH_FRAME_MS) {
                    view.lastDraw = time;
                    rig!.draw(view.els, pod.whales[i].phase, { undulation: pod.whales[i].effort, bend: pod.whales[i].bend });
                }
            });
            rafId = requestAnimationFrame(tick);
        };

        const run = () => {
            if (reduceMotion || rafId || !visible || document.hidden || !rig) return;
            lastTime = 0;
            rafId = requestAnimationFrame(tick);
        };

        loadWhaleInk().then((data) => {
            if (disposed) return;
            rig = createWhaleRig(data);
            for (const view of views) applyWhaleArt(view.els.svg, data);
            measure();
            if (reduceMotion) pod.rest();
            else pod.spawn();
            drawAll();
            for (const view of views) view.wrapper.style.visibility = "visible";
            run();
        });

        // Only animate while the section is on screen.
        const visibleObserver = new IntersectionObserver((entries) => {
            visible = entries.some((e) => e.isIntersecting);
            if (visible) run();
        });
        visibleObserver.observe(overlay);

        const onVisibilityChange = () => {
            if (!document.hidden) run();
        };
        document.addEventListener("visibilitychange", onVisibilityChange);

        const remeasure = () => {
            if (disposed || !rig) return;
            measure();
            if (reduceMotion) {
                pod.rest();
                drawAll();
            }
        };
        const resizeObserver = new ResizeObserver(remeasure);
        resizeObserver.observe(section);
        document.fonts?.ready.then(remeasure);

        return () => {
            disposed = true;
            if (rafId) cancelAnimationFrame(rafId);
            visibleObserver.disconnect();
            resizeObserver.disconnect();
            document.removeEventListener("visibilitychange", onVisibilityChange);
        };
        // svgA/svgB hold stable ref objects; the effect only needs to rerun for reduced motion.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reduceMotion]);

    return (
        <div ref={overlayRef} aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
            <div ref={wrapperA} className="absolute left-0 top-0 will-change-transform" style={{ visibility: "hidden" }}>
                <WhaleSvg refs={svgA} className="block w-[177px] h-auto" />
            </div>
            {/* The smaller whale is burgundy in light mode and pale pink in dark (--whale-accent-ink). */}
            <div
                ref={wrapperB}
                className="absolute left-0 top-0 will-change-transform"
                style={{ visibility: "hidden", "--whale-ink": "var(--whale-accent-ink)", "--whale-pleat": "var(--whale-accent-pleat)" } as CSSProperties}
            >
                <WhaleSvg refs={svgB} className="block w-[161px] h-auto" />
            </div>
        </div>
    );
}
