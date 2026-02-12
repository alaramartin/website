"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Commit = {
    sha: string;
    url: string;
} | null;

export default function MostRecentCommit() {
    const [commit, setCommit] = useState<Commit>(null);

    useEffect(() => {
        const controller = new AbortController();

        async function fetchLatestCommit() {
            try {
                const res = await fetch("/api/github/commits", {
                    cache: "no-store",
                    signal: controller.signal,
                });
                if (!res.ok || controller.signal.aborted) return;
                const data = await res.json().catch(() => null);
                if (controller.signal.aborted) return;
                setCommit(data);
            } catch {
                if (controller.signal.aborted) return;
                setCommit(null);
            }
        }

        fetchLatestCommit();

        return () => {
            controller.abort();
        };
    }, []);

    if (!commit) return null;
    return (
        <div className="text-sm text-bodytext/80">
            on commit{" "}
            <span className="link">
                <Link
                    href={commit.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="see most recent commit"
                >
                    {commit.sha.substring(0, 7)}
                </Link>
            </span>
        </div>
    );
}
