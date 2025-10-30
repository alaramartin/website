"use client";
import { useEffect } from "react";
import { useTheme } from "next-themes";

type ScrollProps = {
    rangeVH?: number; // the threshold for scrolling to activate the animation
};

// "linear interprolation" or something. for smooth scrolling effect between the two colors
function lerp(a: number, b: number, t: number) {
    return Math.round(a + (b - a) * t);
}

export default function ScrollAnimation({ rangeVH = 0.75 }: ScrollProps) {
    const { theme } = useTheme();

    useEffect(() => {
        const START_BG_COLOR =
            theme === "light"
                ? { r: 163, g: 0, b: 44 }
                : { r: 255, g: 248, b: 246 };
        const END_BG_COLOR =
            theme === "light"
                ? { r: 255, g: 248, b: 246 }
                : { r: 163, g: 0, b: 44 };

        // to stop multiple animation useeffects to run at the same time
        let ticking = false;
        let maxScroll = Math.max(1, window.innerHeight * rangeVH);

        const updateRGBVars = (tValue: number) => {
            const c = Math.max(0, Math.min(1, tValue));

            // lerping stuff to find new rgb values
            //      background
            const bgR = lerp(START_BG_COLOR.r, END_BG_COLOR.r, c);
            const bgG = lerp(START_BG_COLOR.g, END_BG_COLOR.g, c);
            const bgB = lerp(START_BG_COLOR.b, END_BG_COLOR.b, c);
            //      foreground
            const fgR = lerp(END_BG_COLOR.r, START_BG_COLOR.r, c);
            const fgG = lerp(END_BG_COLOR.g, START_BG_COLOR.g, c);
            const fgB = lerp(END_BG_COLOR.b, START_BG_COLOR.b, c);

            const root = document.documentElement;
            root.style.setProperty("--bg-r", String(bgR));
            root.style.setProperty("--bg-g", String(bgG));
            root.style.setProperty("--bg-b", String(bgB));
            root.style.setProperty("--fg-r", String(fgR));
            root.style.setProperty("--fg-g", String(fgG));
            root.style.setProperty("--fg-b", String(fgB));
        };

        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(() => {
                const t = window.scrollY / maxScroll;
                updateRGBVars(t);
                ticking = false;
            });
        };

        const onResize = () => {
            maxScroll = Math.max(1, window.innerHeight * rangeVH);
            const t = window.scrollY / maxScroll;
            updateRGBVars(t);
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onResize);

        onResize();

        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onResize);
        };
    }, [rangeVH, theme]);

    return null;
}
