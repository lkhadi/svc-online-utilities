<template>
  <div class="blog-tags-wrapper">
    <div class="blog-tags">
      <NuxtLink
        v-for="tag in visibleTags"
        :key="tag.id"
        :to="`/blog/tag/${tag.slug}`"
        class="tag"
        :class="{ active: activeSlug === tag.slug }"
      >
        {{ tag.name }}
        <span v-if="tag.postCount" class="tag-count">({{ tag.postCount }})</span>
      </NuxtLink>
      <button
        v-if="hasMore"
        class="tag show-more-btn"
        @click="toggleExpanded"
      >
        {{ expanded ? 'Show less' : `+${hiddenCount} more` }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Tag {
  id: number;
  slug: string;
  name: string;
  postCount?: number;
}

const props = defineProps<{
  tags: Tag[];
  activeSlug?: string;
  initialLimit?: number;
}>();

const expanded = ref(false);
const limit = props.initialLimit ?? 10;

const visibleTags = computed(() => {
  if (expanded.value || props.tags.length <= limit) {
    return props.tags;
  }
  return props.tags.slice(0, limit);
});

const hasMore = computed(() => props.tags.length > limit);
const hiddenCount = computed(() => props.tags.length - limit);

function toggleExpanded() {
  expanded.value = !expanded.value;
}
</script>

<style scoped>
.blog-tags-wrapper {
  flex: 1;
}

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

.show-more-btn {
  cursor: pointer;
  background: var(--color-accent-primary);
  border-color: var(--color-accent-primary);
  color: white;
  font-weight: 500;
}

.show-more-btn:hover {
  background: var(--color-accent-secondary);
  border-color: var(--color-accent-secondary);
  color: white;
}

.tag-count {
  opacity: 0.7;
  font-size: var(--font-size-xs);
  margin-left: 2px;
}
</style>
