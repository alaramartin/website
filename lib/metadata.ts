import type { Metadata } from "next";

export default function generateMetadata(
    { title, description } : {
    title?: string,
    description?: string}
): Metadata {
    return {
        title: title ? title + " | Alara Martin" : "Alara Martin",
        description: description ?? "",
        openGraph: {
            title: title ? title + " | Alara Martin" : "Alara Martin",
            description: description ?? "",
            type: "website",
            siteName: "Alara Martin",
            url: "https://alaramartin.vercel.app",
        },
    };
}
