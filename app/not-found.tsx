import React from "react";
import Link from "next/link";
import { serif, italiana } from "./ui/fonts";
import {
    SmileySadIcon,
    HouseIcon,
    ArrowSquareInIcon,
    ArrowFatLineDownIcon,
} from "@phosphor-icons/react/dist/ssr";
import BugCatcherGame from "./components/BugCatcherGame";
import DarkModeToggle from "./components/DarkModeToggle";
import NavBar from "./components/NavBar";
import generateMetadataBase from "@/lib/metadata";

export const metadata = generateMetadataBase({
    title: "404 Not Found",
    description: "Error :(",
});

const NotFound = () => {
    return (
        <>
            <main
                className={`${serif.className} h-screen relative flex flex-col items-center justify-center gap-8 select-none bg-pinkbeige dark:bg-darkburgundy`}
            >
                <NavBar />
                <DarkModeToggle />
                <div className="text-center">
                    <h1
                        className={`${italiana.className} font-extrabold text-9xl`}
                    >
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
                        contact me{" "}
                        <ArrowSquareInIcon className="p-1" size={20} />
                    </Link>
                </div>
                <div className="mt-4 bottom-0 absolute">
                    <p className="text-center mb-6 inline-flex items-center gap-1">
                        or... play a game!{" "}
                        <ArrowFatLineDownIcon
                            size={26}
                            className="arrow-bounce"
                        />
                    </p>
                </div>
            </main>
            <BugCatcherGame />
        </>
    );
};

export default NotFound;
