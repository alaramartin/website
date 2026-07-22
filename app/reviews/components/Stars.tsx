import { StarIcon, StarHalfIcon } from "@phosphor-icons/react/dist/ssr";

// render a 5-star rating from a (possibly fractional) number, e.g. 3.5 -> 3 filled,
// 1 half, 1 empty. always renders exactly 5 icons.
export default function Stars({
    stars,
    size = 18,
}: {
    stars: number;
    size?: number;
}) {
    const full = Math.floor(stars);
    const hasHalf = stars - full >= 0.5;
    const empty = 5 - full - (hasHalf ? 1 : 0);

    return (
        <div
            className="flex justify-center gap-0.5 text-accent"
            aria-label={`${stars} out of 5 stars`}
        >
            {Array.from({ length: full }).map((_, i) => (
                <StarIcon key={`f${i}`} size={size} weight="fill" />
            ))}
            {hasHalf && <StarHalfIcon size={size} weight="fill" />}
            {Array.from({ length: empty }).map((_, i) => (
                <StarIcon key={`e${i}`} size={size} weight="regular" />
            ))}
        </div>
    );
}
