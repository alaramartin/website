// Shared color logic for the scroll-driven background transition (red -> light/dark).
// Used by both the home hero (NameCircle, driven by the morph progress) and the global
// ScrollAnimation fallback, so the color pairs live in exactly one place.

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

// start = initial red landing, end = settled page background.
const colorPairs = (isDark: boolean) =>
    isDark
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

function lerpVar(pair: { start: string; end: string }, t: number) {
    const a = hexToRgb(pair.start);
    const b = hexToRgb(pair.end);
    return `rgb(${lerp(a.r, b.r, t)}, ${lerp(a.g, b.g, t)}, ${lerp(
        a.b,
        b.b,
        t,
    )})`;
}

// Sets --scroll-bg / --scroll-text / --scroll-nav on :root for transition progress t (0..1).
export function setScrollColors(progress: number, isDark: boolean) {
    const t = Math.max(0, Math.min(1, progress));
    const colors = colorPairs(isDark);
    const root = document.documentElement;
    root.style.setProperty("--scroll-bg", lerpVar(colors.bg, t));
    root.style.setProperty("--scroll-text", lerpVar(colors.text, t));
    root.style.setProperty("--scroll-nav", lerpVar(colors.nav, t));
}
