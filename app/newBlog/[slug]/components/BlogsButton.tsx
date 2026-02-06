import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";

export default function BlogsButton() {
    return (
        <div className="flex justify-center mt-16">
            <Link
                href="/blog"
                className="inline-flex items-center group gap-1 m-4 select-none"
            >
                <ArrowLeftIcon size={18} />
                <p className="group-hover:underline">Return to Blogs</p>
            </Link>
        </div>
    );
}
