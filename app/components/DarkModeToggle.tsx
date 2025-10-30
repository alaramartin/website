"use client";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { StarAndCrescentIcon } from "@phosphor-icons/react/dist/ssr";

export default function DarkModeToggle() {
    const { theme, setTheme } = useTheme();
    const [mount, setMount] = useState(false);
    const currentTheme = theme === "system" ? "light" : theme; // default to light mode bc light mode is dark on homepage and looks nicer

    // set mount once mounted, don't render until mounted
    useEffect(() => {
        setMount(true);
    }, []);

    if (!mount) {
        return null;
    }

    return (
        <>
            <button
                aria-label="toggle dark mode"
                onClick={() =>
                    setTheme(currentTheme === "dark" ? "light" : "dark")
                }
                className="fixed m-4 top-0 right-0 cursor-pointer z-10000000"
            >
                <StarAndCrescentIcon
                    size={26}
                    weight={currentTheme === "dark" ? "fill" : "regular"}
                />
            </button>
        </>
    );
}
