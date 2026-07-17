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
}

const DEFAULT_DATE = "August 2025";

function formatDateString(dateStr: string): string {
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
}: ProjectProps) {
    const [viewExtra, setViewExtra] = useState(false);
    const hasExtra = (notes && notes.length > 0) || (tags && tags.length > 0);

    return (
        <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className={`${serif.className} text-bodytext antialiased border border-lighthighlight/50 hover:border-lighthighlight rounded-2xl p-4 shadow-lg/5 hover:shadow-lg/15 shadow-lighthighlight relative h-full w-full place-content-center transition-colors duration-150`}
        >
            <div>
                <p
                    className={`${mono.className} text-bodytext/50 pt-0.5 pb-1 text-sm`}
                >
                    {formatDateString(date)}
                </p>
                <p className="text-xl font-extrabold pb-2">{name}</p>
                <div className="absolute top-4 right-4 space-x-2">
                    <Link
                        href={githubLink}
                        target="_blank"
                        aria-label="View the source code on GitHub!"
                        className="inline-block border border-lighthighlight/50 rounded-lg p-2 hover:bg-lighthighlight/20 transition-colors cursor-pointer"
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
                            className="inline-block border border-lighthighlight/50 rounded-lg p-2 hover:bg-lighthighlight/20 transition-colors cursor-pointer"
                        >
                            <div className="w-4 h-4">
                                <ArrowSquareOutIcon />
                            </div>
                        </Link>
                    )}
                </div>
                <p>{description}</p>
            </div>

            {hasExtra && (
                <div className="text-center mt-1">
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
                                {notes && <Notes notes={notes} />}
                                {tags && <SkillTags tags={tags} />}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        type="button"
                        onClick={() => setViewExtra((v) => !v)}
                        aria-expanded={viewExtra}
                        title={viewExtra ? "see less" : "see more"}
                        className={`${mono.className} mt-1 inline-flex items-center gap-1 text-sm text-bodytext/60 hover:text-accent px-3 py-1 rounded-lg cursor-pointer hover:bg-lighthighlight/15 transition-colors`}
                    >
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
        </motion.div>
    );
}
