import { italiana, lato } from "@/app/ui/fonts";
import Footer from "../components/Footer";
import HomeButton from "../components/HomeButton";
import { getSortedBlogPosts } from "@/lib/posts.ts";
import { Metadata } from "next";
import BlogListView from "./components/BlogListView";

export const metadata: Metadata = {
    title: "Blog",
};

// todo: add a search bar for titles + content

export default async function BlogPage() {
    const allPostsData = await getSortedBlogPosts();
    const posts = await Promise.all(allPostsData);

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
