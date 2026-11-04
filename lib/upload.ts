import { mkdir, readFile, writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");

export async function saveFiles(files: File[]) {
  await mkdir(UPLOAD_DIR, { recursive: true });
  const urls: string[] = [];
  for (const f of files) {
    if (!f.size) continue;
    const ext = path.extname(f.name).toLowerCase().replace(/[^.a-z0-9]/g, "");
    const name = `${randomUUID()}${ext}`;
    const body = Buffer.from(await f.arrayBuffer());
    await writeFile(path.join(UPLOAD_DIR, name), body);
    urls.push(`/api/files/${name}`);
  }
  return urls;
}

export async function removeFile(url: string) {
  if (!url.startsWith("/api/files/")) return;
  const name = path.basename(url);
  try {
    await unlink(path.join(UPLOAD_DIR, name));
  } catch (error) {
    if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
  }
}

export async function readFileByName(name: string) {
  try {
    return new Uint8Array(await readFile(path.join(UPLOAD_DIR, name)));
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return null;
    throw error;
  }
}
