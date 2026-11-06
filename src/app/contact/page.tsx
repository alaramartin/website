import type { Metadata } from "next";
import Corners from "../Corners";
import Nav from "../Nav";
import { CONTACTS, external } from "../data/contacts";

export const metadata: Metadata = {
    title: "Contact",
    description: "How to reach Alara Martin: email, LinkedIn, GitHub, X and Discord.",
    alternates: { canonical: "/contact" },
};

// Laid out like the /projects index. Platform on the left, handle on the right.
export default function Contact() {
    return (
        <main className="relative h-dvh overflow-hidden">
            <h1 className="sr-only">Contact</h1>
            <div className="absolute inset-x-0 top-[30%] mx-auto max-w-2xl px-8">
                <ul>
                    {CONTACTS.map(({ label, handle, href }) => (
                        <li key={label} className="index-row">
                            <a
                                href={href}
                                {...external(href)}
                                className="contact-row grid grid-cols-[5.5rem_1fr] items-baseline gap-x-4 py-2.5"
                            >
                                <span className="font-mono text-sm text-[var(--muted)] opacity-70">
                                    {label.toLowerCase()}
                                </span>
                                <span className="index-name text-lg">{handle}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
            <Nav />
            <Corners />
        </main>
    );
}
