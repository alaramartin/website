import Image from "next/image";

// Collage for the "photographer" / "cat lover" proofs. Source images live in public/photos
// and public/cats as optimized WebP; next/image lazy-loads them (the collage only renders
// inside the md+ proof stage), so they never block the initial page load.
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
                            sizes="(min-width: 768px) 220px, 1px"
                            className="object-cover rounded-lg border border-lighthighlight/50"
                            draggable={false}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
