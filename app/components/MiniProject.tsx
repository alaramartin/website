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
            className={`${lato.className} antialiased border border-lightred bg-pinkbeige rounded-2xl p-4 shadow-lg/15 shadow-lightred relative h-full w-full place-content-center`}
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
                        <GithubLogoIcon size="auto" />
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
                            <ArrowSquareOutIcon size="auto" />
                        </div>
                    </Link>
                )}
            </div>
            <p className="md:px-12 px-4 mt-1">{description}</p>
            <div className="flex flex-row justify-center mt-4">
                {tags &&
                    tags.slice(0, 3).map((tag) => {
                        const skillData = skills[tag];
                        if (!skillData) return null;
                        const IconComponent = skillData.icon;
                        return (
                            <button
                                key={tag}
                                onClick={(e) => handleSkillClick(e, tag)}
                                className="inline-flex items-center border border-lightred rounded-lg mx-1 p-2 hover:bg-lightred/20 transition-all duration-300 cursor-pointer"
                                title={`Skill: ${skillData.skillName}`}
                            >
                                <IconComponent size={16} className="m-0.5" />
                            </button>
                        );
                    })}
            </div>
        </div>
    );

    // return (
    //     <div
    //         className={`${lato.className} antialiased flex flex-row items-center bg-pinkbeige rounded-2xl md:p-3 md:mx-8 md:my-2 h-26 border border-lightred shadow-lg/10 shadow-lightred`}
    //     >
    //         <div className="flex flex-col items-center text-center justify-center w-1/4">
    //             <p className="text-lg font-semibold py-2">{name}</p>
    //             <div className="space-x-2">
    //                 <Link
    //                     href={githubLink}
    //                     target="_blank"
    //                     aria-label="View the source code on GitHub!"
    //                     className="inline-block border border-lightred rounded-lg p-2 hover:bg-lightred/20 transition-colors cursor-pointer"
    //                 >
    //                     <GithubLogoIcon size={16} />
    //                 </Link>
    //                 {href && (
    //                     <Link
    //                         href={href}
    //                         target="_blank"
    //                         aria-label="Check it out!"
    //                         className="inline-block border border-lightred rounded-lg p-2 hover:bg-lightred/20 transition-colors cursor-pointer"
    //                     >
    //                         <ArrowSquareOutIcon size={16} />
    //                     </Link>
    //                 )}
    //             </div>
    //         </div>

    //         <div className="h-14 border-r border-lightred opacity-80 mx-2" />

    //         <div className="flex-1 flex justify-center text-center">
    //             <p className="text-center">{description}</p>
    //         </div>

    //         <div className="flex justify-end w-1/8">
    //             <div className="flex flex-row">
    //                 {tags &&
    //                     tags.slice(0, 3).map((tag) => {
    //                         const skillData = skills[tag];
    //                         if (!skillData) return null;
    //                         const IconComponent = skillData.icon;
    //                         return (
    //                             <button
    //                                 key={tag}
    //                                 onClick={(e) => handleSkillClick(e, tag)}
    //                                 className="inline-flex items-center border border-lightred rounded-lg mx-1 p-2 hover:bg-lightred/20 transition-all duration-300 cursor-pointer"
    //                                 title={`Skill: ${skillData.skillName}`}
    //                             >
    //                                 <IconComponent
    //                                     size={16}
    //                                     className="m-0.5"
    //                                 />
    //                             </button>
    //                         );
    //                     })}
    //             </div>
    //         </div>
    //     </div>
    // );
};

export default MiniProject;
