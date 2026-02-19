import { Roboto, Italiana, Poppins, Lato, EB_Garamond, PT_Mono, Inter, PT_Serif, IBM_Plex_Serif, Source_Serif_4, Literata, Space_Mono } from "next/font/google";

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

// export const mono = PT_Mono({weight: "400"});


export const mono = Space_Mono({weight: "400", display: "swap"});

// export const garamond = EB_Garamond({
//     subsets: ["latin"],
//     weight: ['400', '500', '700']
// });

// export const pt_serif = PT_Serif({weight: "400"});

// export const ibm_serif = IBM_Plex_Serif({weight: "400"});

// export const source_serif = Source_Serif_4({weight: "400"});

// export const lit = Literata({weight: "300"});

export const serif = PT_Serif({weight: ["400", "700"], display: "swap"});