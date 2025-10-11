import LinksBar from "./LinksBar";
import { italiana, lato } from "../ui/fonts";
import Link from "next/link";

const Footer = () => {
    return (
        <div className="text-center mt-50 p-30 border-t-2 border-t-lightred inset-shadow-sm inset-shadow-lightred/50 cursor-default select-none">
            <LinksBar />
            <Link
                className={`inline-flex relative m-2 py-3 px-4 antialiased border-1 border-lightred bg-pinkbeige rounded-2xl shadow-xl/10 shadow-lightred place-content-center`}
                href="/contact"
            >
                Contact Me!
            </Link>

            <p className={`m-2 ${italiana.className} text-2xl`}>ALARA MARTIN</p>
        </div>
    );
};

export default Footer;
