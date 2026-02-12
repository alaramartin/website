import ContactLink from "./components/ContactLink";
import NavBar from "../components/NavBar";
import { italiana, mono, serif } from "../ui/fonts";
import {
    EnvelopeIcon,
    LinkedinLogoIcon,
    GithubLogoIcon,
    GlobeIcon,
} from "@phosphor-icons/react/dist/ssr";
import generateMetadataBase from "@/lib/metadata";
import TextScramble from "../components/TextScramble";

export const metadata = generateMetadataBase({
    title: "Contact Me",
    description: "Contact me.",
    url: "https://alaramartin.com/contact",
});

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
        href: "https://alaramartin.com",
        username: "alaramartin.com",
        icon: GlobeIcon,
    },
];

export default function ContactPage() {
    return (
        <>
            <NavBar />
            <div className="h-screen flex flex-col items-center text-center justify-center select-none">
                <p
                    className={`${mono.className} text-3xl font-bold text-accent`}
                >
                    <TextScramble textToScramble="Contact Me" />
                </p>
                <div
                    className={`max-md:mt-6 flex flex-col lg:inline-flex lg:flex-row ${serif.className}`}
                >
                    {contactLinks.map((contactLink) => (
                        <div key={contactLink.contactType}>
                            <ContactLink contact={contactLink} />
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
