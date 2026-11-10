import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";

// Public site data is cached so page changes don't wait on the database.
// Admin actions call revalidateTag(PORTFOLIO_TAG) after every change, and the
// cache also refreshes on its own after REVALIDATE_SECONDS.
export const PORTFOLIO_TAG = "portfolio";
const REVALIDATE_SECONDS = 300;
const options = { tags: [PORTFOLIO_TAG], revalidate: REVALIDATE_SECONDS };

export const getCategories = unstable_cache(
  async () => {
    const categories = await db.category.findMany({
      orderBy: { id: "asc" },
      include: { _count: { select: { projects: { where: { active: true } } } } },
    });
    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      projectCount: category._count.projects,
    }));
  },
  ["categories"],
  options,
);

export const getTechnologies = unstable_cache(
  async () => {
    const records = await db.project.findMany({ where: { active: true }, select: { technologies: true } });
    return [...new Set(
      records
        .flatMap((project) => project.technologies.split(","))
        .map((technology) => technology.trim())
        .filter(Boolean),
    )];
  },
  ["technologies"],
  options,
);

export const getProjects = unstable_cache(
  async (cat: string | null) => {
    const projects = await db.project.findMany({
      where: { active: true, ...(cat ? { category: { slug: cat } } : {}) },
      include: {
        images: { orderBy: { position: "asc" }, ...(!cat ? { take: 1 } : {}) },
        category: true,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      ...(!cat ? { take: 5 } : {}),
    });
    return projects.map((project) => ({
      id: project.id,
      title: project.title,
      technologies: project.technologies,
      year: project.createdAt.getFullYear(),
      category: project.category.name,
      images: project.images.map((image) => image.url),
    }));
  },
  ["projects"],
  options,
);
