import { db } from '../../../db';
import { blogPosts, blogCategories, blogTags, blogPostTags } from '../../../db/schema';
import { eq, desc, and, inArray } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  const status = query.status as string | undefined;
  const categorySlug = query.category as string | undefined;
  const tagSlug = query.tag as string | undefined;
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
  const offset = (page - 1) * limit;

  // Build where conditions
  const conditions = [];

  // Default to published posts only (unless status explicitly requested)
  if (status) {
    conditions.push(eq(blogPosts.status, status));
  } else {
    conditions.push(eq(blogPosts.status, 'published'));
  }

  // Filter by category
  if (categorySlug) {
    const category = await db.query.blogCategories.findFirst({
      where: eq(blogCategories.slug, categorySlug),
    });
    if (category) {
      conditions.push(eq(blogPosts.categoryId, category.id));
    }
  }

  // Filter by tag
  let postIdsWithTag: number[] | undefined;
  if (tagSlug) {
    const tag = await db.query.blogTags.findFirst({
      where: eq(blogTags.slug, tagSlug),
    });
    if (tag) {
      const postTags = await db.query.blogPostTags.findMany({
        where: eq(blogPostTags.tagId, tag.id),
      });
      postIdsWithTag = postTags.map((pt) => pt.postId);
    }
  }

  // Fetch posts
  let posts = await db.query.blogPosts.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [desc(blogPosts.publishedAt), desc(blogPosts.createdAt)],
    limit,
    offset,
    with: {
      category: true,
    },
  });

  // Filter by tag if needed
  if (postIdsWithTag !== undefined) {
    posts = posts.filter((post) => postIdsWithTag!.includes(post.id));
  }

  // Batch fetch all tags for all posts in ONE query (fixes N+1 problem)
  const postIds = posts.map((post) => post.id);
  let allPostTags: { postId: number; tag: { id: number; slug: string; name: string } }[] = [];

  if (postIds.length > 0) {
    allPostTags = await db.query.blogPostTags.findMany({
      where: inArray(blogPostTags.postId, postIds),
      with: {
        tag: true,
      },
    });
  }

  // Group tags by postId
  const tagsByPostId = new Map<number, { id: number; slug: string; name: string }[]>();
  for (const pt of allPostTags) {
    if (!tagsByPostId.has(pt.postId)) {
      tagsByPostId.set(pt.postId, []);
    }
    tagsByPostId.get(pt.postId)!.push(pt.tag);
  }

  // Build final response
  const postsWithTags = posts.map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    status: post.status,
    publishedAt: post.publishedAt,
    createdAt: post.createdAt,
    category: post.category,
    tags: tagsByPostId.get(post.id) || [],
  }));

  return {
    data: postsWithTags,
    meta: {
      page,
      limit,
      hasMore: posts.length === limit,
    },
  };
});
