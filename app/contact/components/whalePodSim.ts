// Swimming for the contact page's pair of whales. Deliberately DOM-free (and import-free):
// WhalePod.tsx feeds it measured layout and reads back poses, and it can be simulated headless.
//
// The whales are flat side-view drawings, so they never turn around on screen (that would mean
// flipping the drawing). Instead the pair makes crossings: enter from one side, swim across, leave
// through the other, and after a short pause out of sight usually come back the other way. Within
// a crossing they can climb and dive steeply, so there's plenty of room for variety:
//   - wave:  meander up and down through one open band (above or below the text),
//   - swoop: dive or climb past one end of the text into the other band,
//   - arc:   dip around the text and come back up past its other end (a rough half-circle).
// Each crossing is built from randomised waypoints joined by a smooth curve (x strictly advancing,
// so the whale can't reverse), then checked: clearance from the text for however tilted the whale
// is at each point, a pitch limit, and a minimum turning radius. Failed attempts are re-rolled,
// falling back to gentler styles. The whales follow the finished curve rather than steering
// frame by frame, so their movement is smooth by construction.
//
// Along the way the pair keeps changing how it swims together: the overall speed drifts, and every
// few seconds they ease into a new arrangement — one ahead or behind, above or below, closer or
// looser. Swapping who's on top happens only once one whale is clearly ahead, so they pass over
// or under each other rather than through.

export type Rect = { l: number; t: number; r: number; b: number };

export type PodLayout = {
    width: number;
    height: number;
    obstacles: Rect[]; // text to keep clear of, in section coordinates (unpadded)
    navBottom: number; // bottom edge of the fixed nav bar, in section coordinates
    lengths: [number, number]; // unscaled drawing size of each whale, px
    heights: [number, number];
    speed: number; // cruise speed for full-size whales, px/s
    sizeScale?: number; // extra size multiplier (e.g. smaller whales on narrow screens)
};

export type PodWhale = {
    x: number; // centre, section coordinates
    y: number;
    pitch: number; // radians; rotation to apply after mirroring for `dir` (never beyond ±90°)
    dir: number; // 1 = swimming right, -1 = swimming left
    speed: number; // px/s actually travelled
    phase: number; // 0..1 through the swim cycle
    scale: number; // size multiplier for short sections
    len: number; // scaled body length, px
    h: number; // scaled drawing height, px
    visible: boolean; // any part on screen
    effort: number; // how hard the tail is working (1 ≈ steady cruise); scales the body's heave
    bend: number; // −1..1: how far the body curves into its current turn (drawing's local frame)
};

export type CrossingStyle = "wave" | "swoop" | "arc" | "fallback";

type Whale = PodWhale & {
    strokeFactor: number;
    vx: number; // smoothed velocity, px/s — the body points along this
    vy: number;
    accel: number; // smoothed change in speed, px/s²
    pitchVel: number; // rad/s — tilt follows its target through a smooth spring, not a hard rate cap
    baseLen: number; // unscaled drawing size, px
    baseH: number;
    targetScale: number; // scale the layout calls for; `scale` eases toward it
};
type Point = { x: number; y: number };
type Band = { lo: number; hi: number };
type Path = { xs: Float32Array; ys: Float32Array; txs: Float32Array; tys: Float32Array; length: number };

const TUNING = {
    referenceHeight: 900, // sections at least this tall show whales at full size
    minScale: 0.7,
    maxPitchDeg: 68, // steepest climb or dive (tilt changes are separately rate-capped when drawn)
    maxPitchRateDeg: 18, // cap on how fast a whale's tilt can change, degrees per second
    pitchTau: 0.22, // seconds for a whale's tilt to settle onto a new heading (a smooth spring, no ticking)
    maxPitchAccelDeg: 120, // cap on how quickly tilting itself can start or stop, degrees per second²
    spacingTau: 0.6, // seconds for extra spacing between the two whales to ease in or out
    minTurnRadius: 0.6, // body lengths — bends slow the pair and drawn tilt is rate-capped, so this can be fairly tight
    clearance: 0.08, // body lengths of open water kept between the pair and any text
    sampleStep: 4, // px between samples of the planned curve
    waypointSpacing: [200, 420], // px between waypoints along x
    planTries: 60,
    styleWeights: { wave: 0.35, swoop: 0.35, arc: 0.3 },
    pauseSeconds: [1.75, 4.25], // out of sight between crossings
    offscreenSpeedup: 4.5, // swim faster while neither whale is visible (entering/leaving past the edges)
    returnChance: 0.7, // come back the way they left, rather than re-enter from the same side
    speedRange: [0.75, 1.1], // pair speed, as a fraction of cruise
    speedHoldSeconds: [8, 16], // how long before picking a new pair speed
    speedTau: 6, // seconds to ease into a new speed
    pairAccel: 0.06, // max change in pair speed while visible, × cruise per second
    relativeAccel: 0.1, // max change in one whale's speed relative to the other, × cruise per second
    pitchSpeedBoost: 0.06, // a little faster when diving, slower when climbing
    // Relative arrangement of the two whales (along = along the path, lateral = across it).
    alongRange: 1.3, // body lengths either way
    lateralRange: 1.15, // drawing heights either way
    centreRange: 0.1, // drawing heights the pair as a whole drifts off the path
    clearAlong: 1.1, // body lengths ahead before they may be at the same height
    clearLateral: 0.95, // drawing heights apart whenever they're not clearly staggered
    arrangeTau: 7, // seconds to ease into a new arrangement
    arrangeHoldSeconds: [3, 8],
    maxRelativeSpeed: 0.35, // cap on how fast one whale moves relative to the other, × pair speed
    lateralSlipDeg: 12, // sideways shifts within the pair are slow enough to need at most this much tilt
    thrustGain: 2.5, // seconds: speeding up works the tail harder, slowing down lets it glide
    bodyBendTau: 0.35, // seconds to ease the body's curve into and out of turns
    scaleTau: 0.5, // seconds to ease whale size after a resize
    replanDelay: 0.3, // seconds after the last resize before re-planning the rest of a crossing
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const now = () => globalThis.performance?.now() ?? Date.now();

// Critically damped ease toward a target: smooth, no overshoot, no jitter.
const spring = (x: number, v: number, target: number, tau: number, dt: number): [number, number] => {
    const w = 2 / tau;
    const nv = v + (w * w * (target - x) - 2 * w * v) * dt;
    return [x + nv * dt, nv];
};

export function createWhalePod(options: { random?: () => number; bodyLengthsPerStroke?: number } = {}) {
    const random = options.random ?? Math.random;
    const strokeLengths = options.bodyLengthsPerStroke ?? 1.2;
    const between = (lo: number, hi: number) => lo + random() * (hi - lo);
    const pickRange = (range: number[]) => between(range[0], range[1]);

    const makeWhale = (strokeFactor: number): Whale => ({
        x: -1e4, y: 0, pitch: 0, dir: 1, speed: 0, phase: random(), scale: 1, len: 1, h: 1, visible: false, strokeFactor,
        vx: 0, vy: 0, accel: 0, effort: 1, bend: 0, baseLen: 1, baseH: 1, targetScale: 1, pitchVel: 0,
    });
    const whales: [Whale, Whale] = [makeWhale(1.05), makeWhale(0.93)];

    let W = 0;
    let H = 0;
    let cruise = 0;
    let ready = false;
    let rects: Rect[] = [];
    let textBox: Rect | null = null;

    let clock = 0;
    let active = false;
    let dir = random() < 0.5 ? 1 : -1;
    let path: Path | null = null;
    let sPod = 0; // the pair's reference position, as arc length along the path
    let pauseUntil = 0;
    let style: CrossingStyle = "wave";
    let crossings = 0;
    let fallbacks = 0;
    const failures: Record<string, number> = {}; // rejected plan attempts, by "style:reason"
    let lastPlanMs = 0;
    let needsReplan = false; // the layout changed mid-crossing
    let replanAt = 0;
    let resizedAt = -Infinity; // when the section's size last changed
    let seenThisCrossing = false; // whether either whale has been on screen yet this crossing
    let crossingStartedAt = 0; // when the current crossing's path was planned

    let speedFactor = 1;
    let speedVel = 0;
    let speedGoal = 1;
    let speedGoalUntil = 0;
    let podSpeed = 0; // the pair's actual speed along the path, px/s (acceleration-limited)
    let lastSeparationPush = 0; // debug: how far the spacing check pushed the pair apart this frame, px
    let lastProjected = false; // debug: whether the arrangement safety clamp fired this frame
    let sepAlong = 0; // extra spacing between the two whales along the path, px (eased in and out)
    let sepLateral = 0; // extra spacing across the path, px
    let sepGoalAlong = 0; // where that spacing is easing toward
    let sepGoalLateral = 0;
    let sepAlongVel = 0;
    let sepLateralVel = 0;
    let smoothedTarget = 0; // low-passed target pair speed, px/s

    // Relative arrangement: da = how far whale 0 is ahead of whale 1 along the path (px),
    // dn = how far whale 0 is to the path's normal side of whale 1 (px), c = pair's shared offset.
    const rel = { da: 0, dn: 0, c: 0, vda: 0, vdn: 0, vc: 0 };
    let relQueue: { da: number; dn: number; c: number }[] = [];
    let relHoldUntil = 0;

    const avgLen = () => (whales[0].len + whales[1].len) / 2;
    const avgH = () => (whales[0].h + whales[1].h) / 2;
    const maxLen = () => Math.max(whales[0].len, whales[1].len);
    const maxH = () => Math.max(whales[0].h, whales[1].h);
    const lateralReach = () => (TUNING.centreRange + TUNING.lateralRange / 2) * avgH();
    const offscreenMargin = () => maxLen() * (0.5 + TUNING.alongRange / 2) + lateralReach() + 24;

    // ---- planning ---------------------------------------------------------------------------

    // Room the pair needs around its path point when the path is tilted by `angle`.
    const padding = (angle: number) => {
        const c = Math.abs(Math.cos(angle));
        const s = Math.abs(Math.sin(angle));
        const halfLen = 0.5 * maxLen();
        const across = lateralReach() + 0.5 * maxH();
        const clr = TUNING.clearance * maxLen();
        return { x: c * halfLen + s * across + clr, y: s * halfLen + c * across + clr, edgeY: s * halfLen + c * across + 2 };
    };

    const hitsText = (x: number, y: number, pad: { x: number; y: number }) =>
        rects.some((r) => x > r.l - pad.x && x < r.r + pad.x && y > r.t - pad.y && y < r.b + pad.y);

    // Horizontal bands a level pair can swim through across (nearly) the whole screen.
    function bands(): Band[] {
        const pad = padding(0);
        const out: Band[] = [];
        let start = -1;
        for (let y = pad.edgeY; y <= H - pad.edgeY + 0.01; y += 4) {
            let open = 0;
            const columns = Math.max(12, Math.ceil(W / 24)); // fine enough not to miss narrow text
            for (let k = 0; k <= columns; k++) if (!hitsText((W * k) / columns, y, pad)) open++;
            if (open >= 0.95 * (columns + 1)) {
                if (start < 0) start = y;
            } else if (start >= 0) {
                out.push({ lo: start, hi: y - 4 });
                start = -1;
            }
        }
        if (start >= 0) out.push({ lo: start, hi: H - pad.edgeY });
        return out.filter((b) => b.hi - b.lo >= 0);
    }

    // x ranges beside the text (past its left and right ends) where the pair can pass up or down.
    function gaps(): { lo: number; hi: number }[] {
        if (!textBox) return [];
        const steep = padding((50 * Math.PI) / 180);
        const L = maxLen();
        const out = [];
        // Passages may sit well past the screen edge, so the dive can happen mostly out of view.
        const left = { lo: -1.0 * L, hi: textBox.l - steep.x };
        const right = { lo: textBox.r + steep.x, hi: W + 1.0 * L };
        if (left.hi - left.lo > 10) out.push(left);
        if (right.hi - right.lo > 10) out.push(right);
        return out;
    }

    // Smooth curve through waypoints: x via monotone cubic (so it never reverses), y via
    // Catmull-Rom, resampled every sampleStep px of arc length.
    function buildPath(points: Point[], startSlope?: number): Path {
        const n = points.length;
        const xs = points.map((p) => p.x);
        const ys = points.map((p) => p.y);
        const d = xs.slice(0, -1).map((x, i) => xs[i + 1] - x);
        const mx = xs.map((_, i) => (i === 0 ? d[0] : i === n - 1 ? d[n - 2] : (d[i - 1] + d[i]) / 2));
        for (let i = 0; i < n - 1; i++) {
            const a = mx[i] / d[i];
            const b = mx[i + 1] / d[i];
            const m = a * a + b * b;
            if (m > 9) {
                const t = 3 / Math.sqrt(m);
                mx[i] = t * a * d[i];
                mx[i + 1] = t * b * d[i];
            }
        }
        const my = ys.map((_, i) => (i === 0 ? ys[1] - ys[0] : i === n - 1 ? ys[n - 1] - ys[n - 2] : (ys[i + 1] - ys[i - 1]) / 2));
        if (startSlope !== undefined) my[0] = mx[0] * startSlope; // continue smoothly from an existing path

        const dense: Point[] = [];
        for (let i = 0; i < n - 1; i++) {
            for (let k = i === 0 ? 0 : 1; k <= 48; k++) {
                const t = k / 48;
                const t2 = t * t;
                const t3 = t2 * t;
                const h00 = 2 * t3 - 3 * t2 + 1;
                const h10 = t3 - 2 * t2 + t;
                const h01 = -2 * t3 + 3 * t2;
                const h11 = t3 - t2;
                dense.push({
                    x: h00 * xs[i] + h10 * mx[i] + h01 * xs[i + 1] + h11 * mx[i + 1],
                    y: h00 * ys[i] + h10 * my[i] + h01 * ys[i + 1] + h11 * my[i + 1],
                });
            }
        }
        // Resample by arc length.
        const step = TUNING.sampleStep;
        const outX: number[] = [dense[0].x];
        const outY: number[] = [dense[0].y];
        let carry = 0;
        for (let i = 1; i < dense.length; i++) {
            const ax = dense[i - 1].x;
            const ay = dense[i - 1].y;
            const seg = Math.hypot(dense[i].x - ax, dense[i].y - ay);
            let pos = step - carry;
            while (pos <= seg) {
                outX.push(ax + ((dense[i].x - ax) * pos) / seg);
                outY.push(ay + ((dense[i].y - ay) * pos) / seg);
                pos += step;
            }
            carry = seg - (pos - step);
        }
        const count = outX.length;
        const txs = new Float32Array(count);
        const tys = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            const a = Math.max(0, i - 2);
            const b = Math.min(count - 1, i + 2);
            const dx = outX[b] - outX[a];
            const dy = outY[b] - outY[a];
            const len = Math.hypot(dx, dy) || 1;
            txs[i] = dx / len;
            tys[i] = dy / len;
        }
        return { xs: Float32Array.from(outX), ys: Float32Array.from(outY), txs, tys, length: (count - 1) * step };
    }

    // Tilt of the drawing at a path sample (mirroring for dir is applied separately).
    const tiltAt = (tx: number, ty: number) => Math.atan2(dir * ty, dir * tx);

    // Returns why a planned path is unusable, or null if it's fine.
    function pathProblem(p: Path, skipPx = 0, ignoreLayout = false): string | null {
        const maxPitch = (TUNING.maxPitchDeg * Math.PI) / 180;
        const minRadius = TUNING.minTurnRadius * avgLen();
        const count = p.xs.length;
        const reach = 0.5 * maxLen() + lateralReach();
        for (let i = 0; i < count; i++) {
            if (dir * p.txs[i] <= 0.05) return "headway"; // must keep moving forward
            const tilt = tiltAt(p.txs[i], p.tys[i]);
            if (Math.abs(tilt) > maxPitch) return "pitch";
            if (i >= 3 && i < count - 3) {
                const turn = Math.abs(tiltAt(p.txs[i + 3], p.tys[i + 3]) - tiltAt(p.txs[i - 3], p.tys[i - 3]));
                if (turn > 1e-6 && (6 * TUNING.sampleStep) / turn < minRadius) return "turn";
            }
            const x = p.xs[i];
            const y = p.ys[i];
            if (x < -reach || x > W + reach || y < -reach || y > H + reach) continue; // fully off screen: anything goes
            if (i * TUNING.sampleStep < skipPx) continue; // continuing after a resize: let the pair swim clear first
            const pad = padding(tilt);
            if (ignoreLayout) continue; // last-resort path: only the swimming checks above apply
            if (y < pad.edgeY || y > H - pad.edgeY) return "edge";
            if (hitsText(x, y, pad)) return "text";
        }
        return null;
    }

    function chooseStyle(bandCount: number, gapCount: number): CrossingStyle {
        if (bandCount < 2 || gapCount === 0) return "wave";
        const w = TUNING.styleWeights;
        let roll = random() * (w.wave + w.swoop + w.arc);
        if ((roll -= w.wave) < 0) return "wave";
        if ((roll -= w.swoop) < 0 || gapCount < 2) return "swoop";
        return "arc";
    }

    // Waypoints for one attempt at a crossing of the given style.
    function waypoints(kind: CrossingStyle, laneList: Band[], gapList: { lo: number; hi: number }[], from?: Point): Point[] {
        const margin = offscreenMargin();
        const xStart = from?.x ?? (dir > 0 ? -margin : W + margin);
        const xEnd = dir > 0 ? W + margin : -margin;
        const inBand = (b: Band, bias = 0.5) => clamp(b.lo + (b.hi - b.lo) * (bias + between(-0.35, 0.35)), b.lo, b.hi);
        const laneA = laneList[Math.floor(random() * laneList.length)];
        const others = laneList.filter((b) => b !== laneA);
        const laneB = others.length ? others[Math.floor(random() * others.length)] : laneA;

        // Anchors in travel order: [x, lane] pairs, plus gap passages where the lane changes.
        const passagesInTravelOrder = dir > 0 ? gapList : [...gapList].reverse();
        type Anchor = { x: number; y: number; lane: Band | null };
        const anchors: Anchor[] = [{ x: xStart, y: from?.y ?? inBand(laneA), lane: laneA }];
        const passage = (g: { lo: number; hi: number }, a: Band, b: Band) => {
            const x = clamp(between(g.lo, g.hi), g.lo, g.hi);
            const mid = (a.lo + a.hi + b.lo + b.hi) / 4 + between(-0.06, 0.06) * H;
            const lead = between(150, 340); // room to bend into and out of the dive/climb
            anchors.push({ x: x - dir * lead, y: inBand(a), lane: a });
            anchors.push({ x, y: mid, lane: null });
            anchors.push({ x: x + dir * lead, y: inBand(b), lane: b });
        };
        if (kind === "swoop") {
            const g = passagesInTravelOrder[Math.floor(random() * passagesInTravelOrder.length)];
            passage(g, laneA, laneB);
            anchors.push({ x: xEnd, y: inBand(laneB), lane: laneB });
        } else if (kind === "arc") {
            passage(passagesInTravelOrder[0], laneA, laneB);
            passage(passagesInTravelOrder[passagesInTravelOrder.length - 1], laneB, laneA);
            anchors.push({ x: xEnd, y: inBand(laneA), lane: laneA });
        } else {
            anchors.push({ x: xEnd, y: inBand(laneA), lane: laneA });
        }

        // Fill long stretches within a lane with wavy waypoints.
        const points: Point[] = [{ x: anchors[0].x, y: anchors[0].y }];
        let up = random() < 0.5;
        for (let i = 1; i < anchors.length; i++) {
            const a = anchors[i - 1];
            const b = anchors[i];
            if (a.lane && a.lane === b.lane) {
                const lane = a.lane;
                let x = a.x;
                for (;;) {
                    const spacing = pickRange(TUNING.waypointSpacing);
                    x += dir * spacing;
                    if (dir * (b.x - x) < 120) break;
                    const half = (lane.hi - lane.lo) / 2;
                    // Tall bands allow big waves, but keep each one in proportion to its length so the
                    // bends stay gentle enough to pass the turning-radius check.
                    const amp = Math.min(half, 0.2 * H, 0.3 * spacing) * between(0.4, 1);
                    points.push({ x, y: clamp((lane.lo + lane.hi) / 2 + (up ? -amp : amp), lane.lo, lane.hi) });
                    up = !up;
                }
            }
            points.push({ x: b.x, y: b.y });
        }
        // Keep x strictly advancing with some breathing room.
        const out: Point[] = [points[0]];
        for (const p of points.slice(1)) if (dir * (p.x - out[out.length - 1].x) >= 60) out.push(p);
        if (dir * (xEnd - out[out.length - 1].x) > 0.01) out.push({ x: xEnd, y: out[out.length - 1].y });
        return out;
    }

    // When the text leaves no clear way across at all (a very small window), still swim rather than
    // hide: a gentle straight line at whichever height overlaps the text least. The text is layered
    // above the whales, so they pass behind it.
    function behindTextPath(from?: Point, startSlope?: number): boolean {
        const margin = offscreenMargin();
        const endX = dir > 0 ? W + margin : -margin;
        if (from && dir * (endX - from.x) < 120) return false;
        const pad = padding(0);
        let bestY = H / 2;
        let fewestBlocked = Infinity;
        for (let y = Math.min(pad.edgeY, H / 2); y <= Math.max(H - pad.edgeY, H / 2); y += 4) {
            let blocked = 0;
            for (let k = 0; k <= 24; k++) if (hitsText((W * k) / 24, y, pad)) blocked++;
            if (blocked < fewestBlocked || (blocked === fewestBlocked && Math.abs(y - H / 2) < Math.abs(bestY - H / 2))) {
                fewestBlocked = blocked;
                bestY = y;
            }
        }
        const start = from ?? { x: dir > 0 ? -margin : W + margin, y: bestY };
        const mid = { x: (start.x + endX) / 2, y: bestY };
        const points = dir * (mid.x - start.x) >= 60 ? [start, mid, { x: endX, y: bestY }] : [start, { x: endX, y: bestY }];
        const candidate = buildPath(points, startSlope);
        if (pathProblem(candidate, 0, true)) return false;
        path = candidate;
        style = "fallback";
        fallbacks++;
        return true;
    }

    function plan(from?: Point, startSlope?: number): boolean {
        const started = now();
        const laneList = bands();
        const gapList = gaps();
        if (!laneList.length) {
            lastPlanMs = now() - started;
            return behindTextPath(from, startSlope);
        }
        let kind = chooseStyle(laneList.length, gapList.length);
        for (let attempt = 0; attempt < TUNING.planTries; attempt++) {
            if (attempt === Math.floor(TUNING.planTries * 0.7) && kind !== "wave") kind = "wave"; // too awkward: go gentler
            const points = waypoints(kind, laneList, gapList, from);
            if (points.length < 2) break; // already at (or past) the far edge: nothing left to plan
            const candidate = buildPath(points, startSlope);
            const problem = pathProblem(candidate, from ? 0.8 * maxLen() : 0);
            if (!problem) {
                path = candidate;
                style = kind;
                lastPlanMs = now() - started;
                return true;
            }
            failures[`${kind}:${problem}`] = (failures[`${kind}:${problem}`] ?? 0) + 1;
        }
        // Last resort: straight through the middle of a band.
        const lane = laneList[Math.floor(random() * laneList.length)];
        const y = (lane.lo + lane.hi) / 2;
        const margin = offscreenMargin();
        if (from && dir * ((dir > 0 ? W + margin : -margin) - from.x) < 120) {
            lastPlanMs = now() - started;
            return false; // too close to the far edge for a fallback path
        }
        const straight = buildPath([
            from ?? { x: dir > 0 ? -margin : W + margin, y },
            { x: W / 2, y },
            { x: dir > 0 ? W + margin : -margin, y },
        ], startSlope);
        lastPlanMs = now() - started;
        if (pathProblem(straight, from ? 0.8 * maxLen() : 0)) return behindTextPath(from, startSlope);
        path = straight;
        style = "fallback";
        fallbacks++;
        return true;
    }

    // After a resize: keep the stretch of path the whales are currently on (so nothing jumps) and
    // re-plan the rest of the crossing around the new layout, continuing smoothly from its end.
    function replanRest(): boolean {
        if (!path) return true;
        const old = path;
        const step = TUNING.sampleStep;
        const spread = (Math.abs(rel.da) + Math.abs(sepAlong)) / 2;
        const iFrom = Math.max(0, Math.floor((sPod - spread - maxLen()) / step));
        const iTo = Math.min(old.xs.length - 1, Math.ceil((sPod + spread + 1.2 * maxLen()) / step));
        if (iTo >= old.xs.length - 2) return true; // nearly through this crossing anyway
        const margin = offscreenMargin();
        if (dir * ((dir > 0 ? W + margin : -margin) - old.xs[iTo]) < 150) return true; // about to leave anyway
        const keptStyle = style;
        if (!plan({ x: old.xs[iTo], y: old.ys[iTo] }, old.tys[iTo] / old.txs[iTo])) {
            path = old;
            style = keptStyle;
            return false;
        }
        const fresh = path!;
        const count = iTo - iFrom + fresh.xs.length; // fresh's first sample is old's sample iTo
        const join = (a: Float32Array, b: Float32Array) => {
            const out = new Float32Array(count);
            out.set(a.subarray(iFrom, iTo + 1), 0);
            out.set(b.subarray(1), iTo - iFrom + 1);
            return out;
        };
        path = {
            xs: join(old.xs, fresh.xs),
            ys: join(old.ys, fresh.ys),
            txs: join(old.txs, fresh.txs),
            tys: join(old.tys, fresh.tys),
            length: (count - 1) * step,
        };
        sPod -= iFrom * step;
        return true;
    }

    // ---- motion -----------------------------------------------------------------------------

    function pathAt(s: number) {
        const p = path!;
        const last = p.xs.length - 1;
        if (s <= 0 || s >= p.length) {
            // Beyond the ends (only ever off screen): continue straight along the end tangent.
            const i = s <= 0 ? 0 : last;
            const extra = s <= 0 ? s : s - p.length;
            return { x: p.xs[i] + p.txs[i] * extra, y: p.ys[i] + p.tys[i] * extra, tx: p.txs[i], ty: p.tys[i] };
        }
        const f = s / TUNING.sampleStep;
        const i = Math.min(Math.floor(f), last - 1);
        const t = f - i;
        const tx = p.txs[i] + (p.txs[i + 1] - p.txs[i]) * t;
        const ty = p.tys[i] + (p.tys[i + 1] - p.tys[i]) * t;
        const tl = Math.hypot(tx, ty) || 1;
        return { x: p.xs[i] + (p.xs[i + 1] - p.xs[i]) * t, y: p.ys[i] + (p.ys[i + 1] - p.ys[i]) * t, tx: tx / tl, ty: ty / tl };
    }

    function planArrangement() {
        const L = avgLen();
        const h = avgH();
        const target = { da: between(-TUNING.alongRange, TUNING.alongRange) * L, dn: 0, c: between(-TUNING.centreRange, TUNING.centreRange) * h };
        const staggered = Math.abs(target.da) >= TUNING.clearAlong * L;
        const side = random() < 0.5 ? -1 : 1;
        target.dn = staggered
            ? between(-TUNING.lateralRange, TUNING.lateralRange) * h
            : side * between(TUNING.clearLateral, TUNING.lateralRange) * h;
        relQueue = [];
        const swapping = Math.sign(target.dn || 1) !== Math.sign(rel.dn || 1);
        if (swapping && (Math.abs(rel.da) < TUNING.clearAlong * L || !staggered)) {
            // Changing who's on top: first get one clearly ahead, then pass over/under.
            const ahead = Math.abs(target.da) >= TUNING.clearAlong * L ? Math.sign(target.da) : Math.sign(rel.da) || side;
            const staged = ahead * (TUNING.clearAlong + 0.15) * L;
            relQueue.push({ da: staged, dn: rel.dn, c: target.c });
            relQueue.push({ da: staged, dn: target.dn, c: target.c });
        }
        relQueue.push(target);
    }

    function updateArrangement(dt: number, pairSpeed: number) {
        if (!relQueue.length && clock >= relHoldUntil) planArrangement();
        const goal = relQueue[0] ?? { da: rel.da, dn: rel.dn, c: rel.c };
        const tau = TUNING.arrangeTau;
        const maxAccel = TUNING.relativeAccel * cruise;
        // Spring toward the goal, but cap how quickly the relative velocity may change, so neither
        // whale surges ahead or drops back abruptly.
        const ease = (x: number, v: number, target: number, maxV: number): [number, number] => {
            const [, wanted] = spring(x, v, target, tau, dt);
            const nv = clamp(v + clamp(wanted - v, -maxAccel * dt, maxAccel * dt), -maxV, maxV);
            return [x + nv * dt, nv];
        };
        const maxRel = TUNING.maxRelativeSpeed * pairSpeed;
        // A whale can't slide sideways: shifts across the path are kept slow relative to forward
        // speed, so a slight tilt toward the new position is enough to make them.
        const maxSideways = Math.tan((TUNING.lateralSlipDeg * Math.PI) / 180) * pairSpeed;
        [rel.da, rel.vda] = ease(rel.da, rel.vda, goal.da, maxRel);
        [rel.dn, rel.vdn] = ease(rel.dn, rel.vdn, goal.dn, maxSideways);
        [rel.c, rel.vc] = ease(rel.c, rel.vc, goal.c, maxSideways);
        // Safety: never let them sit level while overlapping along the path.
        const L = avgLen();
        const h = avgH();
        lastProjected = false;
        const minLateral = 0.95 * TUNING.clearLateral * h;
        if (Math.abs(rel.da) < 0.95 * TUNING.clearAlong * L && Math.abs(rel.dn) < minLateral) {
            // Ease back out to the minimum spacing instead of snapping there in one frame.
            const side = Math.sign(rel.dn) || 1;
            rel.dn += side * Math.min(minLateral - Math.abs(rel.dn), 0.35 * cruise * dt);
            rel.vdn = side * Math.max(side * rel.vdn, 0);
            lastProjected = true;
        }
        if (relQueue.length && Math.abs(rel.da - goal.da) < 0.1 * L && Math.abs(rel.dn - goal.dn) < 0.1 * h) {
            relQueue.shift();
            if (!relQueue.length) relHoldUntil = clock + pickRange(TUNING.arrangeHoldSeconds);
        }
    }

    // Closest distance between two whales' body midlines.
    const bodyGap = (a: { x: number; y: number; pitch: number; dir: number }, la: number, b: typeof a, lb: number) => {
        let best = Infinity;
        for (let i = -2; i <= 2; i++) {
            const ax = a.x + (a.dir * Math.cos(a.pitch) * 0.42 * la * i) / 2;
            const ay = a.y + (a.dir * Math.sin(a.pitch) * 0.42 * la * i) / 2;
            for (let j = -2; j <= 2; j++) {
                const bx = b.x + (b.dir * Math.cos(b.pitch) * 0.42 * lb * j) / 2;
                const by = b.y + (b.dir * Math.sin(b.pitch) * 0.42 * lb * j) / 2;
                best = Math.min(best, Math.hypot(ax - bx, ay - by));
            }
        }
        return best;
    };

    function pose(dt: number) {
        // Extra spacing (see below) is applied in the path's own frame: along it and across it.
        const along = [rel.da / 2 + sepAlong / 2, -rel.da / 2 - sepAlong / 2];
        const lateral = [rel.c + rel.dn / 2 + sepLateral / 2, rel.c - rel.dn / 2 - sepLateral / 2];
        const targets = whales.map((w, i) => {
            const p = pathAt(sPod + along[i]);
            // The spacing check uses each whale's pitch as currently drawn; the new pitch follows the
            // whale's actual motion and is set below.
            return {
                x: p.x - p.ty * lateral[i],
                y: p.y + p.tx * lateral[i],
                pitch: dt > 0 ? w.pitch : tiltAt(p.tx, p.ty),
                dir,
                tx: p.tx,
                ty: p.ty,
            };
        });
        const need = 0.42 * (whales[0].h + whales[1].h);
        const gap = bodyGap(targets[0], whales[0].len, targets[1], whales[1].len);
        // Extra spacing builds up and releases at a capped rate (with a little hysteresis) rather
        // than appearing in a single frame.
        // When the bodies get too close, ease them apart in the direction they're already offset from
        // each other, split into along-path and across-path parts. That direction changes smoothly as
        // they move, so the push can't suddenly flip. Once there's room again it's released gradually.
        if (dt > 0) {
            const rate = 0.5 * Math.max(podSpeed, 0.5 * cruise) * dt;
            const t = pathAt(sPod);
            const dx = targets[0].x - targets[1].x;
            const dy = targets[0].y - targets[1].y;
            const d = Math.hypot(dx, dy) || 1;
            const ua = (dx * t.tx + dy * t.ty) / d; // along-path share of the direction between them
            const un = (-dx * t.ty + dy * t.tx) / d; // across-path share
            if (gap < need) {
                const extra = Math.min(need - gap, rate);
                sepGoalAlong += extra * ua;
                sepGoalLateral += extra * un;
            } else if (gap > need + 8) {
                // Release only with a generous dead zone, so it doesn't toggle on and off near the edge.
                const size = Math.hypot(sepGoalAlong, sepGoalLateral);
                if (size > 0) {
                    const keep = Math.max(0, size - Math.min(gap - need - 8, 0.5 * rate)) / size;
                    sepGoalAlong *= keep;
                    sepGoalLateral *= keep;
                }
            }
            sepGoalAlong = clamp(sepGoalAlong, -1.2 * avgLen(), 1.2 * avgLen());
            sepGoalLateral = clamp(sepGoalLateral, -0.6 * avgH(), 0.6 * avgH()); // stays within the text clearance
            // The applied spacing eases toward that goal through a spring, so it never ticks.
            [sepAlong, sepAlongVel] = spring(sepAlong, sepAlongVel, sepGoalAlong, TUNING.spacingTau, dt);
            [sepLateral, sepLateralVel] = spring(sepLateral, sepLateralVel, sepGoalLateral, TUNING.spacingTau, dt);
        }
        lastSeparationPush = Math.hypot(sepAlong, sepLateral);
        whales.forEach((w, i) => {
            const t = targets[i];
            if (dt > 0 && Math.hypot(t.x - w.x, t.y - w.y) / dt < cruise * 5) {
                // A whale points where it's going: the body angle follows its own smoothed velocity
                // (whatever moves it — path, formation shifts, spacing), at a capped turning rate.
                const k = 1 - Math.exp(-dt / 0.25);
                w.vx += ((t.x - w.x) / dt - w.vx) * k;
                w.vy += ((t.y - w.y) / dt - w.vy) * k;
                const speed = Math.hypot(w.vx, w.vy);
                const maxPitch = (TUNING.maxPitchDeg * Math.PI) / 180;
                const heading =
                    dir * w.vx > 1 ? clamp(Math.atan2(dir * w.vy, dir * w.vx), -maxPitch, maxPitch) : tiltAt(t.tx, t.ty);
                // Tilt follows the heading through a critically damped spring with capped turning speed
                // and turning acceleration. (A plain rate cap ticks back and forth whenever the target
                // wobbles near the cap — that was the jitter on some turns.)
                const maxRate = (TUNING.maxPitchRateDeg * Math.PI) / 180;
                const maxAngAccel = (TUNING.maxPitchAccelDeg * Math.PI) / 180;
                const omega = 2 / TUNING.pitchTau;
                const angAccel = clamp(omega * omega * (heading - w.pitch) - 2 * omega * w.pitchVel, -maxAngAccel, maxAngAccel);
                w.pitchVel = clamp(w.pitchVel + angAccel * dt, -maxRate, maxRate);
                w.pitch += w.pitchVel * dt;
                // The body curves into its turns (tail swinging toward the turn), in proportion to how
                // fast it's turning. Positive = toward the drawing's local +y.
                const bendTarget = (dir * w.pitchVel) / maxRate;
                w.bend += (bendTarget - w.bend) * (1 - Math.exp(-dt / TUNING.bodyBendTau));
                // Tail effort: speeding up works the tail harder and faster, slowing down lets it glide.
                w.accel += ((speed - w.speed) / dt - w.accel) * (1 - Math.exp(-dt / 0.5));
                w.speed = speed;
                const thrust = Math.max(speed + TUNING.thrustGain * w.accel, 0.15 * cruise);
                w.effort = clamp(thrust / Math.max(cruise, 1), 0.35, 1.5);
                const strokeSeconds = (strokeLengths * w.strokeFactor * w.len) / thrust;
                w.phase = (w.phase + dt / strokeSeconds) % 1;
            } else if (dt === 0) {
                // Starting a crossing (or a still pose): already cruising along the path.
                const v = podSpeed || cruise;
                w.vx = t.tx * v;
                w.vy = t.ty * v;
                w.speed = v;
                w.accel = 0;
                w.effort = 1;
                w.bend = 0;
                w.pitchVel = 0;
                w.pitch = t.pitch;
            }
            w.x = t.x;
            w.y = t.y;
            w.dir = dir;
            w.visible = active && t.x + w.len / 2 > 0 && t.x - w.len / 2 < W && t.y + w.len / 2 > 0 && t.y - w.len / 2 < H;
        });
    }

    function startCrossing() {
        if (!plan()) {
            // Nowhere to swim right now (tiny or crowded screen): try again soon — very soon if the window
            // is being resized, so the whales don't sit out of sight.
            pauseUntil = clock + (clock - resizedAt < 5 ? 0.5 : 3);
            return;
        }
        active = true;
        crossings++;
        needsReplan = false;
        seenThisCrossing = false;
        crossingStartedAt = clock;
        sPod = 0;
        podSpeed = cruise * speedFactor;
        smoothedTarget = podSpeed;
        // Start just before the first whale comes into view rather than far off screen, so there's
        // no long invisible approach (the path still begins off screen, so the entry looks the same).
        for (let s = 0; s < path!.length; s += TUNING.sampleStep) {
            sPod = s;
            pose(0);
            if (nearestOutside() < 0.15 * avgLen()) break;
        }
    }

    // How far the nearest whale is from being visible (px; ≤ 0 once any part is on screen).
    function nearestOutside() {
        return Math.min(
            ...whales.map((w) => {
                const reach = w.len / 2;
                return Math.max(-(w.x + reach), w.x - reach - W, -(w.y + reach), w.y - reach - H);
            }),
        );
    }

    // Bends slow the pair down so direction changes stay gradual.
    const bendFactor = () => {
        // Radians of heading change per px of path, around arc length s.
        const curvatureAt = (s: number) => {
            const a = pathAt(s - 60);
            const b = pathAt(s + 60);
            return Math.abs(tiltAt(b.tx, b.ty) - tiltAt(a.tx, a.ty)) / 120;
        };
        // Use the tightest bend anywhere either whale can be right now (ahead of or behind the pair's
        // centre), made tighter still for a whale on the inside of the curve.
        const reachAlong = 0.5 * (Math.abs(rel.da) + Math.abs(sepAlong)) + 0.5 * avgLen();
        const pathCurvature = Math.max(curvatureAt(sPod - reachAlong), curvatureAt(sPod), curvatureAt(sPod + reachAlong));
        const insideOffset = Math.abs(rel.c) + 0.5 * (Math.abs(rel.dn) + Math.abs(sepLateral));
        const curvature = pathCurvature / Math.max(0.25, 1 - pathCurvature * insideOffset);
        // A whale can only swing its body so fast (maxPitchRateDeg). Through tighter bends, slow down
        // enough that the body keeps pointing where it's going instead of lagging behind the path.
        const bodyLimit =
            curvature > 1e-6 ? (((TUNING.maxPitchRateDeg * Math.PI) / 180) * 0.85) / curvature / Math.max(cruise, 1) : 1;
        return clamp(Math.min(1 - curvature * avgLen() * 0.9, bodyLimit), 0.55, 1);
    };

    function step(dt: number) {
        if (!ready) return;
        clock += dt;
        // Ease whale size toward what the layout calls for (e.g. after a resize) instead of snapping.
        const grow = 1 - Math.exp(-dt / TUNING.scaleTau);
        for (const w of whales) {
            w.scale += (w.targetScale - w.scale) * grow;
            w.len = w.baseLen * w.scale;
            w.h = w.baseH * w.scale;
        }
        if (active && needsReplan && clock >= replanAt) {
            if (replanRest()) needsReplan = false;
            else replanAt = clock + 0.6; // no way through yet: keep swimming and try again shortly
        }
        if (!active) {
            if (clock >= pauseUntil) startCrossing();
            if (!active) {
                for (const w of whales) w.visible = false;
                return;
            }
        }

        if (clock >= speedGoalUntil) {
            speedGoal = pickRange(TUNING.speedRange);
            speedGoalUntil = clock + pickRange(TUNING.speedHoldSeconds);
        }
        [speedFactor, speedVel] = spring(speedFactor, speedVel, speedGoal, TUNING.speedTau, dt);
        const here = pathAt(sPod);
        const L = avgLen();
        const outside = nearestOutside();
        // The off-screen speed-up fades out before the first whale reaches the edge, so they never
        // appear at speed and then brake.
        const speedup = 1 + (TUNING.offscreenSpeedup - 1) * clamp((outside - 0.3 * L) / (0.9 * L), 0, 1);
        const targetSpeed = cruise * speedFactor * bendFactor() * (1 + TUNING.pitchSpeedBoost * here.ty) * speedup;
        // Smooth the target first (so small wobbles in it don't make the speed hunt back and forth),
        // then limit acceleration. The limit relaxes only while the pair is well out of sight, and
        // tightens smoothly as the nearest whale approaches the edge.
        smoothedTarget += (targetSpeed - smoothedTarget) * (1 - Math.exp(-dt / 1.2));
        const accel = cruise * (TUNING.pairAccel + (5 - TUNING.pairAccel) * clamp(outside / (0.5 * L), 0, 1));
        podSpeed += clamp(smoothedTarget - podSpeed, -accel * dt, accel * dt);
        sPod += podSpeed * dt;
        updateArrangement(dt, podSpeed);
        pose(dt);

        if (whales.some((w) => w.visible)) seenThisCrossing = true;
        // Lost from view because the window was resized: don't make them finish an invisible path and
        // then pause — start a fresh crossing straight away, coming back in from the side they ended up
        // past (as if they'd turned around out of sight), or reversing if they were cut off above/below.
        if (seenThisCrossing && resizedAt > crossingStartedAt && whales.every((w) => !w.visible)) {
            const cx = (whales[0].x + whales[1].x) / 2;
            dir = cx > W ? -1 : cx < 0 ? 1 : -dir;
            active = false;
            pauseUntil = clock;
            startCrossing();
            return;
        }
        // Done as soon as both whales have swum out past the far edge — no need to finish the
        // invisible tail of the path.
        const pastExit = whales.every(
            (w) => !w.visible && (dir > 0 ? w.x - w.len / 2 > W + 0.6 * w.h : w.x + w.len / 2 < -0.6 * w.h),
        );
        if (pastExit || (sPod > path!.length && whales.every((w) => !w.visible))) {
            active = false;
            pauseUntil = clock + pickRange(TUNING.pauseSeconds);
            if (random() < TUNING.returnChance) dir = -dir;
        }
    }

    // ---- lifecycle --------------------------------------------------------------------------

    function setLayout(layout: PodLayout) {
        if (ready && (layout.width !== W || layout.height !== H)) resizedAt = clock;
        W = layout.width;
        H = layout.height;
        const scale = clamp(H / TUNING.referenceHeight, TUNING.minScale, 1) * (layout.sizeScale ?? 1);
        const first = !ready;
        whales.forEach((w, i) => {
            w.baseLen = layout.lengths[i];
            w.baseH = layout.heights[i];
            w.targetScale = scale;
            if (first) w.scale = scale; // later size changes (resizes) ease in — see step()
            w.len = w.baseLen * w.scale;
            w.h = w.baseH * w.scale;
        });
        cruise = layout.speed * scale;
        rects = [...layout.obstacles, { l: -1e5, t: -1e5, r: 1e5, b: layout.navBottom }];
        textBox = layout.obstacles.length
            ? layout.obstacles.reduce((u, r) => ({ l: Math.min(u.l, r.l), t: Math.min(u.t, r.t), r: Math.max(u.r, r.r), b: Math.max(u.b, r.b) }))
            : null;
        ready = W > 0 && H > 0;
        // Mid-crossing, keep swimming the current path and re-plan the rest once resizing settles.
        if (active && path) {
            needsReplan = true;
            replanAt = clock + TUNING.replanDelay;
        }
    }

    function spawn() {
        if (!ready) return;
        clock = 0;
        active = false;
        pauseUntil = 0;
        rel.da = between(-0.8, 0.8) * avgLen();
        rel.dn = (random() < 0.5 ? -1 : 1) * 1.1 * avgH();
        rel.c = 0;
        relHoldUntil = pickRange(TUNING.arrangeHoldSeconds);
        startCrossing();
    }

    // Reduced motion: the pair resting mid-screen on a planned crossing.
    function rest() {
        if (!ready) return;
        active = false;
        rel.da = 0.6 * avgLen();
        rel.dn = 1.1 * avgH();
        if (!plan()) return;
        active = true;
        const p = path!;
        let best = 0;
        for (let i = 0; i < p.xs.length; i++) if (Math.abs(p.xs[i] - W / 2) < Math.abs(p.xs[best] - W / 2)) best = i;
        sPod = best * TUNING.sampleStep;
        pose(0);
        for (const w of whales) w.speed = 0;
    }

    return {
        whales: whales as readonly PodWhale[],
        setLayout,
        spawn,
        rest,
        step,
        /** For tests and tuning. */
        debug: () => ({
            active, dir, clock, crossings, fallbacks, style, lastPlanMs, sPod, path, rel: { ...rel }, speedFactor,
            podSpeed, lastSeparationPush, lastProjected, needsReplan,
            failures: { ...failures },
            bands: ready ? bands() : [],
            gaps: ready ? gaps() : [],
            textBox,
            lateralReach: lateralReach(),
            padLevel: ready ? padding(0) : null,
        }),
    };
}
