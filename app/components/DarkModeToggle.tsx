"use client";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { StarAndCrescentIcon } from "@phosphor-icons/react/dist/ssr";

export default function DarkModeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mount, setMount] = useState(false);

    useEffect(() => {
        setMount(true);
    }, []);

    // Render the button immediately (it's fixed, so no layout shift); only the
    // theme-dependent icon weight waits for mount, so server and first client render
    // agree (regular) — no hydration mismatch, no pop-in.
    const isDark = mount && resolvedTheme === "dark";

    return (
        <>
            <button
                type="button"
                aria-label="toggle dark mode"
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="fixed m-4 top-0 right-0 cursor-pointer z-100000"
            >
                <StarAndCrescentIcon
                    size={26}
                    weight={isDark ? "fill" : "regular"}
                />
            </button>
        </>
    );
}
