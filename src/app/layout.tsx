import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SITE_URL } from "./site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Alara Martin", template: "%s · Alara Martin" },
  description:
    "Alara Martin studies Applied Math and Data Science at UC Berkeley, builds software and wins hackathons.",
  authors: [{ name: "Alara Martin", url: SITE_URL }],
  openGraph: {
    type: "website",
    siteName: "Alara Martin",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", creator: "@alara_martin_" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Applies the system theme before first paint so there's no light flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if (matchMedia("(prefers-color-scheme: dark)").matches) document.documentElement.classList.add("dark")`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
