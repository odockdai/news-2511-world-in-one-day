// Entry program for make.fun news-image-20261125 — Wednesday 25 November 2026, the world in one day.
// Copies the bundled entry.png into the output directory after verifying it is a
// whole PNG of at most 1024x1024 pixels and at most 1 MiB. Node 22, standard library only.
import { copyFileSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const SRC = join(import.meta.dirname, "entry.png");
const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const OUT = join(OUT_DIR, "entry.png");

const PNG_SIG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const MAX_BYTES = 1048576; // 1 MiB
const MAX_DIM = 1024;

function check(buf: Buffer): void {
  if (buf.length > MAX_BYTES) {
    throw new Error(`entry.png is ${buf.length} bytes, over the ${MAX_BYTES}-byte cap`);
  }
  for (let i = 0; i < PNG_SIG.length; i++) {
    if (buf[i] !== PNG_SIG[i]) throw new Error("entry.png does not start with the PNG signature");
  }
  // IHDR: bytes 16-19 width, 20-23 height, big endian
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  if (width > MAX_DIM || height > MAX_DIM) {
    throw new Error(`entry.png is ${width}x${height}, over the ${MAX_DIM}px cap`);
  }
}

function main(): void {
  const buf = readFileSync(SRC);
  check(buf);
  mkdirSync(OUT_DIR, { recursive: true });
  copyFileSync(SRC, OUT);
  const written = statSync(OUT).size;
  if (written !== buf.length) throw new Error(`wrote ${written} of ${buf.length} bytes`);
  console.log(`entry.png written: ${written} bytes, ${buf.readUInt32BE(16)}x${buf.readUInt32BE(20)}`);
}

main();
