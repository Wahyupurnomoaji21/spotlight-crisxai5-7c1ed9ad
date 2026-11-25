// Spotlight @crisxai5 entry (make.fun program/v1, Node 22, standard library only).
// Copies the post data — POST.json, the caption, and the spotlight image — from
// this repository to MAKEFUN_OUTPUT_DIR, where the gate reads them.
// The entry itself is the X post: the image is posted natively on X from a public
// account with the caption in POST.json, and POST.json names the post URL.
// All paths are built from import.meta.url, never relative: the grader runs this
// program from another directory.
//
// Local run:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(fileURLToPath(import.meta.url));

const outputDir = process.env.MAKEFUN_OUTPUT_DIR;
if (!outputDir) {
  console.error("MAKEFUN_OUTPUT_DIR is not set");
  process.exit(1);
}

const postJsonPath = join(repoRoot, "POST.json");
const captionPath = join(repoRoot, "caption.txt");
const imagePath = join(repoRoot, "crisxai5-spotlight.png");

let post;
try {
  post = JSON.parse(readFileSync(postJsonPath, "utf8"));
} catch (err) {
  console.error(`POST.json could not be read: ${(err as Error).message}`);
  process.exit(1);
}
if (typeof post !== "object" || post === null || typeof post.url !== "string") {
  console.error("POST.json must be an object with a string url field");
  process.exit(1);
}
if (typeof post.caption !== "string" || post.caption.length === 0) {
  console.error("POST.json must carry the post caption");
  process.exit(1);
}
if (typeof post.image !== "string" || post.image.length === 0) {
  console.error("POST.json must carry the image path");
  process.exit(1);
}
if (typeof post.play_code !== "string" || !post.play_code.startsWith("makefun-")) {
  console.error("POST.json must carry a makefun- play code");
  process.exit(1);
}

mkdirSync(outputDir, { recursive: true });
const imageStat = statSync(imagePath);
if (!imageStat.isFile() || imageStat.size === 0) {
  console.error(`image missing or empty: ${imagePath}`);
  process.exit(1);
}
copyFileSync(postJsonPath, join(outputDir, "POST.json"));
copyFileSync(captionPath, join(outputDir, "caption.txt"));
copyFileSync(imagePath, join(outputDir, "crisxai5-spotlight.png"));

const caption = readFileSync(captionPath, "utf8").trim();
if (caption !== post.caption) {
  console.error("caption.txt and POST.json caption disagree");
  process.exit(1);
}
if (caption.length > 280) {
  console.error(`caption is ${caption.length} chars, over the 280 limit`);
  process.exit(1);
}
writeFileSync(join(outputDir, "caption.txt"), caption + "\n", "utf8");

console.log(`POST.json copied to ${join(outputDir, "POST.json")}`);
console.log(`caption (${caption.length} chars) copied to ${join(outputDir, "caption.txt")}`);
console.log(`image (${imageStat.size} bytes) copied to ${join(outputDir, "crisxai5-spotlight.png")}`);
console.log(`post: ${post.url}`);
