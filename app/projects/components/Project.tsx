"use client";
import React from "react";
import { lato } from "@/app/ui/fonts";
import {
    GithubLogoIcon,
    ArrowSquareOutIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { skills } from "@/app/data/info.ts";

interface ProjectProps {
    name: string;
    githubLink: string;
    href?: string;
    description: string;
    tags?: string[];
}

const Project = ({
    name,
    githubLink,
    href,
    description,
    tags,
}: ProjectProps) => {
    return (
        <div
            className={`${lato.className} antialiased border-1 border-lightred bg-pinkbeige rounded-2xl p-4 shadow-xl/20 shadow-lightred relative h-full place-content-center`}
        >
            <p className="text-xl font-extrabold py-2">{name}</p>
            <Link
                href={githubLink}
                target="_blank"
                className="inline-block absolute top-3 right-3 border-1 border-lightred rounded-lg p-2 hover:bg-lightred/20 transition-colors cursor-pointer"
            >
                <GithubLogoIcon size={20} />
            </Link>
            <p>{description}</p>
            {href && (
                <Link
                    href={href}
                    target="_blank"
                    className="inline-flex items-center hover:bg-lightred/30 rounded-lg mt-1.5 p-2 gap-1 underline transition-colors"
                >
                    Check it out! <ArrowSquareOutIcon />
                </Link>
            )}
            {githubLink && (
                <Link
                    href={githubLink}
                    target="_blank"
                    className="inline-flex items-center hover:bg-lightred/30 rounded-lg mt-1.5 p-2 gap-1 underline transition-colors"
                >
                    View the Source Code! <GithubLogoIcon />
                </Link>
            )}
            {tags && (
                <div className="mt-2 space-y-2">
                    {Array.from(
                        { length: Math.ceil(tags.length / 3) },
                        (_, rowIndex) => (
                            <div key={rowIndex} className="flex justify-center">
                                {tags
                                    .slice(rowIndex * 3, (rowIndex + 1) * 3)
                                    .map((tag) => {
                                        // only show maximum of 3 tags per row
                                        const skillData = skills[tag];
                                        if (!skillData) return null;
                                        const IconComponent = skillData.icon;

                                        return (
                                            <div
                                                key={tag}
                                                className="inline-flex items-center border border-lightred rounded-lg mx-2 my-1.5 p-2 transition-all duration-300 group overflow-hidden cursor-default select-none"
                                            >
                                                <IconComponent
                                                    size={16}
                                                    className="mx-1"
                                                />
                                                <p className="max-w-0 group-hover:max-w-xs ml-0 group-hover:ml-2 transition-all duration-500 overflow-hidden whitespace-nowrap">
                                                    {skillData.skillName}
                                                </p>
                                            </div>
                                        );
                                    })}
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
};

export default Project;
