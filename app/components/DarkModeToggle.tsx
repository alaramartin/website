"use client";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { StarAndCrescentIcon } from "@phosphor-icons/react/dist/ssr";

export default function DarkModeToggle() {
    const { resolvedTheme, setTheme } = useTheme();
    const [mount, setMount] = useState(false);

    // set mount once mounted, don't render until mounted
    useEffect(() => {
        setMount(true);
    }, []);

    if (!mount) {
        return null;
    }

    const isDark = resolvedTheme === "dark";

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
