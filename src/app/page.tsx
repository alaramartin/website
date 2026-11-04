import type { Metadata } from "next";
import Link from "next/link";
import Corners from "./Corners";
import Headline from "./Headline";
import Nav from "./Nav";
import Whale from "./Whale";
import { SITE_URL, SOCIAL_URLS } from "./site";

export const metadata: Metadata = {
    alternates: { canonical: "/" },
};

// Tells search engines who the site is about and which profiles are the same person.
const JSON_LD = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "Person",
            "@id": `${SITE_URL}/#person`,
            name: "Alara Martin",
            url: SITE_URL,
            image: `${SITE_URL}/opengraph-image.png`,
            jobTitle: "Student",
            affiliation: {
                "@type": "CollegeOrUniversity",
                name: "University of California, Berkeley",
            },
            sameAs: SOCIAL_URLS,
        },
        {
            "@type": "WebSite",
            name: "Alara Martin",
            url: SITE_URL,
            author: { "@id": `${SITE_URL}/#person` },
        },
    ],
};

export default function Home() {
    return (
        <main className="relative h-dvh overflow-hidden">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(JSON_LD).replace(/</g, "\\u003c"),
                }}
            />
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
