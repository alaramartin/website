import { mono, serif } from "@/app/ui/fonts";
import NavBar from "../components/NavBar";
import generateMetadataBase from "@/lib/metadata";
import Timeline from "./components/Timeline";
import { hackathonProjects, projects } from "@/app/data/info";
import TextScramble from "../components/TextScramble";

// the timeline shows everything: regular projects and hackathon projects interleaved
// by date. they're kept as separate arrays in info.ts because the home page renders
// them as separate sections.
// newest -> oldest, top to bottom (reverse chronological). dates are only
// month precision (YYYY-MM), so entries within the same month rely on the stable
// sort preserving their order here: `projects` first, then `hackathonProjects`
// (see info.ts)
const sortedProjects = [
    ...projects,
    ...hackathonProjects.map((p) => ({ ...p, hackathon: true })),
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export const metadata = generateMetadataBase({
    title: "Projects",
    description: "A timeline of my projects.",
    url: "https://alaramartin.com/projects",
});

export default function ProjectsPage() {
    return (
        <>
            <NavBar />
            <main style={{ minHeight: "100vh" }}>
                <div className={`text-center pt-16 md:px-15`}>
                    <p
                        className={`${mono.className} cursor-default text-4xl pb-4 select-none text-accent`}
                    >
                        <TextScramble textToScramble="Projects" />
                    </p>
                    <p className={`text-bodytext ${serif.className}`}>
                        I&apos;ve made a few things over the years...
                    </p>
                </div>
                <Timeline projects={sortedProjects} />
            </main>
        </>
    );
}
