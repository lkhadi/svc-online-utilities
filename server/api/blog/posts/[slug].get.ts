import { db } from '../../../db';
import { blogPosts, blogPostTags } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug');

  if (!slug) {
    throw createError({
      statusCode: 400,
      message: 'Slug is required',
    });
  }

  const post = await db.query.blogPosts.findFirst({
    where: eq(blogPosts.slug, slug),
    with: {
      category: true,
    },
  });

  if (!post) {
    throw createError({
      statusCode: 404,
      message: 'Post not found',
    });
  }

  // Fetch tags for the post
  const postTags = await db.query.blogPostTags.findMany({
    where: eq(blogPostTags.postId, post.id),
    with: {
      tag: true,
    },
  });

  return {
    data: {
      ...post,
      tags: postTags.map((pt) => pt.tag),
    },
  };
});
