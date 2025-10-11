import React from "react";
import HomeButton from "../components/HomeButton";
import ContactLink from "./components/ContactLink";
import { italiana } from "../ui/fonts";
import {
    EnvelopeIcon,
    LinkedinLogoIcon,
    GithubLogoIcon,
} from "@phosphor-icons/react/dist/ssr";

const contactLinks: {
    contactType: string;
    href: string;
    username?: string;
    icon: any;
}[] = [
    {
        contactType: "Email",
        href: "alara.martin@gmail.com",
        icon: EnvelopeIcon,
    },
    {
        contactType: "LinkedIn",
        href: "https://linkedin.com/in/alara-martin",
        username: "alara-martin",
        icon: LinkedinLogoIcon,
    },
    {
        contactType: "GitHub",
        href: "https://github.com/alaramartin",
        username: "alaramartin",
        icon: GithubLogoIcon,
    },
];

export default function ContactPage() {
    return (
        <>
            <div
                className={`${italiana.className} absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}
            >
                <p>Contact Me</p>
                {contactLinks.map((contactLink) => (
                    <div key={contactLink.contactType}>
                        <ContactLink contact={contactLink} />
                    </div>
                ))}
            </div>
            <HomeButton />
        </>
    );
}
