<template>
  <div class="blog-tags">
    <NuxtLink
      v-for="tag in tags"
      :key="tag.id"
      :to="`/blog/tag/${tag.slug}`"
      class="tag"
      :class="{ active: activeSlug === tag.slug }"
    >
      {{ tag.name }}
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
interface Tag {
  id: number;
  slug: string;
  name: string;
}

defineProps<{
  tags: Tag[];
  activeSlug?: string;
}>();
</script>

<style scoped>
.blog-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.tag {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.tag:hover {
  border-color: var(--color-accent-primary);
  color: var(--color-accent-primary);
}

.tag.active {
  background: var(--color-accent-primary);
  border-color: var(--color-accent-primary);
  color: white;
}
</style>
