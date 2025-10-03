import { italiana } from "@/app/ui/fonts";
import LinksBar from "./components/LinksBar";
import Project from "./components/Project";
import Footer from "./components/Footer";
import {
    FireIcon,
    GoogleChromeLogoIcon,
    FilePyIcon,
    FileTsIcon,
    FileJsIcon,
    AtomIcon,
    PuzzlePieceIcon,
    GitMergeIcon,
    TriangleIcon,
    WindIcon,
} from "@phosphor-icons/react/dist/ssr";

const projects: {
    name: string;
    githubLink: string;
    href?: string;
    description: string;
    tags?: { skill: string; icon?: any }[];
}[] = [
    {
        name: "PKL Viewer",
        githubLink: "https://github.com/alaramartin/pkl-viewer",
        href: "https://marketplace.visualstudio.com/items?itemName=alarm.pkl-viewer",
        description:
            "View Python pickle (.pkl) files directly in the VS Code editor, quickly and safely.",
        tags: [
            { skill: "TypeScript", icon: <FileTsIcon /> },
            { skill: "Python", icon: <FilePyIcon /> },
            { skill: "VS Code API", icon: <PuzzlePieceIcon /> },
        ],
    },
    {
        name: "DICOM Viewer",
        githubLink: "https://github.com/alaramartin/dicom-viewer",
        href: "https://marketplace.visualstudio.com/items?itemName=alarm.dicom-viewer",
        description:
            "View DICOM images and edit metadata side-by-side, right in your VS Code editor.",
        tags: [
            { skill: "TypeScript", icon: <FileTsIcon /> },
            { skill: "JavaScript", icon: <FileJsIcon /> },
            { skill: "VS Code API", icon: <PuzzlePieceIcon /> },
        ],
    },
    {
        name: "AP Score Reveal",
        githubLink: "https://github.com/alaramartin/ap-score-cover",
        href: "https://chromewebstore.google.com/detail/ap%C2%AE-exam-score-reveal/mhjggldhegkdodlneehpkhpjbgmpohak",
        description:
            "Chrome extension that hides AP scores until clicked and plays custom sounds and animations for each reveal.",
        tags: [
            { skill: "TypeScript", icon: <FileTsIcon /> },
            { skill: "React", icon: <AtomIcon /> },
            { skill: "Chrome Extensions API", icon: <GoogleChromeLogoIcon /> },
        ],
    },
    {
        name: "HIPSTER-AI",
        githubLink: "https://github.com/stanfordaide/hipster-ai",
        description:
            "Pediatric acetabular index machine learning cool stuff. Built for Stanford AI Development and Evaluation Lab.",
        tags: [
            { skill: "PyTorch", icon: <FireIcon /> },
            { skill: "Python", icon: <FilePyIcon /> },
            { skill: "Git", icon: <GitMergeIcon /> },
        ],
    },
    {
        name: "Website",
        githubLink: "https://github.com/alaramartin/website",
        href: "localhost:3000",
        description: "ts (this) website",
        tags: [
            { skill: "React", icon: <AtomIcon /> },
            { skill: "NextJS", icon: <TriangleIcon weight="fill" /> },
            { skill: "TailwindCSS", icon: <WindIcon /> },
        ],
    },
];

// idea: the tags only have icons. the icons link to the skills section where it lists the name and the icon

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
                    <p className="text-9xl whitespace-nowrap pr-5 text-darkburgundy">
                        ALARA
                    </p>
                    <p className="text-7xl whitespace-nowrap text-lightred">
                        MARTIN
                    </p>
                </div>
            </div>
            <div className={`text-center pt-10 px-15`}>
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
        </div>
    );
}
