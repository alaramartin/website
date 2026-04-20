import Link from "next/link";
import {
    DiscordLogoIcon,
    GithubLogoIcon,
    LinkedinLogoIcon,
    WindowsLogoIcon,
} from "@phosphor-icons/react/dist/ssr";

const links = [
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
    // {
    //     name: "VS Code Marketplace",
    //     href: "https://marketplace.visualstudio.com/publishers/alarm",
    //     icon: WindowsLogoIcon,
    // },
    {
        name: "Discord",
        href: "https://discord.com/users/808795298587213824",
        icon: DiscordLogoIcon,
    },
] as const;

interface LinkProps {
    direction?: "col" | "row";
}

export default function LinksBar({ direction = "row" }: LinkProps) {
    const directionClass = direction === "col" ? "flex-col" : "flex-row";

    return (
        <div className={`flex ${directionClass} justify-center m-auto`}>
            {links.map((link) => (
                <div className="p-2 inline-flex" key={link.name}>
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
}
