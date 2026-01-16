<template>
  <div class="article-page">
    <div class="container">
      <!-- Back link -->
      <NuxtLink to="/blog" class="back-link">
        <span class="arrow">←</span> Back to Blog
      </NuxtLink>

      <!-- Loading -->
      <div class="loading-state" v-if="pending">
        <div class="spinner"></div>
        <p>Loading article...</p>
      </div>

      <!-- Article -->
      <article class="article" v-else-if="post">
        <header class="article-header">
          <div class="article-meta">
            <NuxtLink
              v-if="post.category"
              :to="`/blog/category/${post.category.slug}`"
              class="category"
            >
              {{ post.category.name }}
            </NuxtLink>
            <span class="date" v-if="post.publishedAt">
              {{ formatDate(post.publishedAt) }}
            </span>
          </div>

          <h1 class="article-title">{{ post.title }}</h1>

          <p class="article-excerpt" v-if="post.excerpt">{{ post.excerpt }}</p>

          <div class="article-tags" v-if="post.tags && post.tags.length">
            <NuxtLink
              v-for="tag in post.tags"
              :key="tag.id"
              :to="`/blog/tag/${tag.slug}`"
              class="tag"
            >
              {{ tag.name }}
            </NuxtLink>
          </div>
        </header>

        <!-- Cover Image -->
        <div class="article-cover" v-if="post.coverImage">
          <img :src="post.coverImage" :alt="post.title" />
        </div>

        <!-- Content -->
        <div class="article-content prose" v-html="post.contentHtml"></div>

        <!-- Footer -->
        <footer class="article-footer">
          <div class="share-section">
            <span class="share-label">Share this article:</span>
            <div class="share-buttons">
              <a
                :href="`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(currentUrl)}`"
                target="_blank"
                rel="noopener"
                class="share-btn"
              >
                Twitter
              </a>
              <a
                :href="`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(post.title)}`"
                target="_blank"
                rel="noopener"
                class="share-btn"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </footer>
      </article>

      <!-- Not Found -->
      <div class="not-found" v-else>
        <div class="not-found-icon">404</div>
        <h2>Article not found</h2>
        <p>The article you're looking for doesn't exist or has been removed.</p>
        <NuxtLink to="/blog" class="btn btn-primary">Back to Blog</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const slug = route.params.slug as string;

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
  contentHtml: string;
  coverImage?: string | null;
  publishedAt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  category?: Category | null;
  tags?: Tag[];
}

const { data, pending, error } = await useFetch<{ data: Post }>(`/api/blog/posts/${slug}`);
const post = computed(() => data.value?.data);

// SEO
useSeoMeta({
  title: () => post.value?.metaTitle || post.value?.title || 'Article',
  description: () => post.value?.metaDescription || post.value?.excerpt || '',
  ogTitle: () => post.value?.title || 'Article',
  ogDescription: () => post.value?.excerpt || '',
  ogImage: () => post.value?.coverImage || undefined,
});

// Current URL for sharing
const currentUrl = computed(() => {
  if (typeof window !== 'undefined') {
    return window.location.href;
  }
  return '';
});

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
</script>

<style scoped>
.article-page {
  padding: var(--spacing-3xl) 0 var(--spacing-4xl);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
  margin-bottom: var(--spacing-xl);
  transition: color var(--transition-fast);
}

.back-link:hover {
  color: var(--color-accent-primary);
}

.back-link .arrow {
  transition: transform var(--transition-fast);
}

.back-link:hover .arrow {
  transform: translateX(-4px);
}

.article {
  max-width: 800px;
  margin: 0 auto;
}

.article-header {
  margin-bottom: var(--spacing-2xl);
}

.article-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.category {
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--color-accent-primary);
  color: white;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-decoration: none;
  transition: opacity var(--transition-fast);
}

.category:hover {
  opacity: 0.9;
}

.date {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.article-title {
  font-size: var(--font-size-4xl);
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: var(--spacing-lg);
  letter-spacing: -0.02em;
}

.article-excerpt {
  font-size: var(--font-size-xl);
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: var(--spacing-lg);
}

.article-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.tag {
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.tag:hover {
  background: var(--color-accent-primary);
  color: white;
}

.article-cover {
  margin-bottom: var(--spacing-2xl);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.article-cover img {
  width: 100%;
  height: auto;
}

.article-content {
  font-size: var(--font-size-lg);
  line-height: 1.8;
  color: var(--color-text-primary);
}

/* Prose styles for article content */
.article-content :deep(h2) {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  margin-top: var(--spacing-3xl);
  margin-bottom: var(--spacing-lg);
}

.article-content :deep(h3) {
  font-size: var(--font-size-xl);
  font-weight: 600;
  margin-top: var(--spacing-2xl);
  margin-bottom: var(--spacing-md);
}

.article-content :deep(p) {
  margin-bottom: var(--spacing-lg);
}

.article-content :deep(a) {
  color: var(--color-accent-primary);
  text-decoration: underline;
}

.article-content :deep(ul),
.article-content :deep(ol) {
  margin-bottom: var(--spacing-lg);
  padding-left: var(--spacing-xl);
}

.article-content :deep(li) {
  margin-bottom: var(--spacing-sm);
}

.article-content :deep(blockquote) {
  border-left: 4px solid var(--color-accent-primary);
  padding-left: var(--spacing-lg);
  margin: var(--spacing-xl) 0;
  font-style: italic;
  color: var(--color-text-secondary);
}

.article-content :deep(pre) {
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  overflow-x: auto;
  margin: var(--spacing-xl) 0;
}

.article-content :deep(code) {
  font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
  font-size: 0.9em;
}

.article-content :deep(p code) {
  background: var(--color-bg-tertiary);
  padding: 0.2em 0.4em;
  border-radius: var(--radius-sm);
}

.article-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-lg);
  margin: var(--spacing-xl) 0;
}

.article-content :deep(hr) {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: var(--spacing-3xl) 0;
}

.article-footer {
  margin-top: var(--spacing-3xl);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--color-border);
}

.share-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.share-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.share-buttons {
  display: flex;
  gap: var(--spacing-sm);
}

.share-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.share-btn:hover {
  border-color: var(--color-accent-primary);
  color: var(--color-accent-primary);
}

.loading-state {
  text-align: center;
  padding: var(--spacing-4xl);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-accent-primary);
  border-radius: 50%;
  margin: 0 auto var(--spacing-md);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.not-found {
  text-align: center;
  padding: var(--spacing-4xl);
}

.not-found-icon {
  font-size: 4rem;
  font-weight: 800;
  color: var(--color-text-muted);
  margin-bottom: var(--spacing-lg);
}

.not-found h2 {
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-sm);
}

.not-found p {
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xl);
}

@media (max-width: 768px) {
  .article-title {
    font-size: var(--font-size-3xl);
  }

  .article-excerpt {
    font-size: var(--font-size-lg);
  }

  .article-content {
    font-size: var(--font-size-base);
  }
}
</style>
