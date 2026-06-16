"use client";
import { useEffect } from "react";

type ScrollProps = {
  holdVH?: number; // amount of VH that it stays at the original color
  rangeVH?: number; // the range of VH that it actually makes the transition of color
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

export default function ScrollAnimation({
  holdVH = 2.75,
  rangeVH = 0.5,
}: ScrollProps) {
  useEffect(() => {
    const root = document.documentElement;
    const isDark = () => root.classList.contains("dark");

    // Measure one CSS viewport-height (1 * 100vh) from the hero, which is sized in
    // CSS vh (`h-[350vh]` + data-scroll-hero="350"). On mobile, CSS vh diverges from
    // window.innerHeight (URL bar), so using the hero keeps the bg transition aligned
    // with where About appears on every device. Falls back to innerHeight off-home.
    const viewportPx = () => {
      const el = document.querySelector(
        "[data-scroll-hero]",
      ) as HTMLElement | null;
      const vh = el ? parseFloat(el.dataset.scrollHero || "") : NaN;
      return el && vh > 0 ? el.offsetHeight / (vh / 100) : window.innerHeight;
    };

    let ticking = false;
    let holdScroll = Math.max(0, viewportPx() * holdVH);
    let fadeScroll = Math.max(1, viewportPx() * rangeVH);

    const getProgress = () => {
      const y = window.scrollY;
      if (y <= holdScroll) return 0;
      return Math.max(0, Math.min(1, (y - holdScroll) / fadeScroll));
    };

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

      root.style.setProperty("--scroll-bg", `rgb(${bgR}, ${bgG}, ${bgB})`);
      root.style.setProperty(
        "--scroll-text",
        `rgb(${textR}, ${textG}, ${textB})`,
      );
      root.style.setProperty("--scroll-nav", `rgb(${navR}, ${navG}, ${navB})`);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateColors(getProgress());
        ticking = false;
      });
    };

    const onResize = () => {
      holdScroll = Math.max(0, viewportPx() * holdVH);
      fadeScroll = Math.max(1, viewportPx() * rangeVH);
      updateColors(getProgress());
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    const observer = new MutationObserver(() => {
      updateColors(getProgress());
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
