import React from "react";
import Image from "next/image";
import Link from "next/link";

const LinkedIcon = ({
    href,
    imageSrc,
    alt,
}: {
    href: string;
    imageSrc: string;
    alt: string;
}) => {
    return (
        <div className="px-2">
            <Link href={href} target="_blank">
                <Image src={imageSrc} alt={alt} width={20} height={20}></Image>
            </Link>
        </div>
    );
};

const LinksBar = () => {
    return (
        <div className="border-2 border-red-200 bg-[#E2CFC5] rounded-4xl m-4 p-4 absolute bottom-0 flex flex-row shadow-xl/20 shadow-[#E2CFC5]">
            <LinkedIcon
                href="https://github.com/alaramartin"
                imageSrc="/github.svg"
                alt="GitHub"
            ></LinkedIcon>
            <LinkedIcon
                href="https://linkedin.com/in/alara-martin"
                imageSrc="/linkedin.svg"
                alt="LinkedIn"
            ></LinkedIcon>
            <LinkedIcon
                href="https://marketplace.visualstudio.com/publishers/alarm"
                imageSrc="/microsoft.png"
                alt="VS Code Marketplace"
            ></LinkedIcon>
        </div>
    );
};

export default LinksBar;
