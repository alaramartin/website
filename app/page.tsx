import { mono, serif } from "@/app/ui/fonts";
import NavBar from "./components/NavBar";
import MiniProject from "./components/MiniProject";
import Skill from "./components/Skill";
import Link from "next/link";
import { projects, skills } from "@/app/data/info.ts";
import { ArrowCircleRightIcon } from "@phosphor-icons/react/dist/ssr";
import generateMetadataBase from "@/lib/metadata";
import NameCircle from "./components/NameCircle";
import ScrollForMore from "./components/ScrollForMore";
import PhotoCollage from "./components/proofs/PhotoCollage";
import type { ReactNode } from "react";

export const metadata = generateMetadataBase({
    description: "My personal website.",
    url: "https://alaramartin.com",
});

// A small heading shared by the proof panels, matching the section headings.
function ProofHeading({ children }: { children: ReactNode }) {
    return (
        <p
            className={`${mono.className} text-3xl pb-4 font-medium text-accent`}
        >
            {children}
        </p>
    );
}

// Proof content keyed by adjective. Server-rendered here, passed to the (client) NameCircle,
// which animates each one into focus on the right as its adjective snaps to focus in the circle.
const miniProjects = projects.filter((p) => p.miniDescription);

const proofs: Record<string, ReactNode> = {
    "LARA MARTIN": (
        <div className={`${serif.className} text-bodytext`}>
            <ProofHeading>About</ProofHeading>
            <p>
                I&apos;m a student at UC Berkeley studying Applied Math and
                learning how to code. Keep scrolling to learn more about me!
            </p>
        </div>
    ),
    programmer: (
        <div className={`${serif.className} text-bodytext flex flex-col`}>
            <ProofHeading>Projects</ProofHeading>
            <div className="-mt-2 mb-2">Some of my favorites.</div>
            <div className="flex flex-col md:-ml-6">
                {miniProjects.map(
                    (project, index) =>
                        project.miniDescription && (
                            <div key={project.name}>
                                <MiniProject
                                    name={project.name}
                                    githubLink={project.githubLink}
                                    href={project.href}
                                    description={project.miniDescription!}
                                    year={project.year}
                                    tags={project.tags}
                                />
                                {index !== miniProjects.length - 1 && (
                                    <div className="border-t border-lighthighlight/65 my-1" />
                                )}
                            </div>
                        ),
                )}
            </div>
            <Link
                className={`${serif.className} select-none text-md self-center justify-center inline-flex items-center text-bodytext border border-lighthighlight shadow-sm shadow-lighthighlight/30 hover:shadow-lg hover:shadow-lighthighlight/30 hover:transform hover:-translate-y-px rounded-lg m-6 py-2 px-3 gap-1 transition-all`}
                href="/projects"
            >
                See all of my projects <ArrowCircleRightIcon size={20} />
            </Link>
        </div>
    ),
    learner: (
        <div className={`${serif.className}`}>
            <ProofHeading>Skills</ProofHeading>
            <div className="-mt-2 mb-4 text-bodytext">
                I neither know nor think I know.
            </div>
            {skills.map((section) => (
                <div key={section.label} className="mb-5">
                    <p className="text-sm tracking-wide text-bodytext/80 mb-2">
                        {section.label}
                    </p>
                    <div className="flex flex-row text-bodytext flex-wrap">
                        {section.items.map((skill) => (
                            <div
                                key={skill.id}
                                className="inline-block w-max px-3"
                            >
                                <Skill id={skill.id} skill={skill} />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    ),
    "girl who codes": (
        <div className={`${serif.className} translate-y-2`}>
            <ProofHeading>Girls Who Code.</ProofHeading>
            <div className="text-bodytext -mt-2 mb-2">
                I found a community through Girls Who Code, and gave back by
                creating a free program for local elementary school girls to
                learn how to code without the barriers I encountered at [website
                coming soon].
            </div>
        </div>
    ),
    reader: (
        <div className={`${serif.className}`}>
            <ProofHeading>Books I've Read</ProofHeading>
            <div className="text-bodytext -mt-2 mb-2">
                I read. Then I write.{" "}
                <span>
                    <Link href="/blog" className="link">
                        See my informal log
                    </Link>
                </span>{" "}
                of books I've read, my thoughts on them, and my recommendations.
            </div>
        </div>
    ),
    photographer: (
        <div className={`${serif.className} translate-y-2`}>
            <ProofHeading>My Photography</ProofHeading>
            <div className="text-bodytext -mt-2 mb-2">Need bigger lens.</div>
            <PhotoCollage catOrPhoto="photo" />
        </div>
    ),
    "cat lover": (
        <div className={`${serif.className} translate-y-2`}>
            <ProofHeading>I love cats.</ProofHeading>
            <div className="text-bodytext -mt-2 mb-2">
                Since I can't paste half my camera roll here, here are just a
                few of the cats I know.
            </div>
            <PhotoCollage catOrPhoto="cat" />
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
          adjectives only and the core content (About, Projects, Skills) lives here. Built
          from the SAME `proofs` map so it stays in sync with the desktop proofs. */}
            <section className={`md:hidden px-6 pb-16 ${serif.className}`}>
                {["LARA MARTIN", "programmer", "learner"].map((key, index) => (
                    <div key={key}>
                        {index !== 0 && (
                            <div className="border-t border-lighthighlight/65 my-8" />
                        )}
                        {proofs[key]}
                    </div>
                ))}
            </section>
        </div>
    );
}
