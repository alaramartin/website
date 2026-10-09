import { mono, serif } from "@/app/ui/fonts";
import NavBar from "./components/NavBar";
import MiniProject from "./components/MiniProject";
import Skill from "./components/Skill";
import Link from "next/link";
import { hackathonProjects, projects, skills } from "@/app/data/info.ts";
import { ArrowCircleRightIcon } from "@phosphor-icons/react/dist/ssr";
import generateMetadataBase from "@/lib/metadata";
import NameCircle from "./components/NameCircle";
import ScrollForMore from "./components/ScrollForMore";
import PhotoCollage from "./components/PhotoCollage";
import type { ReactNode } from "react";

export const metadata = generateMetadataBase({
    description: "My personal website.",
    url: "https://alaramartin.com",
});

// A small heading shared by the proof panels, matching the section headings.
function ProofHeading({ children }: { children: ReactNode }) {
    return (
        <p
            className={`${mono.className} text-3xl pb-1 font-medium text-accent`}
        >
            {children}
        </p>
    );
}

// The one-line intro under each proof heading, so every panel shares the same rhythm.
function ProofSubtitle({ children }: { children: ReactNode }) {
    return <div className="text-bodytext opacity-80 mb-6">{children}</div>;
}

// Proof content keyed by adjective. Server-rendered here, passed to the (client) NameCircle,
// which animates each one into focus on the right as its adjective snaps to focus in the circle.
// newest -> oldest (reverse chronological), matching app/projects/page.tsx. dates are
// month precision (YYYY-MM), so same-month entries keep their info.ts order via the stable sort.
const byNewest = (list: typeof projects) =>
    list
        .filter((p) => p.miniDescription)
        .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );

const miniProjects = byNewest(projects);
const miniHackathonProjects = byNewest(hackathonProjects);

const proofs: Record<string, ReactNode> = {
    "LARA MARTIN": (
        <div className={`${serif.className} text-bodytext`}>
            <ProofHeading>About</ProofHeading>
            <p className="max-w-prose">
                I&apos;m a student at UC Berkeley studying Applied Math and
                learning how to code. Keep scrolling to learn more about me!
            </p>
        </div>
    ),
    programmer: (
        <div className={`${serif.className} text-bodytext flex flex-col`}>
            <ProofHeading>Projects</ProofHeading>
            <ProofSubtitle>Some of my favorites.</ProofSubtitle>
            <div className="flex flex-col divide-y divide-lighthighlight/35">
                {miniProjects.map(
                    (project) =>
                        project.miniDescription && (
                            <div key={project.name}>
                                <MiniProject
                                    name={project.name}
                                    githubLink={project.githubLink}
                                    href={project.href}
                                    description={project.miniDescription!}
                                    tags={project.tags}
                                />
                            </div>
                        ),
                )}
            </div>
            <Link
                className={`${serif.className} select-none text-md self-start inline-flex items-center text-bodytext border border-lighthighlight shadow-sm shadow-lighthighlight/30 hover:shadow-lg hover:shadow-lighthighlight/30 hover:transform hover:-translate-y-px rounded-lg mt-6 py-2 px-3 gap-1 transition-all`}
                href="/projects"
            >
                See all of my projects <ArrowCircleRightIcon size={20} />
            </Link>
        </div>
    ),
    learner: (
        <div className={`${serif.className}`}>
            <ProofHeading>Skills</ProofHeading>
            <ProofSubtitle>I neither know nor think I know.</ProofSubtitle>
            {skills.map((section) => (
                <div key={section.label} className="mb-5">
                    <p className="text-sm tracking-wide text-bodytext/80 mb-2">
                        {section.label}
                    </p>
                    <div className="flex flex-row text-bodytext flex-wrap gap-x-4 gap-y-1">
                        {section.items.map((skill) => (
                            <Skill key={skill.id} id={skill.id} skill={skill} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    ),
    hacker: (
        <div className={`${serif.className} flex flex-col`}>
            <ProofHeading>Hackathons</ProofHeading>
            <ProofSubtitle>
                I&apos;ve been to a few. Even won some. Check them out:
            </ProofSubtitle>
            <div className="flex flex-col divide-y divide-lighthighlight/35">
                {miniHackathonProjects.map((project) => (
                    <div key={project.name}>
                        <MiniProject
                            name={project.name}
                            githubLink={project.githubLink}
                            href={project.href}
                            description={project.miniDescription!}
                            tags={project.tags}
                        />
                    </div>
                ))}
            </div>
        </div>
    ),
    "girl who codes": (
        <div className={`${serif.className}`}>
            <ProofHeading>Girls Who Code</ProofHeading>
            <ProofSubtitle>
                I found a community in tech through Girls Who Code and{" "}
                <span>
                    <Link href="" className="link">
                        ran a free program
                    </Link>
                </span>{" "}
                to teach elementary school girls in my city how to code.
            </ProofSubtitle>
        </div>
    ),
    // reader: (
    //     <div className={`${serif.className}`}>
    //         <ProofHeading>Books I've Read</ProofHeading>
    //         <div className="text-bodytext -mt-2 mb-2">
    //             I read. Then I write.{" "}
    //             <span>
    //                 <Link href="/writing" className="link">
    //                     See my informal log
    //                 </Link>
    //             </span>{" "}
    //             of books I've read, my thoughts on them, and my recommendations.
    //         </div>
    //     </div>
    // ),
    photographer: (
        <div className={`${serif.className}`}>
            <ProofHeading>Photography</ProofHeading>
            <ProofSubtitle>Need bigger lens.</ProofSubtitle>
            <PhotoCollage catOrPhoto="photo" landscape={true} />
        </div>
    ),
    "cat lover": (
        <div className={`${serif.className}`}>
            <ProofHeading>Cats</ProofHeading>
            <ProofSubtitle>
                Since I can&apos;t paste half my camera roll here, here are just
                a few of the cats I know.
            </ProofSubtitle>
            <PhotoCollage catOrPhoto="cat" landscape={false} />
        </div>
    ),
    // "sweet treat lover": (
    //     <ProofPlaceholder
    //         icon={<IceCreamIcon size={28} />}
    //         title="Sweet Treats"
    //         blurb="A running log of the best desserts I've found (and baked)."
    //     />
    // ),
};

// Shown beside the lingering final ALARA MARTIN (after the circle has made its full rotation).
const outro = (
    <div className={`${serif.className} text-bodytext`}>
        <p className={`text-2xl ${mono.className} text-accent`}>
            that&apos;s me :)
        </p>
        <p className="pt-3">
            Feel free to{" "}
            <Link href="/contact" className="link">
                say hi
            </Link>{" "}
            or{" "}
            <Link href="/projects" className="link">
                see my projects
            </Link>
            .
        </p>
    </div>
);

export default function Home() {
    return (
        <div className="change-bg scroll-smooth">
            <NavBar />
            <div className="absolute h-screen">
                <ScrollForMore />
            </div>

            {/* The hero (tall scroll container + sticky circle + proof stage) now lives inside
          NameCircle so it can own its own scroll source and snap markers. */}
            <NameCircle proofs={proofs} outro={outro} />

            {/* Mobile content stack: the proof stage inside NameCircle is md+ only (phones are
          too narrow to show an adjective next to its proof), so on mobile the circle shows
          adjectives only and the core content (About, Projects, Skills, Hackathons) lives
          here. Built from the SAME `proofs` map so it stays in sync with the desktop
          proofs, and kept in the same order as TITLES in NameCircle. */}
            <section className={`md:hidden px-6 pb-16 ${serif.className}`}>
                {["LARA MARTIN", "programmer", "learner", "hacker"].map(
                    (key, index) => (
                        <div key={key}>
                            {index !== 0 && (
                                <div className="border-t border-lighthighlight/65 my-8" />
                            )}
                            {proofs[key]}
                        </div>
                    ),
                )}
            </section>
        </div>
    );
}
