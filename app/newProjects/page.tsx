import { italiana } from "@/app/ui/fonts";
import DarkModeToggle from "../components/DarkModeToggle";
import NavBar from "../components/NavBar";
import generateMetadataBase from "@/lib/metadata";
import Timeline from "./components/Timeline";

export const metadata = generateMetadataBase({
    title: "Projects",
    description: "A timeline of my projects.",
    url: "https://alaramartin.com/projects",
});

export default function ProjectsPage() {
    return (
        <>
            <NavBar />
            <DarkModeToggle />
            <div className={`text-center pt-16 md:px-15`}>
                <p
                    className={`${italiana.className} cursor-default text-4xl pb-4 select-none`}
                >
                    PROJECTS
                </p>
                <p className="text-black">
                    I&apos;ve made a few things over the years...
                </p>
            </div>
            <Timeline />
        </>
    );
}
