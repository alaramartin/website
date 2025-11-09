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
    CoffeeIcon,
    CodeIcon,
    FlowerIcon,
} from "@phosphor-icons/react/dist/ssr";

export const projects: {
    name: string;
    githubLink: string;
    href?: string;
    miniDescription?: string;
    description: string;
    notes?: string[];
    tags: string[];
    display: boolean;
}[] = [
    {
        name: "PKL Viewer",
        githubLink: "https://github.com/alaramartin/pkl-viewer",
        href: "https://marketplace.visualstudio.com/items?itemName=alarm.pkl-viewer",
        miniDescription:
            "View Python pickle (.pkl) files directly in the VS Code editor.",
        description:
            "View Python pickle (.pkl) files directly in the VS Code editor, quickly and safely.",
        notes: ["3000+ users :)"],
        tags: ["TypeScript", "Python", "VS_Code_API", "HTMLCSS", "JavaScript"],
        display: true,
    },
    {
        name: "DICOM Viewer",
        githubLink: "https://github.com/alaramartin/dicom-viewer",
        href: "https://marketplace.visualstudio.com/items?itemName=alarm.dicom-viewer",
        miniDescription: "View DICOM images and edit metadata side-by-side.",
        description:
            "View DICOM images and edit metadata side-by-side, right in your VS Code editor.",
        notes: ["250+ users :)", "first vscode extension"],
        tags: ["TypeScript", "JavaScript", "VS_Code_API", "HTMLCSS"],
        display: true,
    },
    {
        name: "AP Score Reveal",
        githubLink: "https://github.com/alaramartin/ap-score-cover",
        href: "https://chromewebstore.google.com/detail/ap%C2%AE-exam-score-reveal/mhjggldhegkdodlneehpkhpjbgmpohak",
        miniDescription: "Chrome extension to customize score reveals.",
        description:
            "Chrome extension that hides AP scores until clicked and plays custom sounds and animations for each reveal.",
        notes: ["accidentally spoiled my own 2025 AP score reveal by inspecting the HTML to build this extension"],
        tags: [
            "TypeScript",
            "React",
            "Chrome_Extensions_API",
            "HTMLCSS",
            "TailwindCSS",
        ],
        display: true,
    },
    {
        name: "HIPSTER-AI",
        githubLink: "https://github.com/stanfordaide/hipster-ai",
        miniDescription: "Under 1mm MPJPE. Aura.",
        description:
            "Pediatric acetabular index machine learning cool stuff. Built for Stanford AI Development and Evaluation Lab.",
        notes: ["deployment in progress", "0.98mm MPJPE", "resnet-50 backbone, faster-rcnn-based keypoint detection model"],
        tags: ["PyTorch", "Python", "Git"],
        display: true,
    },
    {
        name: "Website",
        githubLink: "https://github.com/alaramartin/website",
        href: "https://alaramartin.vercel.app",
        miniDescription: "ts (this) website",
        description: "ts (this) website",
        notes: ["i still don't know how to make it nicer :(", "someone pls teach me ui/ux design"],
        tags: [
            "React",
            "NextJS",
            "TailwindCSS",
            "TypeScript",
            "HTMLCSS",
            "whimsy",
        ],
        display: true,
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