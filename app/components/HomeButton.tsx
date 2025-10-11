import React from "react";
import { HouseIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

const HomeButton = () => {
    return (
        <Link
            href="/"
            className="absolute right-0 bottom-0 rounded-full bg-pinkbeige text-darkburgundy border-lightred border-2 p-2 m-6 shadow-xl/20 shadow-lightred"
        >
            <HouseIcon size={36} />
        </Link>
    );
};

export default HomeButton;
