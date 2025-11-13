import { Roboto, Italiana, Poppins, Lato, EB_Garamond } from "next/font/google";

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