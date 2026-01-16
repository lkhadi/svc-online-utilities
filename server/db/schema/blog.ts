import { pgTable, serial, varchar, text, timestamp, integer, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Categories (hierarchical)
export const blogCategories = pgTable('blog_categories', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  parentId: integer('parent_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tags
export const blogTags = pgTable('blog_tags', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
});

// Posts
export const blogPosts = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  excerpt: text('excerpt'),

  // Content: store both markdown source and rendered HTML
  contentMarkdown: text('content_markdown').notNull(),
  contentHtml: text('content_html').notNull(),

  coverImage: varchar('cover_image', { length: 500 }),

  // Relations
  categoryId: integer('category_id').references(() => blogCategories.id),

  // SEO
  metaTitle: varchar('meta_title', { length: 70 }),
  metaDescription: varchar('meta_description', { length: 160 }),

  // Status
  status: varchar('status', { length: 20 }).default('draft').notNull(),
  publishedAt: timestamp('published_at'),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Post <-> Tags (many-to-many)
export const blogPostTags = pgTable('blog_post_tags', {
  postId: integer('post_id').notNull().references(() => blogPosts.id, { onDelete: 'cascade' }),
  tagId: integer('tag_id').notNull().references(() => blogTags.id, { onDelete: 'cascade' }),
}, (table) => [
  primaryKey({ columns: [table.postId, table.tagId] }),
]);

// Relations
export const blogCategoriesRelations = relations(blogCategories, ({ one, many }) => ({
  parent: one(blogCategories, {
    fields: [blogCategories.parentId],
    references: [blogCategories.id],
    relationName: 'categoryParent',
  }),
  children: many(blogCategories, { relationName: 'categoryParent' }),
  posts: many(blogPosts),
}));

export const blogPostsRelations = relations(blogPosts, ({ one, many }) => ({
  category: one(blogCategories, {
    fields: [blogPosts.categoryId],
    references: [blogCategories.id],
  }),
  postTags: many(blogPostTags),
}));

export const blogTagsRelations = relations(blogTags, ({ many }) => ({
  postTags: many(blogPostTags),
}));

export const blogPostTagsRelations = relations(blogPostTags, ({ one }) => ({
  post: one(blogPosts, {
    fields: [blogPostTags.postId],
    references: [blogPosts.id],
  }),
  tag: one(blogTags, {
    fields: [blogPostTags.tagId],
    references: [blogTags.id],
  }),
}));
