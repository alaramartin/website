import { getPostData } from "@/lib/posts";

import React from "react";

interface BlogTextProps {
    blogID: string;
}

export default async function BlogText({ blogID }: BlogTextProps) {
    const postData = await getPostData(blogID);
    const thePostItself = postData.contentHTML;

    return <div>{thePostItself}</div>;
}
