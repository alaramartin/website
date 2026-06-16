"use client";
import { useEffect } from "react";
import { setScrollColors } from "@/app/ui/scrollColors";

type ScrollProps = {
  holdVH?: number; // amount of VH that it stays at the original color
  rangeVH?: number; // the range of VH that it actually makes the transition of color
};

export default function ScrollAnimation({
  holdVH = 2.75,
  rangeVH = 0.5,
}: ScrollProps) {
  useEffect(() => {
    const root = document.documentElement;
    const isDark = () => root.classList.contains("dark");

    // The home hero owns its own bg transition (driven by the name morph). When a
    // [data-scroll-hero] element is present, bail so we don't fight that driver — the
    // hero sets --scroll-bg/text/nav itself. This fallback only runs on other pages.
    if (document.querySelector("[data-scroll-hero]")) return;

    let ticking = false;
    const viewportPx = () => window.innerHeight;
    let holdScroll = Math.max(0, viewportPx() * holdVH);
    let fadeScroll = Math.max(1, viewportPx() * rangeVH);

    const getProgress = () => {
      const y = window.scrollY;
      if (y <= holdScroll) return 0;
      return Math.max(0, Math.min(1, (y - holdScroll) / fadeScroll));
    };

    const update = () => setScrollColors(getProgress(), isDark());

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    };

    const onResize = () => {
      holdScroll = Math.max(0, viewportPx() * holdVH);
      fadeScroll = Math.max(1, viewportPx() * rangeVH);
      update();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    const observer = new MutationObserver(update);
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
  }, [holdVH, rangeVH]);

  return null;
}
