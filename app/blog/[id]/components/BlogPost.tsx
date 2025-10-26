"use client";
import { useParams, notFound } from "next/navigation";
import BlogText from "./BlogText";

export default async function BlogPost() {
    const params = useParams();
    const id = params.id?.toString();

    if (!id) {
        // reroute to 404 if page not found
        notFound();
    }

    return (
        <>
            <p>post: {id}</p>;<div></div>
            <BlogText blogID={id} />
        </>
    );
}
