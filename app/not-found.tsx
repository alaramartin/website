import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { lato, italiana } from "./ui/fonts";
import {
    SmileySadIcon,
    HouseIcon,
    ArrowSquareInIcon,
} from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
    title: "404 Not Found",
    description: "The page you are looking for does not exist :(",
};

/* todo: add dinosaur game or something to the page for funsies 

game idea: catch the falling bugs
use arrows to move left or right while bugs fall from the sky randomly
if caught, then get a point.
if not caught, then lose
***have warnings and fatal errors. warnings = 3 makes you lose. fatal errors = lose after 1.
*/

// todo: add a "if you think this was a msitake, feel free to contact me" and link to contact page

const NotFound = () => {
    return (
        <main
            className={`${lato.className} absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 select-none`}
        >
            <div className="place-items-center cursor-default">
                <h1 className={`${italiana.className} font-extrabold text-9xl`}>
                    404
                </h1>
                <p className="mt-5 flex items-center">
                    Page Not Found <SmileySadIcon className="p-1" size={32} />
                </p>
            </div>
            <Link
                href="/"
                className="flex items-center border-2 border-lightred rounded-xl m-8 p-3 gap-2 hover:bg-lightred/20 transition-all duration-200 cursor-pointer"
            >
                <HouseIcon size={22} />
                Return to Homepage
            </Link>
            <div className="absolute text-center whitespace-nowrap italic">
                <p>If you think this was a mistake, feel free to </p>
                <Link
                    href="/contact"
                    className="underline hover:bg-lightred/30 p-2 rounded-lg items-center inline-flex transition-all duration-200"
                >
                    contact me <ArrowSquareInIcon className="p-1" size={28} />
                </Link>
            </div>
        </main>
    );
};

export default NotFound;
