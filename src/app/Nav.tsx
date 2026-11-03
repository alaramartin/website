"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
    { label: "/home", href: "/" },
    { label: "/projects", href: "/projects" },
    { label: "/hacks", href: "/hacks" },
];

export default function Nav() {
    const pathname = usePathname();

    return (
        <nav
            data-whale-avoid
            className="absolute left-1/2 top-4 flex -translate-x-1/2 gap-4 font-mono text-sm text-[var(--muted)] opacity-70"
        >
            {TABS.map(({ label, href }) => {
                const current = pathname === href;
                return (
                    <Link
                        key={href}
                        href={href}
                        aria-current={current ? "page" : undefined}
                        className={
                            current
                                ? "underline decoration-[var(--muted)]/75 decoration-[1.5px] underline-offset-[3px]"
                                : "nav-link"
                        }
                    >
                        {label}
                    </Link>
                );
            })}
        </nav>
    );
}
