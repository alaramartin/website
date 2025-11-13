"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    HouseIcon,
    AddressBookIcon,
    FolderOpenIcon,
    // QuotesIcon,
} from "@phosphor-icons/react/dist/ssr";

const navLinks = [
    { icon: HouseIcon, title: "Home", link: "/" },
    { icon: FolderOpenIcon, title: "Projects", link: "/projects" },
    // { icon: QuotesIcon, title: "Blog", link: "/blog" },
    { icon: AddressBookIcon, title: "Contact", link: "/contact" },
];

export default function NavBar() {
    const pathname = usePathname() || "/";

    return (
        <div className="fixed top-0 left-0 w-full px-4 md:px-8 pt-2.5 pb-2 z-50 bg-inherit">
            <div className="mx-auto flex items-center justify-start md:space-x-30 space-x-8">
                {navLinks.map((navLink) => {
                    const Icon = navLink.icon;
                    return (
                        <div
                            key={navLink.link}
                            className="relative flex items-center"
                        >
                            <Link
                                href={navLink.link}
                                className="peer inline-flex items-center p-2 rounded-md"
                                aria-label={navLink.title}
                            >
                                <Icon
                                    size={24}
                                    weight={
                                        pathname === navLink.link
                                            ? "fill"
                                            : "regular"
                                    }
                                />
                            </Link>
                            <p
                                className="absolute left-full ml-2 top-1/2 -translate-y-1/2
                                           opacity-0 pointer-events-none select-none
                                           whitespace-nowrap underline
                                           transition-opacity duration-200
                                           lg:peer-hover:opacity-95 lg:peer-hover:pointer-events-auto"
                                aria-hidden="true"
                            >
                                {navLink.title}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
