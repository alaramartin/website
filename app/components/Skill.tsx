import React from "react";

interface SkillProps {
    id: string;
    skill: { skillName: string; icon: React.ElementType; href?: string };
}

const Skill = ({ id, skill }: SkillProps) => {
    const IconComponent = skill.icon;

    return (
        <div
            id={id}
            className="inline-flex items-center gap-x-1.5 py-1"
        >
            <div className="w-4 h-4 text-accent">
                <IconComponent />
            </div>
            <p>{skill.skillName}</p>
        </div>
    );
};

export default Skill;
