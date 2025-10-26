import { italiana, lato } from "@/app/ui/fonts";
import NavBar from "../components/NavBar";
import { getSortedBlogPosts } from "@/lib/posts.ts";
import { Metadata } from "next";
import BlogListView from "./components/BlogListView";
import { getPostData } from "@/lib/posts.ts";
import DarkModeToggle from "../components/DarkModeToggle";

export const metadata: Metadata = {
    title: "Blog",
};

export default async function BlogPage() {
    const allPostsData = await getSortedBlogPosts();
    const posts = await Promise.all(
        allPostsData.map(async (post) => {
            const fullData = await getPostData(post.id);
            return {
                id: post.id,
                title: post.title,
                date: post.date,
                // send only the important text stuff (for searching purposes) and not all of the html tags n stuff
                contentHTML: fullData?.contentHTML
                    ? fullData.contentHTML
                          .replace(/<[^>]+>/g, " ")
                          .replace(/\s+/g, " ")
                          .trim()
                    : "",
            };
        })
    );

    return (
        <>
            <NavBar />
            <DarkModeToggle />
            <div className={`text-center pt-18 px-15 dark:bg-darkburgundy`}>
                <p
                    className={`${italiana.className} cursor-default text-4xl pb-4 select-none`}
                >
                    Blog
                </p>
                <p
                    className={`${lato.className} cursor-default text-md pb-4 select-none`}
                >
                    my thoughts :&#41;
                </p>
                <BlogListView posts={posts} />
            </div>
        </>
    );
}
