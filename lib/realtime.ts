import { createRealtime, rawSql } from "@neon/realtime/server";
import type { ProjectSlide } from "@/lib/project-types";

const secret = process.env.NEON_REALTIME_SECRET;
export const realtime = secret && process.env.NEXT_PUBLIC_NEON_REALTIME_URL
  ? createRealtime({ secret, db: "neondb" })
  : null;

export function projectSlidesQuery() {
  return rawSql<ProjectSlide>(`
    SELECT
      p."id" AS "id",
      p."title" AS "title",
      c."name" AS "category",
      (
        SELECT i."url"
        FROM "ProjectImage" i
        WHERE i."projectId" = p."id"
        ORDER BY i."position" ASC, i."id" ASC
        LIMIT 1
      ) AS "imageUrl"
    FROM "Project" p
    INNER JOIN "Category" c ON c."id" = p."categoryId"
    WHERE p."active" = TRUE
    ORDER BY p."createdAt" DESC, p."id" DESC
    LIMIT 5
  `);
}
