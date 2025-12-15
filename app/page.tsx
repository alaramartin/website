import { italiana, lato, garamond } from "@/app/ui/fonts";
import NavBar from "./components/NavBar";
import LinksBar from "./components/LinksBar";
import MiniProject from "./components/MiniProject";
import Skill from "./components/Skill";
import DarkModeToggle from "./components/DarkModeToggle";
import Link from "next/link";
import { projects, skills } from "@/app/data/info.ts";
import { ArrowCircleRightIcon } from "@phosphor-icons/react/dist/ssr";
import generateMetadataBase from "@/lib/metadata";

export const metadata = generateMetadataBase({
    description: "My personal website.",
    url: "https://alaramartin.vercel.app",
});

export default function Home() {
    return (
        <div className="change-bg">
            <NavBar />
            <DarkModeToggle />
            <div
                className={`h-screen ${italiana.className} antialiased relative select-none`}
            >
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <LinksBar></LinksBar>
                </div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 pb-4 md:flex items-baseline cursor-default">
                    <p className="text-9xl whitespace-nowrap pr-5">ALARA</p>
                    <p className="flex text-7xl whitespace-nowrap text-lightred justify-center">
                        MARTIN
                    </p>
                </div>
            </div>
            <div className={`pt-18 lg:px-26`}>
                <div className="flex flex-row select-none">
                    <div className="flex flex-col pl-4 md:pl-14">
                        <p
                            className={`${garamond.className} cursor-default text-4xl pb-4 font-medium`}
                        >
                            Skills
                        </p>
                        <p
                            className={`${lato.className} cursor-default pb-2 inline-flex`}
                        >
                            Click on a skill to see related projects on projects
                            page.
                        </p>
                    </div>
                </div>
                <div className="w-full text-center place-items-center">
                    <div className="grid grid-cols-2 xl:grid-cols-7 gap-x-10 gap-y-4 px-4 pt-3 text-textbrown">
                        {Object.entries(skills).map(
                            ([skillKey, skill], index) => (
                                <div key={skillKey}>
                                    <Link
                                        href={`/projects?skill=${skillKey}`}
                                        className="inline-block w-max cursor-pointer"
                                    >
                                        <Skill id={skillKey} skill={skill} />
                                    </Link>
                                </div>
                            )
                        )}
                    </div>
                    {/* <div className="flex flex-wrap justify-center gap-2 px-4 pt-3 text-textbrown place-items-center">
                        {Object.entries(skills).map(([skillKey, skill]) => (
                            <Link
                                key={skillKey}
                                href={`/projects?skill=${skillKey}`}
                                className="inline-block w-fit cursor-pointer"
                            >
                                <Skill id={skillKey} skill={skill} />
                            </Link>
                        ))}
                    </div> */}
                </div>
            </div>
            <div className={`pt-18 lg:px-26`}>
                <div className="flex flex-row select-none">
                    <div className="flex flex-col pl-4 md:pl-14">
                        <p
                            className={`${garamond.className} cursor-default text-4xl pb-4 font-medium`}
                        >
                            Projects
                        </p>
                        <p
                            className={`${lato.className} cursor-default pb-2 inline-flex`}
                        >
                            Some of my favorites.
                            {/* <Link
                                className={`${lato.className} inline-flex group underline transition-all ml-1 items-center gap-0.5`}
                                href="/projects"
                            >
                                View more <ArrowCircleRightIcon size={20} />
                            </Link> */}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col px-6 md:px-16 w-full">
                    {projects.map((project, index) => {
                        // only show the ones that have a miniDescription or playable URL-- those are the ones that are meant to be displayed on the homepage
                        if (!project.miniDescription) return;

                        return (
                            <div key={project.name} className="">
                                <MiniProject
                                    name={project.name}
                                    githubLink={project.githubLink}
                                    href={project.href}
                                    description={project.miniDescription}
                                    year={project.year}
                                    tags={project.tags}
                                ></MiniProject>
                                {index != projects.length - 1 && (
                                    <div className="border-t border-lightred/65 my-1"></div>
                                )}
                            </div>
                        );
                    })}
                </div>
                {/* <div className="grid lg:auto-rows-fr grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 items-center text-textbrown xl:mx-8 mx-3">
                    {projects.map((project) => {
                        // only show the ones that have a miniDescription -- those are the ones that are meant to be displayed on the homepage
                        if (!project.miniDescription) return;

                        return (
                            <div
                                key={project.name}
                                className="w-full px-6 py-3 h-full"
                            >
                                <MiniProject
                                    name={project.name}
                                    githubLink={project.githubLink}
                                    href={project.href}
                                    description={project.miniDescription}
                                    tags={project.tags}
                                ></MiniProject>
                            </div>
                        );
                    })}
                </div> */}
                <div className="w-full text-center">
                    <Link
                        className={`${lato.className} text-md justify-center inline-flex items-center text-textbrown hover:bg-lightred/20  hover:transform hover:-translate-y-px rounded-lg m-6 p-2 gap-1 underline transition-all`}
                        href="/projects"
                    >
                        See all of my projects{" "}
                        <ArrowCircleRightIcon size={20} />{" "}
                    </Link>
                </div>
            </div>
        </div>
    );
}
