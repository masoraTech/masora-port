import path from "path";
import { randomUUID } from "crypto";
import { getStore } from "@netlify/blobs";

// Uploaded images are stored in Netlify Blobs: the serverless filesystem is read-only,
// so writing to a local "uploads" folder fails in production.
const store = () => getStore("uploads");

export async function saveFiles(files: File[]) {
  const urls: string[] = [];
  for (const f of files) {
    if (!f.size) continue;
    const ext = path.extname(f.name).toLowerCase().replace(/[^.a-z0-9]/g, "");
    const name = `${randomUUID()}${ext}`;
    await store().set(name, await f.arrayBuffer());
    urls.push(`/api/files/${name}`);
  }
  return urls;
}

export async function removeFile(url: string) {
  if (!url.startsWith("/api/files/")) return;
  await store().delete(path.basename(url));
}

export async function readFileByName(name: string) {
  const data = await store().get(name, { type: "arrayBuffer" });
  return data ? new Uint8Array(data) : null;
}
