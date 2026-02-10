import React from "react";
import { serif } from "@/app/ui/fonts";
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
            {/* <div className="w-4 h-4 group-hover:hidden transition-all duration-200">
                <IconComponent />
            </div>
            <div className="w-4 h-4 hidden group-hover:inline-flex transition-all duration-200">
                <CaretDoubleRightIcon />
            </div> */}

            <div className="w-4 h-4 transition-all duration-200">
                <IconComponent />
            </div>
            <p className="underline decoration-lightred/40 underline-offset-3">
                {skill.skillName}
            </p>
        </div>
    );
};

export default Skill;
