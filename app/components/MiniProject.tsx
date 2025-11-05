"use client";
import React from "react";
import { lato } from "@/app/ui/fonts";
import {
    GithubLogoIcon,
    ArrowSquareOutIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { skills } from "@/app/data/info.ts";

interface MiniProjectProps {
    name: string;
    githubLink: string;
    href?: string;
    description: string;
    tags?: string[];
}

const MiniProject = ({
    name,
    githubLink,
    href,
    description,
    tags,
}: MiniProjectProps) => {
    const handleSkillClick = (e: React.MouseEvent, skillKey: string) => {
        e.preventDefault();
        const element = document.getElementById(skillKey);
        if (element) {
            element.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });

            element.classList.add("shadow-pulse");

            setTimeout(() => {
                element.classList.remove("shadow-pulse");
            }, 1500);
        }
    };

    return (
        <div
            className={`${lato.className} antialiased flex flex-row items-center border border-lightred bg-pinkbeige rounded-2xl p-4 m-8 shadow-xl/10 shadow-lightred relative h-full place-content-center`}
        >
            <div className="flex flex-col items-center text-center mx-3">
                <p className="text-lg font-bold py-2">{name}</p>
                <div className="space-x-2">
                    <Link
                        href={githubLink}
                        target="_blank"
                        aria-label="View the source code on GitHub!"
                        className="inline-block border border-lightred rounded-lg p-2 hover:bg-lightred/20 transition-colors cursor-pointer"
                    >
                        <GithubLogoIcon size={15} />
                    </Link>
                    {href && (
                        <Link
                            href={href}
                            target="_blank"
                            aria-label="Check it out!"
                            className="inline-block border border-lightred rounded-lg p-2 hover:bg-lightred/20 transition-colors cursor-pointer"
                        >
                            <ArrowSquareOutIcon size={15} />
                        </Link>
                    )}
                </div>
            </div>
            <hr
                className="border-r border-lightred h-10 mx-3 opacity-80 bg-transparent"
                style={{ margin: "0 12px", borderRightWidth: "1px" }}
            />

            <p>{description}</p>

            {tags && (
                <div className="mt-2 grid grid-cols-4">
                    {tags.map((tag, index) => {
                        // only show first three (most relevant) skill tags on homepage
                        if (index < 3) {
                            const skillData = skills[tag];
                            if (!skillData) return null;
                            const IconComponent = skillData.icon;
                            let colStart: number = 1;
                            if (index === 2) {
                                colStart = 2;
                            }

                            return (
                                <button
                                    key={tag}
                                    onClick={(e) => handleSkillClick(e, tag)}
                                    className={`col-span-2 inline-flex items-center border border-lightred rounded-lg mx-2 my-1.5 p-2 hover:bg-lightred/20 transition-all duration-300 cursor-pointer col-start-${colStart}`}
                                    title={`Skill: ${skillData.skillName}`}
                                >
                                    <IconComponent
                                        size={16}
                                        className="m-0.5"
                                    />
                                </button>
                            );
                        }
                    })}
                </div>
            )}
        </div>
    );
};

export default MiniProject;
