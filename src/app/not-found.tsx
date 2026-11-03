import type { Metadata } from "next";
import Link from "next/link";
import Corners from "./Corners";
import Nav from "./Nav";
import Whale from "./Whale";

export const metadata: Metadata = {
    title: "404 · Alara Martin",
};

// Same frame as the homepage, with just the 404 in the middle. It sits a little above true
// centre (top 45%) because the navbar weighs down the top and makes dead centre look low.
export default function NotFound() {
    return (
        <main className="relative h-dvh overflow-hidden">
            <Whale />
            <Nav />

            <div
                data-whale-avoid
                className="absolute left-1/2 top-[45%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            >
                <h1
                    className="leading-none"
                    style={{ fontSize: "clamp(2.5rem, min(10vh, 12.5vw), 5.5rem)" }}
                >
                    404
                </h1>
                <Link href="/" className="link mt-4">
                    go home
                </Link>
            </div>

            <Corners />
        </main>
    );
}
