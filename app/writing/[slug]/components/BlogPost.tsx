"use client";
import { useParams, notFound } from "next/navigation";
import BlogText from "./BlogText";

export default async function BlogPost() {
    const params = useParams();
    const slug = params.slug?.toString();

    if (!slug) {
        // reroute to 404 if not present
        notFound();
    }

    return (
        <>
            <p>post: {slug}</p>;<div></div>
            <BlogText blogSlug={slug} />
        </>
    );
}
