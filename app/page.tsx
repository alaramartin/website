import { italiana } from "@/app/ui/fonts";
import LinksBar from "./components/LinksBar";

export default function Home() {
    return (
        <div
            className={`flex h-screen items-center justify-center ${italiana.className} antialiased`}
        >
            <p className="text-5xl">ALARA MARTIN</p>
            <LinksBar></LinksBar>
        </div>
    );
}
