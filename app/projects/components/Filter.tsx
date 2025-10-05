"use client";
import React, { useState } from "react";
import { skills } from "@/app/page";

/* idea: on homepage, limit skill tags to 3 (because i want to keep the skill highlighting/scroll thing lol)
on projects page, limit to three but add a "..." where you can expand and see all of them
add ALL the relevant skills to each project so that the filter functionality actually makes sense
*/

// todo: split the filter into tools/tech/skills sections
// todo: make filter be collapsible

interface FilterProps {
    projects: any[];
    onFilterToggle: (filtered: any[]) => void;
}

const Filter = ({ projects, onFilterToggle }: FilterProps) => {
    // initialize all filters to unchecked
    const initCheckedFilters: Record<string, boolean> = {};
    Object.values(skills).forEach((skill) => {
        initCheckedFilters[skill.skillName] = false;
    });

    const [checkedFilters, setCheckedFilters] = useState(initCheckedFilters);

    const areAllUnselected = (filters: Record<string, boolean>) =>
        Object.values(filters).every((v) => !v);

    const handleFilterToggle = (skillKey: string) => {
        const skillName = skills[skillKey].skillName;
        const updatedFilters = {
            ...checkedFilters,
            [skillName]: !checkedFilters[skillName],
        };
        setCheckedFilters(updatedFilters);

        // find selected skills
        const activeSkills = Object.keys(updatedFilters).filter(
            (k) => updatedFilters[k]
        );

        // if no filters selected, show all projects
        if (areAllUnselected(updatedFilters)) {
            onFilterToggle(projects);
            return;
        }

        // filter projects — any project matching any active skill
        const filtered = projects.filter((project) =>
            project.tags.some((tag: string) =>
                activeSkills.includes(skills[tag]?.skillName)
            )
        );

        onFilterToggle(filtered);
    };

    return (
        <div className="px-20 py-4 text-textbrown">
            <p>Filter by Skill</p>
            {Object.entries(skills).map(([skillKey, skill]) => {
                const isChecked = checkedFilters[skill.skillName];
                return (
                    <div
                        key={skillKey}
                        id={skillKey}
                        className={`inline-flex border-1 border-lightred rounded-lg mx-2 my-1.5 p-2 relative transition-colors duration-100 ${
                            isChecked
                                ? "bg-lightred/40"
                                : "hover:bg-lightred/20"
                        }`}
                    >
                        <input
                            className="absolute top-0 right-0 left-0 bottom-0 cursor-pointer opacity-0"
                            type="checkbox"
                            name={skill.skillName}
                            checked={isChecked}
                            onChange={() => handleFilterToggle(skillKey)}
                        />
                        <label
                            htmlFor={skill.skillName}
                            className="inline-flex items-center gap-2"
                        >
                            <skill.icon /> {skill.skillName}
                        </label>
                    </div>
                );
            })}
        </div>
    );
};

export default Filter;
