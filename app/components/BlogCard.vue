<template>
  <NuxtLink :to="`/blog/${post.slug}`" class="blog-card">
    <div class="card-image" v-if="post.coverImage">
      <img :src="post.coverImage" :alt="post.title" loading="lazy" />
    </div>
    <div class="card-image placeholder" v-else>
      <span>{{ post.title.charAt(0) }}</span>
    </div>

    <div class="card-content">
      <div class="card-meta">
        <span class="category" v-if="post.category">{{ post.category.name }}</span>
        <span class="date" v-if="post.publishedAt">
          {{ formatDate(post.publishedAt) }}
        </span>
      </div>

      <h3 class="card-title">{{ post.title }}</h3>
      <p class="card-excerpt" v-if="post.excerpt">{{ post.excerpt }}</p>

      <div class="card-tags" v-if="post.tags && post.tags.length">
        <span v-for="tag in post.tags.slice(0, 3)" :key="tag.id" class="tag">
          {{ tag.name }}
        </span>
      </div>

      <span class="read-more">
        Read article <span class="arrow">→</span>
      </span>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
interface Tag {
  id: number;
  slug: string;
  name: string;
}

interface Category {
  id: number;
  slug: string;
  name: string;
}

interface Post {
  id: number;
  slug: string;
  title: string;
  excerpt?: string | null;
  coverImage?: string | null;
  publishedAt?: string | null;
  category?: Category | null;
  tags?: Tag[];
}

defineProps<{
  post: Post;
}>();

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
</script>

<style scoped>
.blog-card {
  display: flex;
  flex-direction: column;
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  transition: all var(--transition-base);
  text-decoration: none;
}

.blog-card:hover {
  border-color: var(--color-border-hover);
  transform: translateY(-4px);
}

.card-image {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--color-bg-tertiary);
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.blog-card:hover .card-image img {
  transform: scale(1.05);
}

.card-image.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary));
}

.card-image.placeholder span {
  font-size: 3rem;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
}

.card-content {
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-xs);
}

.category {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-accent-primary);
  color: white;
  border-radius: var(--radius-sm);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.date {
  color: var(--color-text-muted);
}

.card-title {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
  line-height: 1.3;
}

.card-excerpt {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: var(--spacing-md);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
}

.tag {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.read-more {
  margin-top: auto;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-accent-primary);
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.arrow {
  transition: transform var(--transition-fast);
}

.blog-card:hover .arrow {
  transform: translateX(4px);
}
</style>
