import { promises as fs } from "fs";
import path from "path";
import { compileMDX } from "next-mdx-remote/rsc";
import generateMetadataBase from "@/lib/metadata";
import { italiana, mono, serif } from "@/app/ui/fonts";
import NavBar from "../components/NavBar";
import BlogListView from "./components/BlogListView";
import TextScramble from "../components/TextScramble";

export const metadata = generateMetadataBase({
    title: "Blog",
    description: "My blog.",
    url: "https://alaramartin.com/blog",
});

interface Frontmatter {
    title: string;
    date: string;
    description: string;
}

export default async function Page() {
    const filenames = await fs.readdir(path.join(process.cwd(), "/posts"));

    const posts = await Promise.all(
        filenames.map(async (filename) => {
            const content = await fs.readFile(
                path.join(process.cwd(), "/posts", filename),
                "utf-8",
            );
            const { frontmatter } = await compileMDX<Frontmatter>({
                source: content,
                options: {
                    parseFrontmatter: true,
                },
            });
            return {
                slug: filename.replace(".mdx", ""),
                title: frontmatter.title,
                date: frontmatter.date,
                description: frontmatter.description,
                content: content
                    .replace(/<[^>]+>/g, " ")
                    .replace(/\s+/g, " ")
                    .trim(),
            };
        }),
    );

    return (
        <>
            <NavBar />
            <div className={`text-center pt-18 px-15`}>
                <p
                    className={`${mono.className} cursor-default text-4xl pb-4 select-none text-accent`}
                >
                    <TextScramble textToScramble="Blog" />
                </p>
                <p
                    className={`${serif.className} cursor-default text-md pb-4 select-none text-bodytext`}
                >
                    my thoughts :&#41;
                </p>
                <div className={`${serif.className}`}>
                    <BlogListView posts={posts} />
                </div>
            </div>
        </>
    );
}
