#!/usr/bin/env node
// Generates app/data/whaleInk.json — the ink-style humpback animated by app/components/Whale.tsx.
//
//   npm run whale:build     regenerate the data file
//   npm run whale:preview   also write scripts/whale/preview/preview.svg (+ preview.svg.png on macOS)
//
// Input: scripts/whale/cruise-mesh.json, the 2D swim-cycle mesh extracted from the whale kit's
// cruise-loop SVG (see extract-mesh.mjs). The look of the whale is defined in the ART section,
// in rest-frame mesh coordinates (904 × 338, head on the right, y down). Random-looking detail
// comes from seeded RNGs, so every run produces identical output.

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const MESH_FILE = join(HERE, "cruise-mesh.json");
const OUT_FILE = join(ROOT, "app", "data", "whaleInk.json");
const PREVIEW_DIR = join(HERE, "preview");

// Keep in sync with --whale-ink / --whale-paper / --whale-pleat in app/ui/globals.css.
const PREVIEW_COLORS = {
    light: { bg: "#fff8f6", ink: "#262325", paper: "#f7f4f0", pleat: "#d3cdc8" },
    dark: { bg: "#1a1819", ink: "#e9e1dc", paper: "#2a2628", pleat: "#4a4548" },
};

// ---------------------------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------------------------

const f1 = (n) => n.toFixed(1);
const f2 = (n) => n.toFixed(2);

// mulberry32
function rng(seed) {
    let a = seed;
    return () => {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// Piecewise-linear y(x) through [[x, y], ...].
function lerpPts(pts, x) {
    if (x <= pts[0][0]) return pts[0][1];
    for (let i = 1; i < pts.length; i++) {
        if (x <= pts[i][0]) {
            const [x0, y0] = pts[i - 1];
            const [x1, y1] = pts[i];
            return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
        }
    }
    return pts[pts.length - 1][1];
}

function sstep(a, b, x) {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
}

// A horizontal ribbon whose centre follows yAt(x) and whose width follows wAt(x), tapered over
// the first `lt` and last `rt` fractions of its length. Used for throat strands.
function ribbon(xs, xe, yAt, wAt, lt, rt) {
    const up = [];
    const lo = [];
    const step = 3;
    for (let x = xs; x <= xe + 0.01; x += step) {
        const t = (x - xs) / (xe - xs);
        const w = wAt(x) * sstep(0, lt, t) * Math.pow(1 - sstep(1 - rt, 1, t), 0.8);
        const y = yAt(x);
        up.push(`${f1(x)} ${f1(y - w / 2)}`);
        lo.push(`${f1(x)} ${f1(y + w / 2)}`);
    }
    return `M${up.join("L")}L${lo.reverse().join("L")}Z`;
}

// A pen stroke along an arbitrary polyline, width widthAt(s) for arclength fraction s in [0, 1].
function penStroke(points, widthAt) {
    const lengths = [0];
    for (let i = 1; i < points.length; i++) {
        lengths.push(lengths[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]));
    }
    const total = lengths[lengths.length - 1];
    const up = [];
    const lo = [];
    for (let i = 0; i < points.length; i++) {
        const a = points[Math.max(0, i - 1)];
        const b = points[Math.min(points.length - 1, i + 1)];
        let nx = -(b[1] - a[1]);
        let ny = b[0] - a[0];
        const nl = Math.hypot(nx, ny) || 1;
        nx /= nl;
        ny /= nl;
        const half = widthAt(lengths[i] / total) / 2;
        up.push(`${f2(points[i][0] + nx * half)} ${f2(points[i][1] + ny * half)}`);
        lo.push(`${f2(points[i][0] - nx * half)} ${f2(points[i][1] - ny * half)}`);
    }
    return `M${up.join("L")}L${lo.reverse().join("L")}Z`;
}

const cubicPoint = (p0, p1, p2, p3, t) => {
    const u = 1 - t;
    return [0, 1].map((k) => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k]);
};

// ---------------------------------------------------------------------------------------------
// MESH — which mesh vertices the drawing tracks
// ---------------------------------------------------------------------------------------------

const mesh = JSON.parse(readFileSync(MESH_FILE, "utf8"));
const T = mesh.triangles;
const S = mesh.samples;
const W = mesh.bbox[2];
const H = mesh.bbox[3];
const NT = T.length / 3;
const F0 = S[0]; // rest frame

const centroid = (f, i) => [
    (f[T[i * 3] * 2] + f[T[i * 3 + 1] * 2] + f[T[i * 3 + 2] * 2]) / 3,
    (f[T[i * 3] * 2 + 1] + f[T[i * 3 + 1] * 2 + 1] + f[T[i * 3 + 2] * 2 + 1]) / 3,
];
// Region split by rest-frame triangle centroid.
const isFin = (i) => {
    const [cx, cy] = centroid(F0, i);
    return cy > 224 && cx > 520 && cx < 670;
};
const isFluke = (i) => centroid(F0, i)[0] < 48;
const isBody = (i) => !isFin(i) && !isFluke(i);

function raster(f, pred) {
    const g = new Uint8Array(W * H);
    const edge = (a, b, x, y) => (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0]);
    for (let i = 0; i < NT; i++) {
        if (!pred(i)) continue;
        const p = [0, 1, 2].map((k) => [f[T[i * 3 + k] * 2], f[T[i * 3 + k] * 2 + 1]]);
        const minx = Math.max(0, Math.floor(Math.min(...p.map((q) => q[0]))));
        const maxx = Math.min(W - 1, Math.ceil(Math.max(...p.map((q) => q[0]))));
        const miny = Math.max(0, Math.floor(Math.min(...p.map((q) => q[1]))));
        const maxy = Math.min(H - 1, Math.ceil(Math.max(...p.map((q) => q[1]))));
        for (let y = miny; y <= maxy; y++) {
            for (let x = minx; x <= maxx; x++) {
                const w0 = edge(p[1], p[2], x + 0.5, y + 0.5);
                const w1 = edge(p[2], p[0], x + 0.5, y + 0.5);
                const w2 = edge(p[0], p[1], x + 0.5, y + 0.5);
                if ((w0 >= 0 && w1 >= 0 && w2 >= 0) || (w0 <= 0 && w1 <= 0 && w2 <= 0)) g[y * W + x] = 1;
            }
        }
    }
    return g;
}

// Moore-neighbour trace of the silhouette's outer contour.
function trace(g) {
    let start = -1;
    for (let i = 0; i < g.length; i++) {
        if (g[i]) {
            start = i;
            break;
        }
    }
    const dirs = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
    const at = (x, y) => x >= 0 && y >= 0 && x < W && y < H && g[y * W + x];
    let x = start % W;
    let y = Math.floor(start / W);
    let dir = 7;
    const pts = [[x, y]];
    for (let it = 0; it < 20000; it++) {
        let found = false;
        for (let k = 0; k < 8; k++) {
            const nd = (dir + 6 + k) % 8;
            const nx = x + dirs[nd][0];
            const ny = y + dirs[nd][1];
            if (at(nx, ny)) {
                x = nx;
                y = ny;
                dir = nd;
                found = true;
                break;
            }
        }
        if (!found) break;
        if (x === pts[0][0] && y === pts[0][1] && pts.length > 2) break;
        pts.push([x, y]);
    }
    return pts;
}

function vertsOf(pred) {
    const set = new Set();
    for (let i = 0; i < NT; i++) if (pred(i)) for (let k = 0; k < 3; k++) set.add(T[i * 3 + k]);
    return [...set];
}

// Ordered ring of mesh vertices sitting on the rest-frame outline, roughly `spacing` apart.
function ringFor(pred, spacing) {
    const verts = vertsOf(pred);
    const contour = trace(raster(F0, pred));
    const samples = [];
    let acc = spacing;
    for (let i = 1; i < contour.length; i++) {
        acc += Math.hypot(contour[i][0] - contour[i - 1][0], contour[i][1] - contour[i - 1][1]);
        if (acc >= spacing) {
            samples.push(contour[i]);
            acc = 0;
        }
    }
    const used = new Set();
    const ring = [];
    for (const [px, py] of samples) {
        let best = -1;
        let bestDist = 1e9;
        for (const v of verts) {
            const dist = Math.hypot(F0[v * 2] - px, F0[v * 2 + 1] - py);
            if (dist < bestDist) {
                bestDist = dist;
                best = v;
            }
        }
        if (bestDist < 12 && !used.has(best)) {
            used.add(best);
            ring.push(best);
        }
    }
    return ring;
}

const RING = ringFor(isBody, 22);
const FIN_VERTS = vertsOf(isFin);
const byRestX = RING.map((v, i) => [F0[v * 2], i]);
const TAIL_TIP = [...byRestX].sort((a, b) => a[0] - b[0]).slice(0, 2).map((p) => p[1]);
const TAIL_STOCK = byRestX.filter((p) => p[0] > 82 && p[0] < 108).map((p) => p[1]);

// ---------------------------------------------------------------------------------------------
// ART — static ink artwork, rest-frame coordinates
// ---------------------------------------------------------------------------------------------

// Throat band: pleat strands run between these two curves (below BOT gets clipped by the body).
const TOP = (x) => lerpPts([[520, 196], [600, 176], [700, 152], [800, 140], [860, 139], [888, 150]], x);
const BOT = (x) =>
    lerpPts([[520, 240], [600, 236], [640, 226], [700, 214], [760, 200], [800, 195], [850, 192], [870, 186], [892, 170]], x);

// Throat strands: long pale ribbons, wavy, uneven, some broken. Gaps between them read as dark
// fingers near the top (over the body) and as fine grey pleat lines lower down (over throatBase).
const strandRng = rng(11);
let strands = "";
const STRAND_COUNT = 19;
for (let k = 0; k < STRAND_COUNT; k++) {
    const r = strandRng;
    const u = (k + 0.5) / STRAND_COUNT + (r() - 0.5) * 0.035;
    const A = 0.5 + r() * 1.3, fr = 1 / (16 + r() * 34), ph = r() * 6.3;
    const A2 = r() * 0.6, fr2 = 1 / (5 + r() * 7), ph2 = r() * 6.3;
    const yAt = (x) => TOP(x) + (BOT(x) - TOP(x)) * u + A * Math.sin(x * fr + ph) + A2 * Math.sin(x * fr2 + ph2);
    const frac = 0.6 + 0.7 * sstep(0.12, 0.55, u) + r() * 0.4; // lower strands are wider, so they merge
    const wAt = (x) => ((frac * (BOT(x) - TOP(x))) / STRAND_COUNT) * (0.85 + 0.3 * Math.sin(x / 23 + ph));
    const xs = 600 - 75 * u + r() * 50, xe = 836 + 34 * u - r() * 24;
    if (r() < 0.4) {
        const gapAt = xs + (xe - xs) * (0.3 + r() * 0.4), gap = 8 + r() * 22;
        strands += ribbon(xs, gapAt, yAt, wAt, 0.25, 0.35) + ribbon(gapAt + gap, xe, yAt, wAt, 0.2, 0.5);
    } else {
        strands += ribbon(xs, xe, yAt, wAt, 0.22, 0.45);
    }
}
// Feathery fringe where the pleats end at the chin.
for (let k = 0; k < 7; k++) {
    const r = strandRng;
    const u = 0.1 + k * 0.12 + (r() - 0.5) * 0.05;
    const xs = 820 + r() * 25, xe = 872 + r() * 12;
    const ph = r() * 6.3;
    strands += ribbon(xs, xe, (x) => TOP(x) + (BOT(x) - TOP(x)) * u + Math.sin(x / 9 + ph) * 0.8, () => 1.6 + r() * 0.2, 0.3, 0.6);
}
// Pale strokes fading out behind the far fin.
let prefin = "";
for (let k = 0; k < 6; k++) {
    const r = strandRng;
    const y0 = 196 + k * 6.2 + (r() - 0.5) * 2;
    const xs = 455 + k * 12 + r() * 14, xe = 585 - k * 4 - r() * 8;
    const ph = r() * 6.3;
    prefin += ribbon(xs, xe, (x) => y0 + Math.sin(x / 19 + ph) * 1.1 - (x - 520) * 0.05, () => 4.6 - k * 0.45, 0.75, 0.12);
}

// Grey underlay for the lower half of the throat, tapered at both ends.
const throatBase = (() => {
    const up = [];
    const lo = [];
    for (let x = 600; x <= 868; x += 4) {
        const mid = TOP(x) + (BOT(x) - TOP(x)) * 0.5 + Math.sin(x / 13) * 1.2;
        const k = sstep(600, 650, x) * (1 - sstep(840, 868, x));
        up.push(`${x} ${f1(BOT(x) + 10 + (mid - BOT(x) - 10) * k)}`);
        lo.push(`${x} ${f1(BOT(x) + 10)}`);
    }
    return `M${up.join("L")}L${lo.reverse().join("L")}Z`;
})();

// Dark far-side pectoral fin, crossing the throat diagonally.
const farFin =
    "M602 186C586 200 556 222 520 243C496 257 470 268 450 276C474 270 505 258 540 240C578 222 610 206 634 197C624 190 612 186 602 186Z";

// Near pectoral fin (pale). Follows an affine fit of the mesh's fin vertices.
const FIN_START = [568, 204];
const FIN_SEGMENTS = [
    // cubic Béziers [control1, control2, end]: trailing edge, rounded tip, leading edge
    [[567, 232], [561, 258], [553, 283]],
    [[547, 300], [539, 311], [536, 322]],
    [[535, 331], [546, 334], [556, 328]],
    [[566, 320], [571, 306], [580, 292]],
    [[592, 273], [604, 252], [613, 236]],
    [[620, 225], [626, 214], [629, 204]],
];
const pt = (p) => `${p[0]} ${p[1]}`;
const fin = `M${pt(FIN_START)}${FIN_SEGMENTS.map(([c1, c2, e]) => `C${pt(c1)} ${pt(c2)} ${pt(e)}`).join("")}Z`;

// Fin pen work, in mesh units (the whale is 904 wide; at 160px on screen, 1 unit ≈ 0.18px).
// Keep the tip no heavier than the outline: at footer size, dense or thick tip lines merge into a blob.
const FIN_LINE = { rootWidth: 1.0, tipWidth: 1.1, pressureWobble: 0.15 };
const FIN_HATCH = { count: 3, width: 0.45 };

const finOutline = [];
{
    let prev = FIN_START;
    for (const [c1, c2, end] of FIN_SEGMENTS) {
        for (let i = finOutline.length ? 1 : 0; i <= 10; i++) finOutline.push(cubicPoint(prev, c1, c2, end, i / 10));
        prev = end;
    }
}
let finInk = penStroke(finOutline, (s) => {
    const fade = sstep(0.02, 0.15, s) * (1 - sstep(0.85, 0.98, s)); // both ends fade into the belly
    const tipBoost = Math.exp(-(((s - 0.47) / 0.16) ** 2));
    const pressure = 1 + FIN_LINE.pressureWobble * Math.sin(s * 29 + 1.3);
    return (FIN_LINE.rootWidth + (FIN_LINE.tipWidth - FIN_LINE.rootWidth) * tipBoost) * fade * pressure;
});
// Curved hatching across the knobbly fin tip.
const hatchRng = rng(5);
for (let j = 0; j < FIN_HATCH.count; j++) {
    const s = j / (FIN_HATCH.count - 1);
    const a = [536.5 + s * 1.5, 310 + s * 15];
    const b = [567 - s * 10, 306 + s * 16];
    const c = [(a[0] + b[0]) / 2, Math.max(a[1], b[1]) + 3.5];
    const pts = [];
    for (let i = 0; i <= 12; i++) {
        const t = i / 12;
        const u = 1 - t;
        pts.push([u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]);
    }
    const w = FIN_HATCH.width * (0.75 + 0.5 * hatchRng());
    finInk += penStroke(pts, (t) => w * Math.pow(Math.sin(Math.PI * t), 0.6));
}

// Fluke, in a local frame: x runs from the tail stock (0) to the body outline's tail tip (1),
// y is perpendicular in the same units. Starts at zero width so it can't poke out of the stock.
const fluke = "M0 0C0.3 -0.09 0.7 -0.13 1 -0.14C1.3 -0.15 1.6 -0.12 1.85 0.02C1.6 0.1 1.3 0.16 1 0.16C0.7 0.15 0.3 0.1 0 0Z";

const ART = { fin, finInk, farFin, fluke, throatBase, strands, prefin };

// ---------------------------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------------------------

const tracked = [...new Set([...RING, ...FIN_VERTS])];
const index = new Map(tracked.map((v, i) => [v, i]));
const r1 = (n) => Math.round(n * 10) / 10;
const data = {
    frames: S.map((f) => tracked.flatMap((v) => [r1(f[v * 2]), r1(f[v * 2 + 1])])),
    ring: RING.map((v) => index.get(v)),
    fin: FIN_VERTS.map((v) => index.get(v)),
    tailTip: TAIL_TIP,
    tailStock: TAIL_STOCK,
    art: ART,
};
const json = JSON.stringify(data);
writeFileSync(OUT_FILE, json);
console.log(`wrote ${OUT_FILE} (${(json.length / 1024).toFixed(1)} KB, ${tracked.length} tracked vertices, ring ${RING.length})`);

// ---------------------------------------------------------------------------------------------
// Preview (--preview): same layering as Whale.tsx
// ---------------------------------------------------------------------------------------------

if (process.argv.includes("--preview")) {
    const SMOOTH_PASSES = 12; // must match Whale.tsx

    const smoothRing = (f) => {
        let P = RING.map((v) => [f[v * 2], f[v * 2 + 1]]);
        const n = P.length;
        for (let pass = 0; pass < SMOOTH_PASSES; pass++) {
            const lambda = pass % 2 ? -0.53 : 0.5;
            P = P.map((p, i) => {
                const a = P[(i - 1 + n) % n];
                const b = P[(i + 1) % n];
                return [p[0] + lambda * ((a[0] + b[0]) / 2 - p[0]), p[1] + lambda * ((a[1] + b[1]) / 2 - p[1])];
            });
        }
        return P;
    };
    const ringPath = (P) => {
        const n = P.length;
        let d = `M${f1(P[0][0])} ${f1(P[0][1])}`;
        for (let i = 0; i < n; i++) {
            const p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n];
            d += `C${f1(p1[0] + (p2[0] - p0[0]) / 6)} ${f1(p1[1] + (p2[1] - p0[1]) / 6)} ${f1(p2[0] - (p3[0] - p1[0]) / 6)} ${f1(p2[1] - (p3[1] - p1[1]) / 6)} ${f1(p2[0])} ${f1(p2[1])}`;
        }
        return `${d}Z`;
    };
    const flukeMatrix = (P) => {
        const mean = (ids) => ids.reduce((acc, i) => [acc[0] + P[i][0] / ids.length, acc[1] + P[i][1] / ids.length], [0, 0]);
        const s = mean(TAIL_STOCK);
        const t = mean(TAIL_TIP);
        const ax = t[0] - s[0], ay = t[1] - s[1];
        return `matrix(${[ax, ay, -ay, ax, s[0], s[1]].map((n) => n.toFixed(3)).join(" ")})`;
    };
    const finMatrix = (f) => {
        const A = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], bx = [0, 0, 0], by = [0, 0, 0];
        for (const v of FIN_VERTS) {
            const row = [F0[v * 2], F0[v * 2 + 1], 1];
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) A[i][j] += row[i] * row[j];
                bx[i] += row[i] * f[v * 2];
                by[i] += row[i] * f[v * 2 + 1];
            }
        }
        const solve = (M, b) => {
            M = M.map((row, i) => [...row, b[i]]);
            for (let i = 0; i < 3; i++) {
                for (let k = 0; k < 3; k++) {
                    if (k === i) continue;
                    const m = M[k][i] / M[i][i];
                    for (let j = i; j < 4; j++) M[k][j] -= m * M[i][j];
                }
            }
            return M.map((row, i) => row[3] / row[i]);
        };
        const p = solve(A, bx);
        const q = solve(A, by);
        return `matrix(${[p[0], q[0], p[1], q[1], p[2], q[2]].map((n) => n.toFixed(4)).join(" ")})`;
    };

    let nextId = 0;
    const whale = (frame, x, y, width, C) => {
        const id = nextId++;
        const f = S[frame];
        const P = smoothRing(f);
        return (
            `<g transform="translate(${x},${y}) scale(${width / W})">` +
            `<defs><path id="b${id}" d="${ringPath(P)}"/><clipPath id="c${id}"><use href="#b${id}"/></clipPath></defs>` +
            `<g transform="${finMatrix(f)}"><path d="${ART.fin}" fill="${C.paper}"/><path d="${ART.finInk}" fill="${C.ink}"/></g>` +
            `<use href="#b${id}" fill="${C.ink}"/>` +
            `<g clip-path="url(#c${id})"><path d="${ART.throatBase}" fill="${C.pleat}"/><path d="${ART.strands}" fill="${C.paper}"/><path d="${ART.prefin}" fill="${C.paper}"/></g>` +
            `<path d="${ART.farFin}" fill="${C.ink}"/>` +
            `<g transform="${flukeMatrix(P)}"><path d="${ART.fluke}" fill="${C.ink}"/></g>` +
            `</g>`
        );
    };
    // Zoomed panel onto a region of the rest-frame whale.
    const closeUp = (x, y, w, h, viewBox, C) =>
        `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${viewBox}">${whale(0, 0, 0, W, C)}</svg>`;

    const L = PREVIEW_COLORS.light;
    const D = PREVIEW_COLORS.dark;
    const body = [
        `<rect width="1600" height="1600" fill="${L.bg}"/>`,
        `<rect y="1060" width="1600" height="540" fill="${D.bg}"/>`,
        // swim-cycle frames, large
        whale(0, 20, 10, 740, L),
        whale(11, 820, 10, 740, L),
        whale(4, 20, 290, 740, L),
        whale(22, 820, 290, 740, L),
        // throat + fin close-up, and real footer sizes (160px desktop, 100px mobile; 320 ≈ 160 @2x)
        closeUp(20, 580, 900, 450, "440 180 320 160", L),
        whale(0, 960, 620, 320, L),
        whale(0, 960, 800, 160, L),
        whale(11, 1160, 800, 160, L),
        whale(0, 1360, 810, 100, L),
        // dark mode
        whale(0, 20, 1100, 320, D),
        whale(11, 380, 1100, 320, D),
        whale(0, 740, 1140, 160, D),
        closeUp(940, 1090, 640, 320, "440 180 320 160", D),
    ].join("");
    mkdirSync(PREVIEW_DIR, { recursive: true });
    const svgPath = join(PREVIEW_DIR, "preview.svg");
    writeFileSync(svgPath, `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1600" viewBox="0 0 1600 1600">${body}</svg>`);
    console.log(`wrote ${svgPath}`);
    if (process.platform === "darwin") {
        try {
            execFileSync("qlmanage", ["-t", "-s", "1600", "-o", PREVIEW_DIR, svgPath], { stdio: "ignore" });
            console.log(`wrote ${svgPath}.png`);
        } catch {
            // Quick Look unavailable; open the SVG in a browser instead.
        }
    }
}
