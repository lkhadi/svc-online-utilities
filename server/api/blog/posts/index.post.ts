import { db } from '../../../db';
import { blogPosts, blogTags, blogPostTags } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { renderMarkdown, generateSlug } from '../../../utils/markdown';

interface CreatePostBody {
  title: string;
  slug?: string;
  excerpt?: string;
  contentMarkdown: string;
  coverImage?: string;
  categoryId?: number;
  metaTitle?: string;
  metaDescription?: string;
  status?: 'draft' | 'published';
  tags?: string[]; // Array of tag slugs
}

export default defineEventHandler(async (event) => {
  // Only allow in development mode (no auth implemented)
  if (!import.meta.dev) {
    throw createError({
      statusCode: 404,
      message: 'Not found',
    });
  }

  const body = await readBody<CreatePostBody>(event);

  // Validate required fields
  if (!body.title || !body.contentMarkdown) {
    throw createError({
      statusCode: 400,
      message: 'Title and content are required',
    });
  }

  // Generate slug if not provided
  const slug = body.slug || generateSlug(body.title);

  // Check if slug already exists
  const existingPost = await db.query.blogPosts.findFirst({
    where: eq(blogPosts.slug, slug),
  });

  if (existingPost) {
    throw createError({
      statusCode: 409,
      message: 'A post with this slug already exists',
    });
  }

  // Render markdown to HTML
  const contentHtml = renderMarkdown(body.contentMarkdown);

  // Create the post
  const [newPost] = await db
    .insert(blogPosts)
    .values({
      title: body.title,
      slug,
      excerpt: body.excerpt,
      contentMarkdown: body.contentMarkdown,
      contentHtml,
      coverImage: body.coverImage,
      categoryId: body.categoryId,
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      status: body.status || 'draft',
      publishedAt: body.status === 'published' ? new Date() : null,
    })
    .returning();

  // Handle tags if provided
  if (body.tags && body.tags.length > 0) {
    for (const tagSlug of body.tags) {
      // Find or create tag
      let tag = await db.query.blogTags.findFirst({
        where: eq(blogTags.slug, tagSlug),
      });

      if (!tag) {
        const [newTag] = await db
          .insert(blogTags)
          .values({
            slug: tagSlug,
            name: tagSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          })
          .returning();
        tag = newTag;
      }

      // Link post to tag
      await db.insert(blogPostTags).values({
        postId: newPost.id,
        tagId: tag.id,
      });
    }
  }

  return {
    data: newPost,
  };
});
