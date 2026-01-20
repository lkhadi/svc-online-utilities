import { db } from '../../../db';
import { blogTags, blogPostTags } from '../../../db/schema';
import { sql, desc } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const includeEmpty = query.includeEmpty === 'true';

  // Fetch tags with post counts, sorted by count DESC
  const tagsWithCounts = await db
    .select({
      id: blogTags.id,
      slug: blogTags.slug,
      name: blogTags.name,
      postCount: sql<number>`CAST(COUNT(${blogPostTags.postId}) AS INTEGER)`,
    })
    .from(blogTags)
    .leftJoin(blogPostTags, sql`${blogTags.id} = ${blogPostTags.tagId}`)
    .groupBy(blogTags.id, blogTags.slug, blogTags.name)
    .orderBy(desc(sql`COUNT(${blogPostTags.postId})`), blogTags.name);

  // Filter out tags with 0 posts unless explicitly requested
  const filteredTags = includeEmpty
    ? tagsWithCounts
    : tagsWithCounts.filter((tag) => tag.postCount > 0);

  return {
    data: filteredTags,
  };
});
