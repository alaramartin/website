"use client";
import Link from "next/link";
import SearchBar from "../../components/SearchBar";
import { useState, useEffect } from "react";

interface Post {
    slug: string;
    title: string;
    date: string;
    description: string;
    content: string;
}

interface BlogListViewProps {
    posts: Post[];
}

export default function BlogListView({ posts }: BlogListViewProps) {
    const [search, setSearch] = useState("");
    const [visibleBlogPosts, setVisibleBlogPosts] = useState(posts);

    useEffect(() => {
        if (search) {
            const filteredBlogPosts = posts.filter((post) => {
                return (
                    post.title.toLowerCase().includes(search.toLowerCase()) ||
                    post.content.toLowerCase().includes(search.toLowerCase())
                );
            });
            setVisibleBlogPosts(filteredBlogPosts);
        }
        if (search === "") {
            setVisibleBlogPosts(posts);
        }
    }, [search]);

    return (
        <>
            <SearchBar
                placeholderText="Search by post title and/or content"
                search={search}
                setSearch={setSearch}
            />
            <div className={`text-left md:px-30 pt-10 flex flex-col`}>
                {visibleBlogPosts.length === 0 && (
                    <div className="col-span-4 flex items-center justify-center py-10">
                        <p className="text-center italic opacity-65">
                            No posts found :&#40;
                        </p>
                    </div>
                )}
                {visibleBlogPosts.map(({ slug, date, description, title }) => (
                    <Link
                        key={slug}
                        href={`/blog/${slug}`}
                        className="inline-block h-fit p-2 md:p-4 transition-all duration-100 group"
                    >
                        <p className="group-hover:underline group-hover:decoration-lighthighlight/70 underline-offset-2 text-lg pb-0.5 text-bodytext">
                            {title}
                        </p>
                        <p className="text-base font-light pb-1 text-bodytext/70">
                            {description}
                        </p>
                        <p className="text-sm font-light text-bodytext/70">
                            {date}
                        </p>
                    </Link>
                ))}
            </div>{" "}
        </>
    );
}
