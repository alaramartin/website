"use client";
import { useParams } from "next/navigation";

export default function BlogPost() {
    const { id } = useParams();
    return <p>post: {id}</p>;
}
