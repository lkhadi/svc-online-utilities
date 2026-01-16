import { db } from '../../../db';
import { blogTags } from '../../../db/schema';
import { asc } from 'drizzle-orm';

export default defineEventHandler(async () => {
  const tags = await db.query.blogTags.findMany({
    orderBy: [asc(blogTags.name)],
  });

  return {
    data: tags,
  };
});
