import { compileMDX } from "next-mdx-remote/rsc";
import { promises as fs } from "fs";
import path from "path";
import LinksBar from "@/app/components/LinksBar";
import { italiana } from "@/app/ui/fonts";
import BlogsButton from "./BlogsButton";

interface BlogTextProps {
    blogSlug: string;
}

interface Frontmatter {
    title: string;
    date: string;
    description: string;
}

export default async function BlogText({ blogSlug }: BlogTextProps) {
    const content = await fs.readFile(
        path.join(process.cwd(), "/posts", `${blogSlug}.mdx`),
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

    console.log(data);

    return (
        <>
            <div className={`text-center p-16 mt-10 ${italiana.className}`}>
                <p className="font-extrabold text-3xl">
                    {data.frontmatter.title}
                </p>
                <p className="text-md">{data.frontmatter.date}</p>
            </div>
            <div className="px-12 md:px-50 text-md text-textbrown">
                {data.content}
            </div>
            <BlogsButton />
        </>
    );
}
