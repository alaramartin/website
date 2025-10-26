import { italiana } from "@/app/ui/fonts";
import ProjectsContent from "./components/ProjectsContent";
import Footer from "../components/Footer";
import HomeButton from "../components/HomeButton";
import NavBar from "../components/NavBar";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Projects",
};

interface PageProps {
    searchParams: Promise<{ skill?: string }>;
}

export default async function ProjectsPage({ searchParams }: PageProps) {
    const resolvedSearchParams = await searchParams;
    const skillFilter = resolvedSearchParams.skill || null;

    return (
        <>
            <NavBar />
            <div className={`text-center pt-16 px-15`}>
                <p
                    className={`${italiana.className} cursor-default text-4xl pb-4 select-none`}
                >
                    Projects
                </p>
                <ProjectsContent initialSkillFilter={skillFilter} />
            </div>
            <HomeButton />
            <Footer />
        </>
    );
}
