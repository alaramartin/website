"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Commit = {
    sha: string;
    url: string;
} | null;

export default function MostRecentCommit() {
    const [commit, setCommit] = useState<Commit>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();

        async function fetchLatestCommit() {
            try {
                const res = await fetch("/api/github/commits", {
                    headers: {
                        "Cache-Control": "public, s-maxage=3600",
                    },
                    signal: controller.signal,
                });
                if (!res.ok || controller.signal.aborted) return;
                const data = await res.json().catch(() => null);
                if (controller.signal.aborted) return;
                setCommit(data);
            } catch {
                if (controller.signal.aborted) return;
                setCommit(null);
            } finally {
                setIsLoading(false);
            }
        }

        fetchLatestCommit();

        return () => {
            controller.abort();
        };
    }, []);

    // if (isLoading || !commit) {
    //     return <div className="text-sm text-bodytext/80">loading...</div>;
    // }

    return (
        <div className="text-sm text-bodytext/80">
            on commit{" "}
            <span className="link">
                <Link
                    href={
                        commit
                            ? commit.url
                            : "https://github.com/alaramartin/website"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="see most recent commit"
                >
                    {commit ? commit.sha.substring(0, 7) : "abc123"}
                </Link>
            </span>
        </div>
    );
}
