"use client";
import React from "react";
import { skills } from "@/app/page";
import { useState } from "react";

/* idea: on homepage, limit skill tags to 3
on projects page, limit to three but add a "..." where you can expand and see all of them
add ALL the relevant skills to each project so that the filter functionality actually makes sense
*/

const Filter = () => {
    let initCheckedFilters: Record<string, boolean> = {};
    Object.values(skills).forEach((skill) => {
        initCheckedFilters[skill.skillName] = true;
    });
    // keep track of the status of each filter; initialized to all checked (no filter)
    const [checkedFilters, setCheckedFilters] = useState(initCheckedFilters);

    const updateFilters = (skill: string) => {
        const skillToUpdate = skills[skill].skillName;
        setCheckedFilters((prevFilters) => ({
            ...prevFilters,
            [skillToUpdate]: !prevFilters[skill],
        }));

        // highlight or un-highlight the selected filters
        const skillElement = document.getElementById(skillToUpdate);
        if (skillElement?.classList.contains("selected")) {
            skillElement?.classList.remove("selected");
        } else {
            skillElement?.classList.add("selected");
        }
    };

    return (
        <div>
            <p>Filter by Skill</p>
            {Object.entries(skills).map(([skillKey, skill]) => (
                <div
                    key={skillKey}
                    id={skill.skillName}
                    className="inline-flex border-1 border-lightred rounded-lg mx-2 my-1.5 p-2 relative transition-colors duration-100 hover:bg-lightred/20"
                >
                    <input
                        className="absolute top-0 right-0 left-0 bottom-0 cursor-pointer opacity-0"
                        type="checkbox"
                        name={skill.skillName}
                        checked={checkedFilters[skill.skillName]}
                        onChange={() => updateFilters(skillKey)}
                    />
                    <label
                        htmlFor={skill.skillName}
                        className="inline-flex items-center gap-2"
                    >
                        {" "}
                        <skill.icon /> {skill.skillName}
                    </label>
                </div>
            ))}
        </div>
    );
};

export default Filter;
