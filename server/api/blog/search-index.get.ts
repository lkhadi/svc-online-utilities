import { db } from '../../db';
import { blogPosts } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  // Set cache headers for better performance (e.g., 5 minutes)
  setHeader(event, 'Cache-Control', 'public, max-age=300, s-maxage=300');

  // Fetch all published posts
  // We select only minimal fields needed for search to keep payload small
  const posts = await db.query.blogPosts.findMany({
    where: eq(blogPosts.status, 'published'),
    orderBy: [desc(blogPosts.publishedAt)],
    columns: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      // We can search efficiently on these fields
    }
  });

  return {
    data: posts
  };
});
