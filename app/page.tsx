import { italiana, lato } from "@/app/ui/fonts";
import NavBar from "./components/NavBar";
import LinksBar from "./components/LinksBar";
import MiniProject from "./components/MiniProject";
import Skill from "./components/Skill";
import DarkModeToggle from "./components/DarkModeToggle";
import Link from "next/link";
import { projects, skills } from "@/app/data/info.ts";
import { ArrowCircleRightIcon } from "@phosphor-icons/react/dist/ssr";
import generateMetadata from "@/lib/metadata";

export const metadata = generateMetadata({
    description: "My personal website.",
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
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 pb-4 flex items-baseline cursor-default">
                    <p className="text-9xl whitespace-nowrap pr-5">ALARA</p>
                    <p className="text-7xl whitespace-nowrap text-lightred">
                        MARTIN
                    </p>
                </div>
            </div>
            <div className={`text-center pt-18 px-30`}>
                <p
                    className={`${italiana.className} cursor-default text-4xl pb-4 font-bold`}
                >
                    Skills
                </p>
                <p className={`${lato.className} cursor-default pb-4`}>
                    Click on a skill to see related projects on projects page
                </p>
                <div className="grid grid-cols-4 text-textbrown mx-5 place-items-center">
                    {Object.entries(skills).map(([skillKey, skill]) => (
                        <Link
                            key={skillKey}
                            href={`/projects?skill=${skillKey}`}
                            className="inline-block w-fit cursor-pointer"
                        >
                            <Skill id={skillKey} skill={skill} />
                        </Link>
                    ))}
                </div>
            </div>
            <div className={`text-center pt-18 px-30`}>
                <p
                    className={`${italiana.className} cursor-default text-4xl pb-4 font-bold`}
                >
                    Projects
                </p>
                <div className="text-textbrown items-stretch pt-8 mx-10">
                    {projects.map((project, index) => {
                        // let gridColumn = "";
                        // const totalItems = projects.length;

                        // if (totalItems - index === 1 && index % 2 === 0) {
                        //     gridColumn = "col-span-2 col-start-2";
                        // } else {
                        //     gridColumn = "col-span-2";
                        // }

                        return (
                            <div key={project.name}>
                                <MiniProject
                                    name={project.name}
                                    githubLink={project.githubLink}
                                    href={project.href}
                                    description={project.description}
                                    tags={project.tags}
                                ></MiniProject>
                            </div>
                        );
                    })}
                </div>
                <Link
                    className={`${lato.className} text-lg inline-flex items-center text-textbrown hover:bg-lightred/30 rounded-lg m-6 p-2 gap-1 underline transition-colors`}
                    href="/projects"
                >
                    View more of my projects <ArrowCircleRightIcon size={20} />{" "}
                </Link>
            </div>
        </div>
    );
}
