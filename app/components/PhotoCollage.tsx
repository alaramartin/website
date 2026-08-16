import Image from "next/image";

// Collage for the "photographer" / "cat lover" proofs. Source images live in public/photos
// and public/cats as optimized WebP; next/image lazy-loads them, so they never block the
// initial page load. Renders in the md+ proof stage AND the mobile content stack, so `sizes`
// covers both layouts (~220px/275px tile on the desktop stage, ~45vw/55vw in the 2-col mobile
// stack — the wider numbers are for landscape, whose container is scaled up so its tiles end up
// the same on-page size as portrait's; see the comment below).
const TILES = [0, 1, 2, 3];

interface PhotoCollageProps {
    catOrPhoto: "cat" | "photo";
    landscape: boolean;
}

export default function PhotoCollage({
    catOrPhoto,
    landscape,
}: PhotoCollageProps) {
    const label = catOrPhoto === "cat" ? "Cat" : "Photo by Alara Martin";
    // Each tile's width is fixed by the 2-column layout, so its aspect ratio alone decides its
    // area: a 4/3 landscape crop is much shorter (and so much smaller) than a 6/7 portrait crop
    // at the same width. Widen the landscape container by sqrt(14/9) (≈1.25x) so landscape tiles
    // end up the same on-page area as portrait ones instead of looking noticeably smaller.
    return (
        <div
            className={`w-full ${landscape ? "max-w-140" : "max-w-md"} select-none`}
        >
            <div className="columns-2 gap-3 *:mb-3">
                {TILES.map((i) => (
                    <div
                        key={i}
                        className={`relative ${landscape ? "aspect-4/3" : "aspect-6/7"} w-full break-inside-avoid`}
                    >
                        <Image
                            src={`/${catOrPhoto}s/${catOrPhoto}${i + 1}.webp`}
                            alt={label}
                            fill
                            sizes={
                                landscape
                                    ? "(min-width: 768px) 275px, 55vw"
                                    : "(min-width: 768px) 220px, 45vw"
                            }
                            className="object-cover rounded-lg border border-lighthighlight/50"
                            draggable={false}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
