import React from "react";
import { lato } from "@/app/ui/fonts";

interface SkillProps {
    id: string;
    skill: { skillName: string; icon: React.ElementType; href?: string };
}

const Skill = ({ id, skill }: SkillProps) => {
    const IconComponent = skill.icon;

    return (
        <div
            id={id}
            className={`${lato.className} max-md:text-sm max-md:rounded-xl px-3 py-1.5 antialiased inline-flex items-center border border-lightred bg-pinkbeige rounded-2xl md:m-2 md:p-4 shadow-lg/10 shadow-lightred gap-2 hover:scale-101 hover:-translate-y-0.5 hover:shadow-xl/20 transition-all duration-200`}
        >
            <div className="w-4 h-4 md:w-6 md:h-6">
                <IconComponent size="auto" />
            </div>

            <p>{skill.skillName}</p>
        </div>
    );
};

// inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-lightred text-sm
export default Skill;
