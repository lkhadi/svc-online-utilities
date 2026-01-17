<template>
  <header class="navbar glass">
    <div class="container navbar-container">
      <NuxtLink to="/" class="brand">
        <span class="brand-icon">🚀</span>
        <span class="brand-text">meskipun<span class="brand-accent">.win</span></span>
      </NuxtLink>
      
      <nav class="nav-links" :class="{ 'nav-open': isMenuOpen }">
        <NuxtLink 
          v-for="link in navLinks" 
          :key="link.path" 
          :to="link.path"
          class="nav-link"
          @click="isMenuOpen = false"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>
      
      <button 
        class="menu-toggle" 
        @click="isMenuOpen = !isMenuOpen"
        :aria-expanded="isMenuOpen"
        aria-label="Toggle menu"
      >
        <span class="menu-bar" :class="{ 'open': isMenuOpen }"></span>
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'

const isMenuOpen = ref(false)

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Features', path: '/#features' },
  { label: 'Blog', path: '/blog' },
  { label: 'Tools', path: '/tools' },
  { label: 'Games', path: '/games' },
]
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--nav-height);
  z-index: 1000;
  transition: all var(--transition-base);
}

.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-xl);
  font-weight: 700;
  transition: opacity var(--transition-fast);
}

.brand:hover {
  opacity: 0.9;
}

.brand-icon {
  font-size: 1.5rem;
}

.brand-text {
  color: var(--color-text-primary);
}

.brand-accent {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.nav-link {
  position: relative;
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.nav-link:hover {
  color: var(--color-text-primary);
  background: var(--color-bg-glass-hover);
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: var(--gradient-primary);
  transition: all var(--transition-fast);
  transform: translateX(-50%);
  border-radius: var(--radius-full);
}

.nav-link:hover::after {
  width: 60%;
}

.menu-toggle {
  display: none;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}

.menu-toggle:hover {
  background: var(--color-bg-glass-hover);
}

.menu-bar,
.menu-bar::before,
.menu-bar::after {
  width: 20px;
  height: 2px;
  background: var(--color-text-primary);
  border-radius: var(--radius-full);
  transition: all var(--transition-fast);
}

.menu-bar {
  position: relative;
}

.menu-bar::before,
.menu-bar::after {
  content: '';
  position: absolute;
  left: 0;
}

.menu-bar::before {
  top: -6px;
}

.menu-bar::after {
  bottom: -6px;
}

.menu-bar.open {
  background: transparent;
}

.menu-bar.open::before {
  top: 0;
  transform: rotate(45deg);
}

.menu-bar.open::after {
  bottom: 0;
  transform: rotate(-45deg);
}

@media (max-width: 768px) {
  .menu-toggle {
    display: flex;
  }
  
  .nav-links {
    position: fixed;
    top: var(--nav-height);
    left: 0;
    right: 0;
    flex-direction: column;
    gap: var(--spacing-sm);
    padding: var(--spacing-lg);
    background: var(--color-bg-secondary);
    border-bottom: 1px solid var(--color-border);
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all var(--transition-base);
  }
  
  .nav-links.nav-open {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }
  
  .nav-link {
    width: 100%;
    padding: var(--spacing-md);
    text-align: center;
  }
}
</style>
