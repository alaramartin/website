import type { Metadata } from "next";
import Link from "next/link";
import Corners from "../../Corners";
import Nav from "../../Nav";
import { formatDate, linksOf, PROJECTS } from "../../data/projects";

// One page per project that has a writeup (src/writeups/<slug>.mdx).
const withWriteup = PROJECTS.filter((p) => p.writeup);
const bySlug = (slug: string) => withWriteup.find((p) => p.writeup === slug)!;

export function generateStaticParams() {
    return withWriteup.map((p) => ({ slug: p.writeup! }));
}

export const dynamicParams = false;

export async function generateMetadata({
    params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
    const { slug } = await params;
    const p = bySlug(slug);
    return {
        title: p.name,
        description: p.description,
        alternates: { canonical: `/projects/${slug}` },
        openGraph: { type: "article", title: p.name, description: p.description },
    };
}

export default async function Writeup({
    params,
}: PageProps<"/projects/[slug]">) {
    const { slug } = await params;
    const p = bySlug(slug);
    const { default: Body } = await import(`@/writeups/${slug}.mdx`);

    return (
        <main className="relative h-dvh overflow-hidden">
            <div className="feed-fade no-scrollbar absolute inset-0 overflow-y-auto">
                <article className="mx-auto max-w-2xl px-8 pt-24 pb-24 sm:pt-20">
                    <Link
                        href="/projects"
                        className="hack-link font-mono text-sm text-[var(--muted)] opacity-80"
                    >
                        {"←"} projects
                    </Link>
                    <h1 className="mt-6 text-3xl">{p.name}</h1>
                    <p className="mt-3 flex flex-wrap gap-x-4 font-mono text-sm text-[var(--muted)]">
                        <time dateTime={p.date} className="opacity-70">
                            {formatDate(p.date)}
                        </time>
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
                    <div className="prose-writeup mt-10">
                        <Body />
                    </div>
                </article>
            </div>
            <Nav />
            <Corners />
        </main>
    );
}
