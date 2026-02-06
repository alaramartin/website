import { promises as fs } from "fs";
import path from "path";
import { compileMDX } from "next-mdx-remote/rsc";
import BlogText from "./components/BlogText";
import NavBar from "@/app/components/NavBar";
import { notFound } from "next/navigation";
import DarkModeToggle from "@/app/components/DarkModeToggle";
import generateMetadataBase from "@/lib/metadata";

interface PageProps {
    params: Promise<{ slug: string }>;
}

interface Frontmatter {
    title: string;
    date: string;
    description: string;
}

export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;
    const content = await fs.readFile(
        path.join(process.cwd(), "/posts", slug + ".mdx"),
        "utf-8",
    );
    const { frontmatter } = await compileMDX<Frontmatter>({
        source: content,
        options: {
            parseFrontmatter: true,
        },
    });

    return generateMetadataBase({
        title: frontmatter.title,
        description: frontmatter.description ?? "A blog post.",
        url: `https://alaramartin.com/blog/${slug}`,
    });
}

export default async function BlogPostPage({ params }: PageProps) {
    const { slug } = await params;
    if (!slug) {
        notFound();
    }

    try {
        await fs.readFile(
            path.join(process.cwd(), "/posts", `${slug}.mdx`),
            "utf-8",
        );

        return (
            <>
                <NavBar />
                <DarkModeToggle />
                <BlogText blogSlug={slug} />
            </>
        );
    } catch {
        notFound();
    }
}
