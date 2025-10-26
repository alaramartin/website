"use client";
import Link from "next/link";
import SearchBar from "./SearchBar";
import { useState, useEffect } from "react";

interface Post {
    id: string;
    date: string;
    title: string;
    contentHTML: string;
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
                console.log(
                    post.title.toLowerCase().includes(search.toLowerCase()),
                    post.contentHTML
                        .toLowerCase()
                        .includes(search.toLowerCase())
                );
                return (
                    post.title.toLowerCase().includes(search.toLowerCase()) ||
                    post.contentHTML
                        .toLowerCase()
                        .includes(search.toLowerCase())
                );
            });
            console.log(filteredBlogPosts.length);
            setVisibleBlogPosts(filteredBlogPosts);
        }
        if (search === "") {
            setVisibleBlogPosts(posts);
        }
    }, [search]);

    return (
        <>
            <SearchBar search={search} setSearch={setSearch} />
            <div className={`text-left px-30 pt-10 flex flex-col`}>
                {visibleBlogPosts.map(({ id, date, title }) => (
                    <Link
                        key={id}
                        href={`/blog/${id}`}
                        className="inline-block h-fit p-4 transition-all duration-100 group"
                    >
                        <p className="group-hover:underline text-lg pb-1">
                            {title}
                        </p>
                        <p className="text-sm font-light">{date}</p>
                    </Link>
                ))}
            </div>{" "}
        </>
    );
}
