import { CameraIcon } from "@phosphor-icons/react/dist/ssr";

// Placeholder collage for the "photographer" proof. Real photos go in public/ later;
// for now these are neutral tiles laid out in a small masonry-ish grid.
const TILES = [
    "aspect-[3/4]",
    "aspect-square",
    "aspect-[4/3]",
    "aspect-[3/4]",
    "aspect-square",
    "aspect-[4/3]",
];

export default function PhotoCollage() {
    return (
        <div className="w-full max-w-md">
            <div className="columns-2 gap-3 [&>*]:mb-3">
                {TILES.map((aspect, i) => (
                    <div
                        key={i}
                        className={`${aspect} w-full break-inside-avoid rounded-lg border border-lighthighlight/50 bg-lighthighlight/10 flex items-center justify-center text-bodytext/30`}
                    >
                        <CameraIcon size={28} />
                    </div>
                ))}
            </div>
            <p className="pt-2 text-xs text-bodytext/40 text-center">
                photos coming soon
            </p>
        </div>
    );
}
