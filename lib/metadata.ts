import type { Metadata } from "next";

export default function generateMetadataBase(
    { title, description, url, keywords } : {
    title?: string,
    description?: string,
    url?: string,
    keywords?: string[]}
): Metadata {
    return {
        title: title ? title + " | Alara Martin" : "Alara Martin",
        description: description ?? "",
        authors: [{ name: "Alara Martin", url: "https://alaramartin.vercel.app" }],
        keywords: keywords?.length ? keywords : ["Alara Martin", "dev", "developer", "portfolio", "website"],
        metadataBase: new URL(url ?? "https://alaramartin.vercel.app"),
        alternates: {
            canonical: url,
        },
        openGraph: {
            title: title ? title + " | Alara Martin" : "Alara Martin",
            description: description ?? "",
            type: "website",
            siteName: "Alara Martin",
            url: url,
            images: [
                {
                    url: "/og",
                    width: 1200,
                    height: 630,
                    alt: "preview img"
                }
            ]
        },
        twitter: {
            card: "summary_large_image",
            title: title ? title + " | Alara Martin" : "Alara Martin",
            description: description ?? "",
        }
    };
}