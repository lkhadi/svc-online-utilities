<template>
  <div class="feature-card" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
    <div class="card-glow" :class="{ 'active': isHovered }"></div>
    
    <div class="card-content">
      <div class="card-icon" :style="{ background: gradientStyle }">
        {{ icon }}
      </div>
      
      <h3 class="card-title">{{ title }}</h3>
      <p class="card-description">{{ description }}</p>
      
      <div class="card-tools" v-if="tools && tools.length">
        <span v-for="tool in tools" :key="tool" class="tool-tag">
          {{ tool }}
        </span>
      </div>
      
      <NuxtLink :to="link" class="card-link">
        <span>Explore</span>
        <span class="link-arrow">→</span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  icon: { type: String, default: '🚀' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  link: { type: String, default: '/' },
  tools: { type: Array, default: () => [] },
  gradient: { type: String, default: 'primary' }
})

const isHovered = ref(false)

const gradientStyle = computed(() => {
  const gradients = {
    primary: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
    secondary: 'linear-gradient(135deg, #06b6d4, #10b981)',
    accent: 'linear-gradient(135deg, #f472b6, #8b5cf6)',
  }
  return gradients[props.gradient] || gradients.primary
})
</script>

<style scoped>
.feature-card {
  position: relative;
  padding: var(--spacing-xl);
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  transition: all var(--transition-base);
}

.feature-card:hover {
  border-color: var(--color-border-hover);
  transform: translateY(-4px);
}

.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, rgba(139, 92, 246, 0.1), transparent 50%);
  opacity: 0;
  transition: opacity var(--transition-slow);
  pointer-events: none;
}

.card-glow.active {
  opacity: 1;
}

.card-content {
  position: relative;
  z-index: 1;
}

.card-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  font-size: 1.5rem;
  margin-bottom: var(--spacing-lg);
  box-shadow: var(--shadow-md);
}

.card-title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
  color: var(--color-text-primary);
}

.card-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: var(--spacing-lg);
}

.card-tools {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.tool-tag {
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.card-link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-accent-primary);
  transition: all var(--transition-fast);
}

.card-link:hover {
  gap: var(--spacing-md);
}

.link-arrow {
  transition: transform var(--transition-fast);
}

.card-link:hover .link-arrow {
  transform: translateX(4px);
}
</style>
