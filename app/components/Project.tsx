"use client";
import React from "react";
import { lato } from "@/app/ui/fonts";
import {
    GithubLogoIcon,
    ArrowSquareOutIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { skills } from "../page";

// todo: hover effect on the skill tag where when you hover, it expands to show the name of the skill
// todo: clicked-on skill flashes when scrolled to

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
    const handleSkillClick = (e: React.MouseEvent, skillKey: string) => {
        e.preventDefault();
        const element = document.getElementById(skillKey);
        if (element) {
            element.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    };

    return (
        <div
            className={`${lato.className} antialiased border-2 border-lightred bg-pinkbeige rounded-2xl mx-15 my-6 p-4 shadow-xl/20 shadow-lightred relative place-content-center`}
        >
            <p className="text-xl font-extrabold py-2">{name}</p>
            <Link
                href={githubLink}
                target="_blank"
                className="inline-block absolute top-2 right-2 hover:bg-[#c5b6ad] rounded-lg p-2 transition-colors"
            >
                <GithubLogoIcon size={20} />
            </Link>
            <p>{description}</p>
            {href && (
                <Link
                    href={href}
                    target="_blank"
                    className="inline-flex items-center hover:bg-[#c5b6ad] rounded-lg p-1.5 gap-1 underline transition-colors"
                >
                    Try it out! <ArrowSquareOutIcon />
                </Link>
            )}
            {tags && (
                <div className="mt-2">
                    {tags.map((tag) => {
                        const skillData = skills[tag];
                        if (!skillData) return null;
                        const IconComponent = skillData.icon;

                        return (
                            <button
                                key={tag}
                                onClick={(e) => handleSkillClick(e, tag)}
                                className="inline-block border-1 border-lightred rounded-lg mx-2 my-2 p-2 hover:bg-lightred/20 transition-colors cursor-pointer"
                                title={`Skill: ${skillData.skillName}`}
                            >
                                <IconComponent size={16} />
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Project;
