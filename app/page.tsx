import { italiana } from "@/app/ui/fonts";
import LinksBar from "./components/LinksBar";
import Project from "./components/Project";

const projects: {
    name: string;
    githubLink: string;
    href?: string;
    description: string;
    tags?: string[];
}[] = [
    {
        name: "PKL Viewer",
        githubLink: "https://github.com/alaramartin/pkl-viewer",
        href: "https://marketplace.visualstudio.com/items?itemName=alarm.pkl-viewer",
        description:
            "View Python pickle (.pkl) files directly in the VS Code editor, quickly and safely.",
        tags: ["TypeScript", "Python", "VS Code API"],
    },
    {
        name: "DICOM Viewer",
        githubLink: "https://github.com/alaramartin/dicom-viewer",
        href: "https://marketplace.visualstudio.com/items?itemName=alarm.dicom-viewer",
        description:
            "View DICOM images and edit metadata side-by-side, right in your VS Code editor.",
        tags: ["TypeScript", "JavaScript", "VS Code API"],
    },
    {
        name: "AP Score Reveal",
        githubLink: "https://github.com/alaramartin/ap-score-cover",
        href: "https://chromewebstore.google.com/detail/ap%C2%AE-exam-score-reveal/mhjggldhegkdodlneehpkhpjbgmpohak",
        description:
            "Chrome extension that hides AP scores until clicked and plays custom sounds and animations for each reveal.",
        tags: ["TypeScript", "React", "Chrome Extensions API"],
    },
];

export default function Home() {
    return (
        <div>
            <div
                className={`h-screen ${italiana.className} antialiased relative`}
            >
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <LinksBar></LinksBar>
                </div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 pb-4 flex items-baseline cursor-default">
                    <p className="text-9xl whitespace-nowrap pr-5">ALARA</p>
                    <p className="text-7xl whitespace-nowrap text-[#d58789]">
                        MARTIN
                    </p>
                </div>
            </div>
            <div className={`text-center pt-10`}>
                <p className={`${italiana.className} cursor-default text-2xl`}>
                    Projects
                </p>
                <div className="grid grid-cols-3 text-[#421C0A]">
                    {projects.map((project) => (
                        <Project
                            key={project.name}
                            name={project.name}
                            githubLink={project.githubLink}
                            href={project.href}
                            description={project.description}
                            tags={project.tags}
                        ></Project>
                    ))}
                </div>
            </div>
        </div>
    );
}
