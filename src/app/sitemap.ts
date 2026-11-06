import type { MetadataRoute } from "next";
import { PROJECTS } from "./data/projects";
import { HACKS } from "./hacks/hacks";
import { SITE_URL } from "./site";

// "2026-10" or "2026-10-12" → the newest one as a Date
const newest = (dates: string[]) =>
    new Date(
        dates
            .map((d) => (d.length === 7 ? `${d}-01` : d))
            .sort()
            .at(-1)!,
    );

export default function sitemap(): MetadataRoute.Sitemap {
    const projects = newest(PROJECTS.map((p) => p.date));
    const hacks = newest(HACKS.map((h) => h.date));
    return [
        {
            url: SITE_URL,
            lastModified: projects > hacks ? projects : hacks,
            priority: 1,
        },
        { url: `${SITE_URL}/projects`, lastModified: projects, priority: 0.8 },
        { url: `${SITE_URL}/hacks`, lastModified: hacks, priority: 0.8 },
        { url: `${SITE_URL}/contact`, priority: 0.5 },
    ];
}
