import Link from "next/link";

export default function NavBar() {
    return (
        <div className="fixed top-0 left-0 px-8 pt-4 pb-2 gap-8 z-1000 bg-inherit w-full space-x-26">
            <Link href="/" className="hover:underline">
                Home
            </Link>
            <Link href="/projects" className="hover:underline">
                Projects
            </Link>
            <Link href="/blog" className="hover:underline">
                Blog
            </Link>
            <Link href="/contact" className="hover:underline">
                Contact
            </Link>
        </div>
    );
}
