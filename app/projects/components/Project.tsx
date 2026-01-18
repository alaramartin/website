"use client";
import { lato } from "@/app/ui/fonts";
import {
    GithubLogoIcon,
    ArrowSquareOutIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import Notes from "./Notes";
import SkillTags from "./SkillTags";

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
    return (
        <div
            className={`${lato.className} antialiased border border-lightred bg-pinkbeige rounded-2xl p-4 shadow-lg/15 shadow-lightred relative h-full place-content-center`}
        >
            <p className="text-xl font-extrabold py-2">{name}</p>
            <div className="absolute top-3 right-3 space-x-2">
                <Link
                    href={githubLink}
                    target="_blank"
                    aria-label="View the source code on GitHub!"
                    className="inline-block border border-lightred rounded-lg p-2 hover:bg-lightred/20 transition-colors cursor-pointer"
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
                        className="inline-block border border-lightred rounded-lg p-2 hover:bg-lightred/20 transition-colors cursor-pointer"
                    >
                        <div className="w-4 h-4">
                            <ArrowSquareOutIcon />
                        </div>
                    </Link>
                )}
            </div>
            <p>{description}</p>

            {notes && <Notes notes={notes} />}

            {tags && <SkillTags tags={tags} />}
        </div>
    );
};

export default Project;
