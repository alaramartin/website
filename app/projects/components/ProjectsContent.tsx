"use client";
import { useState, useEffect } from "react";
import { projects } from "@/app/data/info";
import Project from "./Project";
import Filter from "./Filter";
import SearchBar from "@/app/components/SearchBar";

interface ProjectsContentProps {
    initialSkillFilter?: string | null;
}

function ProjectsContent({ initialSkillFilter }: ProjectsContentProps) {
    // keep track of which projects to show/which are unfiltered using state
    const [visibleProjects, setVisibleProjects] = useState(projects);
    // keep track of filtered projects
    const [filteredProjects, setFilteredProjects] = useState(projects);
    useEffect(() => {
        if (initialSkillFilter) {
            const filtered = projects.filter((project) => {
                return project.tags.includes(initialSkillFilter);
            });
            setVisibleProjects(filtered);
            setFilteredProjects(filtered);
        }
    }, []);

    // keep track of which projects to show when searched -- FILTER TAKES PRECEDENCE, search shows only those that match the filter as well
    const [search, setSearch] = useState("");
    useEffect(() => {
        if (search) {
            const filtered = filteredProjects.filter((project) => {
                return (
                    project.name.toLowerCase().includes(search.toLowerCase()) ||
                    project.description
                        .toLowerCase()
                        .includes(search.toLowerCase())
                );
            });
            setVisibleProjects(filtered);
        }
        if (search === "") {
            setVisibleProjects(filteredProjects);
        }
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
