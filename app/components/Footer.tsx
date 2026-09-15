import LinksBar from "./LinksBar";
import MostRecentCommit from "./MostRecentCommit";
import Whale from "./Whale";
import { italiana, serif } from "../ui/fonts";

const Footer = () => {
    return (
        <>
            {/* Divider lives outside <footer> so the whale below it can span the full page width. */}
            <div className="mx-16 md:mx-30 mt-60 border-t-2 border-t-lighthighlight/80" />
            <Whale />
            <footer
                className="text-center mx-16 md:mx-30 md:px-30 pt-6 pb-16 cursor-default select-none"
                style={{ color: "var(--color-footertext)" }}
            >
                <LinksBar direction="row" />
                <p className={`m-2 ${italiana.className} text-2xl`}>ALARA MARTIN</p>
                <span
                    className={`${serif.className} inline-block m-2 py-3 px-4 border-t border-lighthighlight/80 text-bodytext`}
                >
                    <MostRecentCommit />
                </span>
            </footer>
        </>
    );
};

export default Footer;
