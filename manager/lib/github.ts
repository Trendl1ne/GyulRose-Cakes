import type { Cake } from "./cake-schema";

const owner = process.env.GITHUB_OWNER || "Trendl1ne";
const repo = process.env.GITHUB_REPO || "GyulRose-Cakes";
const branch = process.env.GITHUB_BRANCH || "main";
const api = `https://api.github.com/repos/${owner}/${repo}`;

async function github(path: string, init: RequestInit = {}) {
  const token = process.env.GITHUB_REPO_TOKEN;
  if (!token) throw new Error("GitHub publishing is not configured");
  const response = await fetch(`${api}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...init.headers
    },
    cache: "no-store"
  });
  if (!response.ok) throw new Error(`GitHub ${response.status}: ${(await response.text()).slice(0, 300)}`);
  return response.json();
}

async function createBlob(content: string, encoding: "utf-8" | "base64") {
  return (await github("/git/blobs", { method: "POST", body: JSON.stringify({ content, encoding }) })).sha as string;
}

export async function readCakeIndex(): Promise<Cake[]> {
  const file = await github(`/contents/src/data/cakes.json?ref=${encodeURIComponent(branch)}`);
  const text = Buffer.from(file.content, "base64").toString("utf8");
  return JSON.parse(text) as Cake[];
}

type Change = { path: string; content: string; encoding: "utf-8" | "base64" };

export async function commitChanges(message: string, changes: Change[]) {
  const ref = await github(`/git/ref/heads/${encodeURIComponent(branch)}`);
  const parentSha = ref.object.sha as string;
  const parent = await github(`/git/commits/${parentSha}`);
  const entries = await Promise.all(changes.map(async (change) => ({
    path: change.path,
    mode: "100644",
    type: "blob",
    sha: await createBlob(change.content, change.encoding)
  })));
  const tree = await github("/git/trees", { method: "POST", body: JSON.stringify({ base_tree: parent.tree.sha, tree: entries }) });
  const commit = await github("/git/commits", { method: "POST", body: JSON.stringify({ message, tree: tree.sha, parents: [parentSha] }) });
  await github(`/git/refs/heads/${encodeURIComponent(branch)}`, { method: "PATCH", body: JSON.stringify({ sha: commit.sha, force: false }) });
  return commit.sha as string;
}

export async function publishCake(cake: Cake, imageBase64: string, extension: string) {
  const cakes = await readCakeIndex();
  if (cakes.some((item) => item.slug === cake.slug)) throw new Error("A cake with this name already exists");
  const imagePath = `public/images/cakes/${cake.slug}.${extension}`;
  const finalCake = { ...cake, image: `/images/cakes/${cake.slug}.${extension}`, published: true };
  const nextIndex = [...cakes, finalCake].sort((a, b) => a.title.localeCompare(b.title));
  const sha = await commitChanges(`Add cake: ${finalCake.title}`, [
    { path: imagePath, content: imageBase64, encoding: "base64" },
    { path: `src/content/cakes/${cake.slug}.json`, content: `${JSON.stringify(finalCake, null, 2)}\n`, encoding: "utf-8" },
    { path: "src/data/cakes.json", content: `${JSON.stringify(nextIndex, null, 2)}\n`, encoding: "utf-8" }
  ]);
  return { cake: finalCake, sha };
}

export async function setCakePublished(slug: string, published: boolean) {
  const cakes = await readCakeIndex();
  const position = cakes.findIndex((cake) => cake.slug === slug);
  if (position < 0) throw new Error("Cake not found");
  const updated = { ...cakes[position], published };
  cakes[position] = updated;
  const sha = await commitChanges(`${published ? "Restore" : "Archive"} cake: ${updated.title}`, [
    { path: `src/content/cakes/${slug}.json`, content: `${JSON.stringify(updated, null, 2)}\n`, encoding: "utf-8" },
    { path: "src/data/cakes.json", content: `${JSON.stringify(cakes, null, 2)}\n`, encoding: "utf-8" }
  ]);
  return { cake: updated, sha };
}
