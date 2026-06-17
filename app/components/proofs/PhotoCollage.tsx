import Image from "next/image";

// Collage for the "photographer" / "cat lover" proofs. Source images live in public/photos
// and public/cats as optimized WebP; next/image lazy-loads them, so they never block the
// initial page load. Renders in the md+ proof stage AND the mobile content stack, so `sizes`
// covers both layouts (~220px tile on the desktop stage, ~45vw in the 2-col mobile stack).
const TILES = [0, 1, 2, 3];

interface PhotoCollageProps {
    catOrPhoto: "cat" | "photo";
}

export default function PhotoCollage({ catOrPhoto }: PhotoCollageProps) {
    const label = catOrPhoto === "cat" ? "Alara's cat" : "Photo by Alara";
    return (
        <div className="w-full max-w-md select-none">
            <div className="columns-2 gap-3 *:mb-3">
                {TILES.map((i) => (
                    <div
                        key={i}
                        className={`relative aspect-6/7 w-full break-inside-avoid`}
                    >
                        <Image
                            src={`/${catOrPhoto}s/${catOrPhoto}${i + 1}.webp`}
                            alt={label}
                            fill
                            sizes="(min-width: 768px) 220px, 45vw"
                            className="object-cover rounded-lg border border-lighthighlight/50"
                            draggable={false}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
