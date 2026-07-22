import { mono, serif } from "@/app/ui/fonts";
import NavBar from "../components/NavBar";
import generateMetadataBase from "@/lib/metadata";
import { books } from "@/app/data/info";
import TextScramble from "../components/TextScramble";
import BookShelf from "./components/BookShelf";

export const metadata = generateMetadataBase({
    title: "Reviews",
    description: "Books I've read and what I thought.",
    url: "https://alaramartin.com/reviews",
    ogLabel: "Reviews",
});

export default function ReviewsPage() {
    return (
        <>
            <NavBar />
            <main style={{ minHeight: "100vh" }}>
                <div className={`text-center pt-16 md:px-15`}>
                    <p
                        className={`${mono.className} cursor-default text-4xl pb-4 select-none text-accent`}
                    >
                        <TextScramble textToScramble="Reviews" />
                    </p>
                    <p className={`text-bodytext ${serif.className}`}>
                        Some books I&apos;ve read, and what I thought of them.
                    </p>
                </div>
                <BookShelf books={books} />
            </main>
        </>
    );
}
