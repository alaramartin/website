import { italiana } from "@/app/ui/fonts";
import LinksBar from "./components/LinksBar";
import MiniProject from "./components/MiniProject";
import Skill from "./components/Skill";
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
    ArrowCircleRightIcon,
    CoffeeIcon,
    CodeIcon,
    FlowerIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export const projects: {
    name: string;
    githubLink: string;
    href?: string;
    description: string;
    tags: string[];
}[] = [
    {
        name: "PKL Viewer",
        githubLink: "https://github.com/alaramartin/pkl-viewer",
        href: "https://marketplace.visualstudio.com/items?itemName=alarm.pkl-viewer",
        description:
            "View Python pickle (.pkl) files directly in the VS Code editor, quickly and safely.",
        tags: ["TypeScript", "Python", "VS_Code_API"],
    },
    {
        name: "DICOM Viewer",
        githubLink: "https://github.com/alaramartin/dicom-viewer",
        href: "https://marketplace.visualstudio.com/items?itemName=alarm.dicom-viewer",
        description:
            "View DICOM images and edit metadata side-by-side, right in your VS Code editor.",
        tags: ["TypeScript", "JavaScript", "VS_Code_API"],
    },
    {
        name: "AP Score Reveal",
        githubLink: "https://github.com/alaramartin/ap-score-cover",
        href: "https://chromewebstore.google.com/detail/ap%C2%AE-exam-score-reveal/mhjggldhegkdodlneehpkhpjbgmpohak",
        description:
            "Chrome extension that hides AP scores until clicked and plays custom sounds and animations for each reveal.",
        tags: ["TypeScript", "React", "Chrome_Extensions_API"],
    },
    {
        name: "HIPSTER-AI",
        githubLink: "https://github.com/stanfordaide/hipster-ai",
        description:
            "Pediatric acetabular index machine learning cool stuff. Built for Stanford AI Development and Evaluation Lab.",
        tags: ["PyTorch", "Python", "Git"],
    },
    {
        name: "Website",
        githubLink: "https://github.com/alaramartin/website",
        href: "localhost:3000",
        description: "ts (this) website",
        tags: ["React", "NextJS", "TailwindCSS"],
    },
];

export const skills: Record<
    string,
    { skillName: string; icon: React.ElementType }
> = {
    TypeScript: { skillName: "TypeScript", icon: FileTsIcon },
    Python: { skillName: "Python", icon: FilePyIcon },
    JavaScript: { skillName: "JavaScript", icon: FileJsIcon },
    React: { skillName: "React", icon: AtomIcon },
    NextJS: { skillName: "NextJS", icon: TriangleIcon },
    TailwindCSS: { skillName: "TailwindCSS", icon: WindIcon },
    VS_Code_API: { skillName: "VS Code API", icon: PuzzlePieceIcon },
    Chrome_Extensions_API: {
        skillName: "Chrome Extensions API",
        icon: GoogleChromeLogoIcon,
    },
    PyTorch: { skillName: "PyTorch", icon: FireIcon },
    Git: { skillName: "Git", icon: GitMergeIcon },
    Java: { skillName: "Java", icon: CoffeeIcon },
    HTMLCSS: { skillName: "HTML/CSS", icon: CodeIcon },
    whimsy: { skillName: "whimsy :)", icon: FlowerIcon },
};

export default function Home() {
    return (
        <div className="change-bg">
            <div
                className={`h-screen ${italiana.className} antialiased relative`}
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
            <div className={`text-center pt-18 px-15`}>
                <p
                    className={`${italiana.className} cursor-default text-4xl pb-4 font-bold`}
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
                    className="inline-flex items-center text-textbrown hover:bg-[#c5b6ad] rounded-lg m-4 p-2 gap-1 underline transition-colors"
                    href="/projects"
                >
                    View more of my projects <ArrowCircleRightIcon size={20} />{" "}
                </Link>
            </div>
            <div className={`text-center pt-10 px-15`}>
                <p
                    className={`${italiana.className} cursor-default text-4xl pb-4 font-bold`}
                >
                    Skills
                </p>
                <div className="grid grid-cols-6 text-textbrown mx-5">
                    {Object.entries(skills).map(([skillKey, skill]) => (
                        <div key={skillKey}>
                            <Skill id={skillKey} skill={skill} />
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );
}
