"use client";
import { useId, useRef, type RefObject } from "react";
import { VIEW_H, VIEW_W, type WhaleEls } from "./whaleInk";

export type WhaleSvgRefs = {
    svg: RefObject<SVGSVGElement | null>;
    body: RefObject<SVGPathElement | null>;
    fin: RefObject<SVGGElement | null>;
    fluke: RefObject<SVGGElement | null>;
};

export function useWhaleSvgRefs(): WhaleSvgRefs {
    return {
        svg: useRef<SVGSVGElement>(null),
        body: useRef<SVGPathElement>(null),
        fin: useRef<SVGGElement>(null),
        fluke: useRef<SVGGElement>(null),
    };
}

export function resolveWhaleEls(refs: WhaleSvgRefs): WhaleEls | null {
    const { svg, body, fin, fluke } = refs;
    if (!svg.current || !body.current || !fin.current || !fluke.current) return null;
    return { svg: svg.current, body: body.current, fin: fin.current, fluke: fluke.current };
}

/** The whale's SVG layers. Shapes are filled in by applyWhaleArt() and posed by a WhaleRig. */
export default function WhaleSvg({ refs, className }: { refs: WhaleSvgRefs; className?: string }) {
    const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
    return (
        <svg ref={refs.svg} viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} overflow="visible" className={className}>
            <defs>
                <path id={`${id}-body`} ref={refs.body} d="" />
                <clipPath id={`${id}-clip`}>
                    <use href={`#${id}-body`} />
                </clipPath>
            </defs>
            {/* Near pectoral fin, tucked under the body. */}
            <g ref={refs.fin}>
                <path data-art="fin" fill="var(--whale-paper)" />
                {/* Pen outline and tip hatching, as filled shapes so they scale with the whale. */}
                <path data-art="finInk" fill="var(--whale-ink)" />
            </g>
            <use href={`#${id}-body`} fill="var(--whale-ink)" />
            {/* Throat pleats, trimmed to the live body outline. */}
            <g clipPath={`url(#${id}-clip)`}>
                <path data-art="throatBase" fill="var(--whale-pleat)" />
                <path data-art="strands" fill="var(--whale-paper)" />
                <path data-art="prefin" fill="var(--whale-paper)" />
            </g>
            <path data-art="farFin" fill="var(--whale-ink)" />
            <g ref={refs.fluke}>
                <path data-art="fluke" fill="var(--whale-ink)" />
            </g>
        </svg>
    );
}
