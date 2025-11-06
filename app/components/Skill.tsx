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
            className={`${lato.className} antialiased inline-flex items-center border border-lightred bg-pinkbeige rounded-2xl m-2 p-4 shadow-lg/10 shadow-lightred gap-2 hover:scale-101 hover:-translate-y-0.5 hover:shadow-xl/20 transition-all duration-200`}
        >
            <IconComponent size={26} />
            <p>{skill.skillName}</p>
        </div>
    );
};

export default Skill;
