import { mono, serif } from "@/app/ui/fonts";
import NavBar from "./components/NavBar";
import MiniProject from "./components/MiniProject";
import Skill from "./components/Skill";
import Link from "next/link";
import { projects, skills } from "@/app/data/info.ts";
import {
    ArrowCircleRightIcon,
    CodeIcon,
    MountainsIcon,
    CatIcon,
    IceCreamIcon,
} from "@phosphor-icons/react/dist/ssr";
import generateMetadataBase from "@/lib/metadata";
import NameCircle from "./components/NameCircle";
import ScrollForMore from "./components/ScrollForMore";
import PhotoCollage from "./components/proofs/PhotoCollage";
import ProofPlaceholder from "./components/proofs/ProofPlaceholder";
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
                learning how to code. Keep scrolling to see my skills and
                projects. Feel free to{" "}
                <Link href="/contact" className="link">
                    contact me
                </Link>
                !
            </p>
        </div>
    ),
    programmer: (
        <div className={`${serif.className} text-bodytext`}>
            <ProofHeading>Projects</ProofHeading>
            <div className="flex flex-col">
                {miniProjects.map((project, index) => (
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
                ))}
            </div>
        </div>
    ),
    learner: (
        <div className={`${serif.className}`}>
            <ProofHeading>Skills</ProofHeading>
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
        <ProofPlaceholder
            icon={<CodeIcon size={28} />}
            title="Girls Who Code"
            blurb="Projects, workshops, and the community I built through Girls Who Code."
        />
    ),
    photographer: (
        <div>
            <ProofHeading>Photography</ProofHeading>
            <PhotoCollage />
        </div>
    ),
    "rock climber": (
        <ProofPlaceholder
            icon={<MountainsIcon size={28} />}
            title="Rock Climbing"
            blurb="Bouldering and top-rope — projects on the wall, sends in progress."
        />
    ),
    "cat petter": (
        <ProofPlaceholder
            icon={<CatIcon size={28} />}
            title="Cat Petter"
            blurb="Certified cat enthusiast. Photos of feline friends incoming."
        />
    ),
    "sweet treat lover": (
        <ProofPlaceholder
            icon={<IceCreamIcon size={28} />}
            title="Sweet Treats"
            blurb="A running log of the best desserts I've found (and baked)."
        />
    ),
};

// Shown beside the lingering final ALARA MARTIN (after the circle has made its full rotation).
const outro = (
    <div className={`${serif.className} text-bodytext`}>
        <p className="text-2xl">you&apos;ve seen the whole circle now :)</p>
        <p className="pt-3">
            if you scrolled this far, we&apos;re practically friends.{" "}
            <Link href="/contact" className="link">
                come say hi
            </Link>{" "}
            or{" "}
            <Link href="/projects" className="link">
                poke around my projects
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

            {/* Currently — placeholder for now; fill in later. */}
            <div className="pt-24 lg:px-26">
                <div className="flex flex-col pl-4 md:pl-14">
                    <p
                        className={`${mono.className} text-4xl pb-4 font-medium text-accent`}
                    >
                        Currently
                    </p>
                </div>
                <div
                    className={`w-full text-bodytext md:pl-20 px-8 ${serif.className}`}
                >
                    <ul className="space-y-1">
                        <li>
                            <span className="opacity-60">building:</span>{" "}
                            [coming soon]
                        </li>
                        <li>
                            <span className="opacity-60">reading:</span> [coming
                            soon]
                        </li>
                        <li>
                            <span className="opacity-60">listening to:</span>{" "}
                            [coming soon]
                        </li>
                    </ul>
                </div>
            </div>

            {/* Closing CTA card */}
            <div className="w-full flex justify-center px-8 py-20">
                <div
                    className={`${serif.className} text-bodytext border border-lighthighlight shadow-sm shadow-lighthighlight/30 rounded-2xl px-8 py-8 max-w-xl text-center`}
                >
                    <p className="text-lg pb-5">like what you see?</p>
                    <div className="flex flex-wrap gap-3 justify-center">
                        <Link
                            href="/projects"
                            className="inline-flex items-center gap-1 border border-lighthighlight shadow-sm shadow-lighthighlight/30 hover:shadow-lg hover:shadow-lighthighlight/30 hover:-translate-y-px rounded-lg py-2 px-3 transition-all"
                        >
                            See all my projects{" "}
                            <ArrowCircleRightIcon size={20} />
                        </Link>
                        <Link
                            href="/contact"
                            className="inline-flex items-center gap-1 border border-lighthighlight shadow-sm shadow-lighthighlight/30 hover:shadow-lg hover:shadow-lighthighlight/30 hover:-translate-y-px rounded-lg py-2 px-3 transition-all"
                        >
                            Say hi
                        </Link>
                    </div>
                </div>
            </div>

            {/* ---------------------------------------------------------------------------
          Old static About / Projects / Skills section — commented out for now (its
          content now lives in the rotating proofs above). Kept here for reference /
          easy restore.
      ----------------------------------------------------------------------------
      <div className={`pt-18 lg:px-26`}>
        <div className="flex flex-row">
          <div className="flex flex-col pl-4 md:pl-14">
            <p className={`${mono.className} text-4xl pb-4 font-medium text-accent`}>About</p>
          </div>
        </div>
        <div className={`w-full text-bodytext md:pl-20 px-8 ${serif.className}`}>
          I'm a student at UC Berkeley studying Applied Math and learning how to code. Read on to
          see my skills and projects. Feel free to <Link href="/contact" className="link">contact me</Link>!
        </div>
        ...Projects list (MiniProject) + "See all of my projects" CTA + Skills list...
      </div>
      --------------------------------------------------------------------------- */}
        </div>
    );
}
