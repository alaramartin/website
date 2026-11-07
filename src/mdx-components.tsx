import type { MDXComponents } from "mdx/types";

// Required by @next/mdx. Writeup styling lives in .prose-writeup (globals.css).
const components: MDXComponents = {};

export function useMDXComponents(): MDXComponents {
    return components;
}
