"use server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export async function sendMessage(fd: FormData) {
  const name = String(fd.get("name") || "").trim().slice(0, 120);
  const email = String(fd.get("email") || "").trim().slice(0, 200);
  const body = String(fd.get("body") || "").trim().slice(0, 5000);
  if (!name || !email.includes("@") || !body) redirect("/contact?error=1");
  await db.message.create({ data: { name, email, body } });
  redirect("/contact?sent=1");
}
