"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { BookInfo } from "@/app/data/info";
import { mono, serif } from "@/app/ui/fonts";
import Stars from "./Stars";

const COVER_W = 200;
const COVER_H = 270;

// rounded-rect outline, drawn ~4px outside the cover, starting from the top-middle so it
// looks like a pen stroke that begins above the cover and wraps all the way around.
// coords live in a viewBox padded 8px on every side (cover sits at 8..208 / 8..278).
const OUTLINE_PATH =
    "M 108 4 H 202 A 10 10 0 0 1 212 14 V 272 A 10 10 0 0 1 202 282 " +
    "H 14 A 10 10 0 0 1 4 272 V 14 A 10 10 0 0 1 14 4 Z";

// short, slightly curved arrow + arrowhead, pointing from the cover out toward the box.
const ARROW = {
    right: "M 4 50 C 22 44, 42 40, 64 14 M 64 14 L 55 16 M 64 14 L 62 25",
    left: "M 68 50 C 50 44, 30 40, 8 14 M 8 14 L 17 16 M 8 14 L 10 25",
};

const drawTransition = { duration: 0.55, ease: "easeInOut" as const };

export default function BookCover({
    book,
    slug,
    tilt,
    side,
}: {
    book: BookInfo;
    slug: string;
    tilt: number;
    side: "left" | "right";
}) {
    const [hovered, setHovered] = useState(false);

    return (
        <Link
            href={`/reviews/${slug}`}
            aria-label={`Read my review of ${book.title}`}
            className="group block"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div
                className="relative flex flex-col items-center gap-2"
                style={{
                    transform: `rotate(${tilt}deg)`,
                    zIndex: hovered ? 30 : 1,
                }}
            >
                {/* cover — plain <img> because these are external Amazon URLs and
                    next.config has no images.remotePatterns. To use next/image later,
                    add a remotePatterns entry or move covers into public/books/. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={book.cover}
                    alt={`Cover of ${book.title}`}
                    width={COVER_W}
                    height={COVER_H}
                    draggable={false}
                    className="rounded-sm object-cover shadow-md select-none"
                    style={{ width: COVER_W, height: COVER_H }}
                />

                <Stars stars={book.stars} />

                {/* pen outline drawn around the cover on hover */}
                <AnimatePresence>
                    {hovered && (
                        <motion.svg
                            key="outline"
                            className="pointer-events-none absolute text-accent"
                            style={{ top: -8, left: -8 }}
                            width={COVER_W + 16}
                            height={COVER_H + 16}
                            viewBox={`0 0 ${COVER_W + 16} ${COVER_H + 16}`}
                            fill="none"
                        >
                            <motion.path
                                d={OUTLINE_PATH}
                                stroke="currentColor"
                                strokeWidth={2.5}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                exit={{ pathLength: 0 }}
                                transition={drawTransition}
                            />
                        </motion.svg>
                    )}
                </AnimatePresence>

                {/* arrow + info box, unfurling toward the open side of the page */}
                <AnimatePresence>
                    {hovered && (
                        <div
                            key="callout"
                            className="absolute top-1 flex items-start"
                            style={
                                side === "right"
                                    ? { left: "calc(100% + 2px)" }
                                    : {
                                          right: "calc(100% + 2px)",
                                          flexDirection: "row-reverse",
                                      }
                            }
                        >
                            <motion.svg
                                className="pointer-events-none shrink-0 text-accent"
                                width={72}
                                height={60}
                                viewBox="0 0 72 60"
                                fill="none"
                            >
                                <motion.path
                                    d={ARROW[side]}
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeDasharray="5 4"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    exit={{ pathLength: 0 }}
                                    transition={drawTransition}
                                />
                            </motion.svg>

                            <motion.div
                                className="w-44 rounded-md border border-accent bg-[var(--background)] px-3 py-2 shadow-sm"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2, delay: 0.5 }}
                            >
                                <p
                                    className={`${mono.className} text-sm font-bold leading-tight text-accent`}
                                >
                                    {book.title}
                                </p>
                                <p
                                    className={`${serif.className} mt-0.5 text-xs text-bodytext`}
                                >
                                    {book.author}
                                </p>
                                <p
                                    className={`${serif.className} mt-2 text-xs italic text-accent`}
                                >
                                    click to see my in-depth review
                                </p>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </Link>
    );
}
