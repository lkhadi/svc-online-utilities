<template>
  <div class="blog-page">
    <div class="container">
      <!-- Back link -->
      <NuxtLink to="/blog" class="back-link">
        <span class="arrow">←</span> All Articles
      </NuxtLink>

      <header class="page-header">
        <span class="section-tag">Category</span>
        <h1 class="page-title">{{ categoryName }}</h1>
        <p class="page-description">
          Articles in the {{ categoryName }} category
        </p>
      </header>

      <!-- Posts Grid -->
      <div class="posts-grid" v-if="posts.length">
        <BlogCard v-for="post in posts" :key="post.id" :post="post" />
      </div>

      <!-- Empty State -->
      <div class="empty-state" v-else-if="!pending">
        <div class="empty-icon">📂</div>
        <h2>No articles in this category</h2>
        <p>Check back soon for new content!</p>
        <NuxtLink to="/blog" class="btn btn-primary">View all articles</NuxtLink>
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
import { ref, computed } from 'vue';

const route = useRoute();
const slug = route.params.slug as string;
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

// Fetch posts by category
const { data: postsData, pending } = await useFetch<{ data: Post[]; meta: { hasMore: boolean } }>(
  '/api/blog/posts',
  {
    query: { category: slug, page: page.value, limit: 9 },
  }
);

const posts = ref<Post[]>(postsData.value?.data || []);
hasMore.value = postsData.value?.meta.hasMore || false;

// Get category name from first post or format slug
const categoryName = computed(() => {
  if (posts.value.length && posts.value[0].category) {
    return posts.value[0].category.name;
  }
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
});

// SEO
useSeoMeta({
  title: () => `${categoryName.value} - Blog - meskipun.win`,
  description: () => `Articles in the ${categoryName.value} category`,
});

async function loadMore() {
  loadingMore.value = true;
  page.value++;

  try {
    const response = await $fetch<{ data: Post[]; meta: { hasMore: boolean } }>(
      '/api/blog/posts',
      {
        query: { category: slug, page: page.value, limit: 9 },
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
  padding: var(--spacing-3xl) 0 var(--spacing-4xl);
  min-height: 60vh;
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
  margin-bottom: var(--spacing-xl);
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
}
</style>
