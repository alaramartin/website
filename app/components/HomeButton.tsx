import React from "react";
import { HouseIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

const HomeButton = () => {
    return (
        <Link
            href="/"
            className="select-none fixed inline-flex items-center gap-2 right-0 bottom-0 rounded-full bg-pinkbeige text-darkburgundy border-lightred border-1 p-3 m-6 shadow-xl/20 shadow-lightred hover:scale-102 hover:-translate-y-0.5 hover:shadow-xl/25 transition-all duration-200"
        >
            <HouseIcon size={24} />
            Back to Home
        </Link>
    );
};

export default HomeButton;
