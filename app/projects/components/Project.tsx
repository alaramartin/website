"use client";
import React from "react";
import { lato } from "@/app/ui/fonts";
import {
    GithubLogoIcon,
    ArrowSquareOutIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { skills } from "@/app/data/info.ts";
import Notes from "./Notes";

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
            className={`${lato.className} antialiased border border-lightred bg-pinkbeige rounded-2xl p-4 shadow-xl/20 shadow-lightred relative h-full place-content-center`}
        >
            <p className="text-xl font-extrabold py-2">{name}</p>
            <div className="absolute top-3 right-3 space-x-2">
                <Link
                    href={githubLink}
                    target="_blank"
                    aria-label="View the source code on GitHub!"
                    className="inline-block border border-lightred rounded-lg p-2 hover:bg-lightred/20 transition-colors cursor-pointer"
                >
                    <GithubLogoIcon size={20} />
                </Link>
                {href && (
                    <Link
                        href={href}
                        target="_blank"
                        aria-label="Check it out!"
                        className="inline-block border border-lightred rounded-lg p-2 hover:bg-lightred/20 transition-colors cursor-pointer"
                    >
                        <ArrowSquareOutIcon size={20} />
                    </Link>
                )}
            </div>
            <p>{description}</p>

            {notes && <Notes notes={notes} />}

            {tags && (
                <div className="mt-2 space-y-2">
                    {Array.from(
                        { length: Math.ceil(tags.length / 3) },
                        (_, rowIndex) => (
                            <div key={rowIndex} className="flex justify-center">
                                {tags
                                    .slice(rowIndex * 3, (rowIndex + 1) * 3)
                                    .map((tag) => {
                                        // only show maximum of 3 tags per row // todo: fix this to just flex anywhere for mobile
                                        const skillData = skills[tag];
                                        if (!skillData) return null;
                                        const IconComponent = skillData.icon;

                                        return (
                                            <div
                                                key={tag}
                                                className="inline-flex items-center border border-lightred rounded-lg mx-2 my-1.5 p-2 md:transition-all md:duration-300 group md:overflow-hidden cursor-default select-none"
                                            >
                                                <IconComponent
                                                    size={16}
                                                    className="mx-1"
                                                />
                                                <p className="md:max-w-0 md:group-hover:max-w-xs md:ml-0 md:group-hover:ml-2 md:transition-all md:duration-500 md:overflow-hidden md:whitespace-nowrap">
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
