import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import "./ui/globals.css";
import { lato, italiana } from "./ui/fonts";
import { SmileySadIcon, HouseIcon } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
    title: "404 Not Found",
    description: "The page you are looking for does not exist :(",
};

// todo: add dinosaur game or something to the page for funsies

const GlobalNotFound = () => {
    return (
        <html lang="en">
            <body
                className={`${lato.className} absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}
            >
                <div className="place-items-center">
                    <SmileySadIcon size={50} />
                    <h1
                        className={`${italiana.className} font-extrabold text-9xl`}
                    >
                        404
                    </h1>
                    <p className="mt-5">Page Not Found</p>
                </div>
                <Link
                    href="https://alaramartin.vercel.app"
                    className="flex items-center border-2 border-lightred rounded-xl m-10 p-3 gap-2 hover:bg-lightred/20 transition-all duration-300 cursor-pointer"
                >
                    <HouseIcon size={22} />
                    Return to Homepage
                </Link>
            </body>
        </html>
    );
};

export default GlobalNotFound;
