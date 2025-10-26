import { italiana, lato } from "@/app/ui/fonts";
import Footer from "../components/Footer";
import HomeButton from "../components/HomeButton";
import { getSortedBlogPosts } from "@/lib/posts.ts";
import { Metadata } from "next";
import BlogListView from "./components/BlogListView";
import { getPostData } from "@/lib/posts.ts";

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
            <div className={`text-center pt-10 px-15`}>
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
            <HomeButton />
            <Footer />
        </>
    );
}
