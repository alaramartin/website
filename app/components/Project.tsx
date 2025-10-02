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
    tags?: string[];
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
            className={`${lato.className} antialiased border-2 border-[#d58789] bg-[#E2CFC5] rounded-2xl m-4 p-4 shadow-xl/20 shadow-[#d58789] relative`}
        >
            <p className="text-xl font-extrabold pb-2">{name}</p>
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
                        <p key={tag} className="inline-block rounded-lg p-2">
                            {tag}
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Project;
