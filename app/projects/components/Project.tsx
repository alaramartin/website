"use client";
import { serif, mono } from "@/app/ui/fonts";
import {
    GithubLogoIcon,
    ArrowSquareOutIcon,
    CaretDownIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import Notes from "./Notes";
import SkillTags from "./SkillTags";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

interface ProjectProps {
    name: string;
    githubLink: string;
    href?: string;
    description: string;
    notes?: string[];
    tags?: string[];
    date?: string;
    hackathon?: boolean;
    // which side of the desktop timeline the card sits on; left cards are
    // right-aligned so both columns hug the curve
    side?: "left" | "right";
}

// small marker after a hackathon project's date, here and in TimelineNode
export function HackathonMark() {
    return <span className="text-accent/80"> · hackathon</span>;
}

const DEFAULT_DATE = "August 2025";

export function formatDateString(dateStr: string): string {
    if (dateStr == "DEFAULT") {
        return DEFAULT_DATE;
    } else {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            timeZone: "UTC",
            year: "numeric",
            month: "long",
        });
    }
}

export default function Project({
    name,
    githubLink,
    href,
    description,
    notes,
    tags,
    date = "DEFAULT",
    hackathon,
    side = "right",
}: ProjectProps) {
    const [viewExtra, setViewExtra] = useState(false);
    const hasExtra = (notes && notes.length > 0) || (tags && tags.length > 0);
    const isLeft = side === "left";

    return (
        <div
            className={`${serif.className} text-bodytext antialiased rounded-2xl p-4 relative w-fit max-w-full hover:bg-lighthighlight/10 transition-colors duration-150 ${
                isLeft ? "md:text-right" : ""
            }`}
        >
            <div>
                {/* on desktop the date sits across the timeline from the card
                    (see TimelineNode); mobile has no room there, so keep it here */}
                <p
                    className={`${mono.className} md:hidden text-bodytext/50 pt-0.5 pb-1 text-sm`}
                >
                    {formatDateString(date)}
                    {hackathon && <HackathonMark />}
                </p>
                <div
                    className={`flex items-center gap-2 pb-2 ${
                        isLeft ? "md:flex-row-reverse" : ""
                    }`}
                >
                    <p className="text-xl font-extrabold">{name}</p>
                    <div className="flex items-center gap-0.5">
                        <Link
                            href={githubLink}
                            target="_blank"
                            aria-label="View the source code on GitHub!"
                            className="inline-flex p-1 text-bodytext/50 hover:text-accent transition-colors cursor-pointer"
                        >
                            <div className="w-4 h-4">
                                <GithubLogoIcon />
                            </div>
                        </Link>
                        {href && (
                            <Link
                                href={href}
                                target="_blank"
                                aria-label="Check it out!"
                                className="inline-flex p-1 text-bodytext/50 hover:text-accent transition-colors cursor-pointer"
                            >
                                <div className="w-4 h-4">
                                    <ArrowSquareOutIcon />
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
                <p>{description}</p>
            </div>

            {hasExtra && (
                <div className="mt-1">
                    <AnimatePresence initial={false}>
                        {viewExtra && (
                            <motion.div
                                key="extra"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{
                                    duration: 0.3,
                                    ease: "easeInOut",
                                }}
                                style={{ overflow: "hidden" }}
                            >
                                {notes && <Notes notes={notes} side={side} />}
                                {tags && <SkillTags tags={tags} side={side} />}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        type="button"
                        onClick={() => setViewExtra((v) => !v)}
                        aria-expanded={viewExtra}
                        className={`${mono.className} mt-1 inline-flex items-center gap-1 text-sm text-bodytext/50 hover:text-accent py-1 cursor-pointer transition-colors`}
                    >
                        {viewExtra ? "less" : "more"}
                        <motion.span
                            className="inline-flex w-4 h-4"
                            animate={{ rotate: viewExtra ? 180 : 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                        >
                            <CaretDownIcon />
                        </motion.span>
                    </button>
                </div>
            )}
        </div>
    );
}
