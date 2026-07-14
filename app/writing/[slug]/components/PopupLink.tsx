"use client";

import { useEffect, useRef, useState } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";
import { AnimatePresence, motion } from "motion/react";

interface PopupLinkProps {
    term: string;
    children: React.ReactNode;
}

export default function PopupLink({ term, children }: PopupLinkProps) {
    const [open, setOpen] = useState(false);
    const [placement, setPlacement] = useState<"left" | "right">("right");
    const containerRef = useRef<HTMLSpanElement>(null);

    function toggle() {
        // decide which side has more room before opening
        if (!open && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const spaceRight = window.innerWidth - rect.right;
            const spaceLeft = rect.left;
            setPlacement(spaceRight >= spaceLeft ? "right" : "left");
        }
        setOpen((prev) => !prev);
    }

    useEffect(() => {
        if (!open) return;

        function handlePointerDown(event: PointerEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setOpen(false);
            }
        }

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open]);

    // Grow the panel out from the edge nearest the word by animating clip-path.
    // (We can't scale/transform the glass element — a transform silently kills
    // its backdrop-filter — but clip-path reveals it while keeping the blur.)
    const collapsed =
        placement === "right"
            ? "inset(50% 100% 50% 0% round 0.5rem)"
            : "inset(50% 0% 50% 100% round 0.5rem)";
    const expanded = "inset(0% 0% 0% 0% round 0.5rem)";

    return (
        <span ref={containerRef} className="relative inline-block">
            <button
                type="button"
                onClick={toggle}
                aria-expanded={open}
                aria-haspopup="dialog"
                className="text-accent underline underline-offset-1 hover:decoration-wavy decoration-solid decoration-lighthighlight/80 inline-flex items-baseline gap-0.5 cursor-pointer"
            >
                {term}
                <MagnifyingGlassIcon
                    size={14}
                    weight="duotone"
                    color="var(--color-lighthighlight)"
                    className="translate-y-0.5"
                    aria-hidden
                />
            </button>

            <AnimatePresence>
                {open && (
                    // Vertically center the panel on the word: a transform-free
                    // wrapper spans the word's line height and flex-centers the
                    // panel, so the middle of the panel's near edge sits at the
                    // word. NOTE: never animate `transform` on the panel — it
                    // silently cancels `backdrop-filter`. We use opacity +
                    // clip-path instead, which keep the blur intact.
                    <span
                        className={`absolute inset-y-0 z-50 flex items-center ${
                            placement === "right"
                                ? "left-full ml-2"
                                : "right-full mr-2"
                        }`}
                    >
                        <motion.span
                            role="dialog"
                            initial={{ opacity: 0, clipPath: collapsed }}
                            animate={{ opacity: 1, clipPath: expanded }}
                            exit={{ opacity: 0, clipPath: collapsed }}
                            transition={{ duration: 0.18, ease: "easeInOut" }}
                            className="block w-max max-w-[min(22rem,75vw)] rounded-lg border border-lightpink bg-lightpink/30 px-4 py-3 text-left text-sm leading-relaxed text-bodytext shadow-lg backdrop-blur-md"
                        >
                            {children}
                        </motion.span>
                    </span>
                )}
            </AnimatePresence>
        </span>
    );
}
