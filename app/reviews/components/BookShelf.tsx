"use client";

import { BookInfo, bookSlug } from "@/app/data/info";
import BookCover from "./BookCover";

// deterministic pseudo-random in [0, 1) from a numeric seed. we can't use Math.random()
// for tilt/position because the server and client would disagree and React would throw a
// hydration mismatch — same seed in, same value out on both sides.
const seeded = (seed: number): number => {
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
};

// vertical distance (in vh) between consecutive covers. ~40vh keeps ~2-3 covers in any
// 100vh window while leaving comfortable gaps so covers never overlap.
const STRIDE_VH = 40;
const TOP_PAD_VH = 6;

export default function BookShelf({ books }: { books: BookInfo[] }) {
    const containerHeight = `${TOP_PAD_VH + (books.length - 1) * STRIDE_VH + 48}vh`;

    return (
        <div
            className="relative w-full mt-8"
            style={{ height: containerHeight }}
        >
            {books.map((book, i) => {
                const r1 = seeded(i + 1);
                const r2 = seeded(i + 101);
                const r3 = seeded(i + 211);

                // slight tilt, random-looking, within [-7deg, +7deg]
                const tilt = r1 * 14 - 7;

                // alternate left/right columns for an even spread, with a little jitter.
                const isLeft = i % 2 === 0;
                const left = isLeft ? 14 + r2 * 9 : 55 + r2 * 9; // percent
                // the arrow + info box unfurl toward the open side of the page.
                const side: "left" | "right" = isLeft ? "right" : "left";

                // even vertical stride with per-index jitter so it reads as scattered.
                const top = TOP_PAD_VH + i * STRIDE_VH + (r3 * 8 - 4);

                const slug = bookSlug(book.title);

                return (
                    <div
                        key={slug}
                        className="absolute"
                        style={{ top: `${top}vh`, left: `${left}%` }}
                    >
                        <BookCover
                            book={book}
                            slug={slug}
                            tilt={tilt}
                            side={side}
                        />
                    </div>
                );
            })}
        </div>
    );
}
