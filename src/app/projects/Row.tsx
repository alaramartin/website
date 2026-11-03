"use client";
import { useId, useState } from "react";
import { formatDate, linksOf, type Project } from "../data/projects";

// One line per project; click it and the details slide open underneath.
export default function Row({ project: p }: { project: Project }) {
    const [open, setOpen] = useState(false);
    const panel = useId();

    return (
        <li className="index-row" data-open={open}>
            <button
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                aria-controls={panel}
                className="grid w-full cursor-pointer grid-cols-[4.75rem_1fr_auto] items-baseline gap-x-4 py-4 text-left sm:grid-cols-[5.5rem_1fr_auto_auto] sm:py-2.5"
            >
                <time
                    dateTime={p.date}
                    className="font-mono text-sm text-[var(--muted)] opacity-70"
                >
                    {formatDate(p.date)}
                </time>
                <span className="text-lg">
                    <span className="index-name">{p.name}</span>
                    {p.hackathon?.result && (
                        <span className="ml-2 font-mono text-xs text-[rgb(var(--accent-rgb))]">
                            {p.hackathon.result}
                        </span>
                    )}
                </span>
                {/* the first few of the stack, on wider screens only */}
                <span className="hidden font-mono text-xs text-[var(--muted)] opacity-60 sm:block">
                    {p.stack.slice(0, 3).join(", ").toLowerCase()}
                    {p.stack.length > 3 && ", …"}
                </span>
                {/* a plus that becomes a minus when the row is open */}
                <span aria-hidden className="index-plus text-lg">
                    {open ? "\u2212" : "+"}
                </span>
            </button>

            {/* grid rows 0fr → 1fr animates to the content's real height */}
            <div id={panel} className="index-panel" inert={!open}>
                <div className="overflow-hidden">
                    <div className="pb-7 pl-[calc(4.75rem+1rem)] sm:pb-6 sm:pl-[calc(5.5rem+1rem)]">
                        <p className="flex flex-wrap gap-x-4 font-mono text-sm text-[var(--muted)]">
                            {linksOf(p).map(({ label, href }) => (
                                <a
                                    key={href}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hack-link"
                                >
                                    {label} ↗
                                </a>
                            ))}
                        </p>
                        <p className="mt-3 max-w-md">{p.description}</p>
                        {p.hackathon && (
                            <p className="mt-2 font-mono text-sm text-[var(--muted)] opacity-80">
                                built at {p.hackathon.event.toLowerCase()}
                            </p>
                        )}
                        <p className="mt-3 font-mono text-sm text-[var(--muted)] opacity-80">
                            {p.stack.join(", ").toLowerCase()}
                        </p>
                    </div>
                </div>
            </div>
        </li>
    );
}
