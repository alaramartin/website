import { Italiana, Lato, PT_Serif, Space_Mono } from "next/font/google";

// "optional": the hero name paints directly in Italiana when the (preloaded, tiny) font wins
// the ~100ms block window — which it almost always does — so there's NO fallback->web-font
// swap jump on the LCP text. On a slow link it falls back with no later swap (never a shift,
// never the old multi-second blank). subset+weight kept minimal so the file stays small.
export const italiana = Italiana({
    subsets: ["latin"], weight: ['400'], display: "optional"
});

// Below-the-fold / other-page fonts: don't preload them on every route — that just steals
// bandwidth from the critical above-the-fold fonts (italiana hero, serif nav).
export const lato = Lato({
    subsets: ["latin"],
    weight: ['400', '700'], preload: false
});

export const mono = Space_Mono({weight: "400", display: "swap", preload: false});

export const serif = PT_Serif({weight: ["400", "700"], display: "swap"});
