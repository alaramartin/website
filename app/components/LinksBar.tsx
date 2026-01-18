import Link from "next/link";
import {
    GithubLogoIcon,
    LinkedinLogoIcon,
    WindowsLogoIcon,
} from "@phosphor-icons/react/dist/ssr";

const links: { name: string; href: string; icon: any }[] = [
    {
        name: "LinkedIn",
        href: "https://linkedin.com/in/alara-martin",
        icon: LinkedinLogoIcon,
    },
    {
        name: "GitHub",
        href: "https://github.com/alaramartin",
        icon: GithubLogoIcon,
    },
    {
        name: "VS Code Marketplace",
        href: "https://marketplace.visualstudio.com/publishers/alarm",
        icon: WindowsLogoIcon,
    },
];

const LinksBar = () => {
    return (
        <div className="flex justify-center m-auto">
            {links.map((link) => (
                <div className="p-2" key={link.name}>
                    <Link
                        href={link.href}
                        target="_blank"
                        aria-label={link.name}
                    >
                        <link.icon size={32} />
                    </Link>
                </div>
            ))}
        </div>
    );
};

export default LinksBar;
