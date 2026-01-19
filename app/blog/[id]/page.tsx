import BlogText from "./components/BlogText";
import NavBar from "@/app/components/NavBar";
import { notFound } from "next/navigation";
import { getPostData } from "@/lib/posts";
import DarkModeToggle from "@/app/components/DarkModeToggle";
import generateMetadataBase from "@/lib/metadata";

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
    const { id } = await params;
    const post = await getPostData(id);

    return generateMetadataBase({
        title: post.title,
        description: post.description ?? "A blog post.",
        url: `https://alaramartin.com/blog/${id}`,
    });
}

export default async function BlogPostPage({ params }: PageProps) {
    // const id = params.id;
    const { id } = await params;
    if (!id) {
        notFound();
    }

    // verify the post actually exists and 404 if not
    try {
        await getPostData(id);
    } catch {
        notFound();
    }

    return (
        <>
            <NavBar />
            <DarkModeToggle />
            <BlogText blogID={id} />
        </>
    );
}
