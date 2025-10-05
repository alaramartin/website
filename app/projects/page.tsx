import { italiana } from "@/app/ui/fonts";
import { projects } from "@/app/page";
import Project from "./components/Project";
import Footer from "../components/Footer";
import Filter from "./components/Filter";

// todo: add a searchbar
// todo: add a filter for skills/technologies/tools/etc used

export default function Page() {
    // todo: keep track of which projects to show/which are unfiltered using state

    return (
        <>
            <div className={`text-center pt-10 px-15`}>
                <p
                    className={`${italiana.className} cursor-default text-4xl pb-4`}
                >
                    Projects
                </p>
                <Filter />
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
