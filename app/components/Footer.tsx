import LinksBar from "./LinksBar";
import MostRecentCommit from "./MostRecentCommit";
import { italiana, serif } from "../ui/fonts";

const Footer = () => {
    return (
        <div
            className="text-center mx-16 md:mx-30 mt-60 md:px-30 pt-20 pb-16 border-t-2 border-t-lighthighlight/80 cursor-default select-none"
            style={{ color: "var(--color-footertext)" }}
        >
            <LinksBar />
            <p className={`m-2 ${italiana.className} text-2xl`}>ALARA MARTIN</p>
            <span
                className={`${serif.className} inline-block m-2 py-3 px-4 border-t border-lighthighlight/80 text-bodytext`}
            >
                <MostRecentCommit />
            </span>
        </div>
    );
};

export default Footer;
