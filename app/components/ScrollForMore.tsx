"use client";
import { ArrowFatLineDownIcon } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useState } from "react";
import { mono, serif } from "../ui/fonts";

export default function ScrollForMore() {
    const [opacity, setOpacity] = useState(1);

    useEffect(() => {
        const onScroll = () => {
            setOpacity(window.scrollY > 5 ? 0 : 1);
        };

        window.addEventListener("scroll", onScroll, { passive: true });

        return () => {
            window.removeEventListener("scroll", onScroll);
        };
    }, []);

    return (
        <div
            className="fixed inset-0 flex items-end justify-center z-10 pointer-events-none"
            style={{ opacity, transition: "opacity 100ms" }}
        >
            <p
                className={`${serif.className} pb-4 inline-flex items-center gap-1.5 opacity-70 text-(--color-verylightpink)`}
            >
                Scroll for more
                <ArrowFatLineDownIcon size={24} className="arrow-bounce" />
            </p>
        </div>
    );
}
