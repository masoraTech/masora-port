import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import ProjectForm from "../../../ProjectForm";

export const dynamic = "force-dynamic";

export default async function Edit({ params }: { params: { id: string } }) {
  const project = await db.project.findUnique({
    where: { id: Number(params.id) || 0 },
    include: { images: { orderBy: { position: "asc" } } },
  });
  if (!project) notFound();
  const categories = await db.category.findMany({ orderBy: { id: "asc" } });
  return (
    <main className="admin">
      <Link href="/admin">← Retour à la liste</Link>
      <h2>Modifier le projet</h2>
      <ProjectForm categories={categories} project={project} />
    </main>
  );
}
