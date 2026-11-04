import path from "path";
import { readFileByName } from "@/lib/upload";

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp",
  ".gif": "image/gif", ".avif": "image/avif",
};

export async function GET(_: Request, { params }: { params: { name: string } }) {
  const name = path.basename(params.name);
  const contentType = TYPES[path.extname(name).toLowerCase()];
  if (!contentType) return new Response("Introuvable", { status: 404 });
  const contents = await readFileByName(name);
  if (!contents) return new Response("Introuvable", { status: 404 });
  return new Response(contents, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
