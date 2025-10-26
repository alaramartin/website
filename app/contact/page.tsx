import HomeButton from "../components/HomeButton";
import ContactLink from "./components/ContactLink";
import Footer from "../components/Footer";
import NavBar from "../components/NavBar";
import { italiana, lato } from "../ui/fonts";
import {
    EnvelopeIcon,
    LinkedinLogoIcon,
    GithubLogoIcon,
    GlobeIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact",
};

const contactLinks: {
    contactType: string;
    href: string;
    username?: string;
    icon: any;
}[] = [
    {
        contactType: "Email",
        href: "mailto:alara.martin@gmail.com",
        username: "alara.martin@gmail.com",
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
    {
        contactType: "Website",
        href: "https://alaramartin.vercel.app",
        username: "alaramartin.vercel.app",
        icon: GlobeIcon,
    },
];

export default function ContactPage() {
    return (
        <>
            <NavBar />
            <div className="h-screen relative">
                <div
                    className={`${italiana.className} absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 select-none`}
                >
                    <p className="flex justify-self-center text-2xl font-bold">
                        CONTACT ME
                    </p>
                    <div className={`inline-flex ${lato.className}`}>
                        {contactLinks.map((contactLink) => (
                            <div key={contactLink.contactType}>
                                <ContactLink contact={contactLink} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <HomeButton />
            <Footer />
        </>
    );
}
