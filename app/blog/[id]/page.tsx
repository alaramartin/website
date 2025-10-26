import BlogText from "./components/BlogText";
import HomeButton from "@/app/components/HomeButton";
import Footer from "@/app/components/Footer";
import { notFound } from "next/navigation";
import { getPostData } from "@/lib/posts";

interface PageProps {
    params: { id: string };
}

export default async function BlogPostPage({ params }: PageProps) {
    const id = params.id;
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
            <BlogText blogID={id} />
            <HomeButton />
            <Footer />
        </>
    );
}
