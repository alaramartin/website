"use client";
import { italiana } from "@/app/ui/fonts";
import { projects } from "@/app/page";
import Project from "./components/Project";
import Footer from "../components/Footer";
import Filter from "./components/Filter";
import HomeButton from "../components/HomeButton";
import { useState, useEffect } from "react";

// todo: add a searchbar

export default function ProjectsPage() {
    // keep track of which projects to show/which are unfiltered using state
    const [visibleProjects, setVisibleProjects] = useState(projects);

    // set initial filter if coming from skills in homepage
    const [skillFilter, setSkillFilter] = useState<string | null>(null);
    useEffect(() => {
        const initialSkill = sessionStorage.getItem("skillFilter");
        if (initialSkill) {
            setSkillFilter(initialSkill);
            const filtered = projects.filter((project) => {
                return project.tags.includes(initialSkill);
            });
            setVisibleProjects(filtered);
            sessionStorage.removeItem("skillFilter");
        }
    }, []);

    return (
        <>
            <div className={`text-center pt-10 px-15`}>
                <p
                    className={`${italiana.className} cursor-default text-4xl pb-4 select-none`}
                >
                    Projects
                </p>
                <Filter
                    projects={projects}
                    onFilterToggle={setVisibleProjects}
                    initialSkillFilter={skillFilter}
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
            </div>
            <HomeButton />
            <Footer />
        </>
    );
}
