import { compileMDX } from "next-mdx-remote/rsc";
import { promises as fs } from "fs";
import path from "path";
import LinksBar from "@/app/components/LinksBar";

interface Frontmatter {
    title: string;
    date: string;
    description: string;
}

export default async function ProjectPage({
    params,
}: {
    params: { slug: string };
}) {
    const { slug } = await params;
    const content = await fs.readFile(
        path.join(process.cwd(), "/newBlog", `${slug}.mdx`),
        "utf-8",
    );

    const data = await compileMDX<Frontmatter>({
        source: content,
        options: {
            parseFrontmatter: true,
        },
        components: {
            LinksBar,
        },
    });
    return <div>{data.content}</div>;
}
