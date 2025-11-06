import LinksBar from "./LinksBar";
import { italiana } from "../ui/fonts";
import Link from "next/link";

const Footer = () => {
    return (
        <div className="text-center mx-16 md:mx-30 mt-60 md:px-30 pt-20 pb-16 border-t-2 border-t-lightred/80 cursor-default select-none">
            <LinksBar />

            <p className={`m-2 ${italiana.className} text-2xl`}>ALARA MARTIN</p>
            <span className="inline-block m-2 py-3 px-4 border-t border-lightred/80">
                <Link
                    className="hover:underline transition-all"
                    href="/contact"
                >
                    Contact Me
                </Link>
            </span>
        </div>
    );
};

export default Footer;
