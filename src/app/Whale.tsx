"use client";
import { useEffect, useRef } from "react";
import WhaleSvg, { resolveWhaleEls, useWhaleSvgRefs } from "./whale/WhaleSvg";
import {
    HEAVE,
    PATH_FRAME_MS,
    applyWhaleArt,
    createWhaleRig,
    loadWhaleInk,
    type WhaleRig,
} from "./whale/whaleInk";
import { createWhalePod, type Rect } from "./whale/whalePodSim";

// One ink humpback roaming the whole screen, steering around anything marked data-whale-avoid.
// Swimming comes from whale/whalePodSim.ts (copied from alaramartin.com's contact page).

const SPEED = 55; // px per second
const STRIDE_BODY_LENGTHS = 0.7;

export default function Whale() {
    const overlayRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLAnchorElement>(null);
    const svgRefs = useWhaleSvgRefs();

    useEffect(() => {
        const overlay = overlayRef.current;
        const wrapper = wrapperRef.current;
        const els = resolveWhaleEls(svgRefs);
        if (!overlay || !wrapper || !els) return;
        const section = overlay.parentElement ?? overlay;
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const pod = createWhalePod({ bodyLengthsPerStroke: STRIDE_BODY_LENGTHS });
        let rig: WhaleRig | null = null;
        let disposed = false;
        let rafId = 0;
        let lastTime = 0;
        let lastDraw = 0;
        let hovered = false;
        let pace = 1; // 1 = full swim, eases to 0.5 while hovered
        let w = 0;
        let h = 0;

        const measure = () => {
            const box = overlay.getBoundingClientRect();
            w = wrapper.offsetWidth;
            h = wrapper.offsetHeight;
            const obstacles: Rect[] = Array.from(
                section.querySelectorAll<HTMLElement>("[data-whale-avoid]"),
                (el) => {
                    const r = el.getBoundingClientRect();
                    return { l: r.left - box.left, t: r.top - box.top, r: r.right - box.left, b: r.bottom - box.top };
                },
            );
            pod.setLayout({
                width: box.width,
                height: box.height,
                obstacles,
                navBottom: 0,
                lengths: [w, w],
                heights: [h, h],
                speed: SPEED,
            });
        };

        const place = () => {
            const whale = pod.whales[0];
            const bob = rig ? rig.heaveAt(whale.phase) * HEAVE * whale.effort * w : 0;
            wrapper.style.transform =
                `translate3d(${(whale.x - w / 2).toFixed(1)}px, ${(whale.y - h / 2).toFixed(1)}px, 0) ` +
                `rotate(${whale.pitch.toFixed(4)}rad) scale(${(whale.dir * whale.scale).toFixed(3)}, ${whale.scale.toFixed(3)}) ` +
                `translateY(${bob.toFixed(2)}px)`;
        };

        const draw = () => {
            const whale = pod.whales[0];
            rig!.draw(els, whale.phase, { undulation: whale.effort, bend: whale.bend });
        };

        const tick = (time: number) => {
            rafId = 0;
            if (document.hidden || !rig) return;
            const dt = lastTime ? Math.min(time - lastTime, 100) / 1000 : 0;
            lastTime = time;
            pace += ((hovered ? 0.5 : 1) - pace) * (1 - Math.exp(-dt * 4));
            pod.step(dt * pace);
            place();
            if (time - lastDraw >= PATH_FRAME_MS) {
                lastDraw = time;
                draw();
            }
            rafId = requestAnimationFrame(tick);
        };

        const run = () => {
            if (reduceMotion || rafId || document.hidden || !rig) return;
            lastTime = 0;
            rafId = requestAnimationFrame(tick);
        };

        loadWhaleInk().then((data) => {
            if (disposed) return;
            rig = createWhaleRig(data);
            applyWhaleArt(els.svg, data);
            measure();
            if (reduceMotion) pod.rest();
            else pod.spawn();
            draw();
            place();
            wrapper.style.visibility = "visible";
            run();
        });

        const onEnter = () => (hovered = true);
        const onLeave = () => (hovered = false);
        wrapper.addEventListener("pointerenter", onEnter);
        wrapper.addEventListener("pointerleave", onLeave);

        const onVisibilityChange = () => {
            if (!document.hidden) run();
        };
        document.addEventListener("visibilitychange", onVisibilityChange);

        const resizeObserver = new ResizeObserver(() => {
            if (!rig) return;
            measure();
            if (reduceMotion) {
                pod.rest();
                draw();
                place();
            }
        });
        resizeObserver.observe(section);
        // Text that grows in place (the headline's fan) moves the obstacles without resizing the page.
        section
            .querySelectorAll<HTMLElement>("[data-whale-avoid]")
            .forEach((el) => resizeObserver.observe(el));

        return () => {
            disposed = true;
            if (rafId) cancelAnimationFrame(rafId);
            resizeObserver.disconnect();
            wrapper.removeEventListener("pointerenter", onEnter);
            wrapper.removeEventListener("pointerleave", onLeave);
            document.removeEventListener("visibilitychange", onVisibilityChange);
        };
        // svgRefs holds stable ref objects.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div ref={overlayRef} className="pointer-events-none absolute inset-0 overflow-hidden">
            <a
                ref={wrapperRef}
                href="https://me.alaramartin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="me.alaramartin.com"
                className="whale-link pointer-events-auto absolute left-0 top-0 block will-change-transform"
                style={{ visibility: "hidden" }}
            >
                <WhaleSvg refs={svgRefs} className="block h-auto w-[177px]" />
            </a>
        </div>
    );
}
