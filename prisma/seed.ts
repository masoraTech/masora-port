import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/password";

const db = new PrismaClient();

const cats = [
  ["Développement mobile", "developpement-mobile"],
  ["Création de sites web", "creation-de-sites-web"],
  ["Applications web", "applications-web"],
  ["Solutions ERP", "solutions-erp"],
  ["E-commerce", "e-commerce"],
];

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Set a valid ADMIN_EMAIL before running the database seed");
  }
  if (!password || password.length < 12) {
    throw new Error("Set an ADMIN_PASSWORD with at least 12 characters before running the database seed");
  }
  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) {
    throw new Error("Set an AUTH_SECRET with at least 32 characters before running the database seed");
  }

  for (const [name, slug] of cats)
    await db.category.upsert({ where: { slug }, update: {}, create: { name, slug } });

  const passwordHash = await hashPassword(password);
  await db.admin.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });
}

main()
  .catch((error: unknown) => {
    console.error("Database seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
