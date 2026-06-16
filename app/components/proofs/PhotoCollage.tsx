import { CameraIcon } from "@phosphor-icons/react/dist/ssr";

// Placeholder collage for the "photographer" proof. Real photos go in public/ later;
// for now these are neutral tiles laid out in a small masonry-ish grid.
const TILES = [
    "aspect-[3/4]",
    "aspect-square",
    "aspect-square",
    "aspect-[4/3]",
];

export default function PhotoCollage() {
    return (
        <div className="w-full max-w-md">
            <div className="columns-2 gap-3 *:mb-3">
                {TILES.map((aspect, i) => (
                    <div
                        key={i}
                        className={`aspect-6/7 w-full break-inside-avoid flex items-center justify-center`}
                    >
                        <img
                            src={`/photography/photo${i + 1}.png`}
                            alt="Photo placeholder"
                            className="w-full h-full object-cover rounded-lg border border-lighthighlight/50"
                            draggable="false"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
