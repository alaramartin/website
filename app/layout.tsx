import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";

import "@/app/ui/globals.css";

export const metadata: Metadata = {
    title: "Alara Martin",
    description: "My personal website.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                {children}
                <Analytics />
            </body>
        </html>
    );
}
