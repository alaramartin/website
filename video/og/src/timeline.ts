// The whale's swim for the OG video, simulated up front with the site's own swim code so every
// frame is deterministic (Remotion renders frames out of order, in several tabs at once).
import { createWhalePod } from "../../../src/app/whale/whalePodSim.ts";

export const W = 1200;
export const H = 630;
export const FPS = 30;

export const NAME_PX = 124; // the old OG image's name was ~155px
export const WHALE_PX = 177; // the site's whale, before the sim scales it to the frame
const SIZE_SCALE = 1.5; // the sim shrinks whales to 0.7× on a 630px-tall frame; bring it back up
const SPEED = 80; // px/s at full size; the site uses 55
const STRIDE_BODY_LENGTHS = 0.7;
const WHALE_H = WHALE_PX * (338 / 904); // VIEW_H / VIEW_W
const KEEP_HIDDEN_S = 1.2; // offscreen pauses (the turnarounds) are cut down to this
const CROSSINGS = 2; // there and back

// The name's box, centred: "Alara Martin." in Georgia is 5.97em wide (measured from a render).
export const NAME_W_EM = 5.97;
export const nameBox = () => {
    const w = NAME_W_EM * NAME_PX;
    const h = 1.15 * NAME_PX;
    const l = (W - w) / 2;
    const t = (H - h) / 2;
    return { l, t, r: l + w, b: t + h };
};

export type Pose = {
    x: number;
    y: number;
    pitch: number;
    dir: number;
    scale: number;
    phase: number;
    effort: number;
    bend: number;
    visible: boolean;
};

const mulberry32 = (seed: number) => () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export function simulate(seed: number): Pose[] {
    const pod = createWhalePod({ random: mulberry32(seed), bodyLengthsPerStroke: STRIDE_BODY_LENGTHS });
    pod.setLayout({
        width: W,
        height: H,
        obstacles: [nameBox()],
        navBottom: 0,
        lengths: [WHALE_PX, WHALE_PX],
        heights: [WHALE_H, WHALE_H],
        speed: SPEED,
        sizeScale: SIZE_SCALE,
    });
    pod.spawn();

    const all: Pose[] = [];
    const dt = 1 / FPS;
    for (let i = 0; i < FPS * 120; i++) {
        const w = pod.whales[0];
        // Generous: fins, a tilted body and the heave reach past len / 2, and the loop is cut where
        // nothing at all is on screen.
        const reach = 0.6 * w.len;
        const vis = w.x + reach > 0 && w.x - reach < W && w.y + reach > 0 && w.y - reach < H;
        all.push({ x: w.x, y: w.y, pitch: w.pitch, dir: w.dir, scale: w.scale, phase: w.phase, effort: w.effort, bend: w.bend, visible: vis });
        // The first crossing starts with the whale already at the edge, so it's skipped.
        if (pod.debug().crossings > CROSSINGS + 1) break;
        pod.step(dt);
    }

    // Cut every hidden stretch down to `keep` frames, then loop from the middle of the first gap
    // (after the skipped crossing) to the middle of the last, so the loop point is out of sight.
    const keep = Math.round(KEEP_HIDDEN_S * FPS);
    const out: Pose[] = [];
    const gapMids: number[] = [];
    let hiddenRun: Pose[] = [];
    for (const p of all) {
        if (!p.visible) {
            hiddenRun.push(p);
            continue;
        }
        if (hiddenRun.length) {
            gapMids.push(out.length + Math.floor(Math.min(hiddenRun.length, keep) / 2));
            out.push(...hiddenRun.slice(-keep));
            hiddenRun = [];
        }
        out.push(p);
    }
    gapMids.push(out.length + Math.floor(Math.min(hiddenRun.length, keep) / 2));
    out.push(...hiddenRun.slice(0, keep));
    const firstGap = all[0].visible ? gapMids[0] : gapMids[1];
    return out.slice(firstGap, gapMids[gapMids.length - 1]);
}

export const SEED = 347;
