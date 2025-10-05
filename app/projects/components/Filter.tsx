"use client";
import React from "react";
import { skills } from "@/app/page";
import { projects } from "@/app/page";
import { useState } from "react";

/* idea: on homepage, limit skill tags to 3 (because i want to keep the skill highlighting/scroll thing lol)
on projects page, limit to three but add a "..." where you can expand and see all of them
add ALL the relevant skills to each project so that the filter functionality actually makes sense

make a MiniProject.tsx compoennt for homepage and keep Project.tsx for projects page
*/

// todo: split the filter into tools/tech/skills sections
// todo: make filter be collapsible

const Filter = () => {
    let initCheckedFilters: Record<string, boolean> = {};
    Object.values(skills).forEach((skill) => {
        initCheckedFilters[skill.skillName] = false;
    });
    // keep track of the status of each filter; initialized to all checked (no filter)
    const [checkedFilters, setCheckedFilters] = useState(initCheckedFilters);

    const updateFilters = (skill: string) => {
        const skillToUpdate = skills[skill].skillName;
        const tempFilters = checkedFilters;
        tempFilters[skillToUpdate] = !tempFilters[skillToUpdate];

        console.log(tempFilters);

        // highlight or un-highlight the selected filters
        const skillElement = document.getElementById(skill);
        if (skillElement?.classList.contains("selected")) {
            skillElement?.classList.remove("selected");
            filterToOneTag(skill, false, tempFilters);
        } else {
            skillElement?.classList.add("selected");
            filterToOneTag(skill, true, tempFilters);
        }

        setCheckedFilters(tempFilters);
    };

    // project: { which skills are selecting it to be viewed}
    let selectors: Record<string, string[]> = {};

    function areAllUnselected(currentFilters: Record<string, boolean>) {
        let isUnfiltered = true;
        Object.keys(currentFilters).forEach((key) => {
            if (currentFilters[key] === true) {
                isUnfiltered = false;
            }
        });
        return isUnfiltered;
    }

    const filterToOneTag = (
        skill: string,
        removeUnselectedProjectsFromView: boolean,
        currentFilters: Record<string, boolean>
    ) => {
        // iterate through the projects and see which ones have the tag of the skill
        projects.forEach((project) => {
            const projectTags = project.tags;
            const projectName = project.name;
            if (!selectors[projectName]) {
                selectors[projectName] = [];
            }
            if (!projectTags.includes(skill)) {
                const projectInDoc = document.getElementById(project.name);
                if (projectInDoc) {
                    if (removeUnselectedProjectsFromView) {
                        // only remove if there are no other skills selecting this project
                        if (
                            selectors[projectName].length < 1 &&
                            !areAllUnselected(currentFilters)
                        ) {
                            projectInDoc.style.display = "none";
                        }
                    } else {
                        // only add back if there are other selectors or everything is unfiltered
                        if (
                            selectors[projectName].length > 0 ||
                            areAllUnselected(currentFilters)
                        ) {
                            projectInDoc.style.display = "block";
                            console.log(projectName, selectors[projectName]);
                        }
                    }
                }
            } else {
                if (removeUnselectedProjectsFromView) {
                    selectors[projectName].push(skill);
                    const projectInDoc = document.getElementById(project.name);
                    if (projectInDoc) {
                        projectInDoc.style.display = "block";
                    }
                } else {
                    selectors[projectName].splice(
                        selectors[projectName].indexOf(skill),
                        1
                    );
                    // only remove if there are no other skills selecting this project
                    if (
                        selectors[projectName].length < 1 &&
                        !areAllUnselected(currentFilters)
                    ) {
                        const projectInDoc = document.getElementById(
                            project.name
                        );
                        if (projectInDoc) {
                            projectInDoc.style.display = "none";
                        }
                    }
                }
            }
        });
    };

    return (
        <div className="px-20 py-4 text-textbrown">
            <p>Filter by Skill</p>
            {Object.entries(skills).map(([skillKey, skill]) => (
                <div
                    key={skillKey}
                    id={skillKey}
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
