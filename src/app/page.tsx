import Link from "next/link";
import Corners from "./Corners";
import Headline from "./Headline";
import Nav from "./Nav";
import Whale from "./Whale";

export default function Home() {
    return (
        <main className="relative h-dvh overflow-hidden">
            <Whale />
            <Nav />

            <div
                data-whale-avoid
                className="absolute left-8 right-8 top-[32%] md:left-[36%] md:right-auto md:top-[24%]"
            >
                <Headline />
                <p className="mt-6 max-w-md">
                    I study Applied Math and Data Science at UC Berkeley. I also{" "}
                    <Link href="/projects" className="link">
                        build things
                    </Link>{" "}
                    and{" "}
                    <Link href="/hacks" className="link">
                        win hackathons
                    </Link>
                    .
                </p>
            </div>

            <Corners />
        </main>
    );
}
