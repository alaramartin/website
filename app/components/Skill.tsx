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
            className="inline-flex items-center gap-x-1 group p-1 rounded-xl"
        >
            <div className="w-4 h-4 transition-all duration-200">
                <IconComponent />
            </div>
            <p className="underline decoration-lighthighlight/40 underline-offset-3">
                {skill.skillName}
            </p>
        </div>
    );
};

export default Skill;
