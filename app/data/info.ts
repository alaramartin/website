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

export type ProjectInfo = {
    name: string;
    githubLink: string;
    href?: string;
    miniDescription?: string;
    description: string;
    notes?: string[];
    tags: string[];
    // hardcoded; mostly the github repo created_at date, month precision only (YYYY-MM)
    // list entries in chronological order within the same month so the stable
    // sort in projects/page.tsx keeps them correctly ordered on ties
    date: string;
};

export type BookInfo = {
    title: string;
    author: string;
    stars: number;
    review: string;
    cover: string;
};

// derive a url-safe slug from a book title, e.g. "You Don't Know JS" -> "you-dont-know-js".
// used by both the reviews shelf links and the [slug] lookup so they always agree.
export const bookSlug = (title: string): string =>
    title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

export const books: BookInfo[] = [
    {
        title: "The Pragmatic Programmer",
        author: "David Thomas and Andrew Hunt",
        stars: 5,
        review: "A must-read for any software developer. Offers practical advice and timeless principles.",
        cover: "https://images-na.ssl-images-amazon.com/images/I/41as+WafrFL._SX258_BO1,204,203,200_.jpg",
    },
    {
        title: "Clean Code",
        author: "Robert C. Martin",
        stars: 5,
        review: "Essential reading for writing maintainable and readable code. Emphasizes the importance of good coding practices.",
        cover: "https://images-na.ssl-images-amazon.com/images/I/41xShlnTZTL._SX374_BO1,204,203,200_.jpg",
    },
    {
        title: "Design Patterns",
        author: "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
        stars: 5,
        review: "A classic book that introduces fundamental design patterns in software engineering. Highly recommended for understanding object-oriented design.",
        cover: "https://images-na.ssl-images-amazon.com/images/I/51kuc0iWoUL._SX258_BO1,204,203,200_.jpg",
    },
    {
        title: "Refactoring",
        author: "Martin Fowler",
        stars: 4.5,
        review: "Provides a comprehensive guide to improving code structure and maintainability through refactoring techniques.",
        cover: "https://images-na.ssl-images-amazon.com/images/I/41jEbK-jG+L._SX396_BO1,204,203,200_.jpg",
    },
    {
        title: "You Don't Know JS",
        author: "Kyle Simpson",
        stars: 3.5,
        review: "A deep dive into JavaScript, covering its quirks and intricacies. A must-read for serious JavaScript developers.",
        cover: "https://images-na.ssl-images-amazon.com/images/I/51kuc0iWoUL._SX258_BO1,204,203,200_.jpg",
    },
];

export const projects: ProjectInfo[] = [
    {
        name: "PKL Viewer",
        githubLink: "https://github.com/alaramartin/pkl-viewer",
        href: "https://marketplace.visualstudio.com/items?itemName=alarm.pkl-viewer",
        miniDescription: "View Python pickle files directly in VS Code.",
        description:
            "View Python pickle (.pkl) files directly in the VS Code editor, quickly and safely.",
        notes: ["15000+ users :)"],
        tags: ["TypeScript", "Python", "VS_Code_API", "HTMLCSS", "JavaScript"],
        date: "2025-08",
    },
    {
        name: "DICOM Viewer",
        githubLink: "https://github.com/alaramartin/dicom-viewer",
        href: "https://marketplace.visualstudio.com/items?itemName=alarm.dicom-viewer",
        miniDescription: "View & edit DICOM images and metadata.",
        description:
            "View DICOM images and edit metadata side-by-side, right in your VS Code editor.",
        notes: ["1000+ users :)", "first vscode extension"],
        tags: ["TypeScript", "JavaScript", "VS_Code_API", "HTMLCSS"],
        date: "2025-08",
    },
    {
        name: "AP Score Reveal",
        githubLink: "https://github.com/alaramartin/ap-score-cover",
        href: "https://chromewebstore.google.com/detail/ap%C2%AE-exam-score-reveal/mhjggldhegkdodlneehpkhpjbgmpohak",
        description:
            "Chrome extension that hides AP scores until clicked and plays custom sounds and animations for each reveal.",
        notes: [
            "accidentally spoiled my own 2025 AP score reveal by inspecting the HTML to build this extension",
        ],
        tags: ["TypeScript", "React", "Chrome_API", "HTMLCSS", "TailwindCSS"],
        date: "2025-07",
    },
    {
        name: "HIPSTER-AI",
        githubLink: "https://github.com/stanfordaide/hipster-ai",
        description:
            "Pediatric acetabular index machine learning cool stuff. Built for the Stanford AI Development and Evaluation Lab.",
        notes: [
            "deployment in progress",
            "1.70mm MPJPE",
            "resnet-50 backbone, faster-rcnn-based keypoint detection model",
        ],
        tags: ["PyTorch", "Python", "Git"],
        date: "2025-09",
    },
    {
        name: "Website",
        githubLink: "https://github.com/alaramartin/website",
        href: "https://alaramartin.com",
        // miniDescription: "ts (this) website",
        description: "ts (this) website",
        notes: [
            "i still don't know how to make it nicer :(",
            "someone pls teach me ui/ux design",
        ],
        tags: [
            "React",
            "NextJS",
            "TailwindCSS",
            "TypeScript",
            "HTMLCSS",
            "whimsy",
        ],
        date: "2025-10",
    },
    {
        name: "Alternate Website",
        githubLink: "https://github.com/alaramartin/alarming-clock",
        href: "https://clock.alaramartin.com",
        miniDescription: "my OTHER personal website",
        description: "a sillier, interactive version of my personal website",
        notes: ["experimenting", "try typing something!"],
        tags: [
            "React",
            "NextJS",
            "TailwindCSS",
            "TypeScript",
            "HTMLCSS",
            "whimsy",
        ],
        date: "2025-11",
    },
    {
        name: "Redirect",
        githubLink: "https://github.com/alaramartin/redirect",
        href: "https://chromewebstore.google.com/detail/redirect-rerouting-your-s/codaengcdkfgecfakjdpclppcpnmoglh",
        miniDescription:
            "Reroute your focus; take control of your screen time.",
        description:
            "A Chrome extension to limit your screen time, track your usage, and redirect you to a more productive website.",
        notes: ["try it out"],
        tags: ["React", "TypeScript", "HTMLCSS", "Chrome_API"],
        date: "2026-07",
    },
];

export const skills: {
    label: string;
    items: {
        id: string;
        skillName: string;
        icon: React.ElementType;
    }[];
}[] = [
    {
        label: "LANGUAGES (and markup)",
        items: [
            { id: "TypeScript", skillName: "TypeScript", icon: FileTsIcon },
            { id: "JavaScript", skillName: "JavaScript", icon: FileJsIcon },
            { id: "Python", skillName: "Python", icon: FilePyIcon },
            { id: "Java", skillName: "Java", icon: CoffeeIcon },
            { id: "HTMLCSS", skillName: "HTML/CSS", icon: CodeIcon },
        ],
    },
    {
        label: "TOOLS, LIBRARIES, AND FRAMEWORKS",
        items: [
            { id: "React", skillName: "React", icon: AtomIcon },
            { id: "NextJS", skillName: "NextJS", icon: TriangleIcon },
            { id: "TailwindCSS", skillName: "TailwindCSS", icon: WindIcon },
            {
                id: "VS_Code_API",
                skillName: "VS Code API",
                icon: PuzzlePieceIcon,
            },
            {
                id: "Chrome_API",
                skillName: "Chrome API",
                icon: GoogleChromeLogoIcon,
            },
            { id: "PyTorch", skillName: "PyTorch", icon: FireIcon },
            { id: "Git", skillName: "Git", icon: GitMergeIcon },
            { id: "whimsy", skillName: "whimsy :)", icon: FlowerIcon },
        ],
    },
];
