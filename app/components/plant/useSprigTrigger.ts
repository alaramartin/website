"use client";
import { useEffect, useState, type RefObject } from "react";
import { useInView } from "motion/react";

export type SprigTrigger = "view" | "hover";

// whether a plant should be grown right now (`grow`), and whether that's
// being decided by hover (`byHover`) rather than by scrolling into view.
// "view": true once `ref` has scrolled into view (stays true).
// "hover": true while the closest [data-sprig-host] ancestor of `ref` is
// hovered or has focus; on touch screens (no hover) it falls back to "view".
export default function useSprigTrigger(
    ref: RefObject<Element | null>,
    trigger: SprigTrigger,
) {
    const [hovered, setHovered] = useState(false);
    const [canHover, setCanHover] = useState(true);

    useEffect(() => {
        setCanHover(!window.matchMedia("(hover: none)").matches);
    }, []);

    const byHover = trigger === "hover" && canHover;
    useEffect(() => {
        if (!byHover) return;
        const host = ref.current?.closest<HTMLElement>("[data-sprig-host]");
        if (!host) return;
        const on = () => setHovered(true);
        const off = () => setHovered(false);
        host.addEventListener("pointerenter", on);
        host.addEventListener("pointerleave", off);
        host.addEventListener("focusin", on);
        host.addEventListener("focusout", off);
        return () => {
            host.removeEventListener("pointerenter", on);
            host.removeEventListener("pointerleave", off);
            host.removeEventListener("focusin", on);
            host.removeEventListener("focusout", off);
        };
    }, [byHover, ref]);

    const inView = useInView(ref, { once: true, margin: "-10% 0px" });
    return { grow: byHover ? hovered : inView, byHover };
}
