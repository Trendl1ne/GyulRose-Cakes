import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const contentDir = path.join(root, "src", "content", "cakes");
const outputDir = path.join(root, "public", "images", "optimized");
await fs.mkdir(outputDir, { recursive: true });
const files = (await fs.readdir(contentDir)).filter((file) => file.endsWith(".json"));

for (const file of files) {
  const cake = JSON.parse(await fs.readFile(path.join(contentDir, file), "utf8"));
  const source = path.join(root, "public", cake.image.replace(/^\//, ""));
  const output = path.join(outputDir, `${cake.slug}.webp`);
  await sharp(source).rotate().resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true }).webp({ quality: 82, effort: 5 }).toFile(output);
}
console.log(`Optimized ${files.length} cake images.`);
