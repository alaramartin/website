#!/usr/bin/env node
// Rebuilds scripts/whale/cruise-mesh.json from the whale kit's self-animating SVG.
//
//   node scripts/whale/extract-mesh.mjs ~/Downloads/whale-kit/svg/cruise-loop-dots.svg
//
// The SVG embeds its swim cycle as `samples` (30 keyframes of 2D vertex positions) and
// `triangles` (vertex index triples). This pulls both out, crops them to the bounding box of
// every frame (plus 2 units of padding), and rounds coordinates to 0.1.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const svgPath = process.argv[2];
if (!svgPath) {
    console.error("usage: node scripts/whale/extract-mesh.mjs <path to cruise-loop-dots.svg>");
    process.exit(1);
}

const svg = readFileSync(svgPath, "utf8");
const samples = JSON.parse(svg.match(/const samples = (\[\[.*?\]\]);/s)[1]);
const triangles = JSON.parse(svg.match(/const triangles = (\[\[.*?\]\]);/s)[1]);

let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
for (const frame of samples) {
    for (let i = 0; i < frame.length; i += 2) {
        minX = Math.min(minX, frame[i]);
        maxX = Math.max(maxX, frame[i]);
        minY = Math.min(minY, frame[i + 1]);
        maxY = Math.max(maxY, frame[i + 1]);
    }
}
const pad = 2;
minX = Math.floor(minX - pad);
minY = Math.floor(minY - pad);
maxX = Math.ceil(maxX + pad);
maxY = Math.ceil(maxY + pad);

const mesh = {
    duration: 4,
    bbox: [0, 0, maxX - minX, maxY - minY],
    samples: samples.map((frame) => frame.map((v, i) => Math.round((v - (i % 2 ? minY : minX)) * 10) / 10)),
    triangles: triangles.flat(),
};

const out = join(dirname(fileURLToPath(import.meta.url)), "cruise-mesh.json");
writeFileSync(out, JSON.stringify(mesh));
console.log(`wrote ${out}: ${samples.length} frames, ${samples[0].length / 2} vertices, ${triangles.length} triangles, bbox ${mesh.bbox.join("×")}`);
