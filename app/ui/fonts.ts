import { Roboto, Italiana, Poppins, Lato } from "next/font/google";

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
    weight: ['400']
})