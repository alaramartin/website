import ContactLink from "./components/ContactLink";
import WhalePod from "./components/WhalePod";
import NavBar from "../components/NavBar";
import { italiana, mono, serif } from "../ui/fonts";
import {
    EnvelopeIcon,
    LinkedinLogoIcon,
    GithubLogoIcon,
    // GlobeIcon,
    DiscordLogoIcon,
    XLogoIcon,
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
        href: "mailto:me@alaramartin.com",
        username: "me@alaramartin.com",
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
        contactType: "X",
        href: "https://x.com/alara_martin_",
        username: "alara_martin_",
        icon: XLogoIcon,
    },
    // {
    //     contactType: "Website",
    //     href: "https://alaramartin.com",
    //     username: "alaramartin.com",
    //     icon: GlobeIcon,
    // },
    {
        contactType: "Discord",
        href: "https://discord.com/users/808795298587213824",
        username: "alarm",
        icon: DiscordLogoIcon,
    },
];

export default function ContactPage() {
    return (
        <>
            <NavBar />
            <div className="relative min-h-screen py-20 flex flex-col items-center text-center justify-center select-none">
                {/* Two whales roam this screen, steering around anything marked data-whale-avoid. */}
                <WhalePod />
                <p
                    data-whale-avoid
                    className={`relative z-10 ${mono.className} text-3xl font-bold text-accent`}
                >
                    <TextScramble textToScramble="Contact Me" />
                </p>
                <div
                    className={`relative z-10 max-md:mt-6 flex flex-col lg:flex-row lg:flex-wrap lg:justify-center lg:w-full lg:max-w-5xl ${serif.className}`}
                >
                    {contactLinks.map((contactLink) => (
                        <div
                            key={contactLink.contactType}
                            className="lg:basis-1/3 lg:flex lg:justify-center"
                        >
                            <div data-whale-avoid>
                                <ContactLink contact={contactLink} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
