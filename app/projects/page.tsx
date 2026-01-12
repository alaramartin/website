import { italiana } from "@/app/ui/fonts";
import ProjectsContent from "./components/ProjectsContent";
import DarkModeToggle from "../components/DarkModeToggle";
import NavBar from "../components/NavBar";
import generateMetadataBase from "@/lib/metadata";

export const metadata = generateMetadataBase({
    title: "Projects",
    description: "My projects.",
    url: "https://alaramartin.com/projects",
});

interface PageProps {
    searchParams: Promise<{ skill?: string }>;
}

export default async function ProjectsPage({ searchParams }: PageProps) {
    const resolvedSearchParams = await searchParams;
    const skillFilter = resolvedSearchParams.skill || null;

    return (
        <>
            <NavBar />
            <DarkModeToggle />
            <div className={`text-center pt-16 md:px-15`}>
                <p
                    className={`${italiana.className} cursor-default text-4xl pb-4 select-none`}
                >
                    Projects
                </p>
                <ProjectsContent initialSkillFilter={skillFilter} />
            </div>
        </>
    );
}
