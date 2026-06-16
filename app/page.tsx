import { italiana, mono, serif } from "@/app/ui/fonts";
import NavBar from "./components/NavBar";
import MiniProject from "./components/MiniProject";
import Skill from "./components/Skill";
import Link from "next/link";
import { projects, skills } from "@/app/data/info.ts";
import { ArrowCircleRightIcon } from "@phosphor-icons/react/dist/ssr";
import generateMetadataBase from "@/lib/metadata";
import NameCircle from "./components/NameCircle";
import ScrollForMore from "./components/ScrollForMore";

export const metadata = generateMetadataBase({
  description: "My personal website.",
  url: "https://alaramartin.com",
});

export default function Home() {
  return (
    <div className="change-bg scroll-smooth">
      <NavBar />
      <div className="absolute h-screen">
        <ScrollForMore />
      </div>
      <div
        data-scroll-hero="350"
        className={`h-[350vh] ${italiana.className} antialiased relative select-none`}
      >
        <div className="sticky top-0 h-screen">
          <NameCircle />
        </div>
      </div>
      <div className={`pt-18 lg:px-26`}>
        <div className="flex flex-row">
          <div className="flex flex-col pl-4 md:pl-14">
            <p
              className={`${mono.className} text-4xl pb-4 font-medium text-accent`}
            >
              About
            </p>
          </div>
        </div>
        <div
          className={`w-full text-bodytext md:pl-20 px-8 ${serif.className}`}
        >
          I&apos;m a student at UC Berkeley studying Applied Math and learning
          how to code. Read on to see my skills and projects. Feel free to{" "}
          <span>
            <Link href="/contact" className="link">
              contact me
            </Link>
          </span>
          !
        </div>

        <div className="flex flex-row pt-18">
          <div className="flex flex-col pl-4 md:pl-14">
            <p
              className={`${mono.className} text-4xl pb-4 font-medium text-accent`}
            >
              Projects
            </p>
            <p className={`${serif.className} pb-2 inline-flex text-bodytext`}>
              Some of my favorites.
            </p>
          </div>
        </div>
        <div className="flex flex-col px-6 md:px-16 w-full">
          {projects.map((project, index) => {
            // only show the ones that have a miniDescription or playable URL-- those are the ones that are meant to be displayed on the homepage
            if (!project.miniDescription) return;

            return (
              <div key={project.name} className={`${serif.className}`}>
                <MiniProject
                  name={project.name}
                  githubLink={project.githubLink}
                  href={project.href}
                  description={project.miniDescription}
                  year={project.year}
                  tags={project.tags}
                ></MiniProject>
                {index != projects.length - 1 && (
                  <div className="border-t border-lighthighlight/65 my-1"></div>
                )}
              </div>
            );
          })}
        </div>
        <div className="w-full text-center">
          <Link
            className={`${serif.className} text-md justify-center inline-flex items-center text-bodytext border border-lighthighlight shadow-sm shadow-lighthighlight/30 hover:shadow-lg hover:shadow-lighthighlight/30 hover:transform hover:-translate-y-px rounded-lg m-6 py-2 px-3 gap-1 transition-all`}
            href="/projects"
          >
            See all of my projects <ArrowCircleRightIcon size={20} />
          </Link>
        </div>

        <div className="pt-18 flex flex-row pb-4">
          <div className="flex flex-col pl-4 md:pl-14">
            <p className={`${mono.className} text-4xl font-medium text-accent`}>
              Skills
            </p>
          </div>
        </div>
        <div className={`w-full px-6 md:px-16 ${serif.className}`}>
          {skills.map((section) => (
            <div key={section.label} className="mb-6">
              <p className="text-sm tracking-wide text-bodytext/80 mb-3">
                {section.label}
              </p>

              <div className="flex flex-row text-bodytext px-4 flex-wrap max-md:justify-center">
                {section.items.map((skill) => (
                  <div key={skill.id} className="inline-block w-max px-4">
                    <Skill id={skill.id} skill={skill} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
