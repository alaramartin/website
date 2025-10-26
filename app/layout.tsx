import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "@/app/ui/globals.css";
import Footer from "./components/Footer";
import { ThemeProvider } from "next-themes";
import DarkModeToggle from "./components/DarkModeToggle";

export const metadata: Metadata = {
    title: {
        template: "%s | Alara Martin",
        default: "Alara Martin",
    },
    description: "My personal website.",
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
                    {children}
                    <Footer />
                </ThemeProvider>
                <Analytics />
            </body>
        </html>
    );
}
