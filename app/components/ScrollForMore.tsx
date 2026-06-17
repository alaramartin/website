"use client";
import { ArrowFatLineDownIcon } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useState } from "react";
import { serif } from "../ui/fonts";

export default function ScrollForMore() {
    // Start visible: the page always loads scrolled to the top, so SSR can paint the
    // indicator immediately (no mount gate / pop-in). The scroll listener only hides it.
    const [opacity, setOpacity] = useState(1);

    useEffect(() => {
        const onScroll = () => {
            setOpacity(window.scrollY > 5 ? 0 : 1);
        };

        onScroll();

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <div
            className="fixed inset-0 flex items-end justify-center z-10 pointer-events-none"
            style={{ opacity, transition: "opacity 100ms" }}
        >
            {/* Scales with viewport width (clamp, mirroring the name's 12vw) so it shrinks
          alongside the big "ALARA MARTIN" on narrow screens instead of overlapping it. The
          icon is sized in em, so it tracks the font-size, and the bottom gap is vw-relative
          too so it sits close to the bottom edge on small screens instead of floating up. */}
            <p
                className={`${serif.className} inline-flex items-center gap-1.5 opacity-70 text-(--color-verylightpink)`}
                style={{
                    fontSize: "clamp(0.55rem, 2.5vw, 1rem)",
                    paddingBottom: "clamp(0.2rem, 1.0vw, 0.5rem)",
                }}
            >
                Scroll
                <ArrowFatLineDownIcon size="1.3em" className="arrow-bounce" />
            </p>
        </div>
    );
}
