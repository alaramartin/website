import type { Metadata } from "next";
import Corners from "../Corners";
import Nav from "../Nav";
import Carousel from "./Carousel";
import { HACKS, type Hack } from "./hacks";

export const metadata: Metadata = {
    title: "Hacks",
    description:
        "Hackathons Alara Martin has entered: what got built at each and how it placed.",
    alternates: { canonical: "/hacks" },
};

// "2025-10" → "oct 2025"
const formatDate = (date: string) =>
    new Date(`${date.length === 7 ? `${date}-01` : date}T00:00:00Z`)
        .toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
            timeZone: "UTC",
        })
        .toLowerCase();

function Post({ hack }: { hack: Hack }) {
    return (
        <article className="py-10">
            <div className="font-mono text-sm text-[var(--muted)]">
                <div className="flex items-baseline justify-between gap-4">
                    <p>
                        <span className="text-[var(--foreground)] opacity-80">
                            {hack.event}
                        </span>
                        {hack.result && (
                            <>
                                <span className="opacity-50"> · </span>
                                <span className="text-[rgb(var(--accent-rgb))]">
                                    {hack.result}
                                </span>
                            </>
                        )}
                    </p>
                    <time dateTime={hack.date} className="shrink-0 opacity-70">
                        {formatDate(hack.date)}
                    </time>
                </div>
                {hack.links.length > 0 && (
                    <p className="mt-1 flex flex-wrap gap-x-4 opacity-70">
                        {hack.links.map(({ label, href }) => (
                            <a
                                key={href}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hack-link"
                            >
                                {label} ↗
                            </a>
                        ))}
                    </p>
                )}
            </div>

            <p className="mt-4 mb-5">{hack.caption}</p>

            <Carousel media={hack.media} aspect={hack.aspect} />
        </article>
    );
}

export default function Hacks() {
    return (
        <main className="relative h-dvh overflow-hidden">
            <h1 className="sr-only">Hacks</h1>
            <div className="feed-fade no-scrollbar absolute inset-0 overflow-y-auto">
                <div className="mx-auto max-w-xl px-8 sm:px-4 pt-14 pb-20">
                    {HACKS.map((hack) => (
                        <Post key={hack.date + hack.event} hack={hack} />
                    ))}
                </div>
            </div>
            <Nav />
            <Corners />
        </main>
    );
}
