import { mono, serif } from "@/app/ui/fonts";
import NavBar from "../components/NavBar";
import generateMetadataBase from "@/lib/metadata";
import Timeline from "./components/Timeline";
import TextScramble from "../components/TextScramble";

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
                <Timeline />
            </main>
        </>
    );
}
