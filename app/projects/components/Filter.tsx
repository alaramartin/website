"use client";
import React, { useState } from "react";
import { skills } from "@/app/page";
import { XCircleIcon } from "@phosphor-icons/react/dist/ssr";

// todo: split the filter into tools/tech/skills sections
// todo: make filter be collapsible

interface FilterProps {
    projects: any[];
    onFilterToggle: (filtered: any[]) => void;
    initialSkillFilter?: string | null;
}

const Filter = ({
    projects,
    onFilterToggle,
    initialSkillFilter,
}: FilterProps) => {
    // initialize all filters to unchecked (or one filter checked, if coming from homepage skill)
    let initCheckedFilters: Record<string, boolean> = {};
    Object.values(skills).forEach((skill) => {
        initCheckedFilters[skill.skillName] = false;
    });

    if (initialSkillFilter && skills[initialSkillFilter]) {
        initCheckedFilters[skills[initialSkillFilter].skillName] = true;
    }

    const [checkedFilters, setCheckedFilters] = useState(initCheckedFilters);

    const resetFilters = () => {
        const emptyFilters: Record<string, boolean> = {};
        Object.values(skills).forEach((skill) => {
            emptyFilters[skill.skillName] = false;
        });
        setCheckedFilters(emptyFilters);
        onFilterToggle(projects);
    };

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
        <div className="px-20 py-4 text-textbrown select-none">
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
            {!areAllUnselected(checkedFilters) && (
                <button
                    className={
                        "inline-flex items-center gap-2 border-1 border-lightred rounded-lg mx-2 my-1.5 p-2 relative transition-colors duration-100 bg-lightred/20 hover:bg-lightred/40 active:bg-lightred/50 cursor-pointer"
                    }
                    onClick={resetFilters}
                >
                    {" "}
                    <XCircleIcon /> <p>Clear All Filters</p>
                </button>
            )}
        </div>
    );
};

export default Filter;
