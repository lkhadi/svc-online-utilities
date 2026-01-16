import { db } from '../../../db';
import { blogCategories } from '../../../db/schema';
import { eq } from 'drizzle-orm';

interface CreateCategoryBody {
  slug: string;
  name: string;
  description?: string;
  parentId?: number;
}

export default defineEventHandler(async (event) => {
  // Only allow in development mode (no auth implemented)
  if (!import.meta.dev) {
    throw createError({
      statusCode: 404,
      message: 'Not found',
    });
  }

  const body = await readBody<CreateCategoryBody>(event);

  if (!body.slug || !body.name) {
    throw createError({
      statusCode: 400,
      message: 'Slug and name are required',
    });
  }

  // Check if slug already exists
  const existing = await db.query.blogCategories.findFirst({
    where: eq(blogCategories.slug, body.slug),
  });

  if (existing) {
    throw createError({
      statusCode: 409,
      message: 'A category with this slug already exists',
    });
  }

  const [newCategory] = await db
    .insert(blogCategories)
    .values({
      slug: body.slug,
      name: body.name,
      description: body.description,
      parentId: body.parentId,
    })
    .returning();

  return {
    data: newCategory,
  };
});
