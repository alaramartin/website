"use client";
import { useEffect } from "react";

type ScrollProps = {
    rangeVH?: number;
};

function lerp(a: number, b: number, t: number) {
    return Math.round(a + (b - a) * t);
}

function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : { r: 0, g: 0, b: 0 };
}

export default function ScrollAnimation({ rangeVH = 0.75 }: ScrollProps) {
    useEffect(() => {
        const root = document.documentElement;
        const isDark = () => root.classList.contains("dark");

        let ticking = false;
        let maxScroll = Math.max(1, window.innerHeight * rangeVH);

        const updateColors = (progress: number) => {
            const t = Math.max(0, Math.min(1, progress));

            // color transitions here
            const colors = isDark()
                ? {
                      bg: { start: "#a3002c", end: "#1a1819" },
                      text: { start: "#fff8f6", end: "#a3002c" },
                      nav: { start: "#fff8f6", end: "#ed8c91" },
                  }
                : {
                      bg: { start: "#a3002c", end: "#fff8f6" },
                      text: { start: "#fff8f6", end: "#a3002c" },
                      nav: { start: "#fff8f6", end: "#a3002c" },
                  };

            // background transition
            const bgStart = hexToRgb(colors.bg.start);
            const bgEnd = hexToRgb(colors.bg.end);
            const bgR = lerp(bgStart.r, bgEnd.r, t);
            const bgG = lerp(bgStart.g, bgEnd.g, t);
            const bgB = lerp(bgStart.b, bgEnd.b, t);

            // text transition
            const textStart = hexToRgb(colors.text.start);
            const textEnd = hexToRgb(colors.text.end);
            const textR = lerp(textStart.r, textEnd.r, t);
            const textG = lerp(textStart.g, textEnd.g, t);
            const textB = lerp(textStart.b, textEnd.b, t);

            // nav transition
            const navStart = hexToRgb(colors.nav.start);
            const navEnd = hexToRgb(colors.nav.end);
            const navR = lerp(navStart.r, navEnd.r, t);
            const navG = lerp(navStart.g, navEnd.g, t);
            const navB = lerp(navStart.b, navEnd.b, t);

            root.style.setProperty(
                "--scroll-bg",
                `rgb(${bgR}, ${bgG}, ${bgB})`,
            );
            root.style.setProperty(
                "--scroll-text",
                `rgb(${textR}, ${textG}, ${textB})`,
            );
            root.style.setProperty(
                "--scroll-nav",
                `rgb(${navR}, ${navG}, ${navB})`,
            );
        };

        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                updateColors(window.scrollY / maxScroll);
                ticking = false;
            });
        };

        const onResize = () => {
            maxScroll = Math.max(1, window.innerHeight * rangeVH);
            updateColors(window.scrollY / maxScroll);
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onResize);

        const observer = new MutationObserver(() => {
            updateColors(window.scrollY / maxScroll);
        });
        observer.observe(root, {
            attributes: true,
            attributeFilter: ["class"],
        });

        onResize();

        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onResize);
            observer.disconnect();
        };
    }, [rangeVH]);

    return null;
}
