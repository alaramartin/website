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
            className={`${lato.className} antialiased inline-flex items-center border-2 border-lightred bg-pinkbeige rounded-2xl m-2 p-4 shadow-xl/10 shadow-lightred gap-2`}
        >
            <IconComponent size={32} />
            <p>{skill.skillName}</p>
        </div>
    );
};

export default Skill;
