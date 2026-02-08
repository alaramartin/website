import { Roboto, Italiana, Poppins, Lato, EB_Garamond, PT_Mono, PT_Serif } from "next/font/google";

export const italiana = Italiana({
    subsets: ["latin"], weight: ['400']
});

export const poppins = Poppins({
    subsets: ["latin"], weight: ['200']
});

export const roboto = Roboto({
    subsets: ["latin"],
});

export const lato = Lato({
    subsets: ["latin"],
    weight: ['400', '700']
});

export const garamond = EB_Garamond({
    subsets: ["latin"],
    weight: ['400', '500', '700']
});

export const mono = PT_Mono({weight: "400"});

export const serif = PT_Serif({weight: "400"});