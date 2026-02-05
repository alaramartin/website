import { promises as fs } from "fs";
import path from "path";
import { compileMDX } from "next-mdx-remote/rsc";
import Link from "next/link";

const filenames = await fs.readdir(path.join(process.cwd(), "/newBlog"));

interface Frontmatter {
    title: string;
    date: string;
    description: string;
}

const projects = await Promise.all(
    filenames.map(async (filename) => {
        const content = await fs.readFile(
            path.join(process.cwd(), "/newBlog", filename),
            "utf-8",
        );
        const { frontmatter } = await compileMDX<Frontmatter>({
            source: content,
            options: {
                parseFrontmatter: true,
            },
        });
        return {
            filename,
            slug: filename.replace(".mdx", ""),
            ...frontmatter,
        };
    }),
);

export default function Page() {
    return (
        <ul>
            {projects.map(({ title, slug }, index) => {
                return (
                    <li key={index}>
                        <Link href={`/newBlog/${slug}`}>{title}</Link>
                    </li>
                );
            })}
        </ul>
    );
}
