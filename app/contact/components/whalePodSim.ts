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
};

export type CrossingStyle = "wave" | "swoop" | "arc" | "fallback";

type Whale = PodWhale & { strokeFactor: number };
type Point = { x: number; y: number };
type Band = { lo: number; hi: number };
type Path = { xs: Float32Array; ys: Float32Array; txs: Float32Array; tys: Float32Array; length: number };

const TUNING = {
    referenceHeight: 900, // sections at least this tall show whales at full size
    minScale: 0.7,
    maxPitchDeg: 68, // steepest climb or dive (tilt changes are separately rate-capped when drawn)
    maxPitchRateDeg: 14, // cap on how fast a whale's tilt can change, degrees per second
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

    let speedFactor = 1;
    let speedVel = 0;
    let speedGoal = 1;
    let speedGoalUntil = 0;
    let podSpeed = 0; // the pair's actual speed along the path, px/s (acceleration-limited)
    let lastSeparationPush = 0; // debug: how far the spacing check pushed the pair apart this frame, px
    let lastProjected = false; // debug: whether the arrangement safety clamp fired this frame
    let separation = 0; // extra spacing currently applied between the two bodies, px (rate-limited)
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
    function buildPath(points: Point[]): Path {
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
    function pathProblem(p: Path): string | null {
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
            if (x < -reach || x > W + reach) continue; // fully off screen: anything goes
            const pad = padding(tilt);
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

    function plan(from?: Point): boolean {
        const started = now();
        const laneList = bands();
        const gapList = gaps();
        if (!laneList.length) {
            lastPlanMs = now() - started;
            return false;
        }
        let kind = chooseStyle(laneList.length, gapList.length);
        for (let attempt = 0; attempt < TUNING.planTries; attempt++) {
            if (attempt === Math.floor(TUNING.planTries * 0.7) && kind !== "wave") kind = "wave"; // too awkward: go gentler
            const candidate = buildPath(waypoints(kind, laneList, gapList, from));
            const problem = pathProblem(candidate);
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
        const straight = buildPath([
            from ?? { x: dir > 0 ? -margin : W + margin, y },
            { x: W / 2, y },
            { x: dir > 0 ? W + margin : -margin, y },
        ]);
        lastPlanMs = now() - started;
        if (pathProblem(straight)) return false;
        path = straight;
        style = "fallback";
        fallbacks++;
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
        const ease = (x: number, v: number, target: number): [number, number] => {
            const [, wanted] = spring(x, v, target, tau, dt);
            const nv = v + clamp(wanted - v, -maxAccel * dt, maxAccel * dt);
            return [x + nv * dt, nv];
        };
        const maxRel = TUNING.maxRelativeSpeed * pairSpeed;
        rel.vda = clamp(rel.vda, -maxRel, maxRel);
        [rel.da, rel.vda] = ease(rel.da, rel.vda, goal.da);
        [rel.dn, rel.vdn] = ease(rel.dn, rel.vdn, goal.dn);
        [rel.c, rel.vc] = ease(rel.c, rel.vc, goal.c);
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
        const along = [rel.da / 2, -rel.da / 2];
        const lateral = [rel.c + rel.dn / 2, rel.c - rel.dn / 2];
        const targets = whales.map((_, i) => {
            const p = pathAt(sPod + along[i]);
            return { x: p.x - p.ty * lateral[i], y: p.y + p.tx * lateral[i], pitch: tiltAt(p.tx, p.ty), dir };
        });
        if (dt > 0) {
            // Tilt eases toward the path's angle at a capped rate, so no bend (or offset from the
            // path) can make a whale lift or dip suddenly. Done before the spacing check below so
            // the whales are kept apart as they're actually drawn.
            const maxStep = ((TUNING.maxPitchRateDeg * Math.PI) / 180) * dt;
            targets.forEach((t, i) => {
                t.pitch = whales[i].pitch + clamp(t.pitch - whales[i].pitch, -maxStep, maxStep);
            });
        }
        const need = 0.42 * (whales[0].h + whales[1].h);
        const gap = bodyGap(targets[0], whales[0].len, targets[1], whales[1].len);
        // Extra spacing builds up and releases at a capped rate (with a little hysteresis) rather
        // than appearing in a single frame.
        const wanted = Math.max(0, need - gap + (separation > 0 ? 2 : 0));
        separation = dt > 0 ? clamp(wanted, separation - 0.5 * cruise * dt, separation + 0.5 * cruise * dt) : wanted;
        lastSeparationPush = separation;
        if (separation > 0) {
            // Ease apart along the line between them.
            const dx = targets[0].x - targets[1].x;
            const dy = targets[0].y - targets[1].y;
            const d = Math.hypot(dx, dy) || 1;
            const push = separation / 2;
            targets[0].x += (dx / d) * push;
            targets[0].y += (dy / d) * push;
            targets[1].x -= (dx / d) * push;
            targets[1].y -= (dy / d) * push;
        }
        whales.forEach((w, i) => {
            const t = targets[i];
            if (dt > 0) {
                const travelled = Math.hypot(t.x - w.x, t.y - w.y) / dt;
                // Smoothed (and ignoring the jump to a new crossing), since it drives the tail beat.
                const measured = travelled > cruise * 5 ? w.speed : travelled;
                w.speed += (measured - w.speed) * (1 - Math.exp(-dt / 0.3));
                const strokeSeconds = (strokeLengths * w.strokeFactor * w.len) / Math.max(w.speed, 8);
                w.phase = (w.phase + dt / strokeSeconds) % 1;
            }
            w.x = t.x;
            w.y = t.y;
            w.pitch = t.pitch;
            w.dir = dir;
            w.visible = active && t.x + w.len / 2 > 0 && t.x - w.len / 2 < W && t.y + w.len / 2 > 0 && t.y - w.len / 2 < H;
        });
    }

    function startCrossing() {
        if (!plan()) {
            pauseUntil = clock + 3; // nowhere to swim right now (tiny or crowded screen); try later
            return;
        }
        active = true;
        crossings++;
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
        const a = pathAt(sPod - 60);
        const b = pathAt(sPod + 60);
        const turn = Math.abs(tiltAt(b.tx, b.ty) - tiltAt(a.tx, a.ty));
        return clamp(1 - (turn / 120) * avgLen() * 0.9, 0.55, 1);
    };

    function step(dt: number) {
        if (!ready) return;
        clock += dt;
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
        W = layout.width;
        H = layout.height;
        const scale = clamp(H / TUNING.referenceHeight, TUNING.minScale, 1);
        whales.forEach((w, i) => {
            w.scale = scale;
            w.len = layout.lengths[i] * scale;
            w.h = layout.heights[i] * scale;
        });
        cruise = layout.speed * scale;
        rects = [...layout.obstacles, { l: -1e5, t: -1e5, r: 1e5, b: layout.navBottom }];
        textBox = layout.obstacles.length
            ? layout.obstacles.reduce((u, r) => ({ l: Math.min(u.l, r.l), t: Math.min(u.t, r.t), r: Math.max(u.r, r.r), b: Math.max(u.b, r.b) }))
            : null;
        ready = W > 0 && H > 0;
        if (active && path) {
            // Re-plan the rest of this crossing around the new layout, from where the pair is now.
            const here = pathAt(sPod);
            if (plan({ x: here.x, y: here.y })) sPod = 0;
            else active = false;
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
            podSpeed, lastSeparationPush, lastProjected,
            failures: { ...failures },
            bands: ready ? bands() : [],
            gaps: ready ? gaps() : [],
            textBox,
            lateralReach: lateralReach(),
            padLevel: ready ? padding(0) : null,
        }),
    };
}
