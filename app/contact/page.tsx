import ContactLink from "./components/ContactLink";
import NavBar from "../components/NavBar";
import { italiana, lato } from "../ui/fonts";
import {
    EnvelopeIcon,
    LinkedinLogoIcon,
    GithubLogoIcon,
    GlobeIcon,
} from "@phosphor-icons/react/dist/ssr";
import DarkModeToggle from "../components/DarkModeToggle";
import generateMetadataBase from "@/lib/metadata";

export const metadata = generateMetadataBase({
    title: "Contact Me",
    description: "Contact me.",
    url: "https://alaramartin.vercel.app/contact",
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
        href: "https://alaramartin.vercel.app",
        username: "alaramartin.vercel.app",
        icon: GlobeIcon,
    },
];

export default function ContactPage() {
    return (
        <>
            <NavBar />
            <DarkModeToggle />
            <div className="h-screen flex flex-col items-center text-center justify-center select-none">
                <p className={`${italiana.className} text-2xl font-bold`}>
                    CONTACT ME
                </p>
                <div
                    className={`max-md:mt-6 flex flex-col lg:inline-flex lg:flex-row ${lato.className}`}
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
