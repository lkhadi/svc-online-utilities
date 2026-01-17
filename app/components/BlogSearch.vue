<template>
  <div class="blog-search">
    <div class="search-input-group">
      <span class="search-icon">🔍</span>
      <input 
        type="text" 
        v-model="query" 
        class="search-input" 
        placeholder="Search articles..."
        @focus="initSearch"
        @input="handleInput"
      >
      <button v-if="query" class="clear-btn" @click="clearSearch">✕</button>
    </div>

    <div v-if="showResults && (results.length > 0 || hasSearched)" class="search-results">
      <div v-if="results.length > 0">
        <NuxtLink 
          v-for="result in results" 
          :key="result.item.id" 
          :to="`/blog/${result.item.slug}`"
          class="search-item"
        >
          <div class="item-title">{{ result.item.title }}</div>
          <div class="item-excerpt" v-if="result.item.excerpt">
            {{ truncate(result.item.excerpt, 60) }}
          </div>
        </NuxtLink>
      </div>
      <div v-else class="no-results">
        No results found for "{{ query }}"
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Fuse from 'fuse.js'

interface SearchItem {
  id: number
  title: string
  slug: string
  excerpt: string
}

const query = ref('')
const results = ref<any[]>([])
const isLoaded = ref(false)
const showResults = ref(false)
const hasSearched = ref(false)
let fuse: any = null

const { data: searchData, execute } = await useFetch('/api/blog/search-index', {
  immediate: false,
  lazy: true
})

async function initSearch() {
  if (!isLoaded.value) {
    await execute()
    if (searchData.value?.data) {
      const options = {
        keys: [
          { name: 'title', weight: 0.7 },
          { name: 'excerpt', weight: 0.3 }
        ],
        includeScore: true,
        threshold: 0.4
      }
      fuse = new Fuse(searchData.value.data, options)
      isLoaded.value = true
    }
  }
}

function handleInput() {
  if (!query.value) {
    results.value = []
    showResults.value = false
    hasSearched.value = false
    return
  }
  
  hasSearched.value = true
  showResults.value = true
  
  if (fuse) {
    results.value = fuse.search(query.value).slice(0, 5)
  }
}

function clearSearch() {
  query.value = ''
  results.value = []
  showResults.value = false
  hasSearched.value = false
}

function truncate(text: string, length: number) {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

// Close results when clicking outside
onMounted(() => {
  document.addEventListener('click', (e: any) => {
    if (!e.target.closest('.blog-search')) {
      showResults.value = false
    }
  })
})
</script>

<style scoped>
.blog-search {
  position: relative;
  width: 100%;
  max-width: 400px;
  margin: 0 auto var(--spacing-2xl);
}

.search-input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: var(--spacing-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-xl) var(--spacing-md) var(--spacing-3xl);
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  transition: all var(--transition-fast);
}

.search-input:focus {
  outline: none;
  background: var(--color-bg-primary);
  border-color: var(--color-accent-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.clear-btn {
  position: absolute;
  right: var(--spacing-md);
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
}

.clear-btn:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: var(--spacing-xs);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: 50;
  overflow: hidden;
}

.search-item {
  display: block;
  padding: var(--spacing-md);
  text-decoration: none;
  border-bottom: 1px solid var(--color-border);
  transition: background var(--transition-fast);
}

.search-item:last-child {
  border-bottom: none;
}

.search-item:hover {
  background: var(--color-bg-secondary);
}

.item-title {
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 2px;
}

.item-excerpt {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.no-results {
  padding: var(--spacing-md);
  color: var(--color-text-secondary);
  text-align: center;
  font-style: italic;
}
</style>
