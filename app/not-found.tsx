import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { lato, italiana } from "./ui/fonts";
import {
    SmileySadIcon,
    HouseIcon,
    ArrowSquareInIcon,
} from "@phosphor-icons/react/dist/ssr";
import BugCatcherGame from "./components/BugCatcherGame";

export const metadata: Metadata = {
    title: "404 Not Found",
    description: "The page you are looking for does not exist :(",
};

const NotFound = () => {
    return (
        <main
            className={`${lato.className} min-h-screen flex flex-col items-center justify-center gap-8 select-none`}
        >
            <div className="text-center">
                <h1 className={`${italiana.className} font-extrabold text-9xl`}>
                    404
                </h1>
                <p className="mt-4 flex items-center justify-center gap-1">
                    Page Not Found <SmileySadIcon size={26} />
                </p>
            </div>
            <Link
                href="/"
                className="flex items-center border-2 border-lightred rounded-xl p-3 gap-2 hover:bg-lightred/20 transition-all duration-200"
            >
                <HouseIcon size={22} />
                Return to Homepage
            </Link>
            <div className="text-center italic">
                <p>If you think this was a mistake, feel free to </p>
                <Link
                    href="/contact"
                    className="underline hover:bg-lightred/30 p-2 rounded-lg inline-flex items-center transition-all duration-200"
                >
                    contact me <ArrowSquareInIcon className="p-1" size={20} />
                </Link>
            </div>
            <div className="mt-4">
                <p className="text-center mb-2">or... play a game!</p>
                <BugCatcherGame />
            </div>
        </main>
    );
};

export default NotFound;
