import LinksBar from "./LinksBar";
import MostRecentCommit from "./MostRecentCommit";
import { italiana, lato } from "../ui/fonts";
// import Link from "next/link";
// import {
//     HouseIcon,
//     AddressBookIcon,
//     FolderOpenIcon,
//     // QuotesIcon,
// } from "@phosphor-icons/react/dist/ssr";

// const links: { href: string; icon: any }[] = [
//     {
//         href: "/",
//         icon: HouseIcon,
//     },
//     {
//         href: "/projects",
//         icon: FolderOpenIcon,
//     },
//     {
//         href: "/contact",
//         icon: AddressBookIcon,
//     },
// ];

const Footer = () => {
    return (
        <div className="text-center mx-16 md:mx-30 mt-60 md:px-30 pt-20 pb-16 border-t-2 border-t-lightred/80 cursor-default select-none">
            <LinksBar />
            {/* <div className="flex justify-center m-auto">
                {links.map((link, index) => (
                    <div className="p-2" key={index}>
                        <Link
                            href={link.href}
                            aria-label={`go to ${link.href}`}
                        >
                            <link.icon size={32} />
                        </Link>
                    </div>
                ))}
            </div> */}

            <p className={`m-2 ${italiana.className} text-2xl`}>ALARA MARTIN</p>
            <span
                className={`${lato.className} inline-block m-2 py-3 px-4 border-t border-lightred/80`}
            >
                {/* <Link
                    className="hover:underline transition-all"
                    href="/contact"
                >
                    Contact Me
                </Link> */}
                <MostRecentCommit />
            </span>
        </div>
    );
};

export default Footer;
