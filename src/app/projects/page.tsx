import type { Metadata } from "next";
import Corners from "../Corners";
import Nav from "../Nav";
import { PROJECTS } from "../data/projects";
import Row from "./Row";

export const metadata: Metadata = {
    title: "Projects",
    description: "Software Alara Martin has built, with stacks and links to code.",
    alternates: { canonical: "/projects" },
};

export default function Projects() {
    return (
        <main className="relative h-dvh overflow-hidden">
            <h1 className="sr-only">Projects</h1>
            <div className="feed-fade no-scrollbar absolute inset-0 overflow-y-auto">
                <div className="mx-auto max-w-2xl px-8 pt-24 pb-24 sm:pt-20">
                    <ul>
                        {PROJECTS.map((p) => (
                            <Row key={p.name} project={p} />
                        ))}
                    </ul>
                </div>
            </div>
            <Nav />
            <Corners />
        </main>
    );
}
