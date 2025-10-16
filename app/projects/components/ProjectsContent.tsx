"use client";
import { useState, useEffect } from "react";
import { projects } from "@/app/page";
import Project from "./Project";
import Filter from "./Filter";

interface ProjectsContentProps {
    initialSkillFilter?: string | null;
}

function ProjectsContent({ initialSkillFilter }: ProjectsContentProps) {
    // keep track of which projects to show/which are unfiltered using state
    const [visibleProjects, setVisibleProjects] = useState(projects);
    useEffect(() => {
        if (initialSkillFilter) {
            const filtered = projects.filter((project) => {
                return project.tags.includes(initialSkillFilter);
            });
            setVisibleProjects(filtered);
        }
    }, []);
    return (
        <>
            <Filter
                projects={projects}
                onFilterToggle={setVisibleProjects}
                initialSkillFilter={initialSkillFilter}
            />
            <div className="grid grid-cols-4 text-textbrown gap-x-20 gap-y-16 items-stretch pt-8 px-15">
                {visibleProjects.map((project, index) => {
                    let gridColumn = "";
                    const totalItems = visibleProjects.length;
                    if (totalItems - index === 1 && index % 2 === 0) {
                        gridColumn = "col-span-2 col-start-2";
                    } else {
                        gridColumn = "col-span-2";
                    }

                    return (
                        <div
                            id={project.name}
                            key={project.name}
                            className={gridColumn}
                        >
                            <Project
                                name={project.name}
                                githubLink={project.githubLink}
                                href={project.href}
                                description={project.description}
                                tags={project.tags}
                            ></Project>
                        </div>
                    );
                })}
            </div>
        </>
    );
}

export default ProjectsContent;
