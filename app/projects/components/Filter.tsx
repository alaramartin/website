"use client";
import React, { useState, useEffect } from "react";
import { skills } from "@/app/data/info.ts";
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

    useEffect(() => {
        if (initialSkillFilter && skills[initialSkillFilter]) {
            const skillName = skills[initialSkillFilter].skillName;

            const newFilters: Record<string, boolean> = {};
            Object.values(skills).forEach((skill) => {
                newFilters[skill.skillName] = false;
            });

            newFilters[skillName] = true;
            setCheckedFilters(newFilters);
        }
    }, [initialSkillFilter]);

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
                    <label
                        key={skillKey}
                        id={skillKey}
                        className={`inline-flex border border-lightred rounded-lg mx-2 my-1.5 p-2 relative transition-colors duration-100 cursor-pointer ${
                            isChecked
                                ? "bg-lightred/40"
                                : "hover:bg-lightred/20"
                        }`}
                    >
                        <input
                            type="checkbox"
                            name={skill.skillName}
                            checked={isChecked}
                            onChange={() => handleFilterToggle(skillKey)}
                            className="absolute opacity-0 pointer-events-none"
                        />
                        <div className="inline-flex items-center gap-2 w-full">
                            <skill.icon /> {skill.skillName}
                        </div>
                    </label>
                );
            })}
            {!areAllUnselected(checkedFilters) && (
                <button
                    className={
                        "inline-flex items-center gap-2 border border-lightred rounded-lg mx-2 my-1.5 p-2 relative transition-colors duration-100 bg-lightred/20 hover:bg-lightred/40 active:bg-lightred/50 cursor-pointer"
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
