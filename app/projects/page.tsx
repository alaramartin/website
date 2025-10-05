import { italiana } from "@/app/ui/fonts";
import { projects } from "@/app/page";
import Project from "../components/Project";
import Footer from "../components/Footer";
import Filter from "./components/Filter";

// todo: add a searchbar
// todo: add a filter for skills/technologies/tools/etc used
/*
in Project.tsx, whenever you make a project element, add the skill tag names as classes
hide/show elements as needed when selected
*/

export default function Page() {
    return (
        <>
            <div className={`text-center pt-10 px-15`}>
                <Filter />
                <p
                    className={`${italiana.className} cursor-default text-4xl pb-4`}
                >
                    Projects
                </p>
                <div className="grid grid-cols-4 text-textbrown">
                    {projects.map((project, index) => {
                        let gridColumn = "";
                        const totalItems = projects.length;

                        if (totalItems - index === 1 && index % 2 === 0) {
                            gridColumn = "col-span-2 col-start-2";
                        } else {
                            gridColumn = "col-span-2";
                        }

                        return (
                            <div key={project.name} className={gridColumn}>
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
