"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { PORTFOLIO_TAG } from "@/lib/queries";
import { db } from "@/lib/db";
import { COOKIE, SESSION_MAX_AGE, sessionToken, requireAdmin } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { saveFiles, removeFile } from "@/lib/upload";

export async function login(fd: FormData) {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const admin = await db.admin.findUnique({ where: { email } });
  if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
    redirect("/admin/login?error=1");
  }

  cookies().set(COOKIE, sessionToken(admin.id), {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: SESSION_MAX_AGE,
    secure: process.env.NODE_ENV === "production" && process.env.COOKIE_SECURE !== "false",
  });
  redirect("/admin");
}

export async function logout() {
  cookies().delete(COOKIE);
  redirect("/admin/login");
}

export async function saveProject(fd: FormData) {
  requireAdmin();
  const id = Number(fd.get("id")) || 0;
  const data = {
    title: String(fd.get("title") || "").trim(),
    description: String(fd.get("description") || "").trim(),
    technologies: String(fd.get("technologies") || "").trim(),
    categoryId: Number(fd.get("categoryId")),
  };
  if (!data.title || !data.categoryId) return;

  const photos = (fd.getAll("photos") as File[]).filter((f) => f.size && f.type.startsWith("image/"));
  const urls = await saveFiles(photos);

  if (id) {
    const remove = fd.getAll("removeIds").map(Number);
    const old = await db.projectImage.findMany({ where: { id: { in: remove }, projectId: id } });
    await db.projectImage.deleteMany({ where: { id: { in: old.map((o) => o.id) } } });
    await Promise.all(old.map((o) => removeFile(o.url)));
    const count = await db.projectImage.count({ where: { projectId: id } });
    await db.project.update({
      where: { id },
      data: { ...data, images: { create: urls.map((url, k) => ({ url, position: count + k })) } },
    });
  } else {
    await db.project.create({
      data: { ...data, images: { create: urls.map((url, k) => ({ url, position: k })) } },
    });
  }
  revalidateTag(PORTFOLIO_TAG);
  revalidatePath("/", "layout");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function toggleProject(fd: FormData) {
  requireAdmin();
  const id = Number(fd.get("id"));
  const p = await db.project.findUnique({ where: { id } });
  if (p) await db.project.update({ where: { id }, data: { active: !p.active } });
  revalidateTag(PORTFOLIO_TAG);
  revalidatePath("/", "layout");
  revalidatePath("/admin");
}

export async function deleteProject(fd: FormData) {
  requireAdmin();
  const id = Number(fd.get("id"));
  const p = await db.project.findUnique({ where: { id }, include: { images: true } });
  if (!p) return;
  await db.project.delete({ where: { id } });
  await Promise.all(p.images.map((i) => removeFile(i.url)));
  revalidateTag(PORTFOLIO_TAG);
  revalidatePath("/", "layout");
  revalidatePath("/admin");
}
