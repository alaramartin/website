"use client";
import Link from "next/link";
import { serif } from "@/app/ui/fonts";
import { GithubLogoIcon } from "@phosphor-icons/react/dist/ssr";
import { skills } from "@/app/data/info.ts";

interface MiniProjectProps {
    name: string;
    githubLink: string;
    href?: string;
    description: string;
    tags?: string[];
}

const getSkillById = new Map(
    skills
        .flatMap((section) => section.items)
        .map((skill) => [skill.id, skill]),
);

const MiniProject = ({
    name,
    githubLink,
    href,
    description,
    tags,
}: MiniProjectProps) => {
    return (
        <div className="group text-bodytext">
            <div className={`flex items-start w-full gap-4 py-3 text-left`}>
                <div className="min-w-0">
                    {/* The name is the link, so the row doesn't need its own "open" icon. */}
                    <Link
                        href={href || githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link font-semibold leading-snug"
                    >
                        {name}
                    </Link>
                    <p className="opacity-70 leading-snug">{description}</p>
                </div>

                {/* Quiet until the row is hovered; always visible on touch (no hover). */}
                <Link
                    href={githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View the source code for ${name} on GitHub`}
                    className="ml-auto shrink-0 p-0.5 mt-1 opacity-60 md:opacity-0 md:group-hover:opacity-60 hover:opacity-100! focus-visible:opacity-100 transition-opacity duration-150"
                >
                    <GithubLogoIcon size={18} />
                </Link>
            </div>
        </div>
    );
};

export default MiniProject;
