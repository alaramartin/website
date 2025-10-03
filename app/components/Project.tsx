import React from "react";
import { lato } from "@/app/ui/fonts";
import {
    GithubLogoIcon,
    ArrowSquareOutIcon,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

const Tag = () => {};

interface ProjectProps {
    name: string;
    githubLink: string;
    href?: string;
    description: string;
    tags?: { skill: string; icon?: any }[];
}

const Project = ({
    name,
    githubLink,
    href,
    description,
    tags,
}: ProjectProps) => {
    return (
        <div
            className={`${lato.className} antialiased border-2 border-lightred bg-pinkbeige rounded-2xl mx-15 my-6 p-4 shadow-xl/20 shadow-lightred relative place-content-center`}
        >
            <p className="text-xl font-extrabold py-2">{name}</p>
            <Link
                href={githubLink}
                target="_blank"
                className="inline-block absolute top-2 right-2 hover:bg-[#c5b6ad] rounded-lg p-2"
            >
                <GithubLogoIcon size={20} />
            </Link>
            <p>{description}</p>
            {href && (
                <Link
                    href={href}
                    target="_blank"
                    className="inline-flex items-center hover:bg-[#c5b6ad] rounded-lg p-1.5 gap-1 underline"
                >
                    Try it out! <ArrowSquareOutIcon />
                </Link>
            )}
            {tags && (
                <div className="mt-2">
                    {tags.map((tag) => (
                        <div
                            key={tag.skill}
                            className="inline-block border-1 border-lightred rounded-lg mx-2 my-2 p-2"
                        >
                            {tag.icon ? tag.icon : tag.skill}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Project;
