import { useState, useEffect } from "react";
import { skills } from "@/app/data/info.ts";

interface SkillTagProps {
    tags: string[];
}

export default function SkillTags({ tags }: SkillTagProps) {
    // keep track of whether or not they're on desktop for the purposes of resizing the project card view
    const [isDesktop, setIsDesktop] = useState(false);
    useEffect(() => {
        function handleResize() {
            setIsDesktop(window.innerWidth > 1000);
        }
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    if (isDesktop) {
        return (
            <div className="mt-2 flex justify-center flex-nowrap flex-col">
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
        );
    } else {
        return (
            <div className="mt-2 flex flex-wrap justify-center">
                {tags.map((tag) => {
                    // only show maximum of 3 tags per row
                    const skillData = skills[tag];
                    if (!skillData) return null;
                    const IconComponent = skillData.icon;

                    return (
                        <div
                            key={tag}
                            className="max-md:text-sm max-md:rounded-xl px-3 py-1.5 antialiased inline-flex items-center border border-lightred bg-pinkbeige rounded-2xl gap-2 m-1 transition-all duration-200 select-none cursor-default"
                        >
                            <div className="w-4 h-4 md:w-5 md:h-5">
                                <IconComponent size="auto" />
                            </div>
                            <p>{skillData.skillName}</p>
                        </div>
                    );
                })}
            </div>
        );
    }
}
