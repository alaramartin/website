import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "@/app/ui/globals.css";
import Footer from "./components/Footer";
import { ThemeProvider } from "next-themes";
import ScrollAnimation from "./components/ScrollAnimation";
import { Viewport } from "next";

export const metadata: Metadata = {
    title: {
        template: "%s | Alara Martin",
        default: "Alara Martin",
    },
    description: "My personal website.",
};

export const viewport: Viewport = {
    viewportFit: "cover",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                >
                    <ScrollAnimation />
                    {children}
                    <Footer />
                </ThemeProvider>
                <Analytics />
            </body>
        </html>
    );
}
