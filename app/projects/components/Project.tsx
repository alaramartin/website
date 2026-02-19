"use client";
import { serif, mono } from "@/app/ui/fonts";
import {
    GithubLogoIcon,
    ArrowSquareOutIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import Notes from "./Notes";
import SkillTags from "./SkillTags";
import { useState, useEffect } from "react";

interface ProjectProps {
    name: string;
    githubLink: string;
    href?: string;
    description: string;
    notes?: string[];
    tags?: string[];
}

const DEFAULT_DATE = "August 23, 2025";

function formatDateString(dateStr: string): string {
    if (dateStr == "DEFAULT") {
        return DEFAULT_DATE;
    } else {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
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
}: ProjectProps) {
    const [viewExtra, setViewExtra] = useState(false);
    const [date, setDate] = useState<string>(DEFAULT_DATE);

    useEffect(() => {
        const controller = new AbortController();

        async function fetchDate() {
            try {
                const repo = githubLink.split("/").pop();
                if (!repo) return;

                const res = await fetch(`/api/github/dates/${repo}`, {
                    signal: controller.signal,
                });

                if (!res.ok || controller.signal.aborted) return;

                const data = await res.json();
                if (data.date && !controller.signal.aborted) {
                    setDate(formatDateString(data.date));
                }
            } catch {
                if (controller.signal.aborted) return;
            }
        }

        fetchDate();
        return () => controller.abort();
    }, [githubLink]);

    return (
        <div
            className={`${serif.className} text-bodytext antialiased border border-lighthighlight/50 hover:border-lighthighlight rounded-2xl p-4 shadow-lg/5 hover:shadow-lg/15 shadow-lighthighlight relative h-full w-full place-content-center transition-all duration-150`}
        >
            <div>
                <p
                    className={`${mono.className} text-bodytext/50 pt-0.5 pb-1 text-sm`}
                >
                    {date}
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

            <div className="text-center mt-1">
                {!viewExtra && (
                    <div
                        className="inline-flex justify-center text-center px-3.5 py-1 rounded-lg cursor-pointer hover:bg-lighthighlight/15"
                        onClick={() => setViewExtra(true)}
                        title="see more"
                    >
                        &middot; &middot; &middot;
                    </div>
                )}

                {notes && viewExtra && <Notes notes={notes} />}

                {tags && viewExtra && <SkillTags tags={tags} />}

                {viewExtra && (
                    <div
                        className="inline-flex mt-1 justify-center text-center px-3.5 py-1 rounded-lg cursor-pointer hover:bg-lighthighlight/15"
                        onClick={() => setViewExtra(false)}
                        title="see less"
                    >
                        &middot; &middot; &middot;
                    </div>
                )}
            </div>
        </div>
    );
}
