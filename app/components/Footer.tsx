import React from "react";
import LinksBar from "./LinksBar";
import { italiana } from "../ui/fonts";

const Footer = () => {
    return (
        <div className="text-center mt-50 p-30 border-t-2 border-t-lightred inset-shadow-sm inset-shadow-lightred/50">
            <LinksBar />
            <p className={`m-5 ${italiana.className} text-2xl`}>ALARA MARTIN</p>
        </div>
    );
};

export default Footer;
