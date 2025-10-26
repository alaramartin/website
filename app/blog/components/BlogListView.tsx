"use client";
import Link from "next/link";
import SearchBar from "./SearchBar";
import { useState } from "react";

interface BlogListViewProps {
    posts: { id: string; date: string; title: string }[];
}

export default function BlogListView({ posts }: BlogListViewProps) {
    const [search, setSearch] = useState("");

    return (
        <>
            <SearchBar search={search} setSearch={setSearch} />
            <div className={`text-left px-30 pt-10 flex flex-col`}>
                {posts.map(({ id, date, title }) => (
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
