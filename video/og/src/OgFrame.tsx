import { useLayoutEffect, useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import WhaleSvg, { resolveWhaleEls, useWhaleSvgRefs } from "../../../src/app/whale/WhaleSvg";
import { HEAVE, applyWhaleArt, createWhaleRig, type WhaleInk } from "../../../src/app/whale/whaleInk";
import ink from "../../../src/app/data/whaleInk.json";
import { H, NAME_PX, W, WHALE_PX, type Pose } from "./timeline.ts";

const data = ink as WhaleInk;
const rig = createWhaleRig(data);
const WHALE_H = WHALE_PX * (338 / 904);

// The site's light theme (globals.css).
const COLORS = {
    background: "#efefef",
    foreground: "#171717",
    accent: "163, 0, 44",
    "--whale-ink": "#262325",
    "--whale-paper": "#f7f4f0",
    "--whale-pleat": "#d3cdc8",
};

type Placement = Partial<Pose>;

/** `place` pins the whale somewhere else (the OG image), overriding any of the pose's fields. */
export function OgFrame({ poses, frame: fixedFrame, place }: { poses: Pose[]; frame?: number; place?: Placement }) {
    const current = useCurrentFrame();
    const pose = poses[Math.min(fixedFrame ?? current, poses.length - 1)];
    const p = place ? { ...pose, ...place, visible: true } : pose;
    const refs = useWhaleSvgRefs();

    useLayoutEffect(() => {
        const els = resolveWhaleEls(refs);
        if (!els) return;
        if (!els.svg.dataset.art) {
            applyWhaleArt(els.svg, data);
            els.svg.dataset.art = "1";
        }
        rig.draw(els, p.phase, { undulation: p.effort, bend: p.bend });
    });

    // Same placement as the site's Whale.tsx.
    const transform = useMemo(() => {
        const bob = rig.heaveAt(p.phase) * HEAVE * p.effort * WHALE_PX;
        return (
            `translate(${(p.x - WHALE_PX / 2).toFixed(2)}px, ${(p.y - WHALE_H / 2).toFixed(2)}px) ` +
            `rotate(${p.pitch.toFixed(4)}rad) scale(${(p.dir * p.scale).toFixed(4)}, ${p.scale.toFixed(4)}) ` +
            `translateY(${bob.toFixed(2)}px)`
        );
    }, [p]);

    return (
        <AbsoluteFill style={{ background: COLORS.background, width: W, height: H, overflow: "hidden" }}>
            <style>{`.whale { display: block; width: ${WHALE_PX}px; height: auto; }`}</style>
            <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
                <div
                    style={{
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        fontSize: NAME_PX,
                        lineHeight: 1.15,
                        color: COLORS.foreground,
                        WebkitFontSmoothing: "antialiased",
                        textRendering: "optimizeLegibility",
                    }}
                >
                    <span
                        id="name"
                        style={{
                            backgroundImage: `linear-gradient(rgba(${COLORS.accent}, 0.4), rgba(${COLORS.accent}, 0.4))`,
                            backgroundSize: "100% 0.03em",
                            backgroundPosition: "0 92%",
                            backgroundRepeat: "no-repeat",
                        }}
                    >
                        Alara Martin.
                    </span>
                </div>
            </AbsoluteFill>
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: WHALE_PX,
                    transform,
                    visibility: p.visible ? "visible" : "hidden",
                    ["--whale-ink" as string]: COLORS["--whale-ink"],
                    ["--whale-paper" as string]: COLORS["--whale-paper"],
                    ["--whale-pleat" as string]: COLORS["--whale-pleat"],
                }}
            >
                <WhaleSvg refs={refs} className="whale" />
            </div>
        </AbsoluteFill>
    );
}
