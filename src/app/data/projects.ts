// The /projects page.
// Data carried over from me.alaramartin.com (github.com/alaramartin/website-plain, app/data/info.ts).

export type Link = { label: string; href: string };

export type Project = {
    name: string;
    // "YYYY-MM"; mostly the repo's created_at month
    date: string;
    description: string;
    stack: string[];
    github: string;
    // where it runs: a site, the chrome web store, the vs code marketplace
    live?: Link;
    // an x / linkedin post about it
    post?: Link;
    // set for hackathon builds
    hackathon?: { event: string; result?: string };
};

// Newest first; ties keep the order they're listed in.
export const PROJECTS: Project[] = [
    {
        name: "Yet Another Personal Website",
        date: "2026-10",
        description: "My current personal website.",
        stack: ["React", "NextJS", "TailwindCSS", "TypeScript", "HTML/CSS"],
        github: "https://github.com/alaramartin/website",
        live: {
            label: "alaramartin.com",
            href: "https://alaramartin.com",
        },
    },
    // hackathon projects: hidden from the projects pages for now (they live on /hacks)
    /*
    {
        name: "Tab",
        date: "2026-10",
        description:
            "Autocomplete for your entire Mac. It predicts your next action and pays in one keypress on Tempo.",
        stack: ["TypeScript", "HTML/CSS"],
        github: "https://github.com/alaramartin/paradigmhacks",
        post: {
            label: "x",
            href: "https://x.com/alara_martin_/status/2110875781819928838",
        },
        hackathon: { event: "Paradigm Frontiers" },
    },
    {
        name: "Cash Cow",
        date: "2026-10",
        description:
            "An accountability platform where you stake AUSD on your own deadlines and other people bet on the outcome. AI agents check GitHub and Canvas to see if the task got done.",
        stack: ["Solidity"],
        github: "https://github.com/cabbles/b-bhacks",
        hackathon: { event: "B@BHacks 2.0", result: "2nd most creative" },
    },
    {
        name: "ORIGIN",
        date: "2026-09",
        description:
            "A root-cause analysis agent for GPU cluster failures that builds a dependency graph from raw telemetry. Beat the sponsor's solution at $0 inference cost.",
        stack: ["Python", "Docker"],
        github: "https://github.com/alaramartin/mantisgridhacks",
        post: { label: "linkedin", href: "https://lnkd.in/p/gX2muBUr" },
        hackathon: {
            event: "MantisGrid AI Infra",
            result: "1st place grand prize",
        },
    },
    {
        name: "SafePath",
        date: "2026-09",
        description:
            "Renders any walking route as night-time video, fusing OpenStreetMap routing, Mapillary imagery, streetlight outages and weather.",
        stack: ["TypeScript", "React", "NextJS", "Python", "HTML/CSS"],
        github: "https://github.com/alaramartin/viskohacks",
        post: {
            label: "x",
            href: "https://x.com/alara_martin_/status/2098924619831161147",
        },
        hackathon: { event: "Live Models (Visko x Reactor)", result: "2nd place" },
    },
    */
    {
        name: "Redirect",
        date: "2026-07",
        description:
            "A Chrome extension to limit your screen time, track your usage, and redirect you to a more productive website.",
        stack: ["React", "TypeScript", "HTML/CSS", "Chrome API"],
        github: "https://github.com/alaramartin/redirect",
        live: {
            label: "chrome web store",
            href: "https://chromewebstore.google.com/detail/redirect-rerouting-your-s/codaengcdkfgecfakjdpclppcpnmoglh",
        },
    },
    /*
    {
        name: "UX-Agent",
        date: "2026-05",
        description:
            "An agent pipeline that watches real PostHog feature analytics and ships UI updates on its own, based on what users actually do.",
        stack: ["TypeScript", "React", "NextJS", "TailwindCSS", "Python", "HTML/CSS"],
        github: "https://github.com/AzizAkturin/TeamSnorlax-UX-Agent",
        hackathon: { event: "Nozomio", result: "best use of tensorlake" },
    },
    */
    {
        name: "Alternate Website",
        date: "2025-11",
        description: "A sillier, interactive version of my personal website.",
        stack: ["React", "NextJS", "TailwindCSS", "TypeScript", "HTML/CSS"],
        github: "https://github.com/alaramartin/alarming-clock",
        live: {
            label: "clock.alaramartin.com",
            href: "https://clock.alaramartin.com",
        },
    },
    {
        name: "Website",
        date: "2025-10",
        description: "My first ever personal website.",
        stack: ["React", "NextJS", "TailwindCSS", "TypeScript", "HTML/CSS"],
        github: "https://github.com/alaramartin/website-plain",
        live: { label: "me.alaramartin.com", href: "https://me.alaramartin.com" },
    },
    {
        name: "HIPSTER-AI",
        date: "2025-09",
        description:
            "Computer vision model for X-ray QA. Built for the Stanford AI Development and Evaluation Lab.",
        stack: ["PyTorch", "Python", "Git"],
        github: "https://github.com/stanfordaide/hipster-ai",
    },
    {
        name: "PKL Viewer",
        date: "2025-08",
        description:
            "View Python pickle (.pkl) files directly in the VS Code editor, quickly and safely.",
        stack: [
            "TypeScript",
            "Python",
            "VS Code API",
            "HTML/CSS",
            "JavaScript",
        ],
        github: "https://github.com/alaramartin/pkl-viewer",
        live: {
            label: "vs code marketplace",
            href: "https://marketplace.visualstudio.com/items?itemName=alarm.pkl-viewer",
        },
    },
    {
        name: "DICOM Viewer",
        date: "2025-08",
        description:
            "View DICOM images and edit metadata side-by-side, right in your VS Code editor.",
        stack: ["TypeScript", "JavaScript", "VS Code API", "HTML/CSS"],
        github: "https://github.com/alaramartin/dicom-viewer",
        live: {
            label: "vs code marketplace",
            href: "https://marketplace.visualstudio.com/items?itemName=alarm.dicom-viewer",
        },
    },
    {
        name: "AP Score Reveal",
        date: "2025-07",
        description:
            "Chrome extension that hides AP scores until clicked and plays custom sounds and animations for each reveal.",
        stack: ["TypeScript", "React", "Chrome API", "HTML/CSS", "TailwindCSS"],
        github: "https://github.com/alaramartin/ap-score-cover",
        live: {
            label: "chrome web store",
            href: "https://chromewebstore.google.com/detail/ap%C2%AE-exam-score-reveal/mhjggldhegkdodlneehpkhpjbgmpohak",
        },
    },
];

// "2025-10" → "oct 2025"
export const formatDate = (date: string) =>
    new Date(`${date}-01T00:00:00Z`)
        .toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
            timeZone: "UTC",
        })
        .toLowerCase();

// github first, then wherever it runs, then the post
export const linksOf = (p: Project): Link[] => [
    { label: "github", href: p.github },
    ...(p.live ? [p.live] : []),
    ...(p.post ? [p.post] : []),
];
