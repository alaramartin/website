"use client";
import { useState } from "react";
import Link from "next/link";
import { lato, garamond } from "@/app/ui/fonts";
import {
    GithubLogoIcon,
    ArrowSquareOutIcon,
    CaretRightIcon,
    CaretDownIcon,
} from "@phosphor-icons/react/dist/ssr";
import { skills } from "@/app/data/info.ts";

interface MiniProjectProps {
    name: string;
    githubLink: string;
    href?: string;
    description: string;
    year: number;
    tags?: string[];
}

const MiniProject = ({
    name,
    githubLink,
    href,
    description,
    year,
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

    // const [collapsed, setCollapsed] = useState(true);

    return (
        <div className="group text-textbrown">
            {/* {collapsed ? <CaretRightIcon /> : <CaretDownIcon />} */}

            <button
                // onClick={() => setCollapsed(!collapsed)}
                className={`flex items-center w-full md:px-4 py-2 text-left`}
            >
                <div
                    className={`${garamond.className} hidden md:flex opacity-50 group-hover:opacity-60 text-md md:text-lg items-center gap-2 text-lg font-medium md:font-bold p-2 transition-all duration-150`}
                >
                    {year}
                </div>
                <div className="flex md:opacity-75 md:group-hover:opacity-100 text-md md:text-lg items-center gap-2 text-lg font-semibold md:font-bold p-2 transition-all duration-150">
                    {name}
                </div>
                <p className="pl-2 opacity-80 hover:opacity-90 text-md transition-all duration-150">
                    {description}
                </p>

                <div className="ml-auto text-right space-x-3 inline-flex">
                    <div className="flex-row hidden md:flex">
                        {tags &&
                            tags.slice(0, 3).map((tag) => {
                                const skillData = skills[tag];
                                if (!skillData) return null;
                                const IconComponent = skillData.icon;
                                return (
                                    <div
                                        key={tag}
                                        onClick={(e) =>
                                            handleSkillClick(e, tag)
                                        }
                                        className="items-center border border-lightred rounded-lg mx-1 p-1 hover:bg-lightred/20 transition-all duration-300 cursor-pointer"
                                        title={`Skill: ${skillData.skillName}`}
                                    >
                                        <IconComponent
                                            size={14}
                                            className="m-0.5"
                                        />
                                    </div>
                                );
                            })}
                    </div>

                    <Link
                        href={href || githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Check it out!"
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        className={`flex items-center w-full ml-2 md:ml-0 p-0.5`}
                    >
                        <div className="opacity-80 group-hover:opacity-100 hover:transform hover:-translate-y-px duration-150">
                            <ArrowSquareOutIcon size={20} />
                        </div>
                    </Link>

                    <Link
                        href={githubLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="View the source code on GitHub!"
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        className={`flex items-center w-full p-0.5`}
                    >
                        <div className="opacity-80 hover:opacity-100 hover:transform hover:-translate-y-px duration-150">
                            <GithubLogoIcon size={20} />
                        </div>
                    </Link>
                </div>
            </button>

            {/* <div
                className={`overflow-hidden flex flex-row ${
                    collapsed ? "max-h-0" : "max-h-[600px]"
                }`}
            >
                <div className="flex-1 flex justify-center text-center">
                    <p className="text-center">{longDescription}</p>
                </div>
                <div className="h-14 border-r border-lightred mx-2 mr-6" />
                <div className="flex justify-start w-1/6">
                    <div className="flex flex-col">
                        <div className="flex flex-row">
                            {tags &&
                                tags.slice(0, 3).map((tag) => {
                                    const skillData = skills[tag];
                                    if (!skillData) return null;
                                    const IconComponent = skillData.icon;
                                    return (
                                        <button
                                            key={tag}
                                            onClick={(e) =>
                                                handleSkillClick(e, tag)
                                            }
                                            className="items-center border border-lightred rounded-lg mx-1 p-2 hover:bg-lightred/20 transition-all duration-300 cursor-pointer"
                                            title={`Skill: ${skillData.skillName}`}
                                        >
                                            <IconComponent
                                                size={16}
                                                className="m-0.5"
                                            />
                                        </button>
                                    );
                                })}
                        </div>
                    </div>
                </div>
            </div> */}
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
