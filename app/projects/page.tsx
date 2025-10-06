"use client";
import { italiana } from "@/app/ui/fonts";
import { projects } from "@/app/page";
import Project from "./components/Project";
import Footer from "../components/Footer";
import Filter from "./components/Filter";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

// todo: add a searchbar

export default function Page() {
    // keep track of which projects to show/which are unfiltered using state
    const [visibleProjects, setVisibleProjects] = useState(projects);

    // set initial filter if coming from skills in homepage
    const searchParams = useSearchParams();
    const skillFilter = searchParams.get("skill");
    useEffect(() => {
        if (skillFilter) {
            const filtered = projects.filter((project) => {
                return project.tags.includes(skillFilter);
            });
            setVisibleProjects(filtered);
        }
    }, [skillFilter]);

    return (
        <>
            <div className={`text-center pt-10 px-15`}>
                <p
                    className={`${italiana.className} cursor-default text-4xl pb-4`}
                >
                    Projects
                </p>
                <Filter
                    projects={projects}
                    onFilterToggle={setVisibleProjects}
                    initialSkillFilter={skillFilter}
                />
                <div className="grid grid-cols-4 text-textbrown">
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
            </div>
            <Footer />
        </>
    );
}
