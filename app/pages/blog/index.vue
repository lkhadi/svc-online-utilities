<template>
  <div class="blog-page">
    <div class="container">
      <header class="page-header">
        <span class="section-tag">Blog</span>
        <h1 class="page-title">Articles & Insights</h1>
        <p class="page-description">
          Explore our latest articles, tutorials, and insights.
        </p>
      </header>

      <!-- Filters -->
      <div class="filters" v-if="categories.length || tags.length">
        <div class="filter-group" v-if="categories.length">
          <span class="filter-label">Categories:</span>
          <div class="filter-options">
            <NuxtLink
              to="/blog"
              class="filter-btn"
              :class="{ active: !route.query.category }"
            >
              All
            </NuxtLink>
            <NuxtLink
              v-for="cat in categories"
              :key="cat.id"
              :to="`/blog/category/${cat.slug}`"
              class="filter-btn"
            >
              {{ cat.name }}
            </NuxtLink>
          </div>
        </div>

        <div class="filter-group" v-if="tags.length">
          <span class="filter-label">Tags:</span>
          <BlogTags :tags="tags" />
        </div>
      </div>

      <!-- Posts Grid -->
      <div class="posts-grid" v-if="posts.length">
        <BlogCard v-for="post in posts" :key="post.id" :post="post" />
      </div>

      <!-- Empty State -->
      <div class="empty-state" v-else-if="!pending">
        <div class="empty-icon">📝</div>
        <h2>No articles yet</h2>
        <p>Check back soon for new content!</p>
      </div>

      <!-- Loading State -->
      <div class="loading-state" v-if="pending">
        <div class="spinner"></div>
        <p>Loading articles...</p>
      </div>

      <!-- Pagination -->
      <div class="pagination" v-if="posts.length && hasMore">
        <button class="btn btn-secondary" @click="loadMore" :disabled="loadingMore">
          {{ loadingMore ? 'Loading...' : 'Load more articles' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

useSeoMeta({
  title: 'Blog - meskipun.win',
  description: 'Explore our latest articles, tutorials, and insights.',
});

const route = useRoute();
const page = ref(1);
const loadingMore = ref(false);
const hasMore = ref(false);

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

// Fetch posts
const { data: postsData, pending } = await useFetch<{ data: Post[]; meta: { hasMore: boolean } }>(
  '/api/blog/posts',
  {
    query: { page: page.value, limit: 9 },
  }
);

const posts = ref<Post[]>(postsData.value?.data || []);
hasMore.value = postsData.value?.meta.hasMore || false;

// Fetch categories
const { data: categoriesData } = await useFetch<{ data: Category[] }>('/api/blog/categories');
const categories = categoriesData.value?.data || [];

// Fetch tags
const { data: tagsData } = await useFetch<{ data: Tag[] }>('/api/blog/tags');
const tags = tagsData.value?.data || [];

async function loadMore() {
  loadingMore.value = true;
  page.value++;

  try {
    const response = await $fetch<{ data: Post[]; meta: { hasMore: boolean } }>(
      '/api/blog/posts',
      {
        query: { page: page.value, limit: 9 },
      }
    );

    posts.value.push(...response.data);
    hasMore.value = response.meta.hasMore;
  } finally {
    loadingMore.value = false;
  }
}
</script>

<style scoped>
.blog-page {
  padding: var(--spacing-4xl) 0;
  min-height: 60vh;
}

.page-header {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
}

.section-tag {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-md);
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-accent-primary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: var(--spacing-lg);
}

.page-title {
  font-size: var(--font-size-4xl);
  font-weight: 800;
  margin-bottom: var(--spacing-md);
  letter-spacing: -0.02em;
}

.page-description {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  max-width: 500px;
  margin: 0 auto;
}

.filters {
  margin-bottom: var(--spacing-3xl);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.filter-group {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.filter-label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  padding-top: var(--spacing-sm);
  min-width: 80px;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.filter-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.filter-btn:hover {
  border-color: var(--color-accent-primary);
  color: var(--color-accent-primary);
}

.filter-btn.active {
  background: var(--color-accent-primary);
  border-color: var(--color-accent-primary);
  color: white;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-xl);
}

.empty-state,
.loading-state {
  text-align: center;
  padding: var(--spacing-4xl);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
}

.empty-state h2 {
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-sm);
}

.empty-state p {
  color: var(--color-text-secondary);
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

.pagination {
  margin-top: var(--spacing-3xl);
  text-align: center;
}

@media (max-width: 768px) {
  .page-title {
    font-size: var(--font-size-3xl);
  }

  .posts-grid {
    grid-template-columns: 1fr;
  }

  .filter-group {
    flex-direction: column;
  }

  .filter-label {
    min-width: auto;
  }
}
</style>
