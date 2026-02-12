import Link from "next/link";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { serif } from "@/app/ui/fonts";

export default function BlogsButton() {
    return (
        <div className="flex justify-center mt-16 text-accent">
            <Link
                href="/blog"
                className="inline-flex items-center group gap-1 m-4 select-none"
            >
                <ArrowLeftIcon size={18} />
                <p className={`group-hover:underline ${serif.className}`}>
                    Return to Blogs
                </p>
            </Link>
        </div>
    );
}
