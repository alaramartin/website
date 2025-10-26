"use client";
import { useState, useMemo } from "react";
import { projects } from "@/app/data/info";
import Project from "./Project";
import Filter from "./Filter";
import SearchBar from "@/app/components/SearchBar";

interface ProjectsContentProps {
    initialSkillFilter?: string | null;
}

function ProjectsContent({ initialSkillFilter }: ProjectsContentProps) {
    // keep track of filtered projects
    const [filteredProjects, setFilteredProjects] = useState(() => {
        if (initialSkillFilter) {
            return projects.filter((project) =>
                project.tags.includes(initialSkillFilter)
            );
        }
        return projects;
    });

    // keep track of which projects to show when searched -- FILTER TAKES PRECEDENCE, search shows only those that match the filter as well
    const [search, setSearch] = useState("");

    const visibleProjects = useMemo(() => {
        const searchQ = search.toLowerCase();
        if (!searchQ) {
            return filteredProjects;
        }
        return filteredProjects.filter((project) => {
            return (
                project.name.toLowerCase().includes(searchQ) ||
                project.description.toLowerCase().includes(searchQ)
            );
        });
    }, [search, filteredProjects]);

    return (
        <>
            <SearchBar
                placeholderText="Search by title and/or description"
                search={search}
                setSearch={setSearch}
            />
            <Filter
                projects={projects}
                onFilterToggle={setFilteredProjects}
                initialSkillFilter={initialSkillFilter}
            />
            <div className="grid grid-cols-4 text-textbrown gap-x-20 gap-y-16 items-stretch pt-8 px-15">
                {visibleProjects.length === 0 && (
                    <div className="col-span-4 flex items-center justify-center py-10">
                        <p className="text-center italic opacity-65">
                            No projects found :&#40;
                        </p>
                    </div>
                )}
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
