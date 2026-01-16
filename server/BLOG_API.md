# Blog API Documentation

This document describes the database schema and API endpoints for the blog feature.

## Database Schema

### Tables

#### `blog_categories`

Stores blog post categories with optional hierarchical support.

| Column      | Type         | Constraints        | Description                    |
| ----------- | ------------ | ------------------ | ------------------------------ |
| id          | serial       | PRIMARY KEY        | Auto-increment ID              |
| slug        | varchar(100) | NOT NULL, UNIQUE   | URL-friendly identifier        |
| name        | varchar(100) | NOT NULL           | Display name                   |
| description | text         |                    | Optional description           |
| parent_id   | integer      | FK -> blog_categories.id | Parent category for hierarchy |
| created_at  | timestamp    | NOT NULL, DEFAULT NOW() | Creation timestamp        |

#### `blog_tags`

Stores tags for categorizing posts.

| Column | Type         | Constraints      | Description             |
| ------ | ------------ | ---------------- | ----------------------- |
| id     | serial       | PRIMARY KEY      | Auto-increment ID       |
| slug   | varchar(100) | NOT NULL, UNIQUE | URL-friendly identifier |
| name   | varchar(100) | NOT NULL         | Display name            |

#### `blog_posts`

Main posts table storing article content.

| Column           | Type         | Constraints                   | Description                        |
| ---------------- | ------------ | ----------------------------- | ---------------------------------- |
| id               | serial       | PRIMARY KEY                   | Auto-increment ID                  |
| slug             | varchar(255) | NOT NULL, UNIQUE              | URL-friendly identifier            |
| title            | varchar(255) | NOT NULL                      | Post title                         |
| excerpt          | text         |                               | Short summary for listings         |
| content_markdown | text         | NOT NULL                      | Original markdown content          |
| content_html     | text         | NOT NULL                      | Rendered HTML content              |
| cover_image      | varchar(500) |                               | Cover image URL                    |
| category_id      | integer      | FK -> blog_categories.id      | Post category                      |
| meta_title       | varchar(70)  |                               | SEO title (max 70 chars)           |
| meta_description | varchar(160) |                               | SEO description (max 160 chars)    |
| status           | varchar(20)  | NOT NULL, DEFAULT 'draft'     | Post status: 'draft' or 'published' |
| published_at     | timestamp    |                               | Publication date                   |
| created_at       | timestamp    | NOT NULL, DEFAULT NOW()       | Creation timestamp                 |
| updated_at       | timestamp    | NOT NULL, DEFAULT NOW()       | Last update timestamp              |

#### `blog_post_tags`

Junction table for post-tag many-to-many relationship.

| Column  | Type    | Constraints                              | Description |
| ------- | ------- | ---------------------------------------- | ----------- |
| post_id | integer | NOT NULL, FK -> blog_posts.id (CASCADE)  | Post ID     |
| tag_id  | integer | NOT NULL, FK -> blog_tags.id (CASCADE)   | Tag ID      |

**Primary Key:** (post_id, tag_id)

### Entity Relationship Diagram

```
blog_categories (1) ──────< (N) blog_posts
       │
       └──< parent_id (self-referential for hierarchy)

blog_posts (N) ────── blog_post_tags ────── (N) blog_tags
```

---

## API Endpoints

Base URL: `/api/blog`

### Posts

#### List Posts

```
GET /api/blog/posts
```

Returns a paginated list of blog posts.

**Query Parameters:**

| Parameter | Type   | Default     | Description                          |
| --------- | ------ | ----------- | ------------------------------------ |
| status    | string | 'published' | Filter by status ('draft', 'published') |
| category  | string |             | Filter by category slug              |
| tag       | string |             | Filter by tag slug                   |
| page      | number | 1           | Page number (1-indexed)              |
| limit     | number | 10          | Items per page (max 50)              |

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "slug": "hello-world",
      "title": "Hello World",
      "excerpt": "Welcome to my blog...",
      "coverImage": "https://example.com/image.jpg",
      "status": "published",
      "publishedAt": "2025-01-15T10:00:00.000Z",
      "createdAt": "2025-01-15T09:00:00.000Z",
      "category": {
        "id": 1,
        "slug": "tutorials",
        "name": "Tutorials"
      },
      "tags": [
        { "id": 1, "slug": "javascript", "name": "JavaScript" },
        { "id": 2, "slug": "nuxt", "name": "Nuxt" }
      ]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "hasMore": true
  }
}
```

---

#### Get Single Post

```
GET /api/blog/posts/:slug
```

Returns a single post by slug with full content.

**Path Parameters:**

| Parameter | Type   | Description         |
| --------- | ------ | ------------------- |
| slug      | string | Post slug (required) |

**Response:**

```json
{
  "data": {
    "id": 1,
    "slug": "hello-world",
    "title": "Hello World",
    "excerpt": "Welcome to my blog...",
    "contentMarkdown": "# Hello World\n\nWelcome...",
    "contentHtml": "<h1>Hello World</h1><p>Welcome...</p>",
    "coverImage": "https://example.com/image.jpg",
    "categoryId": 1,
    "metaTitle": "Hello World - My Blog",
    "metaDescription": "Welcome to my first blog post",
    "status": "published",
    "publishedAt": "2025-01-15T10:00:00.000Z",
    "createdAt": "2025-01-15T09:00:00.000Z",
    "updatedAt": "2025-01-15T10:00:00.000Z",
    "category": {
      "id": 1,
      "slug": "tutorials",
      "name": "Tutorials"
    },
    "tags": [
      { "id": 1, "slug": "javascript", "name": "JavaScript" }
    ]
  }
}
```

**Error Responses:**

- `400` - Slug is required
- `404` - Post not found

---

#### Create Post

```
POST /api/blog/posts
```

> **Note:** This endpoint is only available in development mode. Returns 404 in production.

Creates a new blog post.

**Request Body:**

| Field           | Type     | Required | Description                            |
| --------------- | -------- | -------- | -------------------------------------- |
| title           | string   | Yes      | Post title                             |
| contentMarkdown | string   | Yes      | Markdown content                       |
| slug            | string   | No       | Custom slug (auto-generated from title if not provided) |
| excerpt         | string   | No       | Short summary                          |
| coverImage      | string   | No       | Cover image URL                        |
| categoryId      | number   | No       | Category ID                            |
| metaTitle       | string   | No       | SEO title                              |
| metaDescription | string   | No       | SEO description                        |
| status          | string   | No       | 'draft' (default) or 'published'       |
| tags            | string[] | No       | Array of tag slugs (creates tags if not exist) |

**Example Request:**

```json
{
  "title": "Getting Started with Nuxt 3",
  "contentMarkdown": "# Getting Started\n\nNuxt 3 is a powerful framework...",
  "excerpt": "Learn how to build modern web apps with Nuxt 3",
  "categoryId": 1,
  "status": "published",
  "tags": ["nuxt", "vue", "javascript"]
}
```

**Response:**

```json
{
  "data": {
    "id": 2,
    "slug": "getting-started-with-nuxt-3",
    "title": "Getting Started with Nuxt 3",
    "excerpt": "Learn how to build modern web apps with Nuxt 3",
    "contentMarkdown": "# Getting Started\n\nNuxt 3 is a powerful framework...",
    "contentHtml": "<h1>Getting Started</h1><p>Nuxt 3 is a powerful framework...</p>",
    "coverImage": null,
    "categoryId": 1,
    "metaTitle": null,
    "metaDescription": null,
    "status": "published",
    "publishedAt": "2025-01-15T12:00:00.000Z",
    "createdAt": "2025-01-15T12:00:00.000Z",
    "updatedAt": "2025-01-15T12:00:00.000Z"
  }
}
```

**Error Responses:**

- `400` - Title and content are required
- `409` - A post with this slug already exists

---

### Categories

#### List Categories

```
GET /api/blog/categories
```

Returns all categories sorted alphabetically by name.

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "slug": "tutorials",
      "name": "Tutorials",
      "description": "Step-by-step guides",
      "parentId": null,
      "createdAt": "2025-01-15T10:00:00.000Z"
    },
    {
      "id": 2,
      "slug": "news",
      "name": "News",
      "description": null,
      "parentId": null,
      "createdAt": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

---

#### Create Category

```
POST /api/blog/categories
```

> **Note:** This endpoint is only available in development mode. Returns 404 in production.

Creates a new category.

**Request Body:**

| Field       | Type   | Required | Description                     |
| ----------- | ------ | -------- | ------------------------------- |
| slug        | string | Yes      | URL-friendly identifier         |
| name        | string | Yes      | Display name                    |
| description | string | No       | Category description            |
| parentId    | number | No       | Parent category ID for hierarchy |

**Example Request:**

```json
{
  "slug": "devops",
  "name": "DevOps",
  "description": "Articles about development operations and tools"
}
```

**Response:**

```json
{
  "data": {
    "id": 1,
    "slug": "devops",
    "name": "DevOps",
    "description": "Articles about development operations and tools",
    "parentId": null,
    "createdAt": "2025-01-15T10:00:00.000Z"
  }
}
```

**Error Responses:**

- `400` - Slug and name are required
- `409` - A category with this slug already exists

---

### Tags

#### List Tags

```
GET /api/blog/tags
```

Returns all tags sorted alphabetically by name.

**Response:**

```json
{
  "data": [
    { "id": 1, "slug": "javascript", "name": "JavaScript" },
    { "id": 2, "slug": "nuxt", "name": "Nuxt" },
    { "id": 3, "slug": "vue", "name": "Vue" }
  ]
}
```

---

## Database Migrations

Migrations are managed with Drizzle Kit. Migration files are located in `/drizzle/migrations/`.

### Commands

```bash
# Generate migration from schema changes
npm run db:generate

# Run migrations
npm run db:migrate

# Open Drizzle Studio (database GUI)
npm run db:studio
```

### Environment Variables

| Variable    | Description          |
| ----------- | -------------------- |
| DB_HOST     | Database host        |
| DB_PORT     | Database port        |
| DB_DATABASE | Database name        |
| DB_USERNAME | Database username    |
| DB_PASSWORD | Database password    |

---

## Content Storage

Posts store content in two formats:

1. **content_markdown** - Original markdown source for editing
2. **content_html** - Pre-rendered HTML for fast display

The markdown is automatically rendered to HTML when creating a post using the `marked` library (`server/utils/markdown.ts`).
