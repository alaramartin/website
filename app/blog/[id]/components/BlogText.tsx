import { getPostData } from "@/lib/posts";
import { italiana } from "@/app/ui/fonts";
import BlogsButton from "./BlogsButton";

import React from "react";

interface BlogTextProps {
    blogID: string;
}

export default async function BlogText({ blogID }: BlogTextProps) {
    const postData = await getPostData(blogID);
    const thePostItself = postData.contentHTML;

    return (
        <>
            <BlogsButton />
            <div className={`text-center p-16 ${italiana.className}`}>
                <p className="font-extrabold text-3xl">{postData.title}</p>
                <p className="text-md">{postData.date}</p>
            </div>
            <div
                className="px-50 text-md text-textbrown"
                dangerouslySetInnerHTML={{ __html: thePostItself }}
            />
        </>
    );
}
