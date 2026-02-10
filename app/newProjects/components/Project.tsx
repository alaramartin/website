"use client";
import { serif } from "@/app/ui/fonts";
import {
    GithubLogoIcon,
    ArrowSquareOutIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import Notes from "./Notes";
import SkillTags from "./SkillTags";
import { useState } from "react";

interface ProjectProps {
    name: string;
    githubLink: string;
    href?: string;
    description: string;
    notes?: string[];
    tags?: string[];
}

const Project = ({
    name,
    githubLink,
    href,
    description,
    notes,
    tags,
}: ProjectProps) => {
    const [viewExtra, setViewExtra] = useState(false);

    return (
        <div
            className={`${serif.className} text-black antialiased border border-lightred/50 hover:border-lightred bg-pinkbeige rounded-2xl p-4 shadow-lg/5 hover:shadow-lg/15 shadow-lightred relative h-full w-full place-content-center transition-all duration-150`}
        >
            <div>
                <p className="text-xl font-extrabold py-2">{name}</p>
                <div className="absolute top-3 right-3 space-x-2">
                    <Link
                        href={githubLink}
                        target="_blank"
                        aria-label="View the source code on GitHub!"
                        className="inline-block border border-lightred/50 rounded-lg p-2 hover:bg-lightred/20 transition-colors cursor-pointer"
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
                            className="inline-block border border-lightred/50 rounded-lg p-2 hover:bg-lightred/20 transition-colors cursor-pointer"
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
                        className="inline-flex justify-center text-center px-3.5 py-1 rounded-lg cursor-pointer hover:bg-lightred/15"
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
                        className="inline-flex mt-1 justify-center text-center px-3.5 py-1 rounded-lg cursor-pointer hover:bg-lightred/15"
                        onClick={() => setViewExtra(false)}
                        title="see less"
                    >
                        &middot; &middot; &middot;
                    </div>
                )}
            </div>
        </div>
    );
};

export default Project;
