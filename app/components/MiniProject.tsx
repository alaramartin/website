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
            className={`${lato.className} antialiased border-1 border-lightred bg-pinkbeige rounded-2xl p-4 shadow-xl/10 shadow-lightred relative h-full place-content-center`}
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
            {tags && (
                <div className="mt-2">
                    {tags.map((tag, index) => {
                        // only show first three (most relevant) skill tags on homepage
                        /* todo: make it have an expand button (down arrow) on the row under that you can click to see all relevant skills
                        when expanded, switch the expand button to a collapse button (up arrow) to re-collapse to 3 elements
                        */
                        if (index < 3) {
                            const skillData = skills[tag];
                            if (!skillData) return null;
                            const IconComponent = skillData.icon;

                            return (
                                <button
                                    key={tag}
                                    onClick={(e) => handleSkillClick(e, tag)}
                                    className="inline-flex items-center border-1 border-lightred rounded-lg mx-2 my-1.5 p-2 hover:bg-lightred/20 transition-all duration-300 cursor-pointer"
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
