import { mkdir, readFile, writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { getStore, type Store } from "@netlify/blobs";

// Uploaded images go to Netlify Blobs on Netlify (the serverless filesystem is read-only).
// Locally, outside `netlify dev`, there is no Blobs environment:
//  - with NETLIFY_SITE_ID + NETLIFY_AUTH_TOKEN set, the site's real "uploads" store is used;
//  - otherwise files are kept on disk in UPLOAD_DIR (default ./uploads).
const STORE_NAME = "uploads";
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");

function blobStore(): Store | null {
  const siteID = process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_AUTH_TOKEN;
  if (siteID && token) return getStore({ name: STORE_NAME, siteID, token });
  try {
    return getStore(STORE_NAME);
  } catch (error) {
    if (error instanceof Error && error.name === "MissingBlobsEnvironmentError") return null;
    throw error;
  }
}

function isMissing(error: unknown) {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

export async function saveFiles(files: File[]) {
  const store = blobStore();
  if (!store) await mkdir(UPLOAD_DIR, { recursive: true });
  const urls: string[] = [];
  for (const f of files) {
    if (!f.size) continue;
    const ext = path.extname(f.name).toLowerCase().replace(/[^.a-z0-9]/g, "");
    const name = `${randomUUID()}${ext}`;
    const body = await f.arrayBuffer();
    if (store) await store.set(name, body);
    else await writeFile(path.join(UPLOAD_DIR, name), Buffer.from(body));
    urls.push(`/api/files/${name}`);
  }
  return urls;
}

export async function removeFile(url: string) {
  if (!url.startsWith("/api/files/")) return;
  const name = path.basename(url);
  const store = blobStore();
  if (store) return store.delete(name);
  try {
    await unlink(path.join(UPLOAD_DIR, name));
  } catch (error) {
    if (!isMissing(error)) throw error;
  }
}

export async function readFileByName(name: string) {
  const store = blobStore();
  if (store) {
    const data = await store.get(name, { type: "arrayBuffer" });
    return data ? new Uint8Array(data) : null;
  }
  try {
    return new Uint8Array(await readFile(path.join(UPLOAD_DIR, name)));
  } catch (error) {
    if (isMissing(error)) return null;
    throw error;
  }
}
