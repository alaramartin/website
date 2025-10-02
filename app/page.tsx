import { italiana } from "@/app/ui/fonts";
import LinksBar from "./components/LinksBar";

export default function Home() {
    return (
        <div className={`h-screen ${italiana.className} antialiased relative`}>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <LinksBar></LinksBar>
            </div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 pb-4 flex items-baseline cursor-default">
                <p className="text-9xl whitespace-nowrap pr-5">ALARA</p>
                <p className="text-7xl whitespace-nowrap text-[#d58789]">
                    MARTIN
                </p>
            </div>
        </div>
    );
}
