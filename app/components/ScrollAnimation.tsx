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

// get the rgb or hex value of a color
function parseColorString(s: string) {
    const str = (s || "").trim();
    // hex #rrggbb (with or without leading #)
    const hexMatch = str.match(/^#?([0-9a-fA-F]{6})$/);
    if (hexMatch) {
        const hex = hexMatch[1];
        return {
            r: parseInt(hex.slice(0, 2), 16),
            g: parseInt(hex.slice(2, 4), 16),
            b: parseInt(hex.slice(4, 6), 16),
        };
    }
    // rgb(...) or rgba(...)
    const rgbMatch = str.match(
        /rgba?\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})/i
    );
    if (rgbMatch) {
        return {
            r: Number(rgbMatch[1]),
            g: Number(rgbMatch[2]),
            b: Number(rgbMatch[3]),
        };
    }
    // fallback
    return { r: 255, g: 255, b: 255 };
}

export default function ScrollAnimation({ rangeVH = 0.75 }: ScrollProps) {
    useEffect(() => {
        const root = document.documentElement;

        const readThemeColors = () => {
            const cs = getComputedStyle(root);
            const darkToken =
                cs.getPropertyValue("--color-darkburgundy") || "#a3002c";
            const pinkToken =
                cs.getPropertyValue("--color-pinkbeige") || "#fff8f6";
            const start = parseColorString(darkToken);
            const end = parseColorString(pinkToken);
            return { start, end };
        };

        // to stop multiple animation useeffects to run at the same time
        let ticking = false;
        let maxScroll = Math.max(1, window.innerHeight * rangeVH);

        const updateRGBVars = (tValue: number) => {
            const c = Math.max(0, Math.min(1, tValue));
            const { start: START_BG_COLOR, end: END_BG_COLOR } =
                readThemeColors();

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

        // fixes the bug where it doesn't toggle the theme on homepage
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (
                    mutation.type === "attributes" &&
                    (mutation as MutationRecord).attributeName === "class"
                ) {
                    const t = window.scrollY / maxScroll;
                    updateRGBVars(t);
                    break;
                }
            }
        });
        observer.observe(root, {
            attributes: true,
            attributeFilter: ["class"],
        });

        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onResize);
        };
    }, [rangeVH]);

    return null;
}
