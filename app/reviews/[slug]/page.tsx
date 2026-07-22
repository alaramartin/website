import NavBar from "@/app/components/NavBar";
import { notFound } from "next/navigation";
import generateMetadataBase from "@/lib/metadata";
import { books, bookSlug } from "@/app/data/info";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
    const { slug } = await params;
    const book = books.find((b) => bookSlug(b.title) === slug);

    if (!book) {
        return generateMetadataBase({
            title: "Review not found",
            description: "This book review doesn't exist.",
            url: `https://alaramartin.com/reviews/${slug}`,
            ogLabel: "Reviews",
        });
    }

    return generateMetadataBase({
        title: book.title,
        description: `My review of ${book.title} by ${book.author}.`,
        url: `https://alaramartin.com/reviews/${slug}`,
        ogLabel: "Reviews",
    });
}

export default async function ReviewPage({ params }: PageProps) {
    const { slug } = await params;
    const book = books.find((b) => bookSlug(b.title) === slug);

    if (!book) {
        notFound();
    }

    // minimal for now — design/formatting comes later. just surface the review text.
    return (
        <>
            <NavBar />
            <main style={{ minHeight: "100vh" }}>
                <p>{book.review}</p>
            </main>
        </>
    );
}
