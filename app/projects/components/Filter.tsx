"use client";
import React, { useState, useEffect } from "react";
import { skills } from "@/app/data/info.ts";
import {
    XCircleIcon,
    CaretUpIcon,
    CaretDownIcon,
} from "@phosphor-icons/react/dist/ssr";

// todo: split the filter into tools/tech/skills sections?

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

    // if coming straigh tfrom homepage with filter applied, filters should be not-collapsed
    const [collapsed, setCollapsed] = useState(initialSkillFilter == undefined);

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
        <div
            className={`lg:px-40 py-4 text-textbrown select-none flex justify-center`}
        >
            <div
                className={`w-full md:w-2/3 border border-lightred rounded-lg overflow-hidden transition-all duration-300 ${
                    collapsed ? "pb-0" : "pb-4"
                }`}
            >
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="cursor-pointer flex justify-between items-center w-full px-4 py-2 text-left hover:bg-lightred/10 transition-colors duration-150"
                >
                    <div className="flex items-center gap-2 font-medium text-[15px]">
                        Filter by Skill
                        {collapsed ? <CaretDownIcon /> : <CaretUpIcon />}
                    </div>

                    {!areAllUnselected(checkedFilters) && (
                        <div
                            className="text-xs flex items-center gap-1 border border-lightred rounded-md px-2 py-1 bg-lightred/20 hover:bg-lightred/40 active:bg-lightred/50 cursor-pointer transition-colors duration-150"
                            onClick={(e) => {
                                e.stopPropagation();
                                resetFilters();
                            }}
                        >
                            <XCircleIcon size={14} /> Clear Filters
                        </div>
                    )}
                </button>

                <div
                    className={`transition-all duration-300 overflow-hidden ${
                        collapsed ? "max-h-0" : "max-h-[600px]"
                    }`}
                >
                    <div className="flex flex-wrap justify-center gap-2 px-4 pt-3">
                        {Object.entries(skills).map(([skillKey, skill]) => {
                            const isChecked = checkedFilters[skill.skillName];
                            return (
                                <label
                                    key={skillKey}
                                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-lightred text-sm cursor-pointer transition-all duration-150 ${
                                        isChecked
                                            ? "bg-lightred/40"
                                            : "hover:bg-lightred/20"
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() =>
                                            handleFilterToggle(skillKey)
                                        }
                                        className="hidden"
                                    />
                                    <skill.icon size={16} />
                                    {skill.skillName}
                                </label>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Filter;
