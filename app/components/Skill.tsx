import React from "react";
import { lato } from "@/app/ui/fonts";
import { CaretDoubleRightIcon } from "@phosphor-icons/react/dist/ssr";

interface SkillProps {
    id: string;
    skill: { skillName: string; icon: React.ElementType; href?: string };
}

const Skill = ({ id, skill }: SkillProps) => {
    const IconComponent = skill.icon;

    return (
        <div
            id={id}
            className="inline-flex items-center gap-x-1 group p-1 rounded-xl"
        >
            <div className="w-4 h-4 group-hover:hidden transition-all duration-200">
                <IconComponent size="auto" />
            </div>
            <div className="w-4 h-4 hidden group-hover:inline-flex transition-all duration-200">
                <CaretDoubleRightIcon size="auto" />
            </div>

            <p className="underline decoration-lightred/70">
                {skill.skillName}
            </p>
        </div>
        // <div
        //     id={id}
        //     className={`${lato.className} max-md:text-sm max-md:rounded-xl px-3 py-1.5 antialiased inline-flex items-center align-items-center border border-lightred bg-pinkbeige rounded-2xl md:m-2 md:p-4 shadow-lg/10 shadow-lightred gap-2 hover:scale-101 hover:-translate-y-0.5 hover:shadow-xl/20 transition-all duration-200`}
        // >
        //     <IconComponent />
        //     <p>{skill.skillName}</p>
        // </div>
    );
};

export default Skill;
