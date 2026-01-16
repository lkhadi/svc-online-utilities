import { db } from '../../../db';
import { blogCategories } from '../../../db/schema';
import { asc } from 'drizzle-orm';

export default defineEventHandler(async () => {
  const categories = await db.query.blogCategories.findMany({
    orderBy: [asc(blogCategories.name)],
  });

  return {
    data: categories,
  };
});
